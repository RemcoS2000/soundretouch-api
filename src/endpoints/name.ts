import createDebug from 'debug'

import { HttpClient } from '../client/http'

const log = createDebug('soundretouch:endpoints:name')

function escapeXml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

/**
 * Sets the device name.
 *
 * POST /name
 *
 * @param name The name to assign to the device.
 * @returns A promise that resolves when the device accepts the new name.
 *
 * @example
 * await device.setName('Living Room')
 */
export async function setName(client: HttpClient, name: string): Promise<void> {
    const body = `<name>${escapeXml(name)}</name>`

    log('POST /name')
    log('payload %s', body)

    await client.post('/name', body)
}
