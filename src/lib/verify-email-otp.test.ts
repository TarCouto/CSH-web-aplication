import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseOtpType, parseTokenHash } from './verify-email-otp'

describe('parseTokenHash', () => {
  it('accepts a well-formed token hash', () => {
    const token = 'a'.repeat(64)
    assert.equal(parseTokenHash(token), token)
  })

  it('accepts a url-encoded token', () => {
    const token = 'abc_def-123456789012345'
    assert.equal(parseTokenHash(encodeURIComponent(token)), token)
  })

  it('rejects empty and null values', () => {
    assert.equal(parseTokenHash(null), null)
    assert.equal(parseTokenHash(''), null)
  })

  it('rejects tokens that are too short', () => {
    assert.equal(parseTokenHash('abc'), null)
  })

  it('rejects tokens with illegal characters', () => {
    assert.equal(parseTokenHash("' or 1=1--".padEnd(32, 'x')), null)
    assert.equal(parseTokenHash('a'.repeat(20) + '<script>'), null)
  })

  it('rejects an oversized token', () => {
    assert.equal(parseTokenHash('a'.repeat(300)), null)
  })

  it('rejects malformed percent-encoding instead of throwing', () => {
    assert.equal(parseTokenHash('%E0%A4%A'), null)
  })
})

describe('parseOtpType', () => {
  it('allows known OTP types', () => {
    assert.equal(parseOtpType('signup'), 'signup')
    assert.equal(parseOtpType('recovery'), 'recovery')
  })

  it('rejects unknown types', () => {
    assert.equal(parseOtpType('admin'), null)
    assert.equal(parseOtpType(null), null)
  })
})
