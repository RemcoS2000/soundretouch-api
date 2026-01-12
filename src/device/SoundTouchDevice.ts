import { HttpClient, HttpClientOptions } from '../client/http';
import { DeviceInfo } from '../models/DeviceInfo';
import { NowPlaying } from '../models/NowPlaying';
import { VolumeState } from '../models/VolumeState';
import { fetchInfo } from '../endpoints/info';
import { fetchNowPlaying } from '../endpoints/nowPlaying';
import { fetchVolume, setVolume } from '../endpoints/volume';
import { sendKeyPress, SoundTouchKey } from '../endpoints/key';

export class SoundTouchDevice {
    private client: HttpClient;

    constructor(host: string, options?: HttpClientOptions) {
        this.client = new HttpClient(host, options);
    }

    info(): Promise<DeviceInfo> {
        return fetchInfo(this.client);
    }

    nowPlaying(): Promise<NowPlaying> {
        return fetchNowPlaying(this.client);
    }

    volume(): Promise<VolumeState> {
        return fetchVolume(this.client);
    }

    setVolume(value: number): Promise<void> {
        return setVolume(this.client, value);
    }

    keyPress(key: SoundTouchKey): Promise<void> {
        return sendKeyPress(this.client, key);
    }

    play(): Promise<void> {
        return this.keyPress('PLAY');
    }

    pause(): Promise<void> {
        return this.keyPress('PAUSE');
    }

    next(): Promise<void> {
        return this.keyPress('NEXT_TRACK');
    }

    previous(): Promise<void> {
        return this.keyPress('PREV_TRACK');
    }
}
