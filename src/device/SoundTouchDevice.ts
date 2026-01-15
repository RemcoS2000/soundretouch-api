import { HttpClient, HttpClientOptions } from '../client/http'
import { WebSocketClient, WebSocketClientOptions } from '../client/ws'
import { fetchAudioDspControls, setAudioDspControls } from '../endpoints/audiodspcontrols'
import { fetchAudioProductLevelControls, setAudioProductLevelControls } from '../endpoints/audioProductLevelControls'
import { fetchAudioProductToneControls, setAudioProductToneControls } from '../endpoints/audioProductToneControls'
import { fetchBass, setBass } from '../endpoints/bass'
import { fetchBassCapabilities } from '../endpoints/bassCapabilities'
import { fetchCapabilities } from '../endpoints/capabilities'
import { fetchInfo } from '../endpoints/info'
import { sendKeyPress, sendKeyPressAndRelease, SoundTouchKey } from '../endpoints/key'
import { setName } from '../endpoints/name'
import { fetchNowPlaying } from '../endpoints/nowPlaying'
import { fetchPresets } from '../endpoints/presets'
import { selectSource } from '../endpoints/select'
import { fetchSources } from '../endpoints/sources'
import { fetchTrackInfo } from '../endpoints/trackInfo'
import { fetchVolume, setVolume } from '../endpoints/volume'
import { addZoneSlave, fetchZone, removeZoneSlave, setZone } from '../endpoints/zone'
import { AudioDspControls } from '../types/AudioDspControls'
import { AudioProductLevelControls, AudioProductLevelControlsUpdate } from '../types/AudioProductLevelControls'
import { AudioProductToneControls, AudioProductToneControlsUpdate } from '../types/AudioProductToneControls'
import { Bass } from '../types/Bass'
import { BassCapabilities } from '../types/BassCapabilities'
import { Capabilities } from '../types/Capabilities'
import { ContentItem } from '../types/ContentItem'
import { DeviceInfo } from '../types/DeviceInfo'
import { NowPlaying } from '../types/NowPlaying'
import { Preset, Presets } from '../types/Presets'
import { Recents } from '../types/Recents'
import { Sources } from '../types/Sources'
import { Updates } from '../types/Updates'
import { Volume } from '../types/Volume'
import { Zone, ZoneConfig, ZoneSlaveConfig } from '../types/Zone'

export type SoundTouchDeviceOptions = {
    http?: HttpClientOptions
    ws?: WebSocketClientOptions
}

/**
 * Represents a SoundTouch device and provides methods to interact with it.
 *
 * @param host The hostname or IP address of the SoundTouch device.
 * @param options Optional HTTP and WebSocket client configuration.
 *
 * @example
 * const device = new SoundTouchDevice('192.168.1.x');
 * const info = await device.info();
 */
export class SoundTouchDevice {
    readonly host: string

    private httpClient: HttpClient
    private wsClient: WebSocketClient

    constructor(host: string, options: SoundTouchDeviceOptions = {}) {
        this.host = host
        this.httpClient = new HttpClient(host, options.http)
        this.wsClient = new WebSocketClient(this.host, { unwrap: true, ...options.ws })
    }

    /**
     * Gets device information including identifiers, components, and network info.
     *
     * GET /info
     *
     * @returns Promise<DeviceInfo> A promise that resolves to the device info payload as returned by the device.
     */
    info(): Promise<DeviceInfo> {
        return fetchInfo(this.httpClient)
    }

    /**
     * Gets info about the currently playing media.
     *
     * GET /now_playing
     *
     * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
     */
    nowPlaying(): Promise<NowPlaying> {
        return fetchNowPlaying(this.httpClient)
    }

    /**
     * Gets track information for the currently playing media.
     *
     * GET /trackInfo
     *
     * @returns Promise<NowPlaying> A promise that resolves to the now playing payload as returned by the device.
     */
    trackInfo(): Promise<NowPlaying> {
        return fetchTrackInfo(this.httpClient)
    }

    /**
     * Lists available content sources on the device.
     *
     * GET /sources
     *
     * @returns Promise<Sources> A promise that resolves to the sources payload as returned by the device.
     */
    sources(): Promise<Sources> {
        return fetchSources(this.httpClient)
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
        return selectSource(this.httpClient, item)
    }

    /**
     * Gets the current volume settings from the device.
     *
     * GET /volume
     *
     * @returns Promise<Volume> A promise that resolves to the volume payload as returned by the device.
     */
    volume(): Promise<Volume> {
        return fetchVolume(this.httpClient)
    }

    /**
     * Gets the current bass setting from the device.
     *
     * GET /bass
     *
     * @returns Promise<Bass> A promise that resolves to the bass payload as returned by the device.
     */
    bass(): Promise<Bass> {
        return fetchBass(this.httpClient)
    }

    /**
     * Gets bass capability information for the device.
     *
     * GET /bassCapabilities
     *
     * @returns Promise<BassCapabilities> A promise that resolves to the bass capabilities payload as returned by the device.
     */
    bassCapabilities(): Promise<BassCapabilities> {
        return fetchBassCapabilities(this.httpClient)
    }

    /**
     * Retrieves system capabilities for the device.
     *
     * GET /capabilities
     *
     * @returns Promise<Capabilities> A promise that resolves to the capabilities payload as returned by the device.
     */
    capabilities(): Promise<Capabilities> {
        return fetchCapabilities(this.httpClient)
    }

    /**
     * Gets the current DSP settings for the device.
     *
     * GET /audiodspcontrols
     *
     * @returns Promise<AudioDspControls> A promise that resolves to the DSP controls payload as returned by the device.
     */
    audioDspControls(): Promise<AudioDspControls> {
        return fetchAudioDspControls(this.httpClient)
    }

    /**
     * Gets the current bass and treble settings from the device.
     *
     * GET /audioproducttonecontrols
     *
     * @returns Promise<AudioProductToneControls> A promise that resolves to the tone controls payload as returned by the device.
     */
    audioProductToneControls(): Promise<AudioProductToneControls> {
        return fetchAudioProductToneControls(this.httpClient)
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
        return setAudioProductToneControls(this.httpClient, values)
    }

    /**
     * Gets the current front-center and rear-surround level settings from the device.
     *
     * GET /audioproductlevelcontrols
     *
     * @returns Promise<AudioProductLevelControls> A promise that resolves to the level controls payload as returned by the device.
     */
    audioProductLevelControls(): Promise<AudioProductLevelControls> {
        return fetchAudioProductLevelControls(this.httpClient)
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
        return setAudioProductLevelControls(this.httpClient, values)
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
        return setAudioDspControls(this.httpClient, values)
    }

    /**
     * Gets the list of current presets from the device.
     *
     * GET /presets
     *
     * @returns Promise<Presets> A promise that resolves to the presets payload as returned by the device.
     */
    presets(): Promise<Presets> {
        return fetchPresets(this.httpClient)
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
        return setName(this.httpClient, name)
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
        return setBass(this.httpClient, value)
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
        return setVolume(this.httpClient, value, muteenabled)
    }

    /**
     * Gets the current multi-room zone state from the device.
     *
     * GET /getZone
     *
     * @returns Promise<Zone> A promise that resolves to the zone payload as returned by the device.
     */
    zone(): Promise<Zone> {
        return fetchZone(this.httpClient)
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
        return setZone(this.httpClient, config)
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
        return addZoneSlave(this.httpClient, config)
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
        return removeZoneSlave(this.httpClient, config)
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
        return sendKeyPress(this.httpClient, key, state, sender)
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
     * await device.keyPressAndRelease('PLAY', 'Gabbo')
     */
    keyPressAndRelease(key: SoundTouchKey, sender?: string): Promise<void> {
        return sendKeyPressAndRelease(this.httpClient, key, sender)
    }

    /**
     * Subscribes to now playing update notifications.
     *
     * @param handler Callback invoked with the parsed now playing payload.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onNowPlayingUpdated((nowPlaying) => console.log(nowPlaying))
     */
    onNowPlayingUpdated(handler: (nowPlaying: NowPlaying) => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            const nowPlaying = update.nowPlayingUpdated?.nowPlaying
            if (nowPlaying) {
                handler(nowPlaying)
            }
        })
    }

    /**
     * Subscribes to volume update notifications.
     *
     * @param handler Callback invoked with the parsed volume payload.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onVolumeUpdated((volume) => console.log(volume))
     */
    onVolumeUpdated(handler: (volume: Volume) => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            const volumeUpdated = update.volumeUpdated
            if (!volumeUpdated) {
                return
            }

            handler(volumeUpdated.volume ?? {})
        })
    }

    /**
     * Subscribes to bass update notifications.
     *
     * @param handler Callback invoked when bass changes.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onBassUpdated(() => console.log('Bass changed'))
     */
    onBassUpdated(handler: () => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.bassUpdated) {
                handler()
            }
        })
    }

    /**
     * Subscribes to zone map update notifications.
     *
     * @param handler Callback invoked when the zone map changes.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onZoneUpdated(() => console.log('Zone map changed'))
     */
    onZoneUpdated(handler: () => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.zoneUpdated) {
                handler()
            }
        })
    }

    /**
     * Subscribes to software update status notifications.
     *
     * @param handler Callback invoked when update status changes.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onSwUpdateStatusUpdated(() => console.log('SW update status changed'))
     */
    onSwUpdateStatusUpdated(handler: () => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.swUpdateStatusUpdated) {
                handler()
            }
        })
    }

    /**
     * Subscribes to site survey results update notifications.
     *
     * @param handler Callback invoked when site survey results change.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onSiteSurveyResultsUpdated(() => console.log('Site survey updated'))
     */
    onSiteSurveyResultsUpdated(handler: () => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.siteSurveyResultsUpdated) {
                handler()
            }
        })
    }

    /**
     * Subscribes to sources update notifications.
     *
     * @param handler Callback invoked when sources change.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onSourcesUpdated(() => console.log('Sources updated'))
     */
    onSourcesUpdated(handler: () => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.sourcesUpdated) {
                handler()
            }
        })
    }

    /**
     * Subscribes to now selection update notifications.
     *
     * @param handler Callback invoked with the selected preset.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onNowSelectionUpdated((preset) => console.log(preset))
     */
    onNowSelectionUpdated(handler: (preset: Preset) => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            const preset = update.nowSelectionUpdated?.preset
            if (preset) {
                handler(preset)
            }
        })
    }

    /**
     * Subscribes to network connection state notifications.
     *
     * @param handler Callback invoked when connection state changes.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onConnectionStateUpdated(() => console.log('Connection state changed'))
     */
    onConnectionStateUpdated(handler: () => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.connectionStateUpdated) {
                handler()
            }
        })
    }

    /**
     * Subscribes to device info update notifications.
     *
     * @param handler Callback invoked when device info changes.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onInfoUpdated(() => console.log('Device info changed'))
     */
    onInfoUpdated(handler: () => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.infoUpdated) {
                handler()
            }
        })
    }

    /**
     * Subscribes to presets update notifications.
     *
     * @param handler Callback invoked with the parsed presets payload.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onPresetsUpdated((presets) => console.log(presets))
     */
    onPresetsUpdated(handler: (presets: Presets) => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            const preset = update.presetsUpdated?.presets?.preset
            if (Array.isArray(preset)) {
                handler(preset)
                return
            }

            if (preset) {
                handler([preset])
            }
        })
    }

    /**
     * Subscribes to recents update notifications.
     *
     * @param handler Callback invoked with the parsed recents payload.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onRecentsUpdated((recents) => console.log(recents))
     */
    onRecentsUpdated(handler: (recents: Recents) => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            const recent = update.recentsUpdated?.recents?.recent
            if (Array.isArray(recent)) {
                handler(recent)
                return
            }

            if (recent) {
                handler([recent])
            }
        })
    }

    /**
     * Subscribes to account mode update notifications.
     *
     * @param handler Callback invoked when account mode changes.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onAcctModeUpdated(() => console.log('Account mode changed'))
     */
    onAcctModeUpdated(handler: () => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.acctModeUpdated) {
                handler()
            }
        })
    }

    /**
     * Subscribes to error notifications.
     *
     * @param handler Callback invoked when an error notification is received.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onErrorNotification((error) => console.log(error))
     */
    onErrorNotification(handler: (error: Record<string, unknown>) => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onMessage<Updates>((update) => {
            if (update.errorNotification) {
                handler(update.errorNotification)
            }
        })
    }

    /**
     * Subscribes to WebSocket errors.
     *
     * @param handler Callback invoked when a WebSocket error is raised.
     * @returns Unsubscribe function.
     *
     * @example
     * device.onWebSocketError((error) => console.error(error))
     */
    onWebSocketError(handler: (error: unknown) => void): () => void {
        this.wsClient.ensureConnected()

        return this.wsClient.onError(handler)
    }

    /**
     * Starts listening for async notifications and returns a handle to stop.
     *
     * @returns Handle with a stop method that closes the WebSocket connection.
     *
     * @example
     * const handle = device.listenUpdates()
     * handle.stop()
     */
    listenUpdates(): { stop: () => void } {
        this.wsClient.ensureConnected()

        return {
            stop: () => this.wsClient.close(),
        }
    }
}
