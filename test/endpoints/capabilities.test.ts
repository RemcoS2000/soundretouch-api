import { describe, expect, it } from 'vitest'

import { fetchCapabilities } from '../../src/endpoints/capabilities'
import { createMockClient } from '../helpers/mockClient'

describe('capabilities endpoint', () => {
    it('fetches capabilities from /capabilities', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ capabilities: { deviceID: 'abc' } })

        const result = await fetchCapabilities(client)

        expect(getXml).toHaveBeenCalledWith('/capabilities')
        expect(result).toEqual({ deviceID: 'abc' })
    })

    it('returns an empty object when capabilities are missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchCapabilities(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchCapabilities(client)).rejects.toBe(error)
    })
})
