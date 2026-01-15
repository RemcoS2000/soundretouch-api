import { describe, expect, it } from 'vitest'

import { fetchVolume, setVolume } from '../../src/endpoints/volume'
import { createMockClient } from '../helpers/mockClient'

describe('volume endpoint', () => {
    it('fetches volume from /volume', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ volume: { actualvolume: 15 } })

        const result = await fetchVolume(client)

        expect(getXml).toHaveBeenCalledWith('/volume')
        expect(result).toEqual({ actualvolume: 15 })
    })

    it('returns an empty object when volume is missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchVolume(client)

        expect(result).toEqual({})
    })

    it('posts normalized volume updates to /volume', async () => {
        const { client, post } = createMockClient()

        await setVolume(client, 101.7)

        expect(post).toHaveBeenCalledWith('/volume', '<volume>100</volume>')
    })

    it('posts mute updates alongside volume', async () => {
        const { client, post } = createMockClient()

        await setVolume(client, -3, true)

        expect(post).toHaveBeenCalledWith('/volume', '<volume>0<muteenabled>true</muteenabled></volume>')
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchVolume(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(setVolume(client, 25)).rejects.toBe(error)
    })
})
