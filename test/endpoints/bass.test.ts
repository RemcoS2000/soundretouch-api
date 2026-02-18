import { describe, expect, it, vi } from 'vitest'

import { fetchBass, setBass, subscribeBassUpdated } from '../../src/endpoints/bass'
import { createHttpMockClient, createWsMockClient } from '../helpers/mockClient'

describe('bass endpoint', () => {
    it('fetches bass from /bass', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ bass: { value: 4 } })

        const result = await fetchBass(client)

        expect(getXml).toHaveBeenCalledWith('/bass')
        expect(result).toEqual({ value: 4 })
    })

    it('returns an empty object when bass is missing', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchBass(client)

        expect(result).toEqual({})
    })

    it('posts bass updates to /bass', async () => {
        const { client, post } = createHttpMockClient()

        await setBass(client, 5)

        expect(post).toHaveBeenCalledWith('/bass', '<bass>5</bass>')
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createHttpMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchBass(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createHttpMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(setBass(client, 2)).rejects.toBe(error)
    })

    it('subscribes to bass websocket updates', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        const unsubscribe = vi.fn()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return unsubscribe
        })

        const handler = vi.fn()
        const off = subscribeBassUpdated(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onMessage).toHaveBeenCalledTimes(1)
        expect(off).toBe(unsubscribe)

        messageHandler?.({ bassUpdated: {} })
        expect(handler).toHaveBeenCalledTimes(1)
    })
})
