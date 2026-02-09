import { describe, expect, it } from 'vitest'

import { fetchNowPlaying } from '../../src/endpoints/nowPlaying'
import { createMockClient } from '../helpers/mockClient'

describe('now_playing endpoint', () => {
    it('fetches now playing info from /now_playing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ nowPlaying: { track: 'Song' } })

        const result = await fetchNowPlaying(client)

        expect(getXml).toHaveBeenCalledWith('/now_playing')
        expect(result).toEqual({ track: 'Song' })
    })

    it('includes repeatSetting and shuffleSetting when present', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({
            nowPlaying: {
                track: 'Song',
                repeatSetting: 'REPEAT_OFF',
                shuffleSetting: 'SHUFFLE_ON',
            },
        })

        const result = await fetchNowPlaying(client)

        expect(result.repeatSetting).toBe('REPEAT_OFF')
        expect(result.shuffleSetting).toBe('SHUFFLE_ON')
    })

    it('returns an empty object when now playing info is missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchNowPlaying(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchNowPlaying(client)).rejects.toBe(error)
    })
})
