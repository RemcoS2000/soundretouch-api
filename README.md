# SoundRetouch-API

This is another unofficial TypeScript API library to configure and manage legacy Bose SoundTouch devices.

This project is not affiliated with Bose.

As Bose announced the deprecation of the SoundTouch lineup and will stop cloud support, I wanted to try something out and set up a project to help keep these speakers usable. This project provides an easy-to-use wrapper on the SoundTouch API documented by Bose, and it supports device discovery as well.

## Installation

```bash
npm i soundretouch-api
```

## Usage

```ts
import { SoundTouchDevice } from 'soundretouch-api'

const device = new SoundTouchDevice('192.168.1.67')

const info = await device.info()
const nowPlaying = await device.nowPlaying()
const volume = await device.volume()

await device.setVolume(25)
await device.keyPressAndRelease('PLAY')
```

## WebSocket Asynchronous Notifications

```ts
import { SoundTouchDevice } from 'soundretouch-api'

const device = new SoundTouchDevice('192.168.1.67')

device.onNowPlayingUpdated((nowPlaying) => {
    console.log('Now playing changed:', nowPlaying)
})

device.onVolumeUpdated((volume) => {
    console.log('Volume changed:', volume)
})
```

## Discovery

```ts
import { SoundTouchDiscovery } from 'soundretouch-api'

const handle = SoundTouchDiscovery.start(async (device) => {
    console.log('Found device at', device.host)
    console.log(await device.info())
})

// Stop after 2 minutes
setTimeout(() => handle.stop(), 120000)
```

## Implemented Endpoints

- /info
- /now_playing
- /trackInfo
- /sources
- /select
- /volume
- /bass
- /bassCapabilities
- /capabilities
- /audiodspcontrols
- /audioproducttonecontrols
- /audioproductlevelcontrols
- /presets
- /name
- /getZone
- /setZone
- /addZoneSlave
- /removeZoneSlave
- /key

## Debug Logging

Enable debug output with the `DEBUG` environment variable. You can target all logs or narrow it down to a single subsystem.

```
DEBUG=soundretouch:*
DEBUG=soundretouch:discovery
DEBUG=soundretouch:endpoints:*
DEBUG=soundretouch:endpoints:info
```

## Smoke Test

```bash
npx tsx scripts/smoke.ts
```

## Docs

- [`docs/SoundTouch-Web-API.pdf`](docs/SoundTouch-Web-API.pdf)

## Compliance Notice

This project uses the Bose SoundTouch Web API. Use of the SoundTouch Materials is subject to Bose's Terms of Use. Refer to the official documentation for the full terms.

Trademark attribution: Bose and SoundTouch are trademarks of Bose Corporation.
