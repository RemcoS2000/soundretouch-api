import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { UserTrackControlTypes } from '../types/Enums'

const log = createDebug('soundretouch:endpoints:usertrackcontrol')

/**
 * Sends a track control command to the device.
 *
 * POST /userTrackControl
 *
 * @param userTrackControlType Track control command to execute.
 * @param startSecond Optional start time in seconds, used for seek commands.
 * @returns A promise that resolves when the device accepts the control command.
 *
 * @example
 * await setUserTrackControl(client, 'SEEK_TO_TIME', 42)
 */
export async function setUserTrackControl(client: HttpClient, userTrackControlType: UserTrackControlTypes, startSecond?: number): Promise<void> {
    let startSecondAttr = ''
    if (userTrackControlType === 'SEEK_TO_TIME' && typeof startSecond === 'number') {
        startSecondAttr = ` startSecond="${Math.max(0, Math.round(startSecond))}"`
    }

    const body = `<TrackControl${startSecondAttr}>${userTrackControlType}</TrackControl>`

    log('POST /userTrackControl')
    log('payload %s', body)

    await client.post('/userTrackControl', body)
}
