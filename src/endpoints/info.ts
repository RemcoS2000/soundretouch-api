import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { WebSocketClient } from '../client/ws'
import { DeviceInfo } from '../types/DeviceInfo'
import { Updates } from '../types/Updates'

const log = createDebug('soundretouch:endpoints:info')

type InfoResponse = {
    info?: DeviceInfo
}

/**
 * Gets device information including identifiers, components, and network info.
 *
 * GET /info
 *
 * @returns Promise<DeviceInfo> A promise that resolves to the device info payload as returned by the device.
 */
export async function fetchInfo(client: HttpClient): Promise<DeviceInfo> {
    log('GET /info')

    const data = await client.getXml<InfoResponse>('/info')
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
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        if (update.infoUpdated) {
            handler()
        }
    })
}
