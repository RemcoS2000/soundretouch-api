import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type AudioProductLevelControls, type AudioProductLevelControlsUpdate } from '../types/AudioProductLevelControls'

const log = createDebug('soundretouch:endpoints:audioproductlevelcontrols')

type AudioProductLevelControlsResponse = {
    audioproductlevelcontrols?: AudioProductLevelControls
}

/**
 * Serializes supplied speaker-level settings into the endpoint XML payload.
 */
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
 * Gets the current front-center and rear-surround level settings from the device.
 *
 * GET /audioproductlevelcontrols
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<AudioProductLevelControls> A promise that resolves to the level controls payload as returned by the device.
 */
export async function fetchAudioProductLevelControls(client: HttpClient, options?: RequestOptions): Promise<AudioProductLevelControls> {
    log('GET /audioproductlevelcontrols')

    const data = await client.getXml<AudioProductLevelControlsResponse>('/audioproductlevelcontrols', ...(options ? [options] : []))

    log('response %O', data.audioproductlevelcontrols ?? {})

    return data.audioproductlevelcontrols ?? {}
}

/**
 * Updates front-center and/or rear-surround levels for the device. Only included values are changed.
 *
 * POST /audioproductlevelcontrols
 *
 * @param client HTTP client for the target device.
 * @param values Level values to update (frontCenterSpeakerLevel and/or rearSurroundSpeakersLevel).
 * @returns A promise that resolves when the device accepts the level update.
 *
 * @example
 * await device.setAudioProductLevelControls({ frontCenterSpeakerLevel: 1 })
 * await device.setAudioProductLevelControls({ rearSurroundSpeakersLevel: -2 })
 */
export async function setAudioProductLevelControls(client: HttpClient, values: AudioProductLevelControlsUpdate): Promise<void> {
    const body = buildAudioProductLevelControlsXml(values)

    log('POST /audioproductlevelcontrols')
    log('payload %s', body)
    await client.post('/audioproductlevelcontrols', body)
}
