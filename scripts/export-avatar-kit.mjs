// Export a review candidate only. Accepted kit versions are copied separately;
// this command never overwrites public/assets/characters or docs/kits.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const { values } = parseArgs({ options: {
  version: { type: 'string', default: '1.0.0' },
  date: { type: 'string' },
} })
assert.match(values.version, /^\d+\.\d+\.\d+$/)
assert.match(values.date ?? '', /^\d{4}-\d{2}-\d{2}$/, 'Supply --date YYYY-MM-DD for the export record')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const candidate = resolve(root, 'output/ui-redesign/chibi-kit-candidate')
const assets = resolve(candidate, 'assets')
const source = resolve(candidate, 'source')
const checksums = {}
const sha256 = buffer => createHash('sha256').update(buffer).digest('hex')
async function save(relativePath, content) {
  const destination = resolve(assets, relativePath)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, content)
  checksums[relativePath] = sha256(content)
}

// SSR renders the real component without browser/Playwright dependencies.
const vite = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const { AvatarCharacter, AVATAR_ART_SIZE } = await vite.ssrLoadModule('/src/components/avatar/AvatarCharacter.tsx')
  const catalog = await vite.ssrLoadModule('/src/avatar/avatarCatalog.ts')
  const accessories = ['bag', 'none', 'headband', 'glasses', 'cap', 'none', 'bag', 'headband']
  const presets = catalog.hairStyleOptions.map((option, index) => ({
    id: option.id,
    label: option.label,
    config: {
      ...catalog.defaultStudentAvatar,
      hairStyle: option.id,
      skinTone: catalog.skinToneOptions[index % catalog.skinToneOptions.length].id,
      hairColor: catalog.hairColorOptions[index % catalog.hairColorOptions.length].id,
      topColor: catalog.topColorOptions[index % catalog.topColorOptions.length].id,
      accessory: accessories[index % accessories.length],
    },
    full: `svg/${option.id}.svg`,
    portrait: `portraits/${option.id}.svg`,
  }))
  const svg = (config, props = {}) => {
    assert.ok(catalog.isAvatarConfig(config), 'Export preset must remain a valid saved avatar')
    const markup = renderToStaticMarkup(createElement(AvatarCharacter, { config, ...props }))
    assert.ok(markup.startsWith('<svg') && markup.includes('xmlns="http://www.w3.org/2000/svg"'))
    return markup + '\n'
  }
  for (const preset of presets) {
    await save(preset.full, svg(preset.config, { label: preset.label }))
    await save(preset.portrait, svg(preset.config, { label: preset.label, framing: 'portrait' }))
  }
  const expressions = ['happy', 'neutral', 'thinking', 'confused', 'concerned']
  for (const expression of expressions) {
    await save(`expressions/${expression}.svg`, svg(catalog.defaultStudentAvatar, { expression, framing: 'portrait' }))
  }
  await save('svg/default-student.svg', svg(catalog.defaultStudentAvatar))
  await save('svg/smartmart-uniform.svg', svg(catalog.defaultStudentAvatar, { uniform: 'smartmart', age: 'adult' }))

  const snapshots = []
  for (const path of ['src/components/avatar/AvatarCharacter.tsx', 'src/avatar/avatarCatalog.ts', 'src/game/avatarSvg.ts']) {
    const content = await readFile(resolve(root, path))
    const destination = resolve(source, path)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, content)
    snapshots.push({ path, snapshot: `source/${path}`, sha256: sha256(content) })
  }
  const optionNames = ['bodyTypeOptions', 'skinToneOptions', 'hairStyleOptions', 'hairColorOptions', 'eyeStyleOptions', 'topColorOptions', 'bottomColorOptions', 'shoeColorOptions', 'accessoryOptions']
  const manifest = {
    schemaVersion: 1,
    id: 'smartkid-chibi-rpg',
    version: values.version,
    savedOn: values.date,
    description: 'Chibi RPG 2D — SmartKid Wallet, học sinh lớp 4–5',
    canvas: AVATAR_ART_SIZE,
    portraitViewBox: '28 8 190 178',
    pose: 'front-standing-static',
    transparentBackground: true,
    avatarPersistenceVersion: 2,
    sourceFiles: snapshots,
    options: Object.fromEntries(optionNames.map(key => [key, catalog[key]])),
    defaultConfig: catalog.defaultStudentAvatar,
    expressions,
    presets,
    assetSha256: checksums,
  }
  await writeFile(resolve(assets, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(`Exported ${Object.keys(checksums).length} SVGs, ${snapshots.length} source snapshots and manifest to ${candidate}`)
} finally {
  await vite.close()
}
