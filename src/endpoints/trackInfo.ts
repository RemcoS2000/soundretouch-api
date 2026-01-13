import { HttpClient } from '../client/http'
import { NowPlaying } from '../types/NowPlaying'

type TrackInfoResponse = {
    nowPlaying?: NowPlaying
}

/**
 * Gets track information for the currently playing media.
 *
 * GET /trackInfo
 *
 * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
 */
export async function fetchTrackInfo(client: HttpClient): Promise<NowPlaying> {
    const data = await client.getXml<TrackInfoResponse>('/trackInfo')
    return data.nowPlaying ?? {}
}
