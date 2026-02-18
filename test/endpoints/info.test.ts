import { describe, expect, it, vi } from 'vitest'

import { fetchInfo, subscribeInfoUpdated } from '../../src/endpoints/info'
import { createHttpMockClient, createWsMockClient } from '../helpers/mockClient'

describe('info endpoint', () => {
    it('fetches info from /info', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ info: { name: 'Living Room' } })

        const result = await fetchInfo(client)

        expect(getXml).toHaveBeenCalledWith('/info')
        expect(result).toEqual({ name: 'Living Room' })
    })

    it('returns an empty object when info is missing', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchInfo(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createHttpMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchInfo(client)).rejects.toBe(error)
    })

    it('subscribes to info websocket updates', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        const unsubscribe = vi.fn()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return unsubscribe
        })

        const handler = vi.fn()
        const off = subscribeInfoUpdated(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onMessage).toHaveBeenCalledTimes(1)
        expect(off).toBe(unsubscribe)

        messageHandler?.({ infoUpdated: {} })
        expect(handler).toHaveBeenCalledTimes(1)
    })
})
