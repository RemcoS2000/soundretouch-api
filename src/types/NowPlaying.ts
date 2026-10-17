import { type ArtStatus, type PlayStatus, type RepeatSetting, type ShuffleSetting } from './Enums'

/**
 * Normalized types.
 */
export type NowPlayingContentItem = {
    source?: string | undefined
    location?: string | undefined
    sourceAccount?: number | string | undefined
    isPresetable?: boolean | undefined
    itemName?: string | undefined
    containerArt?: string | undefined
    type?: string | undefined
}

export type NowPlaying = {
    deviceID?: string | undefined
    source?: string | undefined
    sourceAccount?: number | string | undefined
    ContentItem?: NowPlayingContentItem | undefined
    track?: string | undefined
    artist?: string | undefined
    album?: string | undefined
    stationName?: string | undefined
    art?: {
        artImageStatus?: ArtStatus | undefined
        url?: string | undefined
    }
    time?: {
        elapsed?: number | undefined
        total?: number | undefined
    }
    playStatus?: PlayStatus | undefined
    description?: string | undefined
    stationLocation?: string | undefined
    repeatSetting?: RepeatSetting | undefined
    shuffleSetting?: ShuffleSetting | undefined
    favoriteEnabled?: string | undefined
    skipEnabled?: string | undefined
    skipPreviousEnabled?: string | undefined
    streamType?: string | undefined
    trackID?: string | undefined
    seekSupported?: {
        value?: boolean | undefined
    }
}

/**
 * Raw response types.
 */
export type NowPlayingRawResponse = Omit<NowPlaying, 'art' | 'time'> & {
    art?: {
        artImageStatus?: ArtStatus | undefined
        '#text'?: string
    }
    time?: {
        '#text'?: number
        total?: number | undefined
    }
}

/**
 * Converts a raw XML response shape to the normalized NowPlaying shape.
 */
export function normalizeNowPlaying(nowPlaying?: NowPlayingRawResponse): NowPlaying {
    if (!nowPlaying) {
        return {}
    }

    return {
        ...nowPlaying,
        ...(nowPlaying.art
            ? {
                  art: {
                      artImageStatus: nowPlaying.art.artImageStatus,
                      url: nowPlaying.art['#text'],
                  },
              }
            : {}),
        ...(nowPlaying.time
            ? {
                  time: {
                      elapsed: nowPlaying.time['#text'],
                      total: nowPlaying.time.total,
                  },
              }
            : {}),
    }
}
