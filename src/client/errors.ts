/**
 * Base error type for SoundTouch client operations.
 */
export class SoundTouchError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'SoundTouchError'
    }
}

/**
 * Error thrown when an HTTP request fails with a non-2xx status code.
 */
export class HttpError extends SoundTouchError {
    status: number
    statusText: string
    body?: string

    /**
     * Creates a new HttpError instance.
     *
     * @param status HTTP status code.
     * @param statusText HTTP status text.
     * @param body Optional response body.
     */
    constructor(status: number, statusText: string, body?: string) {
        super(`HTTP ${status} ${statusText}`)
        this.name = 'HttpError'
        this.status = status
        this.statusText = statusText
        this.body = body
    }
}

/**
 * Error thrown when a request exceeds the configured timeout.
 */
export class TimeoutError extends SoundTouchError {
    timeoutMs: number

    /**
     * Creates a new TimeoutError instance.
     *
     * @param timeoutMs Timeout value in milliseconds.
     */
    constructor(timeoutMs: number) {
        super(`Request timed out after ${timeoutMs}ms`)
        this.name = 'TimeoutError'
        this.timeoutMs = timeoutMs
    }
}
