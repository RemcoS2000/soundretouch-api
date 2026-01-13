import { HttpClient } from '../client/http'
import { BassCapabilities } from '../types/BassCapabilities'

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
    const data = await client.getXml<BassCapabilitiesResponse>('/bassCapabilities')
    return data.bassCapabilities ?? {}
}
