import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { Sources } from '../types/Sources'

const log = createDebug('soundretouch:endpoints:sources')

type SourcesResponse = {
    sources?: Sources
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
    log('response %O', data.sources ?? {})

    return data.sources ?? {}
}
