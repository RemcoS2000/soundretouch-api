import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { BassCapabilities } from '../types/BassCapabilities'

const log = createDebug('soundretouch:endpoints:basscapabilities')

type BassCapabilitiesResponse = {
    bassCapabilities?: BassCapabilities
}

/**
 * Gets bass capability information for the device.
 *
 * GET /bassCapabilities
 *
 * @returns Promise<BassCapabilities> A promise that resolves to the bass capabilities payload as returned by the device.
 */
export async function fetchBassCapabilities(client: HttpClient): Promise<BassCapabilities> {
    log('GET /bassCapabilities')

    const data = await client.getXml<BassCapabilitiesResponse>('/bassCapabilities')
    log('response %O', data.bassCapabilities ?? {})

    return data.bassCapabilities ?? {}
}
