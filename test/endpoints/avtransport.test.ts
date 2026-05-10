import { describe, expect, it } from 'vitest'

import { playAvTransport, playStreamUrl, setAvTransportUri } from '../../src/endpoints/avTransport'
import { createMockClient } from '../helpers/mockClient'

describe('avTransport endpoint', () => {
    it('posts a set-av-transport-uri SOAP request with escaped stream data', async () => {
        const { client, postXml } = createMockClient()
        postXml.mockResolvedValue({ Envelope: { Body: {} } })

        await setAvTransportUri(client, 'http://example.com/radio?station=A&B', '<meta>test</meta>')

        expect(postXml).toHaveBeenCalledWith(
            '/AVTransport/Control',
            expect.stringContaining('<CurrentURI>http://example.com/radio?station=A&amp;B</CurrentURI>'),
            {
                SOAPAction: '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
            }
        )
        expect(postXml).toHaveBeenCalledWith(
            '/AVTransport/Control',
            expect.stringContaining('<CurrentURIMetaData>&lt;meta&gt;test&lt;/meta&gt;</CurrentURIMetaData>'),
            {
                SOAPAction: '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
            }
        )
    })

    it('posts a play SOAP request', async () => {
        const { client, postXml } = createMockClient()
        postXml.mockResolvedValue({ Envelope: { Body: {} } })

        await playAvTransport(client)

        expect(postXml).toHaveBeenCalledWith('/AVTransport/Control', expect.stringContaining('<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">'), {
            SOAPAction: '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
        })
    })

    it('loads a stream url before starting playback', async () => {
        const { client, postXml } = createMockClient()
        postXml.mockResolvedValue({ Envelope: { Body: {} } })

        await playStreamUrl(client, 'http://example.com/radio.mp3')

        expect(postXml).toHaveBeenNthCalledWith(1, '/AVTransport/Control', expect.stringContaining('<CurrentURI>http://example.com/radio.mp3</CurrentURI>'), {
            SOAPAction: '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
        })
        expect(postXml).toHaveBeenNthCalledWith(
            2,
            '/AVTransport/Control',
            expect.stringContaining('<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">'),
            {
                SOAPAction: '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
            }
        )
    })

    it('propagates errors from av transport requests', async () => {
        const { client, postXml } = createMockClient()
        const error = new Error('write failed')
        postXml.mockRejectedValue(error)

        await expect(playAvTransport(client)).rejects.toBe(error)
    })
})
