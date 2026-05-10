import { describe, expect, it } from 'vitest'

import { setName } from '../../src/endpoints/name'
import { createHttpMockClient } from '../helpers/mockClient'

describe('name endpoint', () => {
    it('posts escaped names to /name', async () => {
        const { client, post } = createHttpMockClient()

        await setName(client, `Rock & "Roll" <Live> '24'`)

        expect(post).toHaveBeenCalledWith('/name', '<name>Rock &amp; &quot;Roll&quot; &lt;Live&gt; &apos;24&apos;</name>')
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createHttpMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(setName(client, 'Office')).rejects.toBe(error)
    })
})
