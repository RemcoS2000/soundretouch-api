import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { WebSocketClient } from '../client/ws'
import { normalizeSources, Sources, SourcesRawResponse } from '../types/Sources'
import { Updates } from '../types/Updates'

const log = createDebug('soundretouch:endpoints:sources')

type SourcesResponse = {
    sources?: SourcesRawResponse
}

/**
 * Fetches the list of available content sources from the device.
 *
 * GET /sources
 *
 * @returns Promise<Sources> A promise that resolves to the sources payload as returned by the device.
 */
export async function fetchSources(client: HttpClient): Promise<Sources> {
    log('GET /sources')

    const data = await client.getXml<SourcesResponse>('/sources')
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
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        if (update.sourcesUpdated) {
            handler()
        }
    })
}
