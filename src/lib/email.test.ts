import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildContactEmailHtml } from './email'

describe('escapeHtml (via buildContactEmailHtml)', () => {
  it('escapes the five HTML-sensitive characters', () => {
    const html = buildContactEmailHtml({
      name: 'A&B',
      email: 'a@example.com',
      message: '<tag attr="x" value=\'y\'>',
    })

    assert.match(html, /A&amp;B/)
    assert.match(html, /&lt;tag/)
    assert.match(html, /&gt;/)
    assert.match(html, /&quot;x&quot;/)
    assert.match(html, /&#39;y&#39;/)
  })
})
