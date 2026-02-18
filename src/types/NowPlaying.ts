import { ArtStatus, PlayStatus, RepeatSetting, ShuffleSetting } from './Enums'

/**
 * Normalized types.
 */
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
        url?: string
    }
    time?: {
        elapsed?: number
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

/**
 * Raw response types.
 */
export type NowPlayingRawResponse = Omit<NowPlaying, 'art' | 'time'> & {
    art?: {
        artImageStatus?: ArtStatus
        '#text'?: string
    }
    time?: {
        '#text'?: number
        total?: number
    }
}

/**
 * Converts the raw XML response shape to the normalized NowPlaying shape.
 */
export function normalizeNowPlaying(nowPlaying?: NowPlayingRawResponse): NowPlaying {
    if (!nowPlaying) return {}

    return {
        ...nowPlaying,
        art: nowPlaying.art
            ? {
                  artImageStatus: nowPlaying.art.artImageStatus,
                  url: nowPlaying.art['#text'],
              }
            : undefined,
        time: nowPlaying.time
            ? {
                  elapsed: nowPlaying.time['#text'],
                  total: nowPlaying.time.total,
              }
            : undefined,
    }
}
