import fs from 'node:fs'
import path from 'node:path'

const romDir = path.resolve('src/downloaded_roms')
const outFile = path.resolve('src/romCatalog.ts')
const allowed = new Set(['.zip', '.gba', '.gb', '.gbc'])

function cleanTitle(filename) {
  let name = filename.replace(/\.(zip|gba|gb|gbc)$/i, '')
  name = name.replace(/_/g, ' ')
  name = name.replace(/\s+GBA$/i, '')
  name = name.replace(/\s*\((?:USA|Europe|USA, Europe|Japan|J|E|F|U|UE)[^)]*\)/gi, '')
  name = name.replace(/\s*\[[^\]]+\]/g, '')
  name = name.replace(/\s{2,}/g, ' ').trim()
  return name || filename
}

function slug(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

const files = fs
  .readdirSync(romDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && allowed.has(path.extname(entry.name).toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

const roms = files.map((entry, index) => {
  const stats = fs.statSync(path.join(romDir, entry.name))
  const title = cleanTitle(entry.name)
  return {
    id: `rom-${String(index + 1).padStart(3, '0')}-${slug(title) || 'game'}`,
    filename: entry.name,
    title,
    size: stats.size,
  }
})

const source = `export type RomEntry = {
  id: string
  filename: string
  title: string
  size: number
}

export const roms: RomEntry[] = ${JSON.stringify(roms, null, 2)}
`

fs.writeFileSync(outFile, source)
console.log(`Wrote ${roms.length} ROMs to src/romCatalog.ts`)
