import { describe, expect, it } from 'vitest'

import { sendKeyPress, sendKeyTap } from '../../src/endpoints/key'
import { createMockClient } from '../helpers/mockClient'

describe('key endpoint', () => {
    it('posts key presses to /key with defaults', async () => {
        const { client, post } = createMockClient()

        await sendKeyPress(client, 'PLAY')

        expect(post).toHaveBeenCalledWith('/key', '<key state="press" sender="soundretouch-api">PLAY</key>')
    })

    it('posts key presses to /key with custom state and sender', async () => {
        const { client, post } = createMockClient()

        await sendKeyPress(client, 'PAUSE', 'release', 'Remote')

        expect(post).toHaveBeenCalledWith('/key', '<key state="release" sender="Remote">PAUSE</key>')
    })

    it('sends a key tap as press then release', async () => {
        const { client, post } = createMockClient()

        await sendKeyTap(client, 'PLAY', 'Tester')

        expect(post).toHaveBeenNthCalledWith(1, '/key', '<key state="press" sender="Tester">PLAY</key>')
        expect(post).toHaveBeenNthCalledWith(2, '/key', '<key state="release" sender="Tester">PLAY</key>')
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(sendKeyPress(client, 'PLAY')).rejects.toBe(error)
    })
})
