import { HttpClient } from '../client/http'
import { DeviceInfo } from '../types/DeviceInfo'

type InfoResponse = {
    info?: DeviceInfo
}

/**
 * Gets device information including identifiers, components, and network info.
 *
 * GET /info
 *
 * @returns Promise<DeviceInfo> A promise that resolves to the device info payload as returned by the device.
 */
export async function fetchInfo(client: HttpClient): Promise<DeviceInfo> {
    const data = await client.getXml<InfoResponse>('/info')
    return data.info ?? {}
}
