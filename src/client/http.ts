import createDebug from 'debug'

import { HttpError, TimeoutError } from './errors'
import { parseXml } from './xml'

export interface HttpClientOptions {
    timeoutMs?: number
}

export class HttpClient {
    private host: string
    private timeoutMs: number
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
    }

    /**
     * Sends a GET request and parses the XML response into the expected type.
     *
     * @param path Endpoint path to request.
     * @returns Promise<T> A promise that resolves to the parsed XML response.
     */
    async getXml<T>(path: string): Promise<T> {
        const text = await this.request(path, { method: 'GET' })
        return parseXml<T>(text)
    }

    /**
     * Sends a POST request and parses the XML response into the expected type.
     *
     * @param path Endpoint path to request.
     * @param body Optional XML body to send.
     * @returns Promise<T> A promise that resolves to the parsed XML response.
     */
    async postXml<T>(path: string, body?: string): Promise<T> {
        const text = await this.request(path, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'text/xml' },
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
    async post(path: string, body?: string): Promise<void> {
        await this.request(path, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'text/xml' },
        })
    }

    private async request(path: string, init: RequestInit): Promise<string> {
        const url = `http://${this.host}:8090${path.startsWith('/') ? path : `/${path}`}`
        this.log('request %s %s', init.method, url)
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

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
            if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
                this.log('timeout %s %s', init.method, url)
                throw new TimeoutError(this.timeoutMs)
            }

            this.log('error %s %s %O', init.method, url, error)
            throw error
        } finally {
            clearTimeout(timeout)
        }
    }
}
