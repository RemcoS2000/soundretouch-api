import { HttpClient } from '../client/http'
import { AudioDspControls } from '../types/AudioDspControls'

type AudioDspControlsResponse = {
    audiodspcontrols?: AudioDspControls
}

/**
 * Gets the current DSP settings for the device.
 *
 * GET /audiodspcontrols
 *
 * @returns Promise<AudioDspControls> A promise that resolves to the DSP controls payload as returned by the device.
 */
export async function fetchAudioDspControls(client: HttpClient): Promise<AudioDspControls> {
    const data = await client.getXml<AudioDspControlsResponse>('/audiodspcontrols')
    return data.audiodspcontrols ?? {}
}

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
 * Updates DSP settings for the device. Only included values are changed.
 *
 * POST /audiodspcontrols
 *
 * @param values DSP values to update (audiomode and/or videosyncaudiodelay).
 * @returns A promise that resolves when the device accepts the DSP update.
 *
 * @example
 * await device.setAudioDspControls({ audiomode: 'movie' })
 * await device.setAudioDspControls({ videosyncaudiodelay: 150 })
 */
export async function setAudioDspControls(client: HttpClient, values: AudioDspControls): Promise<void> {
    const body = buildAudioDspControlsXml(values)
    await client.post('/audiodspcontrols', body)
}
