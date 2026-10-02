// Renders the actual production character component as an art review sheet.
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
await mkdir('output/ui-redesign', { recursive: true })
const browser = await chromium.launch({ channel: process.env.UI_BROWSER_CHANNEL || 'msedge', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1120, height: 960 }, reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(process.env.UI_BASE_URL || 'http://127.0.0.1:5173', { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    const { createElement: h } = (await import('/node_modules/.vite/deps/react.js')).default
    const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default
    const { AvatarCharacter } = await import('/src/components/avatar/AvatarCharacter.tsx')
    const catalog = await import('/src/avatar/avatarCatalog.ts')
    const host = document.createElement('div')
    host.id = 'chibi-review-sheet'
    Object.assign(host.style, { position: 'relative', zIndex: '99999', width: '1120px', padding: '36px 48px', background: '#f9f4e9', color: '#284d43', fontFamily: 'Nunito, sans-serif' })
    document.getElementById('root').style.display = 'none'
    document.body.append(host)
    const accessories = ['bag','none','headband','glasses','cap','none','bag','headband']
    const backgrounds = ['#e1ece0','#e3edf4','#f4e1d5','#ece1ef','#f4e9cd','#eee0d8','#e0e9e7','#e5e8f5']
    createRoot(host).render(h('div', {},
      h('p', { style: { margin: '0 0 5px', fontSize: 13, fontWeight: 800, letterSpacing: '2px' } }, 'SMARTKID WALLET · CHIBI RPG'),
      h('h1', { style: { margin: '0 0 22px', fontSize: 32 } }, 'Một diện mạo mới cho cuộc phiêu lưu'),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 } }, catalog.hairStyleOptions.map((option, index) => h('div', { key: option.id, style: { background: backgrounds[index], borderRadius: 22, padding: '14px 10px 16px', textAlign: 'center' } },
        h(AvatarCharacter, { config: { ...catalog.defaultStudentAvatar, hairStyle: option.id, skinTone: catalog.skinToneOptions[index % 5].id, hairColor: catalog.hairColorOptions[index % 6].id, topColor: catalog.topColorOptions[index].id, accessory: accessories[index] }, label: option.label, className: 'review-character' }),
        h('strong', { style: { fontSize: 14 } }, option.label)
      ))),
      h('p', { style: { margin: '20px 0 0', fontSize: 14, color: '#5c6c62' } }, '8 kiểu tóc · 5 phụ kiện · Tùy chỉnh màu da, mắt và trang phục')
    ))
    const style = document.createElement('style')
    style.textContent = '.review-character { width: 100%; height: 260px; display: block; } body { margin: 0; }'
    document.head.append(style)
  })
  await page.locator('.review-character').last().waitFor()
  assert.equal(await page.locator('.review-character').count(), 8)
  await page.locator('#chibi-review-sheet').screenshot({ path: 'output/ui-redesign/chibi-character-sheet.png' })
  assert.deepEqual(errors, [])
  console.log('Chibi art sheet: 8 production character variants rendered without errors.')
} finally { await browser.close() }
