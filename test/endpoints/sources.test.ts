import { describe, expect, it } from 'vitest'

import { fetchSources } from '../../src/endpoints/sources'
import { createMockClient } from '../helpers/mockClient'

describe('sources endpoint', () => {
    it('fetches sources from /sources', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ sources: { source: [{ source: 'AUX' }] } })

        const result = await fetchSources(client)

        expect(getXml).toHaveBeenCalledWith('/sources')
        expect(result).toEqual({ source: [{ source: 'AUX' }] })
    })

    it('returns an empty object when sources are missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchSources(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchSources(client)).rejects.toBe(error)
    })
})
