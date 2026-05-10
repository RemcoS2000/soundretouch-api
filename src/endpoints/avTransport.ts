import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { AvTransportResponse } from '../types/AvTransport'

const log = createDebug('soundretouch:endpoints:avtransport')

const AV_TRANSPORT_SERVICE = 'urn:schemas-upnp-org:service:AVTransport:1'

function escapeXml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

/**
 * Sets the AV transport URI on the device.
 *
 * POST /AVTransport/Control
 *
 * @param client HTTP client for the target device.
 * @param currentUri Stream or media URL to load.
 * @param currentUriMetaData Optional metadata, left empty for the MVP.
 * @returns A promise that resolves when the device accepts the URI.
 */
export async function setAvTransportUri(client: HttpClient, currentUri: string, currentUriMetaData = ''): Promise<AvTransportResponse> {
    const body = [
        '<?xml version="1.0"?>',
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">',
        '  <s:Body>',
        '    <u:SetAVTransportURI xmlns:u="' + AV_TRANSPORT_SERVICE + '">',
        '      <InstanceID>0</InstanceID>',
        '      <CurrentURI>' + escapeXml(currentUri) + '</CurrentURI>',
        '      <CurrentURIMetaData>' + escapeXml(currentUriMetaData) + '</CurrentURIMetaData>',
        '    </u:SetAVTransportURI>',
        '  </s:Body>',
        '</s:Envelope>',
    ].join('\n')

    log('POST /AVTransport/Control SetAVTransportURI')
    log('payload %s', body)

    const response = await client.postXml<AvTransportResponse>('/AVTransport/Control', body, {
        SOAPAction: `"${AV_TRANSPORT_SERVICE}#SetAVTransportURI"`,
    })

    log('response %O', response.Envelope?.Body ?? {})
    return response
}

/**
 * Starts playback on the device's AV transport.
 *
 * POST /AVTransport/Control
 *
 * @param client HTTP client for the target device.
 * @returns A promise that resolves when playback is accepted.
 */
export async function playAvTransport(client: HttpClient): Promise<AvTransportResponse> {
    const body = [
        '<?xml version="1.0"?>',
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">',
        '  <s:Body>',
        '    <u:Play xmlns:u="' + AV_TRANSPORT_SERVICE + '">',
        '      <InstanceID>0</InstanceID>',
        '      <Speed>1</Speed>',
        '    </u:Play>',
        '  </s:Body>',
        '</s:Envelope>',
    ].join('\n')

    log('POST /AVTransport/Control Play')
    log('payload %s', body)

    const response = await client.postXml<AvTransportResponse>('/AVTransport/Control', body, {
        SOAPAction: `"${AV_TRANSPORT_SERVICE}#Play"`,
    })

    log('response %O', response.Envelope?.Body ?? {})
    return response
}

/**
 * Loads a stream URL and starts playback.
 *
 * POST /AVTransport/Control
 *
 * @param client HTTP client for the target device.
 * @param currentUri Stream or media URL to load.
 * @param currentUriMetaData Optional metadata, left empty for the MVP.
 * @returns A promise that resolves when the device accepts both SOAP calls.
 */
export async function playStreamUrl(client: HttpClient, currentUri: string, currentUriMetaData = ''): Promise<AvTransportResponse> {
    await setAvTransportUri(client, currentUri, currentUriMetaData)
    return playAvTransport(client)
}
