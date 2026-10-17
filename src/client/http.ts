import createDebug from 'debug'

import { HttpError, TimeoutError } from './errors'
import { parseXml } from './xml'

export interface HttpClientOptions {
    timeoutMs?: number
    proxyUrl?: string
    port?: number
}

export type RequestOptions = { signal?: AbortSignal }

export class HttpClient {
    private disposed = false
    private pending = new Set<AbortController>()
    private host: string
    private timeoutMs: number
    private proxyUrl: string | undefined
    private port: number
    private log = createDebug('soundretouch:http')

    /**
     * Creates a new HTTP client for a SoundTouch device.
     *
     * @param host The hostname or IP address of the SoundTouch device.
     * @param options Optional HTTP client configuration.
     */
    constructor(host: string, options: HttpClientOptions = {}) {
        this.host = host
        this.timeoutMs = options.timeoutMs ?? 10000
        this.proxyUrl = options.proxyUrl
        this.port = options.port ?? 8090
    }

    /**
     * Permanently aborts pending requests and prevents further requests on this client.
     */
    dispose(): void {
        this.disposed = true
        this.pending.forEach((controller) => controller.abort())
        this.pending.clear()
    }

    /**
     * Sends a GET request and parses the XML response into the expected type.
     *
     * @param path Endpoint path to request.
     * @param options Optional cancellation signal for this read.
     * @returns Promise<T> A promise that resolves to the parsed XML response.
     */
    async getXml<T>(path: string, options: RequestOptions = {}): Promise<T> {
        const text = await this.request(path, { method: 'GET', ...(options.signal ? { signal: options.signal } : {}) })

        return parseXml<T>(text)
    }

    /**
     * Sends a POST request and parses the XML response into the expected type.
     *
     * @param path Endpoint path to request.
     * @param body Optional XML body to send.
     * @returns Promise<T> A promise that resolves to the parsed XML response.
     */
    async postXml<T>(path: string, body?: string, headers: HeadersInit = {}): Promise<T> {
        const text = await this.request(path, {
            method: 'POST',
            ...(body === undefined ? {} : { body }),
            headers: {
                'Content-Type': 'text/xml',
                ...headers,
            },
        })

        if (!text) {
            return {} as T
        }

        return parseXml<T>(text)
    }

    /**
     * Sends a POST request without expecting a response body.
     *
     * @param path Endpoint path to request.
     * @param body Optional XML body to send.
     * @returns Promise<void> A promise that resolves when the request completes.
     */
    async post(path: string, body?: string, headers: HeadersInit = {}): Promise<void> {
        await this.request(path, {
            method: 'POST',
            ...(body === undefined ? {} : { body }),
            headers: {
                'Content-Type': 'text/xml',
                ...headers,
            },
        })
    }

    /**
     * Resolves a speaker endpoint through the optional development proxy.
     */
    private requestUrl(path: string): string {
        const endpoint = path.startsWith('/') ? path : `/${path}`
        const directUrl = `http://${this.host}:${this.port}${endpoint}`

        return this.proxyUrl ? `${this.proxyUrl}${encodeURIComponent(directUrl)}` : directUrl
    }

    /**
     * Sends a bounded HTTP request, distinguishing caller cancellation from timeout and cleaning up abort listeners.
     */
    private async request(path: string, init: RequestInit): Promise<string> {
        if (this.disposed) {
            throw new Error('SoundTouch device has been disposed')
        }

        if (init.signal?.aborted) {
            throw Object.assign(new Error('Request cancelled'), { name: 'AbortError' })
        }

        const url = this.requestUrl(path)

        this.log('request %s %s', init.method, url)

        const controller = new AbortController()

        this.pending.add(controller)

        let timedOut = false

        /**
         * Forwards caller cancellation and its reason to the active HTTP request.
         */
        const abort = () => controller.abort(init.signal?.reason)

        init.signal?.addEventListener('abort', abort, { once: true })

        const timeout = setTimeout(() => {
            timedOut = true
            controller.abort()
        }, this.timeoutMs)

        try {
            const response = await fetch(url, {
                ...init,
                signal: controller.signal,
            })
            const text = await response.text()

            this.log('response %s %s %s', init.method, url, response.status)

            if (!response.ok) {
                throw new HttpError(response.status, response.statusText, text)
            }

            return text
        } catch (error) {
            if (timedOut) {
                this.log('timeout %s %s', init.method, url)

                throw new TimeoutError(this.timeoutMs)
            }

            this.log('error %s %s %O', init.method, url, error)

            throw error
        } finally {
            clearTimeout(timeout)
            init.signal?.removeEventListener('abort', abort)
            this.pending.delete(controller)
        }
    }
}
