import { afterEach, expect, it, vi } from 'vitest'

import { SoundTouchDiscovery } from '../src/discovery/SoundTouchDiscovery'

const mocks = vi.hoisted(() => ({ find: vi.fn(), destroy: vi.fn(), stop: vi.fn(), on: vi.fn() }))
vi.mock('bonjour-service', () => ({
    Bonjour: vi.fn(function () {
        return { find: mocks.find, destroy: mocks.destroy }
    }),
}))

afterEach(() => vi.clearAllMocks())

it('discovers each host once, ignores missing addresses and releases the browser', () => {
    mocks.find.mockReturnValue({ on: mocks.on, stop: mocks.stop })
    const found = vi.fn()
    const handle = SoundTouchDiscovery.start(found)
    const resolve = mocks.find.mock.calls[0]?.[1] as (service: { addresses?: string[] }) => void

    resolve({})
    resolve({ addresses: [] })
    resolve({ addresses: ['fixture.invalid'] })
    resolve({ addresses: ['fixture.invalid'] })
    expect(found).toHaveBeenCalledTimes(1)
    expect(found.mock.calls[0]?.[0].host).toBe('fixture.invalid')
    const error = mocks.on.mock.calls[0]?.[1] as (failure: Error) => void
    expect(() => error(new Error('mDNS permission denied'))).not.toThrow()
    found.mock.calls[0]?.[0].dispose()
    handle.stop()
    expect(mocks.stop).toHaveBeenCalledOnce()
    expect(mocks.destroy).toHaveBeenCalledOnce()
})
