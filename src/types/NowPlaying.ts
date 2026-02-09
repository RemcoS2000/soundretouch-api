import { ArtStatus, PlayStatus, RepeatSetting, ShuffleSetting } from './Enums'

export type NowPlayingContentItem = {
    source?: string
    location?: string
    sourceAccount?: number | string
    isPresetable?: boolean
    itemName?: string
    containerArt?: string
    type?: string
}

export type NowPlaying = {
    deviceID?: string
    source?: string
    sourceAccount?: number | string
    ContentItem?: NowPlayingContentItem
    track?: string
    artist?: string
    album?: string
    stationName?: string
    art?: {
        artImageStatus?: ArtStatus
        '#text'?: string
    }
    time?: {
        '#text'?: number
        total?: number
    }
    playStatus?: PlayStatus
    description?: string
    stationLocation?: string
    repeatSetting?: RepeatSetting
    shuffleSetting?: ShuffleSetting
    favoriteEnabled?: string
    skipEnabled?: string
    skipPreviousEnabled?: string
    streamType?: string
    trackID?: string
    seekSupported?: {
        value?: boolean
    }
}
