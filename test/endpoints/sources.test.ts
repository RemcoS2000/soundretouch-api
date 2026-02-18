import { describe, expect, it } from 'vitest'

import { fetchSources } from '../../src/endpoints/sources'
import { createHttpMockClient } from '../helpers/mockClient'

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
})
