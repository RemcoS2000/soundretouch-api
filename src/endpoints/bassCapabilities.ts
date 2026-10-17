import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type BassCapabilities } from '../types/BassCapabilities'

const log = createDebug('soundretouch:endpoints:basscapabilities')

type BassCapabilitiesResponse = {
    bassCapabilities?: BassCapabilities
}

/**
 * Gets bass capability information for the device.
 *
 * GET /bassCapabilities
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<BassCapabilities> A promise that resolves to the bass capabilities payload as returned by the device.
 */
export async function fetchBassCapabilities(client: HttpClient, options?: RequestOptions): Promise<BassCapabilities> {
    log('GET /bassCapabilities')

    const data = await client.getXml<BassCapabilitiesResponse>('/bassCapabilities', ...(options ? [options] : []))

    log('response %O', data.bassCapabilities ?? {})

    return data.bassCapabilities ?? {}
}
