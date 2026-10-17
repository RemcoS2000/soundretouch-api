import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type WebSocketClient } from '../client/ws'
import { type Updates } from '../types/Updates'
import { type Volume } from '../types/Volume'

const log = createDebug('soundretouch:endpoints:volume')

type VolumeResponse = {
    volume?: Volume
}

/**
 * Gets the current volume and mute state from the device.
 *
 * GET /volume
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns A promise that resolves to the volume payload as returned by the device.
 */
export async function fetchVolume(client: HttpClient, options?: RequestOptions): Promise<Volume> {
    log('GET /volume')

    const data = await client.getXml<VolumeResponse>('/volume', ...(options ? [options] : []))

    log('response %O', data.volume ?? {})

    return data.volume ?? {}
}

/**
 * Sets the volume level and mute state for the device. Volume ranges between 0 and 100 inclusive.
 *
 * POST /volume
 *
 * The muteenabled setting is applied first, if present. The system will be unmuted if the
 * volume value is larger than the current volume setting.
 *
 * @param client HTTP client for the target device.
 * @param value Volume value to set.
 * @param muteenabled Optional mute state to set before applying the volume value.
 * @returns A promise that resolves when the device accepts the volume value.
 *
 * @example
 * await device.setVolume(25)
 * await device.setVolume(10, true)
 */
export async function setVolume(client: HttpClient, value: number, muteenabled?: boolean): Promise<void> {
    const normalized = Math.max(0, Math.min(100, Math.round(value)))
    const muteXml = typeof muteenabled === 'boolean' ? `<muteenabled>${muteenabled}</muteenabled>` : ''
    const body = `<volume>${normalized}${muteXml}</volume>`

    log('POST /volume')
    log('payload %s', body)

    await client.post('/volume', body)
}

/**
 * Subscribes to volume update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked with the parsed volume payload.
 * @returns Unsubscribe function.
 */
export function subscribeVolume(wsClient: WebSocketClient, handler: (volume: Volume) => void): () => void {
    return wsClient.onMessage<Updates>((update) => {
        const volumeUpdated = update.volumeUpdated

        if (!volumeUpdated) {
            return
        }

        handler(volumeUpdated.volume ?? {})
    })
}
