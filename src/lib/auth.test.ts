import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { safeRedirectPath } from './auth'

describe('safeRedirectPath', () => {
  it('allows same-origin relative paths', () => {
    assert.equal(safeRedirectPath('/dashboard/library'), '/dashboard/library')
    assert.equal(safeRedirectPath('/'), '/')
  })

  it('rejects protocol-relative and absolute URLs', () => {
    assert.equal(safeRedirectPath('//evil.com'), '/dashboard')
    assert.equal(safeRedirectPath('https://evil.com'), '/dashboard')
    assert.equal(safeRedirectPath('http://evil.com/path'), '/dashboard')
  })

  it('rejects backslashes and empty values', () => {
    assert.equal(safeRedirectPath('/\\evil.com'), '/dashboard')
    assert.equal(safeRedirectPath(''), '/dashboard')
    assert.equal(safeRedirectPath(null), '/dashboard')
    assert.equal(safeRedirectPath(undefined), '/dashboard')
  })
})
