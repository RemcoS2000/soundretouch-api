import { HttpClient, HttpClientOptions } from '../client/http'
import { DeviceInfo } from '../types/DeviceInfo'
import { NowPlaying } from '../types/NowPlaying'
import { Sources } from '../types/Sources'
import { Volume } from '../types/Volume'
import { Bass } from '../types/Bass'
import { BassCapabilities } from '../types/BassCapabilities'
import { Capabilities } from '../types/Capabilities'
import { AudioDspControls } from '../types/AudioDspControls'
import { AudioProductToneControls, AudioProductToneControlsUpdate } from '../types/AudioProductToneControls'
import { AudioProductLevelControls, AudioProductLevelControlsUpdate } from '../types/AudioProductLevelControls'
import { Presets } from '../types/Presets'
import { Zone, ZoneConfig, ZoneSlaveConfig } from '../types/Zone'
import { fetchInfo } from '../endpoints/info'
import { fetchNowPlaying } from '../endpoints/nowPlaying'
import { fetchTrackInfo } from '../endpoints/trackInfo'
import { fetchSources } from '../endpoints/sources'
import { selectSource } from '../endpoints/select'
import { setName } from '../endpoints/name'
import { fetchVolume, setVolume } from '../endpoints/volume'
import { fetchBass, setBass } from '../endpoints/bass'
import { fetchBassCapabilities } from '../endpoints/bassCapabilities'
import { fetchCapabilities } from '../endpoints/capabilities'
import { fetchAudioDspControls, setAudioDspControls } from '../endpoints/audiodspcontrols'
import { fetchAudioProductToneControls, setAudioProductToneControls } from '../endpoints/audioProductToneControls'
import { fetchAudioProductLevelControls, setAudioProductLevelControls } from '../endpoints/audioProductLevelControls'
import { fetchPresets } from '../endpoints/presets'
import { addZoneSlave, fetchZone, removeZoneSlave, setZone } from '../endpoints/zone'
import { sendKeyPress, sendKeyTap, SoundTouchKey } from '../endpoints/key'
import { ContentItem } from '../types/ContentItem'

/**
 * Represents a SoundTouch device and provides methods to interact with it.
 * @param host The hostname or IP address of the SoundTouch device.
 * @param options Optional HTTP client configuration.
 *
 * @example
 * const device = new SoundTouchDevice('192.168.1.x');
 * const info = await device.info();
 */
export class SoundTouchDevice {
    readonly host: string

    private client: HttpClient

    constructor(host: string, options?: HttpClientOptions) {
        this.host = host
        this.client = new HttpClient(host, options)
    }

    info(): Promise<DeviceInfo> {
        return fetchInfo(this.client)
    }

    /**
     * Gets info about the currently playing media.
     *
     * GET /now_playing
     *
     * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
     */
    nowPlaying(): Promise<NowPlaying> {
        return fetchNowPlaying(this.client)
    }

    /**
     * Gets track information for the currently playing media.
     *
     * GET /trackInfo
     *
     * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
     */
    trackInfo(): Promise<NowPlaying> {
        return fetchTrackInfo(this.client)
    }

    /**
     * Lists available content sources on the device.
     *
     * GET /sources
     *
     * @returns Promise<Sources> A promise that resolves to the sources payload as returned by the device.
     */
    sources(): Promise<Sources> {
        return fetchSources(this.client)
    }

    /**
     * Selects a content source on the device.
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
    select(item: ContentItem): Promise<void> {
        return selectSource(this.client, item)
    }

    volume(): Promise<Volume> {
        return fetchVolume(this.client)
    }

    /**
     * Gets the current bass setting from the device.
     *
     * GET /bass
     *
     * @returns Promise<Bass> A promise that resolves to the bass payload as returned by the device.
     */
    bass(): Promise<Bass> {
        return fetchBass(this.client)
    }

    /**
     * Gets bass capability information for the device.
     *
     * GET /bassCapabilities
     *
     * @returns Promise<BassCapabilities> A promise that resolves to the bass capabilities payload as returned by the device.
     */
    bassCapabilities(): Promise<BassCapabilities> {
        return fetchBassCapabilities(this.client)
    }

    /**
     * Retrieves system capabilities for the device.
     *
     * GET /capabilities
     *
     * @returns Promise<Capabilities> A promise that resolves to the capabilities payload as returned by the device.
     */
    capabilities(): Promise<Capabilities> {
        return fetchCapabilities(this.client)
    }

    /**
     * Gets the current DSP settings for the device.
     *
     * GET /audiodspcontrols
     *
     * @returns Promise<AudioDspControls> A promise that resolves to the DSP controls payload as returned by the device.
     */
    audioDspControls(): Promise<AudioDspControls> {
        return fetchAudioDspControls(this.client)
    }

    /**
     * Gets the current bass and treble settings from the device.
     *
     * GET /audioproducttonecontrols
     *
     * @returns Promise<AudioProductToneControls> A promise that resolves to the tone controls payload as returned by the device.
     */
    audioProductToneControls(): Promise<AudioProductToneControls> {
        return fetchAudioProductToneControls(this.client)
    }

    /**
     * Updates bass and/or treble settings for the device. Only included values are changed.
     *
     * POST /audioproducttonecontrols
     *
     * @param values Tone values to update (bass and/or treble).
     * @returns A promise that resolves when the device accepts the tone update.
     *
     * @example
     * await device.setAudioProductToneControls({ bass: 2 })
     * await device.setAudioProductToneControls({ treble: -1 })
     */
    setAudioProductToneControls(values: AudioProductToneControlsUpdate): Promise<void> {
        return setAudioProductToneControls(this.client, values)
    }

    /**
     * Gets the current front-center and rear-surround level settings from the device.
     *
     * GET /audioproductlevelcontrols
     *
     * @returns Promise<AudioProductLevelControls> A promise that resolves to the level controls payload as returned by the device.
     */
    audioProductLevelControls(): Promise<AudioProductLevelControls> {
        return fetchAudioProductLevelControls(this.client)
    }

    /**
     * Updates front-center and/or rear-surround levels for the device. Only included values are changed.
     *
     * POST /audioproductlevelcontrols
     *
     * @param values Level values to update (frontCenterSpeakerLevel and/or rearSurroundSpeakersLevel).
     * @returns A promise that resolves when the device accepts the level update.
     *
     * @example
     * await device.setAudioProductLevelControls({ frontCenterSpeakerLevel: 1 })
     * await device.setAudioProductLevelControls({ rearSurroundSpeakersLevel: -2 })
     */
    setAudioProductLevelControls(values: AudioProductLevelControlsUpdate): Promise<void> {
        return setAudioProductLevelControls(this.client, values)
    }

    /**
     * Updates DSP settings for the device. Only included values are changed.
     *
     * POST /audiodspcontrols
     *
     * @param values DSP values to update (audiomode and/or videosyncaudiodelay).
     * @returns A promise that resolves when the device accepts the DSP update.
     *
     * @example
     * await device.setAudioDspControls({ audiomode: 'movie' })
     * await device.setAudioDspControls({ videosyncaudiodelay: 150 })
     */
    setAudioDspControls(values: AudioDspControls): Promise<void> {
        return setAudioDspControls(this.client, values)
    }

    /**
     * Gets the list of current presets from the device.
     *
     * GET /presets
     *
     * @returns Promise<Presets> A promise that resolves to the presets payload as returned by the device.
     */
    presets(): Promise<Presets> {
        return fetchPresets(this.client)
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
    setName(name: string): Promise<void> {
        return setName(this.client, name)
    }

    /**
     * Sets the bass level for the device.
     *
     * POST /bass
     *
     * @param value Bass value to set.
     * @returns A promise that resolves when the device accepts the bass value.
     */
    setBass(value: number): Promise<void> {
        return setBass(this.client, value)
    }

    /**
     * Sets the volume level and mute state for the device. Volume ranges between 0 and 100 inclusive.
     *
     * POST /volume
     *
     * The muteenabled setting is applied first, if present. The system will be unmuted if the
     * volume value is larger than the current volume setting.
     *
     * @param value Volume value to set.
     * @param muteenabled Optional mute state to set before applying the volume value.
     * @returns A promise that resolves when the device accepts the volume value.
     *
     * @example
     * await device.setVolume(25)
     * await device.setVolume(10, true)
     */
    setVolume(value: number, muteenabled?: boolean): Promise<void> {
        return setVolume(this.client, value, muteenabled)
    }

    /**
     * Gets the current multi-room zone state from the device.
     *
     * GET /getZone
     *
     * @returns Promise<Zone> A promise that resolves to the zone payload as returned by the device.
     */
    zone(): Promise<Zone> {
        return fetchZone(this.client)
    }

    /**
     * Creates or updates a multi-room zone.
     *
     * POST /setZone
     *
     * @param config Zone configuration including master, sender IP, and member list.
     * @returns A promise that resolves when the device accepts the zone configuration.
     */
    setZone(config: ZoneConfig): Promise<void> {
        return setZone(this.client, config)
    }

    /**
     * Adds one or more slaves to a "play everywhere" zone.
     *
     * POST /addZoneSlave
     *
     * @param config Zone slave configuration including master and member list.
     * @returns A promise that resolves when the device accepts the zone update.
     */
    addZoneSlave(config: ZoneSlaveConfig): Promise<void> {
        return addZoneSlave(this.client, config)
    }

    /**
     * Removes one or more slaves from a "play everywhere" zone.
     *
     * POST /removeZoneSlave
     *
     * @param config Zone slave configuration including master and member list.
     * @returns A promise that resolves when the device accepts the zone update.
     */
    removeZoneSlave(config: ZoneSlaveConfig): Promise<void> {
        return removeZoneSlave(this.client, config)
    }

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
     * await device.keyPress('PLAY', 'press', 'Gabbo')
     * await device.keyPress('PLAY', 'release', 'Gabbo')
     */
    keyPress(key: SoundTouchKey, state: 'press' | 'release' = 'press', sender?: string): Promise<void> {
        return sendKeyPress(this.client, key, state, sender)
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
     * await device.keyTap('PLAY', 'Gabbo')
     */
    keyTap(key: SoundTouchKey, sender?: string): Promise<void> {
        return sendKeyTap(this.client, key, sender)
    }

    play(): Promise<void> {
        return this.keyTap('PLAY')
    }

    pause(): Promise<void> {
        return this.keyTap('PAUSE')
    }

    next(): Promise<void> {
        return this.keyTap('NEXT_TRACK')
    }

    previous(): Promise<void> {
        return this.keyTap('PREV_TRACK')
    }
}
