import { describe, expect, it } from 'vitest'

import { fetchBassCapabilities } from '../../src/endpoints/bassCapabilities'
import { createHttpMockClient } from '../helpers/mockClient'

describe('bassCapabilities endpoint', () => {
    it('fetches bass capabilities from /bassCapabilities', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ bassCapabilities: { bassSupported: true } })

        const result = await fetchBassCapabilities(client)

        expect(getXml).toHaveBeenCalledWith('/bassCapabilities')
        expect(result).toEqual({ bassSupported: true })
    })

    it('returns an empty object when bass capabilities are missing', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchBassCapabilities(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createHttpMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchBassCapabilities(client)).rejects.toBe(error)
    })
})
