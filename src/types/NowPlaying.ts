import { ArtStatus, PlayStatus } from './Enums'

export type NowPlayingContentItem = {
    source?: string
    location?: string
    sourceAccount?: string
    isPresetable?: boolean
    itemName?: string
}

export type NowPlaying = {
    deviceID?: string
    source?: string
    ContentItem?: NowPlayingContentItem
    track?: string
    artist?: string
    album?: string
    stationName?: string
    art?: {
        artImageStatus?: ArtStatus
        '#text'?: string
    }
    playStatus?: PlayStatus
    description?: string
    stationLocation?: string
}
