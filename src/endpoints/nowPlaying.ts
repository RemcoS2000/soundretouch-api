import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { NowPlaying } from '../types/NowPlaying'

const log = createDebug('soundretouch:endpoints:nowplaying')

type NowPlayingResponse = {
    nowPlaying?: NowPlaying
}

/**
 * Gets info about the currently playing media.
 *
 * GET /now_playing
 *
 * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
 */
export async function fetchNowPlaying(client: HttpClient): Promise<NowPlaying> {
    log('GET /now_playing')

    const data = await client.getXml<NowPlayingResponse>('/now_playing')
    log('response %O', data.nowPlaying ?? {})

    return data.nowPlaying ?? {}
}
