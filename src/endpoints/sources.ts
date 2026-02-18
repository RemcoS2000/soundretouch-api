import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { normalizeSources, Sources, SourcesRawResponse } from '../types/Sources'

const log = createDebug('soundretouch:endpoints:sources')

type SourcesResponse = {
    sources?: SourcesRawResponse
}

/**
 * Fetches the list of available content sources from the device.
 *
 * GET /sources
 *
 * @returns Promise<Sources> A promise that resolves to the sources payload as returned by the device.
 */
export async function fetchSources(client: HttpClient): Promise<Sources> {
    log('GET /sources')

    const data = await client.getXml<SourcesResponse>('/sources')
    const sources = normalizeSources(data.sources)

    log('response %O', sources)

    return sources
}
