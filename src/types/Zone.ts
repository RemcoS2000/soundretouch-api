/**
 * Normalized types.
 */
export type ZoneMember = {
    ipaddress?: string | undefined
    macAddress?: string | undefined
}

export type Zone = {
    master?: string | undefined
    member?: ZoneMember | ZoneMember[] | undefined
}

/**
 * Raw response types.
 */
export type ZoneMemberRawResponse = Omit<ZoneMember, 'macAddress'> & {
    '#text'?: string
}

export type ZoneRawResponse = Omit<Zone, 'member'> & {
    member?: ZoneMemberRawResponse | ZoneMemberRawResponse[] | undefined
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
    if (!zone) {
        return {}
    }

    let member: ZoneMember | ZoneMember[] | undefined

    if (Array.isArray(zone.member)) {
        member = zone.member.map(normalizeZoneMember)
    } else if (zone.member) {
        member = normalizeZoneMember(zone.member)
    }

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
