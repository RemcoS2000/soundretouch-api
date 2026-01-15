import { describe, expect, it } from 'vitest'

import { fetchPresets } from '../../src/endpoints/presets'
import { createMockClient } from '../helpers/mockClient'

describe('presets endpoint', () => {
    it('fetches presets from /presets', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ presets: { preset: [{ name: 'Preset 1' }] } })

        const result = await fetchPresets(client)

        expect(getXml).toHaveBeenCalledWith('/presets')
        expect(result).toEqual([{ name: 'Preset 1' }])
    })

    it('wraps a single preset into an array', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ presets: { preset: { name: 'Preset 1' } } })

        const result = await fetchPresets(client)

        expect(result).toEqual([{ name: 'Preset 1' }])
    })

    it('returns an empty array when presets are missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchPresets(client)

        expect(result).toEqual([])
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchPresets(client)).rejects.toBe(error)
    })
})
