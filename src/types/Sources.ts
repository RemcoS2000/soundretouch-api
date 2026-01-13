import { SourceStatus } from './Enums'

export type SourceItem = {
    source?: string
    sourceAccount?: string
    status?: SourceStatus
    '#text'?: string
}

export type Sources = {
    deviceID?: string
    sourceItem?: SourceItem | SourceItem[]
}
