export type RecentContentItem = {
    source?: string
    location?: string
    sourceAccount?: string
    isPresetable?: boolean
    itemName?: string
}

export type Recent = {
    deviceID?: string
    utcTime?: string
    contentItem?: RecentContentItem
}

export type Recents = Recent[]
