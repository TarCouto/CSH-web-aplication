import { type Metadata } from 'next'

/** Prevent search engines from indexing private or transactional pages. */
export const NO_INDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
}
