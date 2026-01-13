import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { Capabilities } from '../types/Capabilities'

const log = createDebug('soundretouch:endpoints:capabilities')

type CapabilitiesResponse = {
    capabilities?: Capabilities
}

/**
 * Retrieves system capabilities for the device.
 *
 * GET /capabilities
 *
 * @returns Promise<Capabilities> A promise that resolves to the capabilities payload as returned by the device.
 */
export async function fetchCapabilities(client: HttpClient): Promise<Capabilities> {
    log('GET /capabilities')

    const data = await client.getXml<CapabilitiesResponse>('/capabilities')
    log('response %O', data.capabilities ?? {})

    return data.capabilities ?? {}
}
