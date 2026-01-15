import { describe, expect, it } from 'vitest'

import { fetchAudioProductToneControls, setAudioProductToneControls } from '../../src/endpoints/audioProductToneControls'
import { createMockClient } from '../helpers/mockClient'

describe('audioproducttonecontrols endpoint', () => {
    it('fetches tone controls from /audioproducttonecontrols', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ audioproducttonecontrols: { bass: 3 } })

        const result = await fetchAudioProductToneControls(client)

        expect(getXml).toHaveBeenCalledWith('/audioproducttonecontrols')
        expect(result).toEqual({ bass: 3 })
    })

    it('returns an empty object when tone controls are missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchAudioProductToneControls(client)

        expect(result).toEqual({})
    })

    it('posts tone updates to /audioproducttonecontrols', async () => {
        const { client, post } = createMockClient()

        await setAudioProductToneControls(client, { bass: 2, treble: -1 })

        expect(post).toHaveBeenCalledWith(
            '/audioproducttonecontrols',
            '<audioproducttonecontrols><bass value="2" /><treble value="-1" /></audioproducttonecontrols>'
        )
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchAudioProductToneControls(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(setAudioProductToneControls(client, { bass: 1 })).rejects.toBe(error)
    })
})
