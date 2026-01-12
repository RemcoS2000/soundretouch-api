import { discoverSoundTouchDevices, DiscoveryResult } from '../src/discovery/discoverSoundTouchDevices';

import { SoundTouchDevice } from '../src/device/SoundTouchDevice';

async function run() {
    const discoveryResults: DiscoveryResult[] = await discoverSoundTouchDevices();

    for (const result of discoveryResults) {
        console.log(`Found SoundTouch device at ${result.host}:${result.port ?? 'default port'}`);

        const device: SoundTouchDevice = new SoundTouchDevice(result.host);

        const info = await device.info();
        console.log(`  Device Info: ${info.model} - ${info.deviceName}`);

        const nowPlaying = await device.nowPlaying();
        console.log(`  Now Playing: ${nowPlaying.track} by ${nowPlaying.artist}`);

        const volume = await device.volume();
        console.log(`  Volume: ${volume.actual} (muted: ${volume.muted})`);
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
