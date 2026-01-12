export interface DeviceInfoRaw {
    deviceID?: string;
    deviceName?: string;
    type?: string;
    model?: string;
    moduleType?: string;
    variant?: string;
    variantMode?: string;
    macAddress?: string;
    ipAddress?: string;
    firmwareVersion?: string;
    firmwareUrl?: string;
    margeAccountUUID?: string;
}

export interface DeviceInfo {
    deviceId?: string;
    deviceName?: string;
    type?: string;
    model?: string;
    moduleType?: string;
    variant?: string;
    variantMode?: string;
    macAddress?: string;
    ipAddress?: string;
    firmwareVersion?: string;
    firmwareUrl?: string;
    margeAccountUUID?: string;
}

export function normalizeDeviceInfo(raw: DeviceInfoRaw): DeviceInfo {
    return {
        deviceId: raw.deviceID,
        deviceName: raw.deviceName,
        type: raw.type,
        model: raw.model,
        moduleType: raw.moduleType,
        variant: raw.variant,
        variantMode: raw.variantMode,
        macAddress: raw.macAddress,
        ipAddress: raw.ipAddress,
        firmwareVersion: raw.firmwareVersion,
        firmwareUrl: raw.firmwareUrl,
        margeAccountUUID: raw.margeAccountUUID,
    };
}
