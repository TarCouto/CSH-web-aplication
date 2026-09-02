import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  AFTER_INTRO_Y,
  BAND_PT,
  GUTTER_X,
  PAGE_INTRO_Y,
  SECTION_Y,
} from './spacing'

describe('spacing tokens', () => {
  it('keeps a modest mobile-first vertical scale', () => {
    assert.equal(PAGE_INTRO_Y, 'mt-16 sm:mt-24 lg:mt-32')
    assert.equal(SECTION_Y, 'mt-16 sm:mt-24 lg:mt-32')
    assert.equal(AFTER_INTRO_Y, 'mt-10 sm:mt-16 lg:mt-24')
    assert.equal(BAND_PT, 'pt-16 sm:pt-24 lg:pt-32')
  })

  it('defines a single horizontal gutter', () => {
    assert.equal(GUTTER_X, 'px-5 sm:px-6 lg:px-8')
  })
})
