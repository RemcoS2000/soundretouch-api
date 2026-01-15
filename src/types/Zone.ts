export type ZoneMember = {
    ipaddress?: string
    '#text'?: string
}

export type Zone = {
    master?: string
    member?: ZoneMember | ZoneMember[]
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
