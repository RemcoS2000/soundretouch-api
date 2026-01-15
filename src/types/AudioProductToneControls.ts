export type ToneControl = {
    value?: number
    minValue?: number
    maxValue?: number
    step?: number
}

export type AudioProductToneControls = {
    bass?: ToneControl
    treble?: ToneControl
}

export type AudioProductToneControlsUpdate = {
    bass?: number
    treble?: number
}
