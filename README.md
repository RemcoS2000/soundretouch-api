# SoundRetouched

This is another unofficial TypeScript API library to configure and manage legacy Bose SoundTouch devices.

As Bose announced the deprecation of the SoundTouch lineup and will stop cloud support, I wanted to try something out and set up a project to help keep these speakers usable. This project provides an easy-to-use wrapper on the SoundTouch API documented by Bose, and it supports device discovery as well.

## Installation

```bash
npm i soundretouch-api
```

## Usage

```ts
import { SoundTouchDevice } from 'soundretouch-api'

const device = new SoundTouchDevice('192.168.1.37')

const info = await device.info()
const nowPlaying = await device.nowPlaying()
const volume = await device.volume()

await device.setVolume(25)
await device.keyTap('PLAY')
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

This library supports debug output using:

```
DEBUG=soundretouch:*
```

## Smoke Test

```bash
npx tsx scripts/smoke.ts
```

## Docs

- `docs/SoundTouch-Web-API.pdf`
