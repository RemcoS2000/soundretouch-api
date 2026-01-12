import { HttpClient } from '../client/http';
import { DeviceInfo, DeviceInfoRaw, normalizeDeviceInfo } from '../models/DeviceInfo';

interface InfoResponse {
    info?: DeviceInfoRaw;
}

export async function fetchInfo(client: HttpClient): Promise<DeviceInfo> {
    const data = await client.getXml<InfoResponse>('/info');
    return normalizeDeviceInfo(data.info ?? {});
}
