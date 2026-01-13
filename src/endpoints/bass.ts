import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { Bass } from '../types/Bass'

const log = createDebug('soundretouch:endpoints:bass')

type BassResponse = {
    bass?: Bass
}

/**
 * Gets the current bass setting from the device.
 *
 * GET /bass
 *
 * @returns Promise<Bass> A promise that resolves to the bass payload as returned by the device.
 */
export async function fetchBass(client: HttpClient): Promise<Bass> {
    log('GET /bass')

    const data = await client.getXml<BassResponse>('/bass')
    log('response %O', data.bass ?? {})

    return data.bass ?? {}
}

/**
 * Sets the bass level for the device.
 *
 * POST /bass
 *
 * @param value Bass value to set.
 * @returns A promise that resolves when the device accepts the bass value.
 *
 * @example
 * await device.setBass(5)
 */
export async function setBass(client: HttpClient, value: number): Promise<void> {
    const body = `<bass>${value}</bass>`

    log('POST /bass')
    log('payload %s', body)

    await client.post('/bass', body)
}
