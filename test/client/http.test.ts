import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TimeoutError } from '../../src/client/errors'
import { HttpClient } from '../../src/client/http'

describe('HttpClient', () => {
    const originalFetch = globalThis.fetch

    beforeEach(() => {
        globalThis.fetch = vi.fn()
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        vi.restoreAllMocks()
    })

    it('parses XML responses for GET requests', async () => {
        const response = new Response('<info><name>Kitchen</name></info>', { status: 200 })
        ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(response)

        const client = new HttpClient('device.local')
        const payload = await client.getXml<{ info: { name: string } }>('/info')

        expect(payload).toEqual({ info: { name: 'Kitchen' } })
        expect(globalThis.fetch).toHaveBeenCalledWith('http://device.local:8090/info', expect.any(Object))
    })

    it('routes requests through a proxy when proxyUrl is provided', async () => {
        const response = new Response('<info><name>Kitchen</name></info>', { status: 200 })
        ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(response)

        const proxyUrl = 'http://localhost:3734/proxy?url='
        const client = new HttpClient('device.local', { proxyUrl })
        await client.getXml<{ info: { name: string } }>('/info')

        const directUrl = 'http://device.local:8090/info'
        expect(globalThis.fetch).toHaveBeenCalledWith(`${proxyUrl}${encodeURIComponent(directUrl)}`, expect.any(Object))
    })

    it('returns empty objects for empty POST XML responses', async () => {
        const response = new Response('', { status: 200 })
        ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(response)

        const client = new HttpClient('device.local')
        const payload = await client.postXml('/select', '<ContentItem></ContentItem>')

        expect(payload).toEqual({})
    })

    it('throws HttpError on non-OK responses', async () => {
        const response = new Response('<error>nope</error>', { status: 500, statusText: 'Server Error' })
        ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(response)

        const client = new HttpClient('device.local')

        await expect(client.getXml('/info')).rejects.toMatchObject({
            name: 'HttpError',
            status: 500,
            statusText: 'Server Error',
            body: '<error>nope</error>',
        })
    })

    it('throws TimeoutError when a request is aborted', async () => {
        const error = new Error('aborted')
        ;(error as Error & { name: string }).name = 'AbortError'
        ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(error)

        const client = new HttpClient('device.local', { timeoutMs: 5 })

        await expect(client.getXml('/info')).rejects.toBeInstanceOf(TimeoutError)
    })
})
