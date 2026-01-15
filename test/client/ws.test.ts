import { afterEach, describe, expect, it, vi } from 'vitest'

import { WebSocketClient } from '../../src/client/ws'

type Listener = (event: { data?: unknown }) => void

class MockWebSocket {
    static instances: MockWebSocket[] = []

    url: string
    protocols: string | string[] | undefined
    listeners: Record<string, Listener[]> = {}
    closed = false

    constructor(url: string, protocols?: string | string[]) {
        this.url = url
        this.protocols = protocols
        MockWebSocket.instances.push(this)
    }

    addEventListener(type: string, handler: Listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = []
        }
        this.listeners[type].push(handler)
    }

    close() {
        this.closed = true
    }

    emit(type: string, event: { data?: unknown } = {}) {
        const handlers = this.listeners[type] ?? []
        handlers.forEach((handler) => handler(event))
    }
}

describe('WebSocketClient', () => {
    const originalWebSocket = globalThis.WebSocket

    afterEach(() => {
        globalThis.WebSocket = originalWebSocket
        MockWebSocket.instances = []
        vi.restoreAllMocks()
    })

    it('connects using port 8080 and protocol gabbo', () => {
        globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket

        const socket = new WebSocketClient('device.local')
        socket.connect()

        expect(MockWebSocket.instances).toHaveLength(1)
        expect(MockWebSocket.instances[0].url).toBe('ws://device.local:8080')
        expect(MockWebSocket.instances[0].protocols).toBe('gabbo')
    })

    it('reconnects when autoReconnect is enabled', () => {
        globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket
        vi.useFakeTimers()

        const socket = new WebSocketClient('device.local', { autoReconnect: true, reconnectDelayMs: 10 })
        socket.connect()

        expect(MockWebSocket.instances).toHaveLength(1)

        MockWebSocket.instances[0].emit('close')
        expect(MockWebSocket.instances).toHaveLength(1)

        vi.advanceTimersByTime(10)
        expect(MockWebSocket.instances).toHaveLength(2)
        vi.useRealTimers()
    })

    it('forwards parsed updates payloads', () => {
        globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket

        const socket = new WebSocketClient('device.local')
        const handler = vi.fn()
        socket.onMessage(handler)
        socket.connect()

        const xml =
            '<updates deviceID="AA:BB"><nowPlayingUpdated><nowPlaying deviceID="AA:BB" source="AUX"><ContentItem source="AUX" location="room" sourceAccount="" isPresetable="false"><itemName>Line In</itemName></ContentItem><track/><artist/><album/><stationName>Station</stationName><art artImageStatus="IMAGE_PRESENT">http://example</art><playStatus>PLAY_STATE</playStatus><description>desc</description><stationLocation>loc</stationLocation></nowPlaying></nowPlayingUpdated></updates>'
        MockWebSocket.instances[0].emit('message', { data: xml })

        expect(handler).toHaveBeenCalledWith({
            updates: {
                deviceID: 'AA:BB',
                nowPlayingUpdated: {
                    nowPlaying: {
                        deviceID: 'AA:BB',
                        source: 'AUX',
                        ContentItem: {
                            source: 'AUX',
                            location: 'room',
                            sourceAccount: '',
                            isPresetable: false,
                            itemName: 'Line In',
                        },
                        track: '',
                        artist: '',
                        album: '',
                        stationName: 'Station',
                        art: { artImageStatus: 'IMAGE_PRESENT', '#text': 'http://example' },
                        playStatus: 'PLAY_STATE',
                        description: 'desc',
                        stationLocation: 'loc',
                    },
                },
            },
        })
    })

    it('forwards socket errors to error handlers', () => {
        globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket

        const socket = new WebSocketClient('device.local')
        const handler = vi.fn()
        socket.onError(handler)
        socket.connect()

        const errorEvent = { data: 'boom' }
        MockWebSocket.instances[0].emit('error', errorEvent)

        expect(handler).toHaveBeenCalledWith(errorEvent)
    })
})
