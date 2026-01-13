import { HttpClient } from '../client/http'
import { AudioProductLevelControls, AudioProductLevelControlsUpdate } from '../types/AudioProductLevelControls'

type AudioProductLevelControlsResponse = {
    audioproductlevelcontrols?: AudioProductLevelControls
}

/**
 * Gets the current front-center and rear-surround level settings from the device.
 *
 * GET /audioproductlevelcontrols
 *
 * @returns Promise<AudioProductLevelControls> A promise that resolves to the level controls payload as returned by the device.
 */
export async function fetchAudioProductLevelControls(client: HttpClient): Promise<AudioProductLevelControls> {
    const data = await client.getXml<AudioProductLevelControlsResponse>('/audioproductlevelcontrols')
    return data.audioproductlevelcontrols ?? {}
}

function buildAudioProductLevelControlsXml(values: AudioProductLevelControlsUpdate): string {
    const parts: string[] = []

    if (values.frontCenterSpeakerLevel !== undefined) {
        parts.push(`<frontCenterSpeakerLevel value="${values.frontCenterSpeakerLevel}" />`)
    }

    if (values.rearSurroundSpeakersLevel !== undefined) {
        parts.push(`<rearSurroundSpeakersLevel value="${values.rearSurroundSpeakersLevel}" />`)
    }

    return `<audioproductlevelcontrols>${parts.join('')}</audioproductlevelcontrols>`
}

/**
 * Updates front-center and/or rear-surround levels for the device. Only included values are changed.
 *
 * POST /audioproductlevelcontrols
 *
 * @param values Level values to update (frontCenterSpeakerLevel and/or rearSurroundSpeakersLevel).
 * @returns A promise that resolves when the device accepts the level update.
 *
 * @example
 * await device.setAudioProductLevelControls({ frontCenterSpeakerLevel: 1 })
 * await device.setAudioProductLevelControls({ rearSurroundSpeakersLevel: -2 })
 */
export async function setAudioProductLevelControls(client: HttpClient, values: AudioProductLevelControlsUpdate): Promise<void> {
    const body = buildAudioProductLevelControlsXml(values)
    await client.post('/audioproductlevelcontrols', body)
}
