export class SoundTouchError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SoundTouchError';
    }
}

export class HttpError extends SoundTouchError {
    status: number;
    statusText: string;
    body?: string;

    constructor(status: number, statusText: string, body?: string) {
        super(`HTTP ${status} ${statusText}`);
        this.name = 'HttpError';
        this.status = status;
        this.statusText = statusText;
        this.body = body;
    }
}

export class TimeoutError extends SoundTouchError {
    timeoutMs: number;

    constructor(timeoutMs: number) {
        super(`Request timed out after ${timeoutMs}ms`);
        this.name = 'TimeoutError';
        this.timeoutMs = timeoutMs;
    }
}
