export type DeviceInfo = {
    deviceID?: string
    name?: string
    type?: string
    margeAccountUUID?: string
    components?: {
        component?: DeviceInfoComponent | DeviceInfoComponent[]
    }
    margeURL?: string
    networkInfo?: DeviceNetworkInfo | DeviceNetworkInfo[]
}

export type DeviceInfoComponent = {
    componentCategory?: string
    softwareVersion?: string
    serialNumber?: string
}

export type DeviceNetworkInfo = {
    type?: string
    macAddress?: string
    ipAddress?: string
}
