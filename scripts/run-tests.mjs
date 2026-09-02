import { spawnSync } from 'node:child_process'
import fg from 'fast-glob'

const files = fg.sync('src/**/*.test.ts').sort()

if (files.length === 0) {
  console.error('No test files found matching src/**/*.test.ts')
  process.exit(1)
}

const result = spawnSync(
  process.execPath,
  ['--import', 'tsx', '--test', ...files],
  { stdio: 'inherit', shell: false },
)

process.exit(result.status ?? 1)
