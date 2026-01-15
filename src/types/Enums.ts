export type ArtStatus = 'INVALID' | 'SHOW_DEFAULT_IMAGE' | 'DOWNLOADING' | 'IMAGE_PRESENT'

export type KeyValue =
    | 'PLAY'
    | 'PAUSE'
    | 'STOP'
    | 'PREV_TRACK'
    | 'NEXT_TRACK'
    | 'THUMBS_UP'
    | 'THUMBS_DOWN'
    | 'BOOKMARK'
    | 'POWER'
    | 'MUTE'
    | 'VOLUME_UP'
    | 'VOLUME_DOWN'
    | 'PRESET_1'
    | 'PRESET_2'
    | 'PRESET_3'
    | 'PRESET_4'
    | 'PRESET_5'
    | 'PRESET_6'
    | 'AUX_INPUT'
    | 'SHUFFLE_OFF'
    | 'SHUFFLE_ON'
    | 'REPEAT_OFF'
    | 'REPEAT_ONE'
    | 'REPEAT_ALL'
    | 'PLAY_PAUSE'
    | 'ADD_FAVORITE'
    | 'REMOVE_FAVORITE'
    | 'INVALID_KEY'

export type KeyState = 'press' | 'release'

export type PlayStatus = 'PLAY_STATE' | 'PAUSE_STATE' | 'STOP_STATE' | 'BUFFERING_STATE' | 'INVALID_PLAY_STATUS'

export type PresetId = 1 | 2 | 3 | 4 | 5 | 6

export type SourceStatus = 'UNAVAILABLE' | 'READY'

export type AudioMode = 'AUDIO_MODE_DIRECT' | 'AUDIO_MODE_NORMAL' | 'AUDIO_MODE_DIALOG' | 'AUDIO_MODE_NIGHT'
