import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { Presets } from '../types/Presets'

const log = createDebug('soundretouch:endpoints:presets')

type PresetsResponse = {
    presets?: Presets
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

    return data.presets ?? {}
}
