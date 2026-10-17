import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type WebSocketClient } from '../client/ws'
import { normalizeSources, type Sources, type SourcesRawResponse } from '../types/Sources'
import { type Updates } from '../types/Updates'

const log = createDebug('soundretouch:endpoints:sources')

type SourcesResponse = {
    sources?: SourcesRawResponse
}

/**
 * Fetches the list of available content sources from the device.
 *
 * GET /sources
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<Sources> A promise that resolves to the sources payload as returned by the device.
 */
export async function fetchSources(client: HttpClient, options?: RequestOptions): Promise<Sources> {
    log('GET /sources')

    const data = await client.getXml<SourcesResponse>('/sources', ...(options ? [options] : []))
    const sources = normalizeSources(data.sources)

    log('response %O', sources)

    return sources
}

/**
 * Subscribes to sources update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when sources change.
 * @returns Unsubscribe function.
 */
export function subscribeSourcesUpdated(wsClient: WebSocketClient, handler: () => void): () => void {
    return wsClient.onMessage<Updates>((update) => {
        if (update.sourcesUpdated) {
            handler()
        }
    })
}
