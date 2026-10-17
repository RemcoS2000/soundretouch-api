import { expect, it } from 'vitest'

import { escapeXml, parseXml } from '../../src/client/xml'

it('preserves numeric-looking speaker and group identities without changing numeric values', () => {
    expect(parseXml('<zone master="001122334455"><member ipaddress="192.168.1.2">001122334455</member></zone>')).toEqual({
        zone: { master: '001122334455', member: { ipaddress: '192.168.1.2', '#text': '001122334455' } },
    })
    expect(parseXml('<volume deviceID="001122334455"><actualvolume>25</actualvolume><muteenabled>false</muteenabled></volume>')).toEqual({
        volume: { deviceID: '001122334455', actualvolume: 25, muteenabled: false },
    })
})
it('escapes attribute and text delimiters in outgoing XML', () => {
    expect(escapeXml('a&<"\'>')).toBe('a&amp;&lt;&quot;&apos;&gt;')
})

it('preserves numeric speaker names and metadata as documented strings', () => {
    expect(parseXml('<info deviceID="001122334455"><name>001</name><type>SoundTouch 10</type></info>')).toEqual({
        info: { deviceID: '001122334455', name: '001', type: 'SoundTouch 10' },
    })
    expect(parseXml('<nowPlaying><track>1984</track><artist>001</artist><time total="240">20</time></nowPlaying>')).toEqual({
        nowPlaying: { track: '1984', artist: '001', time: { total: 240, '#text': 20 } },
    })
})
