import { describe, expect, it } from 'vitest'

import { setUserTrackControl } from '../../src/endpoints/userTrackControl'
import { createHttpMockClient } from '../helpers/mockClient'

describe('userTrackControl endpoint', () => {
    it('posts a seek command with StartSecond when provided', async () => {
        const { client, post } = createHttpMockClient()

        await setUserTrackControl(client, 'SEEK_TO_TIME', 60)

        expect(post).toHaveBeenCalledWith('/userTrackControl', '<TrackControl startSecond="60">SEEK_TO_TIME</TrackControl>')
    })

    it('posts a command without StartSecond when not provided', async () => {
        const { client, post } = createHttpMockClient()

        await setUserTrackControl(client, 'SEEK_TO_TIME')

        expect(post).toHaveBeenCalledWith('/userTrackControl', '<TrackControl>SEEK_TO_TIME</TrackControl>')
    })

    it('normalizes negative StartSecond values to 0', async () => {
        const { client, post } = createHttpMockClient()

        await setUserTrackControl(client, 'SEEK_TO_TIME', -10)

        expect(post).toHaveBeenCalledWith('/userTrackControl', '<TrackControl startSecond="0">SEEK_TO_TIME</TrackControl>')
    })

    it('posts NEXT_TRACK without startSecond attribute', async () => {
        const { client, post } = createHttpMockClient()

        await setUserTrackControl(client, 'NEXT_TRACK')

        expect(post).toHaveBeenCalledWith('/userTrackControl', '<TrackControl>NEXT_TRACK</TrackControl>')
    })

    it('posts REPEAT_ALL_TRACKS without startSecond attribute', async () => {
        const { client, post } = createHttpMockClient()

        await setUserTrackControl(client, 'REPEAT_ALL_TRACKS')

        expect(post).toHaveBeenCalledWith('/userTrackControl', '<TrackControl>REPEAT_ALL_TRACKS</TrackControl>')
    })

    it('ignores startSecond for non-seek commands', async () => {
        const { client, post } = createHttpMockClient()

        await setUserTrackControl(client, 'NEXT_TRACK', 60)

        expect(post).toHaveBeenCalledWith('/userTrackControl', '<TrackControl>NEXT_TRACK</TrackControl>')
    })

    it('propagates POST errors', async () => {
        const { client, post } = createHttpMockClient()
        const error = new Error('network')
        post.mockRejectedValue(error)

        await expect(setUserTrackControl(client, 'SEEK_TO_TIME', 42)).rejects.toBe(error)
    })
})
