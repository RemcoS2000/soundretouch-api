export interface NowPlayingRaw {
    deviceID?: string;
    source?: string;
    stationName?: string;
    track?: string;
    artist?: string;
    album?: string;
    genre?: string;
    description?: string;
    location?: string;
    playStatus?: string;
    isAdvertisement?: boolean;
    skipEnabled?: boolean;
    favoriteEnabled?: boolean;
    streamType?: string;
    art?: {
        artStatus?: string;
        url?: string;
    };
    time?: {
        total?: number;
        current?: number;
    };
}

export interface NowPlaying {
    deviceId?: string;
    source?: string;
    stationName?: string;
    track?: string;
    artist?: string;
    album?: string;
    genre?: string;
    description?: string;
    location?: string;
    playStatus?: string;
    isAdvertisement?: boolean;
    skipEnabled?: boolean;
    favoriteEnabled?: boolean;
    streamType?: string;
    art?: {
        status?: string;
        url?: string;
    };
    time?: {
        total?: number;
        current?: number;
    };
}

export function normalizeNowPlaying(raw: NowPlayingRaw): NowPlaying {
    return {
        deviceId: raw.deviceID,
        source: raw.source,
        stationName: raw.stationName,
        track: raw.track,
        artist: raw.artist,
        album: raw.album,
        genre: raw.genre,
        description: raw.description,
        location: raw.location,
        playStatus: raw.playStatus,
        isAdvertisement: raw.isAdvertisement,
        skipEnabled: raw.skipEnabled,
        favoriteEnabled: raw.favoriteEnabled,
        streamType: raw.streamType,
        art: raw.art
            ? {
                  status: raw.art.artStatus,
                  url: raw.art.url,
              }
            : undefined,
        time: raw.time
            ? {
                  total: raw.time.total,
                  current: raw.time.current,
              }
            : undefined,
    };
}
