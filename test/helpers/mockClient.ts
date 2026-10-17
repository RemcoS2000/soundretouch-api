import { type Mock, vi } from 'vitest'

import type { HttpClient } from '../../src/client/http'
import type { WebSocketClient } from '../../src/client/ws'

/** Builds typed endpoint spies without leaking Vitest's private inferred types. */
export function createHttpMockClient(): { client: HttpClient; getXml: Mock; post: Mock; postXml: Mock } {
    const getXml = vi.fn()
    const post = vi.fn()
    const postXml = vi.fn()
    const client = { getXml, post, postXml } as unknown as HttpClient

    return { client, getXml, post, postXml }
}

/** Builds transport spies shared by endpoint tests. */
export function createWsMockClient(): { client: WebSocketClient; ensureConnected: Mock; onMessage: Mock } {
    const ensureConnected = vi.fn()
    const onMessage = vi.fn()
    const client = { ensureConnected, onMessage } as unknown as WebSocketClient

    return { client, ensureConnected, onMessage }
}
