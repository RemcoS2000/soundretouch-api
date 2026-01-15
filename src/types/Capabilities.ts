export type Capability = {
    name?: string
    url?: string
    info?: string
}

export type Capabilities = {
    deviceID?: string
    capability?: Capability | Capability[]
}
