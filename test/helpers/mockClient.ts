import { vi } from 'vitest'

import type { HttpClient } from '../../src/client/http'
import type { WebSocketClient } from '../../src/client/ws'

export function createHttpMockClient() {
    const getXml = vi.fn()
    const post = vi.fn()
    const postXml = vi.fn()
    const client = { getXml, post, postXml } as unknown as HttpClient

    return { client, getXml, post, postXml }
}

export function createWsMockClient() {
    const ensureConnected = vi.fn()
    const onMessage = vi.fn()
    const client = { ensureConnected, onMessage } as unknown as WebSocketClient

    return { client, ensureConnected, onMessage }
}
