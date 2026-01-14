import { describe, expect, it } from 'vitest'

import { fetchInfo } from '../../src/endpoints/info'
import { createMockClient } from '../helpers/mockClient'

describe('info endpoint', () => {
    it('fetches info from /info', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ info: { name: 'Living Room' } })

        const result = await fetchInfo(client)

        expect(getXml).toHaveBeenCalledWith('/info')
        expect(result).toEqual({ name: 'Living Room' })
    })

    it('returns an empty object when info is missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchInfo(client)

        expect(result).toEqual({})
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchInfo(client)).rejects.toBe(error)
    })
})
