import { HttpClient } from '../client/http';
import { VolumeState, VolumeStateRaw, normalizeVolumeState } from '../models/VolumeState';

interface VolumeResponse {
    volume?: VolumeStateRaw;
}

export async function fetchVolume(client: HttpClient): Promise<VolumeState> {
    const data = await client.getXml<VolumeResponse>('/volume');
    return normalizeVolumeState(data.volume ?? {});
}

export async function setVolume(client: HttpClient, value: number): Promise<void> {
    const normalized = Math.max(0, Math.min(100, Math.round(value)));
    const body = `<volume>${normalized}</volume>`;
    await client.post('/volume', body);
}
