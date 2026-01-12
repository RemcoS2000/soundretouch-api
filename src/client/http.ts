import { HttpError, TimeoutError } from './errors';
import { parseXml } from './xml';

export interface HttpClientOptions {
    timeoutMs?: number;
}

export class HttpClient {
    private host: string;
    private timeoutMs: number;

    constructor(host: string, options: HttpClientOptions = {}) {
        this.host = host;
        this.timeoutMs = options.timeoutMs ?? 5000;
    }

    async getXml<T>(path: string): Promise<T> {
        const text = await this.request(path, { method: 'GET' });
        return parseXml<T>(text);
    }

    async postXml<T>(path: string, body?: string): Promise<T> {
        const text = await this.request(path, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'text/xml' },
        });

        if (!text) {
            return {} as T;
        }

        return parseXml<T>(text);
    }

    async post(path: string, body?: string): Promise<void> {
        await this.request(path, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'text/xml' },
        });
    }

    private async request(path: string, init: RequestInit): Promise<string> {
        const url = `http://${this.host}:8090${path.startsWith('/') ? path : `/${path}`}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await fetch(url, { ...init, signal: controller.signal });
            const text = await response.text();

            if (!response.ok) {
                throw new HttpError(response.status, response.statusText, text);
            }

            return text;
        } catch (error) {
            if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
                throw new TimeoutError(this.timeoutMs);
            }

            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }
}
