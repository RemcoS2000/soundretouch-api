import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { normalizeNowPlaying, NowPlaying, NowPlayingRawResponse } from '../types/NowPlaying'

const log = createDebug('soundretouch:endpoints:trackinfo')

type TrackInfoResponse = {
    nowPlaying?: NowPlayingRawResponse
}

/**
 * Gets track information for the currently playing media.
 *
 * GET /trackInfo
 *
 * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
 */
export async function fetchTrackInfo(client: HttpClient): Promise<NowPlaying> {
    log('GET /trackInfo')

    const data = await client.getXml<TrackInfoResponse>('/trackInfo')
    const nowPlaying = normalizeNowPlaying(data.nowPlaying)
    log('response %O', nowPlaying)
    return nowPlaying
}
