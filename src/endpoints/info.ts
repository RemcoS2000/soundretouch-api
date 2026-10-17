import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type WebSocketClient } from '../client/ws'
import { type DeviceInfo } from '../types/DeviceInfo'
import { type Updates } from '../types/Updates'

const log = createDebug('soundretouch:endpoints:info')

type InfoResponse = {
    info?: DeviceInfo
}

/**
 * Gets device information including identifiers, components, and network info.
 *
 * GET /info
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<DeviceInfo> A promise that resolves to the device info payload as returned by the device.
 */
export async function fetchInfo(client: HttpClient, options?: RequestOptions): Promise<DeviceInfo> {
    log('GET /info')

    const data = await client.getXml<InfoResponse>('/info', ...(options ? [options] : []))

    log('response %O', data.info ?? {})

    return data.info ?? {}
}

/**
 * Subscribes to device info update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when device info changes.
 * @returns Unsubscribe function.
 */
export function subscribeInfoUpdated(wsClient: WebSocketClient, handler: () => void): () => void {
    return wsClient.onMessage<Updates>((update) => {
        if (update.infoUpdated) {
            handler()
        }
    })
}
