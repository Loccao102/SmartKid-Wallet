// Focused Work Mode smoke: load shared React avatar SVGs into Phaser, then
// advance through stage and customer changes while collecting runtime errors.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
const browser = await chromium.launch({
  channel: process.env.UI_BROWSER_CHANNEL || 'msedge',
  headless: true,
})

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto(process.env.UI_BASE_URL || 'http://127.0.0.1:5173', {
    waitUntil: 'networkidle',
  })

  // Isolated fixture state: this runs in a fresh browser context only.
  await page.evaluate(async () => {
    const { useProgressionStore } = await import('/src/store/progression.ts')
    useProgressionStore.setState({
      unlockedStalls: ['produce', 'food', 'drinks', 'supplies', 'promotion'],
      level: 10,
      completedMissionIds: ['mission-class-party-01'],
    })
  })

  await page.getByRole('button', { name: 'Tiếp tục khám phá', exact: true }).click()
  await page.getByRole('button', { name: 'Đi dạo', exact: true }).click()
  await page.locator('.smartmart-phaser-host canvas').first().waitFor()
  await page.getByRole('button', { name: 'Chọn gian', exact: true }).click()
  await page.locator('.hub-stall-produce').click()
  await page.locator('.stall-shop').waitFor()
  await page.getByRole('button', { name: 'Lập giỏ hàng', exact: true }).click()
  await page.locator('.party-mission').waitFor()
  await page.getByRole('button', { name: 'Trang chủ', exact: true }).click()
  await page.getByRole('button', { name: /Khởi động trí óc/ }).click()
  await page.locator('.daily-challenge').waitFor()
  await page.getByRole('button', { name: 'Nhiệm vụ', exact: true }).click()
  await page.getByRole('button', { name: 'Bắt đầu ca làm', exact: true }).click()
  await page.locator('.work-production').waitFor()
  await page.getByRole('button', { name: 'Xem không gian quầy', exact: true }).click()
  await page.locator('.work-phaser-host canvas').first().waitFor()
  await page.waitForLoadState('networkidle')
  await mkdir('output/ui-redesign', { recursive: true })
  await page.locator('.work-phaser-host').screenshot({ path: 'output/ui-redesign/chibi-work-scene.png' })

  const total = await page.locator('.pos-receipt tbody tr').evaluateAll((rows) =>
    rows.reduce((sum, row) => {
      const cells = row.querySelectorAll('td')
      const quantity = Number(cells[0]?.textContent?.replace(/\D/g, '') || 0)
      const unitPrice = Number(cells[1]?.textContent?.replace(/\D/g, '') || 0)
      return sum + quantity * unitPrice
    }, 0),
  )
  await page.locator('#pos-answer').fill(String(total))
  await page.getByRole('button', { name: 'Kiểm tra hóa đơn', exact: true }).click()

  const scenario = page.locator('.scenario-options button').first()
  if (await scenario.isVisible().catch(() => false)) {
    await scenario.click()
  }

  await page.locator('.pos-payment').waitFor()
  const [cashGiven, effectiveTotal] = await page.locator('.pos-payment strong').evaluateAll((items) =>
    items.map((item) => Number(item.textContent?.replace(/\D/g, '') || 0)),
  )
  await page.locator('#pos-answer').fill(String(cashGiven - effectiveTotal))
  await page.getByRole('button', { name: 'Xác nhận tiền thừa', exact: true }).click()
  await page.locator('.pos-done').waitFor()

  const nextCustomer = page.getByRole('button', { name: 'Khách tiếp theo', exact: true })
  if (await nextCustomer.isVisible().catch(() => false)) {
    await nextCustomer.click()
    await page.locator('.pos-input').waitFor()
    await page.locator('.work-phaser-host canvas').first().waitFor()
  }

  assert.ok(await page.locator('.work-phaser-host canvas').count() >= 1)
  assert.deepEqual(errors, [])
  console.log('Work Mode avatar texture loading, stage change, and customer change passed')
  await context.close()
} finally {
  await browser.close()
}
