import { HttpClient } from '../client/http'
import { Presets } from '../types/Presets'

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
    const data = await client.getXml<PresetsResponse>('/presets')
    return data.presets ?? {}
}
