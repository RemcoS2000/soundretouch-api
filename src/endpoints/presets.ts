import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { WebSocketClient } from '../client/ws'
import { Preset, Presets } from '../types/Presets'
import { Updates } from '../types/Updates'

const log = createDebug('soundretouch:endpoints:presets')

type PresetsResponse = {
    presets?: {
        preset?: Preset | Preset[]
    }
}

const normalizePreset = (preset: Preset): Preset => {
    const id = Number((preset as { id?: unknown }).id)
    return Number.isFinite(id) ? { ...preset, id } : { ...preset, id: undefined }
}

/**
 * Gets the list of current presets from the device.
 *
 * GET /presets
 *
 * @returns Promise<Presets> A promise that resolves to the presets payload as returned by the device.
 */
export async function fetchPresets(client: HttpClient): Promise<Presets> {
    log('GET /presets')

    const data = await client.getXml<PresetsResponse>('/presets')
    log('response %O', data.presets ?? {})

    const preset = data.presets?.preset
    if (Array.isArray(preset)) {
        return preset.map(normalizePreset)
    }

    return preset ? [normalizePreset(preset)] : []
}

/**
 * Subscribes to now selection update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked with the selected preset.
 * @returns Unsubscribe function.
 */
export function subscribeNowSelectionUpdated(wsClient: WebSocketClient, handler: (preset: Preset) => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        const preset = update.nowSelectionUpdated?.preset
        if (preset) {
            handler(preset)
        }
    })
}

/**
 * Subscribes to presets update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked with the parsed presets payload.
 * @returns Unsubscribe function.
 */
export function subscribePresetsUpdated(wsClient: WebSocketClient, handler: (presets: Presets) => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        const preset = update.presetsUpdated?.presets?.preset
        if (Array.isArray(preset)) {
            handler(preset.map(normalizePreset))
            return
        }

        if (preset) {
            handler([normalizePreset(preset)])
        }
    })
}
