import { describe, expect, it, vi } from 'vitest'

import { fetchNowPlaying, subscribeNowPlaying } from '../../src/endpoints/nowPlaying'
import { createHttpMockClient, createWsMockClient } from '../helpers/mockClient'

describe('now_playing endpoint', () => {
    it('fetches now playing info from /now_playing', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ nowPlaying: { track: 'Song' } })

        const result = await fetchNowPlaying(client)

        expect(getXml).toHaveBeenCalledWith('/now_playing')
        expect(result).toEqual({ track: 'Song' })
    })

    it('includes repeatSetting and shuffleSetting when present', async () => {
        const { client, getXml } = createHttpMockClient()
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
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchNowPlaying(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createHttpMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchNowPlaying(client)).rejects.toBe(error)
    })

    it('subscribes to now playing websocket updates and normalizes payload', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        const unsubscribe = vi.fn()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return unsubscribe
        })

        const handler = vi.fn()
        const off = subscribeNowPlaying(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onMessage).toHaveBeenCalledTimes(1)
        expect(off).toBe(unsubscribe)

        messageHandler?.({
            nowPlayingUpdated: {
                nowPlaying: {
                    track: 'Song',
                    art: { artImageStatus: 'IMAGE_PRESENT', '#text': 'https://example.com/art.jpg' },
                    time: { '#text': 51, total: 242 },
                },
            },
        })

        expect(handler).toHaveBeenCalledWith({
            track: 'Song',
            art: { artImageStatus: 'IMAGE_PRESENT', url: 'https://example.com/art.jpg' },
            time: { elapsed: 51, total: 242 },
        })
    })

    it('ignores websocket updates when now playing payload is missing', () => {
        const { client, onMessage } = createWsMockClient()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return vi.fn()
        })

        const handler = vi.fn()
        subscribeNowPlaying(client, handler)

        messageHandler?.({ volumeUpdated: { volume: { actualvolume: 22 } } })
        expect(handler).not.toHaveBeenCalled()
    })
})
