import { HttpClient } from '../client/http'
import { Capabilities } from '../types/Capabilities'

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
    const data = await client.getXml<CapabilitiesResponse>('/capabilities')
    return data.capabilities ?? {}
}
