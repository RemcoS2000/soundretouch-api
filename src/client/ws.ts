import { parseXml } from './xml'

export type TransportState = 'connecting' | 'open' | 'reconnecting' | 'disconnected' | 'disposed'

export type WebSocketClientOptions = {
    autoReconnect?: boolean
    reconnectDelayMs?: number
    maxReconnectDelayMs?: number
    connectTimeoutMs?: number
    unwrap?: boolean
    proxyUrl?: string
}

type MessageHandler<T> = (payload: T) => void

type ErrorHandler = (error: unknown) => void

export class WebSocketClient {
    private socket: WebSocket | undefined
    private reconnectTimer: ReturnType<typeof setTimeout> | undefined
    private connectionTimer: ReturnType<typeof setTimeout> | undefined
    private closedByUser = false
    private disposed = false
    private attempts = 0
    private state: TransportState = 'disconnected'
    private messageHandlers = new Set<(payload: unknown) => void>()
    private errorHandlers = new Set<ErrorHandler>()
    private stateHandlers = new Set<(state: TransportState) => void>()

    /**
     * Creates a live-update client without opening a connection.
     *
     * @param host The hostname or IP address of the SoundTouch device.
     * @param options Optional connection, reconnect and payload configuration.
     */
    constructor(
        private host: string,
        private options: WebSocketClientOptions = {}
    ) {}

    /**
     * Opens a WebSocket connection on port 8080 using the "gabbo" protocol.
     *
     * Events from replaced sockets are ignored, and connection attempts have a bounded timeout.
     */
    connect(): void {
        if (this.disposed) {
            throw new Error('SoundTouch device has been disposed')
        }

        if (this.socket) {
            return
        }

        this.closedByUser = false
        this.clearReconnect()
        this.setState(this.attempts ? 'reconnecting' : 'connecting')

        const directUrl = `ws://${this.host}:8080`
        const url = this.options.proxyUrl ? `${this.options.proxyUrl}${encodeURIComponent(directUrl)}` : directUrl
        let socket: WebSocket

        try {
            socket = new WebSocket(url, 'gabbo')
        } catch (error) {
            this.reportError(error)
            this.scheduleReconnect()

            return
        }

        this.socket = socket

        /**
         * Rejects late events from replaced or disposed socket connections.
         */
        const isCurrentSocket = () => this.socket === socket && !this.disposed

        /**
         * Releases the timeout associated with opening this socket.
         */
        const clearConnectionTimeout = () => {
            clearTimeout(this.connectionTimer)
            this.connectionTimer = undefined
        }

        socket.addEventListener('open', () => {
            if (!isCurrentSocket()) {
                return
            }

            clearConnectionTimeout()
            this.attempts = 0
            this.setState('open')
        })

        socket.addEventListener('message', (event) => {
            if (!isCurrentSocket()) {
                return
            }

            try {
                const raw: unknown = event.data

                if (typeof raw !== 'string' && !(raw instanceof ArrayBuffer) && !ArrayBuffer.isView(raw)) {
                    throw new Error('Unsupported WebSocket message format')
                }

                const data = typeof raw === 'string' ? raw : new TextDecoder().decode(raw)
                const payload = this.unwrapPayload(parseXml<unknown>(data))

                this.messageHandlers.forEach((handler) => {
                    try {
                        handler(payload)
                    } catch (error) {
                        this.reportError(error)
                    }
                })
            } catch (error) {
                this.reportError(error)
            }
        })

        socket.addEventListener('error', (error) => {
            if (isCurrentSocket()) {
                this.reportError(error)
            }
        })

        socket.addEventListener('close', () => {
            if (!isCurrentSocket()) {
                return
            }

            clearConnectionTimeout()
            this.socket = undefined
            this.scheduleReconnect()
        })

        this.connectionTimer = setTimeout(() => {
            if (!isCurrentSocket() || this.state === 'open') {
                return
            }

            this.reportError(new Error('SoundTouch WebSocket connection timed out'))
            this.socket = undefined
            socket.close()
            this.scheduleReconnect()
        }, this.options.connectTimeoutMs ?? 8000)
    }

    /**
     * Closes the current socket and cancels reconnect timers while allowing later reuse.
     */
    close(): void {
        this.closedByUser = true
        this.clearReconnect()
        clearTimeout(this.connectionTimer)
        this.connectionTimer = undefined

        const socket = this.socket

        this.socket = undefined
        socket?.close()

        if (!this.disposed) {
            this.setState('disconnected')
        }
    }

    /**
     * Permanently releases the socket, timers and registered handlers.
     */
    dispose(): void {
        if (this.disposed) {
            return
        }

        this.close()
        this.disposed = true
        this.setState('disposed')
        this.messageHandlers.clear()
        this.errorHandlers.clear()
        this.stateHandlers.clear()
    }

    /**
     * Reports the current transport state immediately and subscribes to later transitions.
     *
     * @returns A function that removes the state handler.
     */
    onStateChanged(handler: (state: TransportState) => void): () => void {
        handler(this.state)
        this.stateHandlers.add(handler)

        return () => {
            this.stateHandlers.delete(handler)
        }
    }

    /**
     * Registers an update handler before connecting so early messages cannot be missed.
     *
     * @returns A function that removes the message handler.
     */
    onMessage<T>(handler: MessageHandler<T>): () => void {
        if (this.disposed) {
            throw new Error('SoundTouch device has been disposed')
        }

        const wrapped = handler as MessageHandler<unknown>

        this.messageHandlers.add(wrapped)

        // Register first, including when WebSocket construction fails synchronously.
        this.ensureConnected()

        return () => {
            this.messageHandlers.delete(wrapped)
        }
    }

    /**
     * Subscribes to transport and update-handler failures.
     *
     * @returns A function that removes the error handler.
     */
    onError(handler: ErrorHandler): () => void {
        if (this.disposed) {
            throw new Error('SoundTouch device has been disposed')
        }

        this.errorHandlers.add(handler)

        return () => {
            this.errorHandlers.delete(handler)
        }
    }

    /**
     * Returns whether the active socket is open and ready to receive messages.
     */
    isConnected(): boolean {
        return this.state === 'open' && this.socket?.readyState === 1
    }

    /**
     * Starts a connection if no socket or reconnect is pending, then reports readiness.
     */
    ensureConnected(): boolean {
        if (!this.socket && !this.reconnectTimer) {
            this.connect()
        }

        return this.isConnected()
    }

    /**
     * Publishes a changed transport state while isolating errors thrown by consumers.
     */
    private setState(state: TransportState): void {
        if (this.state === state) {
            return
        }

        this.state = state
        this.stateHandlers.forEach((handler) => {
            try {
                handler(state)
            } catch (error) {
                this.reportError(error)
            }
        })
    }

    /**
     * Notifies error handlers without allowing one consumer to interrupt the others.
     */
    private reportError(error: unknown): void {
        this.errorHandlers.forEach((handler) => {
            try {
                handler(error)
            } catch {
                /* Isolate consumers. */
            }
        })
    }

    /**
     * Schedules opt-in exponential reconnect with jitter and a maximum thirty-second delay.
     */
    private scheduleReconnect(): void {
        if (this.closedByUser || this.disposed || !this.options.autoReconnect) {
            this.setState('disconnected')

            return
        }

        this.setState('reconnecting')

        const cap = Math.min(30000, this.options.maxReconnectDelayMs ?? 30000)
        const delay = Math.min(cap, (this.options.reconnectDelayMs ?? 1000) * 2 ** Math.min(this.attempts++, 10))

        this.reconnectTimer = setTimeout(
            () => {
                this.reconnectTimer = undefined
                this.connect()
            },
            Math.max(1, delay * (0.8 + Math.random() * 0.2))
        )
    }

    /**
     * Optionally removes a single XML root element from an update payload.
     */
    private unwrapPayload(payload: unknown): unknown {
        if (!this.options.unwrap || !payload || typeof payload !== 'object') {
            return payload
        }

        const record = payload as Record<string, unknown>
        const keys = Object.keys(record)

        const [root] = keys

        return keys.length === 1 && root ? (record[root] ?? payload) : payload
    }

    /**
     * Cancels the pending automatic reconnect attempt.
     */
    private clearReconnect(): void {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = undefined
    }
}
