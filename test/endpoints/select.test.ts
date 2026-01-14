import { describe, expect, it } from 'vitest'

import { selectSource } from '../../src/endpoints/select'
import { createMockClient } from '../helpers/mockClient'

describe('select endpoint', () => {
    it('posts a source-only selection to /select', async () => {
        const { client, post } = createMockClient()

        await selectSource(client, { source: 'AUX' })

        expect(post).toHaveBeenCalledWith('/select', '<ContentItem source="AUX"></ContentItem>')
    })

    it('escapes XML attribute values', async () => {
        const { client, post } = createMockClient()

        await selectSource(client, {
            source: 'A&B',
            sourceAccount: `Rock "n" Roll <Live> '24'`,
        })

        expect(post).toHaveBeenCalledWith(
            '/select',
            '<ContentItem source="A&amp;B" sourceAccount="Rock &quot;n&quot; Roll &lt;Live&gt; &apos;24&apos;"></ContentItem>'
        )
    })

    it('propagates errors from POST requests', async () => {
        const { client, post } = createMockClient()
        const error = new Error('write failed')
        post.mockRejectedValue(error)

        await expect(selectSource(client, { source: 'AUX' })).rejects.toBe(error)
    })
})
