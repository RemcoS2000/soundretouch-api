import { HttpClient } from '../client/http';

export type SoundTouchKey =
    | 'PLAY'
    | 'PAUSE'
    | 'NEXT_TRACK'
    | 'PREV_TRACK'
    | 'MUTE'
    | 'POWER'
    | 'SHUFFLE_ON'
    | 'SHUFFLE_OFF'
    | 'REPEAT_ALL'
    | 'REPEAT_OFF'
    | 'THUMBS_UP'
    | 'THUMBS_DOWN';

export type KeyPressState = 'press' | 'release';

export async function sendKeyPress(client: HttpClient, key: SoundTouchKey, state: KeyPressState = 'press'): Promise<void> {
    const body = `<key state="${state}" sender="soundretouch-api">${key}</key>`;
    await client.post('/key', body);
}
