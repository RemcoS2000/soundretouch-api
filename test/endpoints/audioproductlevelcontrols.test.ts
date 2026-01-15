import { describe, expect, it } from 'vitest'

import { fetchAudioProductLevelControls, setAudioProductLevelControls } from '../../src/endpoints/audioProductLevelControls'
import { createMockClient } from '../helpers/mockClient'

describe('audioproductlevelcontrols endpoint', () => {
    it('fetches level controls from /audioproductlevelcontrols', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ audioproductlevelcontrols: { frontCenterSpeakerLevel: 1 } })

        const result = await fetchAudioProductLevelControls(client)

        expect(getXml).toHaveBeenCalledWith('/audioproductlevelcontrols')
        expect(result).toEqual({ frontCenterSpeakerLevel: 1 })
    })

    it('returns an empty object when level controls are missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchAudioProductLevelControls(client)

        expect(result).toEqual({})
    })

    it('posts level updates to /audioproductlevelcontrols', async () => {
        const { client, post } = createMockClient()

        await setAudioProductLevelControls(client, { frontCenterSpeakerLevel: 2, rearSurroundSpeakersLevel: -1 })

        expect(post).toHaveBeenCalledWith(
            '/audioproductlevelcontrols',
            '<audioproductlevelcontrols><frontCenterSpeakerLevel value="2" /><rearSurroundSpeakersLevel value="-1" /></audioproductlevelcontrols>'
        )
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchAudioProductLevelControls(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(setAudioProductLevelControls(client, { frontCenterSpeakerLevel: 1 })).rejects.toBe(error)
    })
})
