import { describe, expect, it, vi } from 'vitest'

import { addZoneSlave, fetchZone, removeZoneSlave, setZone, subscribeZoneUpdated } from '../../src/endpoints/zone'
import { createHttpMockClient, createWsMockClient } from '../helpers/mockClient'

describe('zone endpoints', () => {
    it('fetches zone state from /getZone', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({ zone: { master: '00A040123456' } })

        const result = await fetchZone(client)

        expect(getXml).toHaveBeenCalledWith('/getZone')
        expect(result).toEqual({ master: '00A040123456' })
    })

    it('returns an empty object when zone state is missing', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchZone(client)

        expect(result).toEqual({})
    })

    it('normalizes zone members from #text to macAddress', async () => {
        const { client, getXml } = createHttpMockClient()
        getXml.mockResolvedValue({
            zone: {
                master: '00A040123456',
                member: [{ ipaddress: '192.168.1.10', '#text': '00A040123456' }],
            },
        })

        const result = await fetchZone(client)

        expect(result).toEqual({
            master: '00A040123456',
            member: [{ ipaddress: '192.168.1.10', macAddress: '00A040123456' }],
        })
    })

    it('posts zone updates to /setZone', async () => {
        const { client, post } = createHttpMockClient()

        await setZone(client, {
            master: '00A040123456',
            senderIPAddress: '192.168.1.10',
            members: [{ ipaddress: '192.168.1.10', macAddress: '00A040123456' }],
        })

        expect(post).toHaveBeenCalledWith(
            '/setZone',
            '<zone master="00A040123456" senderIPAddress="192.168.1.10"><member ipaddress="192.168.1.10">00A040123456</member></zone>'
        )
    })

    it('posts zone updates with multiple members', async () => {
        const { client, post } = createHttpMockClient()

        await setZone(client, {
            master: '00A040123456',
            senderIPAddress: '192.168.1.10',
            members: [
                { ipaddress: '192.168.1.10', macAddress: '00A040123456' },
                { ipaddress: '192.168.1.11', macAddress: '00A040654321' },
            ],
        })

        expect(post).toHaveBeenCalledWith(
            '/setZone',
            '<zone master="00A040123456" senderIPAddress="192.168.1.10"><member ipaddress="192.168.1.10">00A040123456</member><member ipaddress="192.168.1.11">00A040654321</member></zone>'
        )
    })

    it('posts zone slave additions to /addZoneSlave', async () => {
        const { client, post } = createHttpMockClient()

        await addZoneSlave(client, {
            master: '00A040123456',
            members: [{ ipaddress: '192.168.1.11', macAddress: '00A040654321' }],
        })

        expect(post).toHaveBeenCalledWith('/addZoneSlave', '<zone master="00A040123456"><member ipaddress="192.168.1.11">00A040654321</member></zone>')
    })

    it('posts zone slave removals to /removeZoneSlave', async () => {
        const { client, post } = createHttpMockClient()

        await removeZoneSlave(client, {
            master: '00A040123456',
            members: [{ ipaddress: '192.168.1.12', macAddress: '00A040000000' }],
        })

        expect(post).toHaveBeenCalledWith('/removeZoneSlave', '<zone master="00A040123456"><member ipaddress="192.168.1.12">00A040000000</member></zone>')
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createHttpMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchZone(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createHttpMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(
            setZone(client, {
                master: '00A040123456',
                senderIPAddress: '192.168.1.10',
                members: [{ ipaddress: '192.168.1.10', macAddress: '00A040123456' }],
            })
        ).rejects.toBe(error)
    })

    it('subscribes to zone websocket updates', () => {
        const { client, ensureConnected, onMessage } = createWsMockClient()
        const unsubscribe = vi.fn()
        let messageHandler: ((update: unknown) => void) | undefined

        onMessage.mockImplementation((handler: (update: unknown) => void) => {
            messageHandler = handler
            return unsubscribe
        })

        const handler = vi.fn()
        const off = subscribeZoneUpdated(client, handler)

        expect(ensureConnected).toHaveBeenCalledTimes(1)
        expect(onMessage).toHaveBeenCalledTimes(1)
        expect(off).toBe(unsubscribe)

        messageHandler?.({ zoneUpdated: {} })
        expect(handler).toHaveBeenCalledTimes(1)
    })
})
