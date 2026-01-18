import createDebug from 'debug'

import { HttpClient } from '../client/http'
import { KeyState, KeyValue } from '../types/Enums'

const log = createDebug('soundretouch:endpoints:key')

export type SoundTouchKey = KeyValue
export type KeyPressState = KeyState

const KEY_SENDER = 'Gabbo'

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
 * @returns A promise that resolves when the device accepts the key event.
 *
 * @example
 * await sendKeyPress(client, 'PLAY', 'press')
 * await sendKeyPress(client, 'PLAY', 'release')
 */
export async function sendKeyPress(client: HttpClient, key: SoundTouchKey, state: KeyPressState = 'press'): Promise<void> {
    const body = `<key state="${state}" sender="${KEY_SENDER}">${key}</key>`

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
 * @returns A promise that resolves when the device accepts both key events.
 *
 * @example
 * await sendKeyPressAndRelease(client, 'PLAY')
 */
export async function sendKeyPressAndRelease(client: HttpClient, key: SoundTouchKey): Promise<void> {
    log('POST /key (press)')
    await sendKeyPress(client, key, 'press')

    log('POST /key (release)')
    await sendKeyPress(client, key, 'release')
}
