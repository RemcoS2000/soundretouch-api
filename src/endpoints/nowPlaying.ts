import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type WebSocketClient } from '../client/ws'
import { normalizeNowPlaying, type NowPlaying, type NowPlayingRawResponse } from '../types/NowPlaying'
import { type Updates } from '../types/Updates'

const log = createDebug('soundretouch:endpoints:nowplaying')

type NowPlayingResponse = {
    nowPlaying?: NowPlayingRawResponse
}

/**
 * Gets info about the currently playing media.
 *
 * GET /now_playing
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
 */
export async function fetchNowPlaying(client: HttpClient, options?: RequestOptions): Promise<NowPlaying> {
    log('GET /now_playing')

    const data = await client.getXml<NowPlayingResponse>('/now_playing', ...(options ? [options] : []))
    const nowPlaying = normalizeNowPlaying(data.nowPlaying)

    log('response %O', nowPlaying)

    return nowPlaying
}

/**
 * Subscribes to now playing update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked with the normalized now playing payload.
 * @returns Unsubscribe function.
 */
export function subscribeNowPlaying(wsClient: WebSocketClient, handler: (nowPlaying: NowPlaying) => void): () => void {
    return wsClient.onMessage<Updates>((update) => {
        const nowPlaying = update.nowPlayingUpdated?.nowPlaying

        if (nowPlaying) {
            handler(normalizeNowPlaying(nowPlaying))
        }
    })
}
