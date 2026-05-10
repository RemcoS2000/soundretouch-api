import { describe, expect, it, vi } from 'vitest'

import { fetchSources, subscribeSourcesUpdated } from '../../src/endpoints/sources'
import { createHttpMockClient, createWsMockClient } from '../helpers/mockClient'

describe('sources endpoint', () => {
    it('fetches sources from /sources', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({
            sources: {
                sourceItem: [
                    {
                        source: 'SPOTIFY',
                        sourceAccount: 1114435301,
                        status: 'READY',
                        isLocal: 'false',
                        multiroomallowed: 'true',
                        '#text': 'rem-coot-je@live.nl',
                    },
                ],
            },
        })

        const result = await fetchSources(client)

        expect(getXml).toHaveBeenCalledWith('/sources')
        expect(result).toEqual({
            sourceItem: [
                {
                    source: 'SPOTIFY',
                    sourceAccount: 1114435301,
                    status: 'READY',
                    isLocal: 'false',
                    multiroomallowed: 'true',
                    name: 'rem-coot-je@live.nl',
                },
            ],
        })
    })

    it('returns an empty object when sources are missing', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchSources(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createHttpMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchSources(client)).rejects.toBe(error)
    })

    it('subscribes to sources websocket updates', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        const unsubscribe = vi.fn()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return unsubscribe
        })

        const handler = vi.fn()
        const off = subscribeSourcesUpdated(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onMessage).toHaveBeenCalledTimes(1)
        expect(off).toBe(unsubscribe)

        messageHandler?.({ sourcesUpdated: {} })
        expect(handler).toHaveBeenCalledTimes(1)
    })
})
