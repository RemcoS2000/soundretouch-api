import { afterEach, describe, expect, it, vi } from 'vitest'

import { HttpClient } from '../../src/client/http'
import { WebSocketClient } from '../../src/client/ws'
import { SoundTouchDevice } from '../../src/device/SoundTouchDevice'
import { requiredAt } from '../requiredAt'

class Socket {
    static instances: Socket[] = []
    readyState = 0
    listeners = new Map<string, Array<(event: unknown) => void>>()
    constructor() {
        Socket.instances.push(this)
    }
    addEventListener(name: string, handler: (event: unknown) => void) {
        this.listeners.set(name, [...(this.listeners.get(name) ?? []), handler])
    }
    emit(name: string, event = {}) {
        this.listeners.get(name)?.forEach((handler) => handler(event))
    }
    close() {
        this.readyState = 3
    }
}
afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    Socket.instances = []
})
describe('device lifecycle', () => {
    it('reports actual open state and ignores a late close from a replaced socket', () => {
        vi.useFakeTimers()
        vi.stubGlobal('WebSocket', Socket)
        const client = new WebSocketClient('speaker')
        client.connect()
        const first = requiredAt(Socket.instances, 0)
        expect(client.isConnected()).toBe(false)
        first.readyState = 1
        first.emit('open')
        expect(client.isConnected()).toBe(true)
        client.close()
        client.connect()
        const second = requiredAt(Socket.instances, 1)
        second.readyState = 1
        second.emit('open')
        first.emit('close')
        expect(client.isConnected()).toBe(true)
        client.dispose()
        expect(vi.getTimerCount()).toBe(0)
    })
    it('stops reconnect after disconnect and permanently closes a disposed device', () => {
        vi.useFakeTimers()
        vi.stubGlobal('WebSocket', Socket)
        const device = new SoundTouchDevice('speaker', { ws: { autoReconnect: true } })
        const states: string[] = []
        device.onTransportStateChanged((state) => states.push(state))
        const off = device.onNowPlayingUpdated(() => {})
        requiredAt(Socket.instances, 0).emit('close')
        expect(states).toContain('reconnecting')
        device.disconnect()
        vi.advanceTimersByTime(60000)
        expect(Socket.instances).toHaveLength(1)
        device.connect()
        off()
        device.dispose()
        expect(states[states.length - 1]).toBe('disposed')
        expect(() => device.connect()).toThrow('disposed')
        expect(vi.getTimerCount()).toBe(0)
    })
    it('connection timeout schedules bounded reconnect', () => {
        vi.useFakeTimers()
        vi.stubGlobal('WebSocket', Socket)
        const client = new WebSocketClient('speaker', { autoReconnect: true, connectTimeoutMs: 10, reconnectDelayMs: 10 })
        client.connect()
        vi.advanceTimersByTime(20)
        expect(Socket.instances).toHaveLength(2)
        client.dispose()
        expect(vi.getTimerCount()).toBe(0)
    })
    it('caller cancellation remains cancellation and dispose cancels pending HTTP', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(
                (_url, init) =>
                    new Promise((_resolve, reject) => {
                        init.signal.addEventListener('abort', () => reject(Object.assign(new Error('cancelled'), { name: 'AbortError' })))
                    })
            )
        )
        const client = new HttpClient('speaker')
        const controller = new AbortController()
        const request = client.getXml('/info', { signal: controller.signal })
        controller.abort()
        await expect(request).rejects.toMatchObject({ name: 'AbortError' })
        const pending = client.getXml('/volume')
        client.dispose()
        await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
        await expect(client.getXml('/info')).rejects.toThrow('disposed')
    })
})
