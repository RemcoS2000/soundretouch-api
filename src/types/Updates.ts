import type { NowPlaying } from './NowPlaying'
import type { Preset } from './Presets'
import type { Recent } from './Recents'
import type { Volume } from './Volume'

export type Updates = {
    deviceID?: string
    nowPlayingUpdated?: {
        nowPlaying?: NowPlaying
    }
    presetsUpdated?: {
        presets?: {
            preset?: Preset | Preset[]
        }
    }
    acctModeUpdated?: Record<string, never>
    bassUpdated?: Record<string, never>
    errorNotification?: Record<string, unknown>
    nowSelectionUpdated?: {
        preset?: Preset
    }
    connectionStateUpdated?: Record<string, never>
    infoUpdated?: Record<string, never>
    siteSurveyResultsUpdated?: Record<string, never>
    sourcesUpdated?: Record<string, never>
    swUpdateStatusUpdated?: Record<string, never>
    zoneUpdated?: Record<string, never>
    recentsUpdated?: {
        recents?: {
            recent?: Recent | Recent[]
        }
    }
    volumeUpdated?: {
        volume?: Volume
    }
    [key: string]: unknown
}
