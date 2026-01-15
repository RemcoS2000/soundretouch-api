import createDebug from 'debug'

import { parseXml } from './xml'

export type WebSocketClientOptions = {
    autoReconnect?: boolean
    reconnectDelayMs?: number
    unwrap?: boolean
}

type MessageHandler<T> = (payload: T) => void
type ErrorHandler = (error: unknown) => void

export class WebSocketClient {
    private host: string
    private socket?: WebSocket
    private options: WebSocketClientOptions
    private reconnectTimer?: ReturnType<typeof setTimeout>
    private closedByUser = false
    private messageHandlers = new Set<(payload: unknown) => void>()
    private errorHandlers = new Set<ErrorHandler>()

    private log = createDebug('soundretouch:client:ws')

    constructor(host: string, options: WebSocketClientOptions = {}) {
        this.host = host
        this.options = options
    }

    /**
     * Opens a WebSocket connection for async updates.
     *
     * WebSocket connections are made on port 8080 using the "gabbo" protocol.
     *
     * @example
     * const client = new WebSocketClient('192.168.1.5')
     * client.connect()
     */
    connect(): void {
        if (this.socket) {
            this.log('connect skipped (already connected)')
            return
        }

        this.closedByUser = false
        this.clearReconnect()

        const url = `ws://${this.host}:8080`
        this.log('connect %s', url)
        this.socket = new WebSocket(url, 'gabbo')

        this.socket.addEventListener('message', (event) => {
            try {
                const data = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data)
                this.log('message received', data)
                const payload = parseXml<unknown>(data)
                const message = this.unwrapPayload(payload)
                this.log('message parsed %O', message)
                this.messageHandlers.forEach((handler) => handler(message))
            } catch (error) {
                this.log('message error %O', error)
                this.errorHandlers.forEach((handler) => handler(error))
            }
        })

        this.socket.addEventListener('error', (event) => {
            this.log('socket error %O', event)
            this.errorHandlers.forEach((handler) => handler(event))
        })

        this.socket.addEventListener('close', () => {
            this.log('socket close')
            this.socket = undefined

            if (!this.closedByUser && this.options.autoReconnect) {
                const delay = this.options.reconnectDelayMs ?? 1000
                this.log('reconnect scheduled in %dms', delay)
                this.reconnectTimer = setTimeout(() => this.connect(), delay)
            }
        })
    }

    /**
     * Closes the WebSocket connection, if one is open.
     *
     * @example
     * const client = new WebSocketClient('192.168.1.5')
     * client.close()
     */
    close(): void {
        this.closedByUser = true
        this.clearReconnect()

        if (!this.socket) {
            this.log('close skipped (no active connection)')
            return
        }

        this.log('close')
        this.socket.close()
        this.socket = undefined
    }

    /**
     * Subscribes to parsed message payloads.
     *
     * @param handler Callback invoked with each parsed payload.
     * @returns Unsubscribe function.
     *
     * @example
     * const off = client.onMessage((payload) => console.log(payload))
     * off()
     */
    onMessage<T>(handler: MessageHandler<T>): () => void {
        const wrapped = handler as MessageHandler<unknown>
        this.messageHandlers.add(wrapped)
        return () => this.messageHandlers.delete(wrapped)
    }

    /**
     * Subscribes to WebSocket errors.
     *
     * @param handler Callback invoked when a WebSocket error is raised.
     * @returns Unsubscribe function.
     *
     * @example
     * const off = client.onError((error) => console.error(error))
     * off()
     */
    onError(handler: ErrorHandler): () => void {
        this.errorHandlers.add(handler)
        return () => this.errorHandlers.delete(handler)
    }

    /**
     * Indicates whether a WebSocket connection is currently active.
     *
     * @returns True when the socket is connected.
     *
     * @example
     * if (client.isConnected()) {
     *     console.log('connected')
     * }
     */
    isConnected(): boolean {
        return this.socket !== undefined
    }

    /**
     * Ensures the WebSocket connection is established.
     *
     * @returns True when the socket is connected.
     *
     * @example
     * client.ensureConnected()
     */
    ensureConnected(): boolean {
        if (!this.isConnected()) {
            this.connect()
        }

        return this.isConnected()
    }

    private unwrapPayload(payload: unknown): unknown {
        if (!this.options.unwrap || !payload || typeof payload !== 'object') {
            return payload
        }

        const record = payload as Record<string, unknown>
        const keys = Object.keys(record)
        if (keys.length !== 1) {
            return payload
        }

        return record[keys[0]] ?? payload
    }

    private clearReconnect(): void {
        if (!this.reconnectTimer) {
            return
        }

        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = undefined
        this.log('reconnect cleared')
    }
}
