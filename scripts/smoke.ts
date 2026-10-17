import { type SoundTouchDevice } from '../src/device/SoundTouchDevice'
import { SoundTouchDiscovery } from '../src/discovery/SoundTouchDiscovery'
import { NowPlaying } from '../src/types/NowPlaying'
import { Presets } from '../src/types/Presets'
import { Volume } from '../src/types/Volume'

/**
 * Smoke test script to discover SoundTouch devices and fetch their info and volume.
 */
function run(): void {
    const handle = SoundTouchDiscovery.start((device) => {
        readDiscoveredSpeaker(device).catch((error: unknown) => console.error('Speaker read failed', error))
    })

    setTimeout(() => {
        handle.stop()
        console.log('🛑 Discovery stopped.')
    }, 120000)
}

/**
 * Reads discovered speaker data and attaches read-only update observers.
 */
async function readDiscoveredSpeaker(device: SoundTouchDevice): Promise<void> {
    console.log(`✅ Found SoundTouch device at ${device.host}`)

    const info = await device.info()

    console.log('ℹ️ Device Info:', info)

    const volume = await device.volume()

    console.log('🔊 Current Volume:', volume)

    const nowPlaying = await device.nowPlaying()

    console.log('🎵 Now Playing:', nowPlaying)

    device.onNowPlayingUpdated((nowPlaying: NowPlaying) => {
        console.log('📡 Now Playing Update:', nowPlaying)
    })
    device.onVolumeUpdated((volume: Volume) => {
        console.log('📡 Volume Update:', volume)
    })
    device.onPresetsUpdated((presets: Presets) => {
        console.log('📡 Presets Update (first item):', presets[0]?.ContentItem)
    })
    device.onWebSocketError((error) => {
        console.error('⚠️ WebSocket error:', error)
    })
}

run()
