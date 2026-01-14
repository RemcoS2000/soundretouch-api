import { vi } from 'vitest'

import type { HttpClient } from '../../src/client/http'

export function createMockClient() {
    const getXml = vi.fn()
    const post = vi.fn()
    const postXml = vi.fn()
    const client = { getXml, post, postXml } as unknown as HttpClient

    return { client, getXml, post, postXml }
}
