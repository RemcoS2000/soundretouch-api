export type PresetContentItem = {
    source?: string
    location?: string
    sourceAccount?: string
    isPresetable?: boolean
    itemName?: string
}

export type Preset = {
    id?: string
    createdOn?: string
    updateOn?: string
    ContentItem?: PresetContentItem
}

export type Presets = {
    preset?: Preset | Preset[]
}
