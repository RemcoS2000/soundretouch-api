import createDebug from 'debug'

import { type HttpClient, type RequestOptions } from '../client/http'
import { normalizeNowPlaying, type NowPlaying, type NowPlayingRawResponse } from '../types/NowPlaying'

const log = createDebug('soundretouch:endpoints:trackinfo')

type TrackInfoResponse = {
    nowPlaying?: NowPlayingRawResponse
}

/**
 * Gets track information for the currently playing media.
 *
 * GET /trackInfo
 *
 * @param client HTTP client for the target device.
 * @param options Optional cancellation signal for this read.
 * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
 */
export async function fetchTrackInfo(client: HttpClient, options?: RequestOptions): Promise<NowPlaying> {
    log('GET /trackInfo')

    const data = await client.getXml<TrackInfoResponse>('/trackInfo', ...(options ? [options] : []))
    const nowPlaying = normalizeNowPlaying(data.nowPlaying)

    log('response %O', nowPlaying)

    return nowPlaying
}
