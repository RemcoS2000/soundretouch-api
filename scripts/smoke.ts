import { SoundTouchDiscovery } from '../src/discovery/SoundTouchDiscovery'

/**
 * Smoke test script to discover SoundTouch devices and fetch their info and volume.
 */
async function run() {
    const handle = SoundTouchDiscovery.start(async (device) => {
        console.log(`✅ Found SoundTouch device at ${device.host}`)

        const info = await device.info()
        console.log('ℹ️ Device Info:', info)

        const volume = await device.volume()
        console.log('🔊 Current Volume:', volume)

        const nowPlaying = await device.nowPlaying()
        console.log('🎵 Now Playing:', nowPlaying)
    })

    setTimeout(() => {
        handle.stop()
        console.log('🛑 Discovery stopped.')
    }, 120000)
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
