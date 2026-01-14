import { describe, expect, it } from 'vitest'

import { addZoneSlave, fetchZone, removeZoneSlave, setZone } from '../../src/endpoints/zone'
import { createMockClient } from '../helpers/mockClient'

describe('zone endpoints', () => {
    it('fetches zone state from /getZone', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({ zone: { master: '00A040123456' } })

        const result = await fetchZone(client)

        expect(getXml).toHaveBeenCalledWith('/getZone')
        expect(result).toEqual({ master: '00A040123456' })
    })

    it('returns an empty object when zone state is missing', async () => {
        const { client, getXml } = createMockClient()
        getXml.mockResolvedValue({})

        const result = await fetchZone(client)

        expect(result).toEqual({})
    })

    it('posts zone updates to /setZone', async () => {
        const { client, post } = createMockClient()

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
        const { client, post } = createMockClient()

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
        const { client, post } = createMockClient()

        await addZoneSlave(client, {
            master: '00A040123456',
            members: [{ ipaddress: '192.168.1.11', macAddress: '00A040654321' }],
        })

        expect(post).toHaveBeenCalledWith('/addZoneSlave', '<zone master="00A040123456"><member ipaddress="192.168.1.11">00A040654321</member></zone>')
    })

    it('posts zone slave removals to /removeZoneSlave', async () => {
        const { client, post } = createMockClient()

        await removeZoneSlave(client, {
            master: '00A040123456',
            members: [{ ipaddress: '192.168.1.12', macAddress: '00A040000000' }],
        })

        expect(post).toHaveBeenCalledWith('/removeZoneSlave', '<zone master="00A040123456"><member ipaddress="192.168.1.12">00A040000000</member></zone>')
    })

    it('propagates errors from GET requests', async () => {
        const { client, getXml } = createMockClient()
        const error = new Error('network')
        getXml.mockRejectedValue(error)

        await expect(fetchZone(client)).rejects.toBe(error)
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createMockClient()
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
})
