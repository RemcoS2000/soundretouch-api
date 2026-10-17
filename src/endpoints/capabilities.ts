import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type Capabilities } from '../types/Capabilities'

const log = createDebug('soundretouch:endpoints:capabilities')

type CapabilitiesResponse = {
    capabilities?: Capabilities
}

/**
 * Retrieves system capabilities for the device.
 *
 * GET /capabilities
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<Capabilities> A promise that resolves to the capabilities payload as returned by the device.
 */
export async function fetchCapabilities(client: HttpClient, options?: RequestOptions): Promise<Capabilities> {
    log('GET /capabilities')

    const data = await client.getXml<CapabilitiesResponse>('/capabilities', ...(options ? [options] : []))

    log('response %O', data.capabilities ?? {})

    return data.capabilities ?? {}
}
