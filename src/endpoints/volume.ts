import { HttpClient } from '../client/http'
import { Volume } from '../types/Volume'

type VolumeResponse = {
    volume?: Volume
}

export async function fetchVolume(client: HttpClient): Promise<Volume> {
    const data = await client.getXml<VolumeResponse>('/volume')
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
    await client.post('/volume', body)
}
