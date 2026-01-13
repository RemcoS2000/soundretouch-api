import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { DeviceInfo } from '../types/DeviceInfo'

const log = createDebug('soundretouch:endpoints:info')

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
    log('GET /info')

    const data = await client.getXml<InfoResponse>('/info')
    log('response %O', data.info ?? {})

    return data.info ?? {}
}
