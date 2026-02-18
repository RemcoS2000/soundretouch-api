import { describe, expect, it, vi } from 'vitest'

import { fetchPresets, subscribeNowSelectionUpdated, subscribePresetsUpdated } from '../../src/endpoints/presets'
import { createHttpMockClient, createWsMockClient } from '../helpers/mockClient'

describe('presets endpoint', () => {
    it('fetches presets from /presets', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ presets: { preset: [{ name: 'Preset 1' }] } })

        const result = await fetchPresets(client)

        expect(getXml).toHaveBeenCalledWith('/presets')
        expect(result).toEqual([{ name: 'Preset 1' }])
    })

    it('wraps a single preset into an array', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ presets: { preset: { name: 'Preset 1' } } })

        const result = await fetchPresets(client)

        expect(result).toEqual([{ name: 'Preset 1' }])
    })

    it('normalizes preset id to number', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ presets: { preset: [{ id: '2', name: 'Preset 2' }] } })

        const result = await fetchPresets(client)

        expect(result).toEqual([{ id: 2, name: 'Preset 2' }])
    })

    it('returns an empty array when presets are missing', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchPresets(client)

        expect(result).toEqual([])
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createHttpMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchPresets(client)).rejects.toBe(error)
    })

    it('subscribes to now selection websocket updates', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        const unsubscribe = vi.fn()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return unsubscribe
        })

        const handler = vi.fn()
        const off = subscribeNowSelectionUpdated(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onMessage).toHaveBeenCalledTimes(1)
        expect(off).toBe(unsubscribe)

        messageHandler?.({ nowSelectionUpdated: { preset: { id: 1, name: 'Preset 1' } } })
        expect(handler).toHaveBeenCalledWith({ id: 1, name: 'Preset 1' })
    })

    it('subscribes to presets websocket updates and normalizes id', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return vi.fn()
        })

        const handler = vi.fn()
        subscribePresetsUpdated(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onMessage).toHaveBeenCalledTimes(1)

        messageHandler?.({ presetsUpdated: { presets: { preset: [{ id: '2', name: 'Preset 2' }] } } })
        expect(handler).toHaveBeenCalledWith([{ id: 2, name: 'Preset 2' }])
    })
})
