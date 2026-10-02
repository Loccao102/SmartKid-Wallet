// Smoke supporting learning/work screens with isolated fixture progress.
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
await mkdir('output/ui-redesign', { recursive: true })
const browser = await chromium.launch({ channel: process.env.UI_BROWSER_CHANNEL || 'msedge', headless: true })
try {
for (const [device, width, height] of [['desktop',1440,1080],['tablet',820,1180],['mobile',390,844]]) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(process.env.UI_BASE_URL || 'http://127.0.0.1:5173', { waitUntil: 'networkidle' })
  // Fixture only: a new isolated browser context, never the user's saved data.
  await page.evaluate(async () => {
    const { useProgressionStore } = await import('/src/store/progression.ts')
    useProgressionStore.setState({ unlockedStalls: ['produce','food','drinks','supplies','promotion'], level: 10 })
    const { useAvatarProfileStore } = await import('/src/store/avatarProfile.ts')
    useAvatarProfileStore.getState().patchAvatar({ hairStyle: 'bob', topColor: '#dc7969', accessory: 'glasses' })
  })
  const capture = async name => {
    await page.screenshot({ path: 'output/ui-redesign/' + name + '-' + device + '.png', fullPage: true })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, name + ' overflow on ' + device)
  }
  await page.getByRole('button', { name: 'Tiếp tục khám phá', exact: true }).click()
  await page.getByRole('button', { name: 'Đi dạo', exact: true }).click()
  await page.locator('.smartmart-phaser-host canvas').first().waitFor()
  await page.waitForLoadState('networkidle')
  await capture('walking')
  await page.getByRole('button', { name: 'Chọn gian', exact: true }).click()
  await page.locator('.hub-stall-produce').click()
  await page.locator('.stall-shop').waitFor()
  await capture('shopping')
  await page.getByRole('button', { name: 'Lập giỏ hàng', exact: true }).click()
  await page.locator('.party-mission').waitFor()
  await capture('mission-shopping')
  await page.getByRole('button', { name: 'Trang chủ', exact: true }).click()
  await page.getByRole('button', { name: /Khởi động trí óc/ }).click()
  await page.locator('.daily-challenge').waitFor()
  await capture('daily')
  await page.evaluate(async () => {
    const { useProgressionStore } = await import('/src/store/progression.ts')
    useProgressionStore.setState({ completedMissionIds: ['mission-class-party-01'] })
  })
  await page.getByRole('button', { name: 'Nhiệm vụ', exact: true }).click()
  await page.getByRole('button', { name: 'Bắt đầu ca làm', exact: true }).click()
  await page.locator('.work-production').waitFor()
  await capture('work')
  assert.deepEqual(errors, [])
  console.log(device + ': shopping, mission, daily, work render and responsive passed')
  await context.close()
}
} finally { await browser.close() }
