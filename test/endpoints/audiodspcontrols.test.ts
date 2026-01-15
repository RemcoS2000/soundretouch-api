import { describe, expect, it } from 'vitest'

import { fetchAudioDspControls, setAudioDspControls } from '../../src/endpoints/audiodspcontrols'
import { createMockClient } from '../helpers/mockClient'

describe('audiodspcontrols endpoint', () => {
    it('fetches DSP controls from /audiodspcontrols', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ audiodspcontrols: { audiomode: 'movie' } })

        const result = await fetchAudioDspControls(client)

        expect(getXml).toHaveBeenCalledWith('/audiodspcontrols')
        expect(result).toEqual({ audiomode: 'movie' })
    })

    it('returns an empty object when DSP controls are missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchAudioDspControls(client)

        expect(result).toEqual({})
    })

    it('posts DSP updates to /audiodspcontrols', async () => {
        const { client, post } = createMockClient()

        await setAudioDspControls(client, { audiomode: 'music', videosyncaudiodelay: 120 })

        expect(post).toHaveBeenCalledWith('/audiodspcontrols', '<audiodspcontrols audiomode="music" videosyncaudiodelay="120" />')
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchAudioDspControls(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(setAudioDspControls(client, { audiomode: 'movie' })).rejects.toBe(error)
    })
})
