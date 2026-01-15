import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { ContentItem } from '../types/ContentItem'

const log = createDebug('soundretouch:endpoints:select')

function escapeXml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function buildContentItemXml(item: ContentItem): string {
    const source = `source="${escapeXml(item.source)}"`
    const account = item.sourceAccount ? ` sourceAccount="${escapeXml(item.sourceAccount)}"` : ''
    return `<ContentItem ${source}${account}></ContentItem>`
}

/**
 * Selects a content source on the device using the /select endpoint.
 *
 * Use the /sources endpoint to discover which sources are available for a device.
 * The available sources vary by product and SoundTouch account.
 *
 * POST /select
 *
 * @param item ContentItem describing the source and optional source account.
 * @returns A promise that resolves when the device accepts the selection.
 *
 * @example
 * await device.select({ source: 'AUX', sourceAccount: 'AUX' })
 * await device.select({ source: 'BLUETOOTH' })
 * await device.select({ source: 'PRODUCT', sourceAccount: 'TV' })
 */
export async function selectSource(client: HttpClient, item: ContentItem): Promise<void> {
    const body = buildContentItemXml(item)
    log('POST /select')
    log('payload %s', body)

    await client.post('/select', body)
}
