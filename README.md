# SoundRetouch-API

SoundRetouch-API is an unofficial TypeScript library for configuring and managing legacy Bose SoundTouch devices.

After Bose announced the deprecation of the SoundTouch product line and the shutdown of its cloud services, I wanted to experiment with ways to keep these speakers useful. This library provides a clean, developer-friendly wrapper around the documented SoundTouch local API, with built-in support for asynchronous notifications and a simple approach to device discovery.

The implementation is based on the official SoundTouch Web API documentation and has been tested and validated with a pair of SoundTouch 10 speakers.

This project is independently developed and is not affiliated with Bose.

## Installation

```bash
npm i @soundretouch/api
```

## Usage

Below is a basic example demonstrating how to connect to a SoundTouch device and perform common operations.

```ts
import { SoundTouchDevice } from '@soundretouch/api'

const device = new SoundTouchDevice('192.168.1.67')

const info = await device.info()
const nowPlaying = await device.nowPlaying()
const volume = await device.volume()

await device.setVolume(25)
await device.keyPressAndRelease('PLAY')
```

## WebSocket Asynchronous Notifications

The library supports real-time notifications over WebSocket for events such as track changes and volume updates.

```ts
import { SoundTouchDevice } from '@soundretouch/api'

const device = new SoundTouchDevice('192.168.1.67')

device.onNowPlayingUpdated((nowPlaying) => {
    console.log('Now playing changed:', nowPlaying)
})

device.onVolumeUpdated((volume) => {
    console.log('Volume changed:', volume)
})
```

## Discovery

Devices on the local network can be discovered automatically using the built-in discovery service.

```ts
import { SoundTouchDiscovery } from '@soundretouch/api'

const handle = SoundTouchDiscovery.start(async (device) => {
    console.log('Found device at', device.host)
    console.log(await device.info())
})

// Stop after 2 minutes
setTimeout(() => handle.stop(), 120000)
```

## Proxy Configuration (Dev)

If you need to route HTTP and WebSocket calls through a development proxy, pass proxy URLs to the device options.

```ts
import { SoundTouchDevice } from '@soundretouch/api'

const device = new SoundTouchDevice('192.168.1.67', {
    http: { proxyUrl: 'http://localhost:6767/proxy?url=' },
    ws: { proxyUrl: 'ws://localhost:6767/proxy?url=' },
})
```

## Implemented Endpoints

The following SoundTouch API endpoints are currently implemented:

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

Debug logging can be enabled using the DEBUG environment variable. Logging can be configured globally or scoped to specific subsystems.

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

- [`docs/SoundTouch-Web-API.pdf`](https://assets.bosecreative.com/m/496577402d128874/original/SoundTouch-Web-API.pdf)

## Compliance Notice

Trademark attribution: Bose and SoundTouch are trademarks of Bose Corporation.
