import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

import { purgeExpiredDownloads } from './entitlements'

function fakeClient(error: { message: string } | null = null) {
  const calls: string[] = []
  const client = {
    calls,
    rpc: async (name: string) => {
      calls.push(name)
      return { data: 0, error }
    },
  } as unknown as SupabaseClient<Database> & { calls: string[] }

  return client
}

describe('purgeExpiredDownloads', () => {
  it('runs the sweep when sampled', async () => {
    const supabase = fakeClient()
    const random = mock.method(Math, 'random', () => 0)

    await purgeExpiredDownloads(supabase)
    random.mock.restore()

    assert.deepEqual(supabase.calls, ['purge_expired_downloads'])
  })

  it('skips the sweep on most requests', async () => {
    const supabase = fakeClient()
    const random = mock.method(Math, 'random', () => 0.9)

    await purgeExpiredDownloads(supabase)
    random.mock.restore()

    assert.deepEqual(supabase.calls, [])
  })

  it('always runs when forced', async () => {
    const supabase = fakeClient()
    const random = mock.method(Math, 'random', () => 0.99)

    await purgeExpiredDownloads(supabase, { force: true })
    random.mock.restore()

    assert.deepEqual(supabase.calls, ['purge_expired_downloads'])
  })

  it('never throws when the sweep fails', async () => {
    const supabase = fakeClient({ message: 'boom' })
    const random = mock.method(Math, 'random', () => 0)
    const originalError = console.error
    console.error = () => {}

    await assert.doesNotReject(() => purgeExpiredDownloads(supabase))

    console.error = originalError
    random.mock.restore()
  })
})
