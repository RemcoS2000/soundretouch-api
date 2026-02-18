import { describe, expect, it, vi } from 'vitest'

import { fetchVolume, setVolume, subscribeVolume } from '../../src/endpoints/volume'
import { createHttpMockClient, createWsMockClient } from '../helpers/mockClient'

describe('volume endpoint', () => {
    it('fetches volume from /volume', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ volume: { actualvolume: 15 } })

        const result = await fetchVolume(client)

        expect(getXml).toHaveBeenCalledWith('/volume')
        expect(result).toEqual({ actualvolume: 15 })
    })

    it('returns an empty object when volume is missing', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchVolume(client)

        expect(result).toEqual({})
    })

    it('posts normalized volume updates to /volume', async () => {
        const { client, post } = createHttpMockClient()

        await setVolume(client, 101.7)

        expect(post).toHaveBeenCalledWith('/volume', '<volume>100</volume>')
    })

    it('posts mute updates alongside volume', async () => {
        const { client, post } = createHttpMockClient()

        await setVolume(client, -3, true)

        expect(post).toHaveBeenCalledWith('/volume', '<volume>0<muteenabled>true</muteenabled></volume>')
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createHttpMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchVolume(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createHttpMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(setVolume(client, 25)).rejects.toBe(error)
    })

    it('subscribes to volume websocket updates', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        const unsubscribe = vi.fn()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return unsubscribe
        })

        const handler = vi.fn()
        const off = subscribeVolume(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onMessage).toHaveBeenCalledTimes(1)
        expect(off).toBe(unsubscribe)

        messageHandler?.({ volumeUpdated: { volume: { actualvolume: 22 } } })
        expect(handler).toHaveBeenCalledWith({ actualvolume: 22 })
    })
})
