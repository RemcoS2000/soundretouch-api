import { describe, expect, it } from 'vitest'

import { fetchBass, setBass } from '../../src/endpoints/bass'
import { createMockClient } from '../helpers/mockClient'

describe('bass endpoint', () => {
    it('fetches bass from /bass', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ bass: { value: 4 } })

        const result = await fetchBass(client)

        expect(getXml).toHaveBeenCalledWith('/bass')
        expect(result).toEqual({ value: 4 })
    })

    it('returns an empty object when bass is missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchBass(client)

        expect(result).toEqual({})
    })

    it('posts bass updates to /bass', async () => {
        const { client, post } = createMockClient()

        await setBass(client, 5)

        expect(post).toHaveBeenCalledWith('/bass', '<bass>5</bass>')
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchBass(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(setBass(client, 2)).rejects.toBe(error)
    })
})
