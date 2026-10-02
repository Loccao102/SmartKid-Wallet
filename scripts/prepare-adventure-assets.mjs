// One-time production image encoding. Run with the bundled sharp module path.
import { createRequire } from 'node:module'
import { mkdir, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const require = createRequire(import.meta.url)
const sharp = require(process.argv[2] || 'sharp')
const source = process.argv[3]
if (!source) throw new Error('Pass the generated-image source directory.')
const artwork = {
  smartmart: 'exec-3f5a12de-e2dd-45a5-b49c-432fbb795e16.png',
  'tiny-bank': 'exec-40e14712-1656-4b68-8721-222b04c61f83.png',
  'happy-restaurant': 'exec-3b8e1c8a-c292-401f-a3aa-d96dc60859e1.png',
  'weekend-market': 'exec-61089f20-2f0b-4a70-be5c-7441b0af6ea6.png',
}
for (const [id, file] of Object.entries(artwork)) {
  const destination = resolve('public/assets/maps', id)
  await mkdir(destination, { recursive: true })
  await sharp(resolve(source, file)).resize(1280).webp({ quality: 83 }).toFile(resolve(destination, 'scene.webp'))
  await sharp(resolve(source, file)).resize(600).webp({ quality: 78 }).toFile(resolve(destination, 'thumbnail.webp'))
  await copyFile(resolve('public/assets/production', `${id}.svg`), resolve(destination, 'landmark.svg'))
}
for (const group of ['stalls', 'products', 'environment']) await mkdir(`public/assets/maps/smartmart/${group}`, { recursive: true })
for (const id of ['produce', 'food', 'drinks', 'supplies', 'promotion']) {
  await copyFile(`public/assets/production/stall-${id}.svg`, `public/assets/maps/smartmart/stalls/${id}.svg`)
}
for (const id of ['banana-bunch', 'apple-bag', 'orange-bag', 'grape-box', 'bread-basket', 'cupcake-box', 'yogurt-pack', 'sandwich-box', 'water-pack', 'milk-pack', 'tea-pack', 'juice-pack', 'paper-cups', 'napkins']) {
  await copyFile(`public/assets/production/${id}.svg`, `public/assets/maps/smartmart/products/${id}.svg`)
}
await copyFile('public/assets/production/hub-floor.svg', 'public/assets/maps/smartmart/environment/floor.svg')
await copyFile('public/assets/production/class-party.svg', 'public/assets/maps/smartmart/environment/class-party.svg')
console.log('Encoded four independent map packs with full scenes and lightweight thumbnails.')
