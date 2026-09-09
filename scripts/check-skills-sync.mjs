/**
 * The skills live twice: `.cursor/skills` (Cursor) and `.claude/skills` (Claude Code).
 * Both tools only read their own directory, so the files must be duplicated — but
 * duplicated instructions that silently diverge are exactly the failure this project
 * warns about. This check fails the build when the two trees stop matching.
 *
 *   node scripts/check-skills-sync.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const SOURCE = '.cursor/skills'
const MIRROR = '.claude/skills'

const FIX = process.argv.includes('--fix')

function walk(root) {
  const files = new Map()

  if (!fs.existsSync(root)) return files

  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        visit(full)
      } else if (entry.isFile()) {
        // Normalise line endings: git checks out CRLF on Windows.
        const content = fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n')
        files.set(path.relative(root, full).split(path.sep).join('/'), content)
      }
    }
  }

  visit(root)
  return files
}

const source = walk(SOURCE)
const mirror = walk(MIRROR)

if (source.size === 0) {
  console.error(`No skills found in ${SOURCE}`)
  process.exit(1)
}

const problems = []

for (const [file, content] of source) {
  if (!mirror.has(file)) {
    problems.push(`missing in ${MIRROR}: ${file}`)
  } else if (mirror.get(file) !== content) {
    problems.push(`content differs: ${file}`)
  }
}

for (const file of mirror.keys()) {
  if (!source.has(file)) {
    problems.push(`orphan in ${MIRROR} (not in ${SOURCE}): ${file}`)
  }
}

if (problems.length > 0 && FIX) {
  fs.rmSync(MIRROR, { recursive: true, force: true })
  fs.cpSync(SOURCE, MIRROR, { recursive: true })
  console.log(`Mirrored ${SOURCE} -> ${MIRROR} (${source.size} file(s)).`)
  process.exit(0)
}

if (problems.length > 0) {
  console.error(`\nSkills are out of sync between ${SOURCE} and ${MIRROR}:\n`)
  for (const p of problems) console.error(`  - ${p}`)
  console.error(
    `\nEdit ${SOURCE} (the source of truth), then mirror it:\n` +
      `  npm run skills:sync\n`,
  )
  process.exit(1)
}

console.log(`Skills in sync (${source.size} file(s)).`)
