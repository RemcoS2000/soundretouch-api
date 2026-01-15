export type LevelControl = {
    value?: number
    minValue?: number
    maxValue?: number
    step?: number
}

export type AudioProductLevelControls = {
    frontCenterSpeakerLevel?: LevelControl
    rearSurroundSpeakersLevel?: LevelControl
}

export type AudioProductLevelControlsUpdate = {
    frontCenterSpeakerLevel?: number
    rearSurroundSpeakersLevel?: number
}
