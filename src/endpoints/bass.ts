import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type WebSocketClient } from '../client/ws'
import { type Bass } from '../types/Bass'
import { type Updates } from '../types/Updates'

const log = createDebug('soundretouch:endpoints:bass')

type BassResponse = {
    bass?: Bass
}

/**
 * Gets the current bass setting from the device.
 *
 * GET /bass
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<Bass> A promise that resolves to the bass payload as returned by the device.
 */
export async function fetchBass(client: HttpClient, options?: RequestOptions): Promise<Bass> {
    log('GET /bass')

    const data = await client.getXml<BassResponse>('/bass', ...(options ? [options] : []))

    log('response %O', data.bass ?? {})

    return data.bass ?? {}
}

/**
 * Sets the bass level for the device.
 *
 * POST /bass
 *
 * @param client HTTP client for the target device.
 * @param value Bass value to set.
 * @returns A promise that resolves when the device accepts the bass value.
 *
 * @example
 * await device.setBass(5)
 */
export async function setBass(client: HttpClient, value: number): Promise<void> {
    const body = `<bass>${value}</bass>`

    log('POST /bass')
    log('payload %s', body)
    await client.post('/bass', body)
}

/**
 * Subscribes to bass update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when bass changes.
 * @returns Unsubscribe function.
 */
export function subscribeBassUpdated(wsClient: WebSocketClient, handler: () => void): () => void {
    return wsClient.onMessage<Updates>((update) => {
        if (update.bassUpdated) {
            handler()
        }
    })
}
