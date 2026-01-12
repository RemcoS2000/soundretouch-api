import { HttpClient } from '../client/http';
import { NowPlaying, NowPlayingRaw, normalizeNowPlaying } from '../models/NowPlaying';

interface NowPlayingResponse {
    nowPlaying?: NowPlayingRaw;
}

export async function fetchNowPlaying(client: HttpClient): Promise<NowPlaying> {
    const data = await client.getXml<NowPlayingResponse>('/now_playing');
    return normalizeNowPlaying(data.nowPlaying ?? {});
}
