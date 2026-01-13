import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { KeyState, KeyValue } from '../types/Enums'

const log = createDebug('soundretouch:endpoints:key')

export type SoundTouchKey = KeyValue
export type KeyPressState = KeyState

/**
 * Sends a remote button press or release to the device.
 *
 * POST /key
 *
 * Keys are used as a simple means to interact with the SoundTouch speaker.
 * For a full listing of supported keys see "KEY VALUE" in section 4.1 of the API docs.
 * It is good practice to send a "press" followed by a "release" to simulate a full key click.
 *
 * @param key Key value to send.
 * @param state Key state to send: "press" or "release".
 * @param sender Sender label to include in the request.
 * @returns A promise that resolves when the device accepts the key event.
 *
 * @example
 * await sendKeyPress(client, 'PLAY', 'press', 'Gabbo')
 * await sendKeyPress(client, 'PLAY', 'release', 'Gabbo')
 */
export async function sendKeyPress(client: HttpClient, key: SoundTouchKey, state: KeyPressState = 'press', sender = 'soundretouch-api'): Promise<void> {
    const body = `<key state="${state}" sender="${sender}">${key}</key>`

    log('POST /key')
    log('payload %s', body)

    await client.post('/key', body)
}

/**
 * Sends a press then release sequence for a key.
 *
 * POST /key
 *
 * @param key Key value to send.
 * @param sender Sender label to include in the request.
 * @returns A promise that resolves when the device accepts both key events.
 *
 * @example
 * await sendKeyTap(client, 'PLAY', 'Gabbo')
 */
export async function sendKeyTap(client: HttpClient, key: SoundTouchKey, sender = 'soundretouch-api'): Promise<void> {
    log('POST /key (press)')
    await sendKeyPress(client, key, 'press', sender)

    log('POST /key (release)')
    await sendKeyPress(client, key, 'release', sender)
}
