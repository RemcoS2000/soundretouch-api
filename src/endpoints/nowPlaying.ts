import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { WebSocketClient } from '../client/ws'
import { normalizeNowPlaying, NowPlaying, NowPlayingRawResponse } from '../types/NowPlaying'
import { Updates } from '../types/Updates'

const log = createDebug('soundretouch:endpoints:nowplaying')

type NowPlayingResponse = {
    nowPlaying?: NowPlayingRawResponse
}

/**
 * Gets info about the currently playing media.
 *
 * GET /now_playing
 *
 * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
 */
export async function fetchNowPlaying(client: HttpClient): Promise<NowPlaying> {
    log('GET /now_playing')

    const data = await client.getXml<NowPlayingResponse>('/now_playing')
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
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        const nowPlaying = update.nowPlayingUpdated?.nowPlaying
        if (nowPlaying) {
            handler(normalizeNowPlaying(nowPlaying))
        }
    })
}
