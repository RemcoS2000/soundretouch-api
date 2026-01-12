export interface VolumeStateRaw {
    actual?: number;
    target?: number;
    muteenabled?: boolean;
    muted?: boolean;
}

export interface VolumeState {
    actual: number;
    target: number;
    muteEnabled: boolean;
    muted: boolean;
}

export function normalizeVolumeState(raw: VolumeStateRaw): VolumeState {
    const actual = raw.actual ?? 0;
    return {
        actual,
        target: raw.target ?? actual,
        muteEnabled: raw.muteenabled ?? false,
        muted: raw.muted ?? false,
    };
}
