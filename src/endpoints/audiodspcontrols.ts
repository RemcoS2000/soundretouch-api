import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type AudioDspControls } from '../types/AudioDspControls'

const log = createDebug('soundretouch:endpoints:audiodspcontrols')

type AudioDspControlsResponse = {
    audiodspcontrols?: AudioDspControls
}

/**
 * Serializes only the DSP settings supplied by the caller.
 */
function buildAudioDspControlsXml(values: AudioDspControls): string {
    const parts: string[] = []

    if (values.audiomode !== undefined) {
        parts.push(`audiomode="${values.audiomode}"`)
    }

    if (values.videosyncaudiodelay !== undefined) {
        parts.push(`videosyncaudiodelay="${values.videosyncaudiodelay}"`)
    }

    return `<audiodspcontrols ${parts.join(' ')} />`
}

/**
 * Gets the current DSP settings for the device.
 *
 * GET /audiodspcontrols
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<AudioDspControls> A promise that resolves to the DSP controls payload as returned by the device.
 */
export async function fetchAudioDspControls(client: HttpClient, options?: RequestOptions): Promise<AudioDspControls> {
    log('GET /audiodspcontrols')

    const data = await client.getXml<AudioDspControlsResponse>('/audiodspcontrols', ...(options ? [options] : []))

    log('response %O', data.audiodspcontrols ?? {})

    return data.audiodspcontrols ?? {}
}

/**
 * Updates DSP settings for the device. Only included values are changed.
 *
 * POST /audiodspcontrols
 *
 * @param client HTTP client for the target device.
 * @param values DSP values to update (audiomode and/or videosyncaudiodelay).
 * @returns A promise that resolves when the device accepts the DSP update.
 *
 * @example
 * await device.setAudioDspControls({ audiomode: 'movie' })
 * await device.setAudioDspControls({ videosyncaudiodelay: 150 })
 */
export async function setAudioDspControls(client: HttpClient, values: AudioDspControls): Promise<void> {
    const body = buildAudioDspControlsXml(values)

    log('POST /audiodspcontrols')
    log('payload %s', body)
    await client.post('/audiodspcontrols', body)
}
