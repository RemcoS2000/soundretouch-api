import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { type WebSocketClient } from '../client/ws'
import { escapeXml } from '../client/xml'
import { type Updates } from '../types/Updates'
import { normalizeZone, type Zone, type ZoneConfig, type ZoneConfigMember, type ZoneRawResponse, type ZoneSlaveConfig } from '../types/Zone'

const log = createDebug('soundretouch:endpoints:zone')

type ZoneResponse = {
    zone?: ZoneRawResponse
}

/**
 * Encodes reported member addresses and IDs as escaped zone XML.
 */
function buildZoneMembersXml(members: ZoneConfigMember[]): string {
    return members.map((member) => `<member ipaddress="${escapeXml(member.ipaddress)}">${escapeXml(member.macAddress)}</member>`).join('')
}

/**
 * Gets the current multi-room zone state from the device.
 *
 * GET /getZone
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<Zone> A promise that resolves to the zone payload as returned by the device.
 */
export async function fetchZone(client: HttpClient, options?: RequestOptions): Promise<Zone> {
    log('GET /getZone')

    const data = await client.getXml<ZoneResponse>('/getZone', ...(options ? [options] : []))
    const zone = normalizeZone(data.zone)

    log('response %O', zone)

    return zone
}

/**
 * Creates or updates a multi-room zone.
 *
 * POST /setZone
 *
 * @param client HTTP client for the target device.
 * @param config Zone configuration including master, sender IP, and member list.
 * @returns A promise that resolves when the device accepts the zone configuration.
 *
 * @example
 * await device.setZone({
 *     master: '00A040123456',
 *     senderIPAddress: '192.168.1.10',
 *     members: [{ ipaddress: '192.168.1.10', macAddress: '00A040123456' }],
 * })
 */
export async function setZone(client: HttpClient, config: ZoneConfig): Promise<void> {
    const membersXml = buildZoneMembersXml(config.members)
    const body = `<zone master="${escapeXml(config.master)}" senderIPAddress="${escapeXml(config.senderIPAddress)}">${membersXml}</zone>`

    log('POST /setZone')
    log('payload %s', body)
    await client.post('/setZone', body)
}

/**
 * Adds one or more slaves to a "play everywhere" zone.
 *
 * POST /addZoneSlave
 *
 * @param client HTTP client for the target device.
 * @param config Zone slave configuration including master and member list.
 * @returns A promise that resolves when the device accepts the zone update.
 *
 * @example
 * await device.addZoneSlave({
 *     master: '00A040123456',
 *     members: [{ ipaddress: '192.168.1.11', macAddress: '00A040654321' }],
 * })
 */
export async function addZoneSlave(client: HttpClient, config: ZoneSlaveConfig): Promise<void> {
    const membersXml = buildZoneMembersXml(config.members)
    const body = `<zone master="${escapeXml(config.master)}">${membersXml}</zone>`

    log('POST /addZoneSlave')
    log('payload %s', body)
    await client.post('/addZoneSlave', body)
}

/**
 * Removes one or more slaves from a "play everywhere" zone.
 *
 * POST /removeZoneSlave
 *
 * @param client HTTP client for the target device.
 * @param config Zone slave configuration including master and member list.
 * @returns A promise that resolves when the device accepts the zone update.
 *
 * @example
 * await device.removeZoneSlave({
 *     master: '00A040123456',
 *     members: [{ ipaddress: '192.168.1.11', macAddress: '00A040654321' }],
 * })
 */
export async function removeZoneSlave(client: HttpClient, config: ZoneSlaveConfig): Promise<void> {
    const membersXml = buildZoneMembersXml(config.members)
    const body = `<zone master="${escapeXml(config.master)}">${membersXml}</zone>`

    log('POST /removeZoneSlave')
    log('payload %s', body)
    await client.post('/removeZoneSlave', body)
}

/**
 * Subscribes to zone map update notifications from the websocket connection.
 *
 * @param wsClient WebSocket client used for async updates.
 * @param handler Callback invoked when the zone map changes.
 * @returns Unsubscribe function.
 */
export function subscribeZoneUpdated(wsClient: WebSocketClient, handler: () => void): () => void {
    return wsClient.onMessage<Updates>((update) => {
        if (update.zoneUpdated) {
            handler()
        }
    })
}
