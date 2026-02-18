/**
 * Normalized types.
 */
export type ZoneMember = {
    ipaddress?: string
    macAddress?: string
}

export type Zone = {
    master?: string
    member?: ZoneMember | ZoneMember[]
}

/**
 * Raw response types.
 */
export type ZoneMemberRawResponse = Omit<ZoneMember, 'macAddress'> & {
    '#text'?: string
}

export type ZoneRawResponse = Omit<Zone, 'member'> & {
    member?: ZoneMemberRawResponse | ZoneMemberRawResponse[]
}

/**
 * Converts a raw zone member to the normalized ZoneMember shape.
 */
function normalizeZoneMember(member: ZoneMemberRawResponse): ZoneMember {
    return {
        ipaddress: member.ipaddress,
        ...(member['#text'] ? { macAddress: member['#text'] } : {}),
    }
}

/**
 * Converts a raw XML response shape to the normalized Zone shape.
 */
export function normalizeZone(zone?: ZoneRawResponse): Zone {
    if (!zone) return {}

    const member = Array.isArray(zone.member)
        ? zone.member.map((item) => normalizeZoneMember(item))
        : zone.member
          ? normalizeZoneMember(zone.member)
          : undefined

    return {
        master: zone.master,
        member,
    }
}

export type ZoneConfigMember = {
    ipaddress: string
    macAddress: string
}

export type ZoneConfig = {
    master: string
    senderIPAddress: string
    members: ZoneConfigMember[]
}

export type ZoneSlaveConfig = {
    master: string
    members: ZoneConfigMember[]
}
