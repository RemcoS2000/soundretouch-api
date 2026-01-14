import { describe, expect, it } from 'vitest'

import { fetchTrackInfo } from '../../src/endpoints/trackInfo'
import { createMockClient } from '../helpers/mockClient'

describe('trackInfo endpoint', () => {
    it('fetches track info from /trackInfo', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ nowPlaying: { track: 'Song' } })

        const result = await fetchTrackInfo(client)

        expect(getXml).toHaveBeenCalledWith('/trackInfo')
        expect(result).toEqual({ track: 'Song' })
    })

    it('returns an empty object when track info is missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchTrackInfo(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchTrackInfo(client)).rejects.toBe(error)
    })
})
