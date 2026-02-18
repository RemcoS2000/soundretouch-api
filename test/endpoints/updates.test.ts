import { describe, expect, it, vi } from 'vitest'

import {
    subscribeAcctModeUpdated,
    subscribeConnectionStateUpdated,
    subscribeErrorNotification,
    subscribeRecentsUpdated,
    subscribeSiteSurveyResultsUpdated,
    subscribeSwUpdateStatusUpdated,
    subscribeWebSocketError,
} from '../../src/endpoints/updates'
import { createWsMockClient } from '../helpers/mockClient'

describe('updates endpoint subscriptions', () => {
    it('subscribes to sw update status updates', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        let messageHandler: ((update: unknown) => void) | undefined
        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return vi.fn()
        })

        const handler = vi.fn()
        subscribeSwUpdateStatusUpdated(client, handler)
        messageHandler?.({ swUpdateStatusUpdated: {} })

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('subscribes to site survey updates', () => {
        const { client, onMessage } = createWsMockClient()
        let messageHandler: ((update: unknown) => void) | undefined
        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return vi.fn()
        })

        const handler = vi.fn()
        subscribeSiteSurveyResultsUpdated(client, handler)
        messageHandler?.({ siteSurveyResultsUpdated: {} })

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('subscribes to connection state updates', () => {
        const { client, onMessage } = createWsMockClient()
        let messageHandler: ((update: unknown) => void) | undefined
        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return vi.fn()
        })

        const handler = vi.fn()
        subscribeConnectionStateUpdated(client, handler)
        messageHandler?.({ connectionStateUpdated: {} })

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('subscribes to account mode updates', () => {
        const { client, onMessage } = createWsMockClient()
        let messageHandler: ((update: unknown) => void) | undefined
        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return vi.fn()
        })

        const handler = vi.fn()
        subscribeAcctModeUpdated(client, handler)
        messageHandler?.({ acctModeUpdated: {} })

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('subscribes to error notifications', () => {
        const { client, onMessage } = createWsMockClient()
        let messageHandler: ((update: unknown) => void) | undefined
        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return vi.fn()
        })

        const handler = vi.fn()
        subscribeErrorNotification(client, handler)
        messageHandler?.({ errorNotification: { code: 500 } })

        expect(handler).toHaveBeenCalledWith({ code: 500 })
    })

    it('subscribes to recents updates and wraps single recent', () => {
        const { client, onMessage } = createWsMockClient()
        let messageHandler: ((update: unknown) => void) | undefined
        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return vi.fn()
        })

        const handler = vi.fn()
        subscribeRecentsUpdated(client, handler)
        messageHandler?.({ recentsUpdated: { recents: { recent: { utcTime: '1' } } } })

        expect(handler).toHaveBeenCalledWith([{ utcTime: '1' }])
    })

    it('subscribes to websocket errors', () => {
        const onError = vi.fn().mockReturnValue(vi.fn())
        const ensureConnected = vi.fn()
        const client = { ensureConnected, onError } as never
        const handler = vi.fn()

        subscribeWebSocketError(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onError).toHaveBeenCalledWith(handler)
    })
})
