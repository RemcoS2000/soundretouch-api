import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type AudioProductToneControls, type AudioProductToneControlsUpdate } from '../types/AudioProductToneControls'

const log = createDebug('soundretouch:endpoints:audioproducttonecontrols')

type AudioProductToneControlsResponse = {
    audioproducttonecontrols?: AudioProductToneControls
}

/**
 * Serializes supplied bass and treble settings into the endpoint XML payload.
 */
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
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<AudioProductToneControls> A promise that resolves to the tone controls payload as returned by the device.
 */
export async function fetchAudioProductToneControls(client: HttpClient, options?: RequestOptions): Promise<AudioProductToneControls> {
    log('GET /audioproducttonecontrols')

    const data = await client.getXml<AudioProductToneControlsResponse>('/audioproducttonecontrols', ...(options ? [options] : []))

    log('response %O', data.audioproducttonecontrols ?? {})

    return data.audioproducttonecontrols ?? {}
}

/**
 * Updates bass and/or treble settings for the device. Only included values are changed.
 *
 * POST /audioproducttonecontrols
 *
 * @param client HTTP client for the target device.
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
