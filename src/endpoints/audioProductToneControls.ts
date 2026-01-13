import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { AudioProductToneControls, AudioProductToneControlsUpdate } from '../types/AudioProductToneControls'

const log = createDebug('soundretouch:endpoints:audioproducttonecontrols')

type AudioProductToneControlsResponse = {
    audioproducttonecontrols?: AudioProductToneControls
}

function buildAudioProductToneControlsXml(values: AudioProductToneControlsUpdate): string {
    const parts: string[] = []

    if (values.bass !== undefined) {
        parts.push(`<bass value="${values.bass}" />`)
    }

    if (values.treble !== undefined) {
        parts.push(`<treble value="${values.treble}" />`)
    }

    return `<audioproducttonecontrols>${parts.join('')}</audioproducttonecontrols>`
}

/**
 * Gets the current bass and treble settings from the device.
 *
 * GET /audioproducttonecontrols
 *
 * @returns Promise<AudioProductToneControls> A promise that resolves to the tone controls payload as returned by the device.
 */
export async function fetchAudioProductToneControls(client: HttpClient): Promise<AudioProductToneControls> {
    log('GET /audioproducttonecontrols')

    const data = await client.getXml<AudioProductToneControlsResponse>('/audioproducttonecontrols')
    log('response %O', data.audioproducttonecontrols ?? {})

    return data.audioproducttonecontrols ?? {}
}

/**
 * Updates bass and/or treble settings for the device. Only included values are changed.
 *
 * POST /audioproducttonecontrols
 *
 * @param values Tone values to update (bass and/or treble).
 * @returns A promise that resolves when the device accepts the tone update.
 *
 * @example
 * await device.setAudioProductToneControls({ bass: 2 })
 * await device.setAudioProductToneControls({ treble: -1 })
 */
export async function setAudioProductToneControls(client: HttpClient, values: AudioProductToneControlsUpdate): Promise<void> {
    const body = buildAudioProductToneControlsXml(values)

    log('POST /audioproducttonecontrols')
    log('payload %s', body)

    await client.post('/audioproducttonecontrols', body)
}
