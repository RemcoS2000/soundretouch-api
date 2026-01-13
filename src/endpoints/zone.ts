import { HttpClient } from '../client/http'
import { Zone, ZoneConfig, ZoneConfigMember, ZoneSlaveConfig } from '../types/Zone'

type ZoneResponse = {
    zone?: Zone
}

function buildZoneMembersXml(members: ZoneConfigMember[]): string {
    return members.map((member) => `<member ipaddress="${member.ipaddress}">${member.macAddress}</member>`).join('')
}

/**
 * Gets the current multi-room zone state from the device.
 *
 * GET /getZone
 *
 * @returns Promise<Zone> A promise that resolves to the zone payload as returned by the device.
 */
export async function fetchZone(client: HttpClient): Promise<Zone> {
    const data = await client.getXml<ZoneResponse>('/getZone')
    return data.zone ?? {}
}

/**
 * Creates or updates a multi-room zone.
 *
 * POST /setZone
 *
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
    const body = `<zone master="${config.master}" senderIPAddress="${config.senderIPAddress}">${membersXml}</zone>`
    await client.post('/setZone', body)
}

/**
 * Adds one or more slaves to a "play everywhere" zone.
 *
 * POST /addZoneSlave
 *
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
    const body = `<zone master="${config.master}">${membersXml}</zone>`
    await client.post('/addZoneSlave', body)
}

/**
 * Removes one or more slaves from a "play everywhere" zone.
 *
 * POST /removeZoneSlave
 *
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
    const body = `<zone master="${config.master}">${membersXml}</zone>`
    await client.post('/removeZoneSlave', body)
}
