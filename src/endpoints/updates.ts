import { WebSocketClient } from '../client/ws'
import { Recents } from '../types/Recents'
import { Updates } from '../types/Updates'

/**
 * Subscribes to software update status notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when update status changes.
 * @returns Unsubscribe function.
 */
export function subscribeSwUpdateStatusUpdated(wsClient: WebSocketClient, handler: () => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        if (update.swUpdateStatusUpdated) {
            handler()
        }
    })
}

/**
 * Subscribes to site survey results update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when site survey results change.
 * @returns Unsubscribe function.
 */
export function subscribeSiteSurveyResultsUpdated(wsClient: WebSocketClient, handler: () => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        if (update.siteSurveyResultsUpdated) {
            handler()
        }
    })
}

/**
 * Subscribes to network connection state notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when connection state changes.
 * @returns Unsubscribe function.
 */
export function subscribeConnectionStateUpdated(wsClient: WebSocketClient, handler: () => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        if (update.connectionStateUpdated) {
            handler()
        }
    })
}

/**
 * Subscribes to account mode update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when account mode changes.
 * @returns Unsubscribe function.
 */
export function subscribeAcctModeUpdated(wsClient: WebSocketClient, handler: () => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        if (update.acctModeUpdated) {
            handler()
        }
    })
}

/**
 * Subscribes to error notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when an error notification is received.
 * @returns Unsubscribe function.
 */
export function subscribeErrorNotification(wsClient: WebSocketClient, handler: (error: Record<string, unknown>) => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        if (update.errorNotification) {
            handler(update.errorNotification)
        }
    })
}

/**
 * Subscribes to recents update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked with the parsed recents payload.
 * @returns Unsubscribe function.
 */
export function subscribeRecentsUpdated(wsClient: WebSocketClient, handler: (recents: Recents) => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onMessage<Updates>((update) => {
        const recent = update.recentsUpdated?.recents?.recent
        if (Array.isArray(recent)) {
            handler(recent)
            return
        }

        if (recent) {
            handler([recent])
        }
    })
}

/**
 * Subscribes to websocket errors.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when a WebSocket error is raised.
 * @returns Unsubscribe function.
 */
export function subscribeWebSocketError(wsClient: WebSocketClient, handler: (error: unknown) => void): () => void {
    wsClient.ensureConnected()

    return wsClient.onError(handler)
}
