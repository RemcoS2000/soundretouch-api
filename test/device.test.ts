import { afterEach, expect, it, vi } from 'vitest'

import { WebSocketClient } from '../src/client/ws'
import { SoundTouchDevice } from '../src/device/SoundTouchDevice'

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

it.each([
    ['info', '/info', '<info deviceID="AABB"><name>Office</name></info>', { deviceID: 'AABB', name: 'Office' }],
    ['nowPlaying', '/now_playing', '<nowPlaying><track>Track</track></nowPlaying>', { track: 'Track' }],
    ['trackInfo', '/trackInfo', '<nowPlaying><track>Track</track></nowPlaying>', { track: 'Track' }],
    ['volume', '/volume', '<volume><actualvolume>25</actualvolume></volume>', { actualvolume: 25 }],
    ['bass', '/bass', '<bass><actualbass>3</actualbass></bass>', { actualbass: 3 }],
    ['bassCapabilities', '/bassCapabilities', '<bassCapabilities><bassAvailable>true</bassAvailable></bassCapabilities>', { bassAvailable: true }],
    ['capabilities', '/capabilities', '<capabilities><capability name="aux"/></capabilities>', { capability: { name: 'aux' } }],
    ['sources', '/sources', '<sources><sourceItem source="AUX"/></sources>', { sourceItem: { source: 'AUX' } }],
    ['audioDspControls', '/audiodspcontrols', '<audiodspcontrols audiomode="AUDIO_MODE_NORMAL"/>', { audiomode: 'AUDIO_MODE_NORMAL' }],
    ['audioProductToneControls', '/audioproducttonecontrols', '<audioproducttonecontrols><bass value="2"/></audioproducttonecontrols>', { bass: { value: 2 } }],
    [
        'audioProductLevelControls',
        '/audioproductlevelcontrols',
        '<audioproductlevelcontrols><frontCenterSpeakerLevel value="2"/></audioproductlevelcontrols>',
        { frontCenterSpeakerLevel: { value: 2 } },
    ],
    ['presets', '/presets', '<presets><preset id="1"><ContentItem source="AUX"/></preset></presets>', [{ id: 1, ContentItem: { source: 'AUX' } }]],
    ['zone', '/getZone', '<zone master="AABB"/>', { master: 'AABB' }],
] as const)('device.%s reads and parses its public resource through the speaker HTTP transport', async (method, path, xml, expected) => {
    const fetcher = vi.fn(async () => new Response(xml))
    vi.stubGlobal('fetch', fetcher)
    const device = new SoundTouchDevice('fixture.invalid')

    try {
        await expect(device[method]()).resolves.toEqual(expected)
        expect(fetcher).toHaveBeenCalledWith(`http://fixture.invalid:8090${path}`, expect.objectContaining({ method: 'GET' }))
    } finally {
        device.dispose()
    }
})

it('uses one device for source, volume, naming, tone and zone commands with escaped XML', async () => {
    const fetcher = vi.fn(async () => new Response(''))
    vi.stubGlobal('fetch', fetcher)
    const device = new SoundTouchDevice('fixture.invalid')
    const member = { ipaddress: '192.0.2.2', macAddress: 'CCDD' }

    try {
        await device.select({ source: 'AUX' })
        await device.setVolume(120, true)
        await device.setBass(3)
        await device.setName('Office & kitchen')
        await device.setAudioDspControls({ audiomode: 'AUDIO_MODE_NORMAL' })
        await device.setAudioProductToneControls({ bass: 2 })
        await device.setAudioProductLevelControls({ frontCenterSpeakerLevel: 2 })
        await device.setZone({ master: 'AABB', senderIPAddress: '192.0.2.1', members: [member] })
        await device.addZoneSlave({ master: 'AABB', members: [member] })
        await device.removeZoneSlave({ master: 'AABB', members: [member] })
        await device.keyPress('NEXT_TRACK')
        await device.keyPressAndRelease('PLAY_PAUSE')
        await device.setUserTrackControl('SEEK_TO_TIME', 30)
        expect(fetcher).toHaveBeenCalledWith(
            'http://fixture.invalid:8090/volume',
            expect.objectContaining({ body: '<volume>100<muteenabled>true</muteenabled></volume>' })
        )
        expect(fetcher).toHaveBeenCalledWith(
            'http://fixture.invalid:8090/name',
            expect.objectContaining({ body: expect.stringContaining('Office &amp; kitchen') })
        )
        expect(fetcher).toHaveBeenCalledWith('http://fixture.invalid:8090/key', expect.objectContaining({ body: expect.stringContaining('state="release"') }))
        expect(fetcher).toHaveBeenCalledWith('http://fixture.invalid:8090/userTrackControl', expect.objectContaining({ body: expect.stringContaining('30') }))
    } finally {
        device.dispose()
    }
})

it('routes stream SOAP requests to the AV transport and preserves their order', async () => {
    const fetcher = vi.fn(async () => new Response('<Envelope><Body/></Envelope>'))
    vi.stubGlobal('fetch', fetcher)
    const device = new SoundTouchDevice('fixture.invalid')

    try {
        await device.playStreamUrl('https://example.invalid/media?a=1&b=2')
        expect(fetcher).toHaveBeenCalledTimes(2)
        expect(fetcher).toHaveBeenNthCalledWith(
            1,
            'http://fixture.invalid:8091/AVTransport/Control',
            expect.objectContaining({ body: expect.stringContaining('SetAVTransportURI') })
        )
        expect(fetcher).toHaveBeenNthCalledWith(
            2,
            'http://fixture.invalid:8091/AVTransport/Control',
            expect.objectContaining({ body: expect.stringContaining('<u:Play') })
        )
    } finally {
        device.dispose()
    }
})

it('forwards read cancellation without sending a request and rejects disposed reads', async () => {
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    const device = new SoundTouchDevice('fixture.invalid')
    const controller = new AbortController()
    controller.abort()

    await expect(device.info({ signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetcher).not.toHaveBeenCalled()
    device.dispose()
    await expect(device.volume()).rejects.toThrow('disposed')
})

it.each([
    ['onInfoUpdated', { infoUpdated: {} }],
    ['onSourcesUpdated', { sourcesUpdated: {} }],
    ['onBassUpdated', { bassUpdated: {} }],
    ['onZoneUpdated', { zoneUpdated: {} }],
    ['onSwUpdateStatusUpdated', { swUpdateStatusUpdated: {} }],
    ['onSiteSurveyResultsUpdated', { siteSurveyResultsUpdated: {} }],
    ['onConnectionStateUpdated', { connectionStateUpdated: {} }],
    ['onAcctModeUpdated', { acctModeUpdated: {} }],
    ['onVolumeUpdated', { volumeUpdated: { volume: { actualvolume: 20 } } }],
    ['onNowSelectionUpdated', { nowSelectionUpdated: { preset: { id: 1 } } }],
    ['onRecentsUpdated', { recentsUpdated: { recents: { recent: { id: '1' } } } }],
    ['onPresetsUpdated', { presetsUpdated: { presets: { preset: [{ id: '1' }, { id: '2' }] } } }],
] as const)('%s exposes its event through the device and returns its unsubscribe handle', (method, update) => {
    const listeners: Array<(data: unknown) => void> = []
    const unsubscribe = vi.fn()
    vi.spyOn(WebSocketClient.prototype, 'onMessage').mockImplementation((handler) => {
        listeners.push(handler as (data: unknown) => void)

        return unsubscribe
    })
    const device = new SoundTouchDevice('fixture.invalid')
    const handler = vi.fn()

    try {
        const off = device[method](handler)
        listeners[0]?.({ unrelated: {} })
        expect(handler).not.toHaveBeenCalled()
        listeners[0]?.(update)
        expect(handler).toHaveBeenCalledOnce()
        off()
        expect(unsubscribe).toHaveBeenCalledOnce()
    } finally {
        device.dispose()
    }
})
