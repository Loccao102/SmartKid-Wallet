// Mobile first-screen check: the fixed bottom navigation must never leave a
// heading or the primary action stranded in the strip it overlays. Each such
// element must be either fully visible or fully below the fold.
//
// Covers the world map's featured chapter and the home screen's adventure
// banner across phone/tablet/desktop widths. Content that simply scrolls past
// the floating nav is normal and is not a failure.
//
// Usage: start Vite, then
//   PLAYWRIGHT_MODULE_PATH=playwright-core node scripts/check-mobile-fold.mjs
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')

const baseURL = process.env.UI_BASE_URL || 'http://127.0.0.1:5173'
await mkdir('output/ui-redesign', { recursive: true })
const browser = await chromium.launch({ channel: process.env.UI_BROWSER_CHANNEL || 'msedge', headless: true })

// Runs at scroll position 0. Returns horizontal-overflow state and every critical
// element that is stuck across the floating-nav boundary.
const probe = () => {
  const nav = document.querySelector('.game-nav')
  const result = {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    nav: null,
    stranded: [],
    belowFold: [],
  }
  const critical = {
    world: ['.explorer-world h1', '.chapter-story h2', '.chapter-start'],
    home: ['.explorer-home h1', '.home-adventure-banner h2', '.home-adventure-banner .adventure-button'],
  }
  if (nav) {
    const navRect = nav.getBoundingClientRect()
    const navStyle = getComputedStyle(nav)
    result.nav = { position: navStyle.position, top: Math.round(navRect.top), bottom: Math.round(navRect.bottom) }
    // Only a floating nav can strand content.
    if (navStyle.position === 'fixed' || navStyle.position === 'sticky') {
      for (const [screen, selectors] of Object.entries(critical)) {
        if (!document.querySelector(screen === 'world' ? '.explorer-world' : '.explorer-home')) continue
        for (const selector of selectors) {
          for (const el of document.querySelectorAll(selector)) {
            const r = el.getBoundingClientRect()
            if (!r.width || !r.height) continue
            const label = { screen, selector, text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 36) }
            // The nav's top edge is the last usable line. An element that begins
            // below it is not visible yet, so scrolling reveals it unobstructed.
            if (r.top >= navRect.top) {
              result.belowFold.push({ ...label, top: Math.round(r.top) })
              continue
            }
            // Any element that starts above the nav must finish above it too.
            if (r.bottom > navRect.top + 1) {
              result.stranded.push({ ...label, top: Math.round(r.top), bottom: Math.round(r.bottom), navTop: Math.round(navRect.top), overlap: Math.round(r.bottom - navRect.top) })
            }
          }
        }
      }
    }
  }
  return result
}

// After scrolling an element into view, confirm the nav is not covering it.
const overlapWithNav = selector => {
  const nav = document.querySelector('.game-nav')
  const el = document.querySelector(selector)
  if (!nav || !el) return { skipped: true }
  const navStyle = getComputedStyle(nav)
  if (navStyle.position !== 'fixed' && navStyle.position !== 'sticky') return { skipped: true }
  const r = el.getBoundingClientRect()
  const navRect = nav.getBoundingClientRect()
  return { overlap: Math.round(Math.min(r.bottom, navRect.bottom) - Math.max(r.top, navRect.top)) }
}

const VIEWPORTS = [
  ['phone-narrow', 320, 844],
  ['phone-small', 360, 844],
  ['phone', 390, 844],
  ['phone-large', 414, 896],
  ['tablet', 820, 1180],
  ['desktop', 1440, 900],
]

const results = []
try {
  for (const [device, width, height] of VIEWPORTS) {
    for (const screen of ['world', 'home']) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
      await page.goto(baseURL, { waitUntil: 'networkidle' })
      await page.locator('.explorer-world').waitFor()
      if (screen === 'home') {
        await page.getByRole('button', { name: 'Trang chủ', exact: true }).click()
        await page.locator('.explorer-home').waitFor()
      }
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(200)

      const state = await page.evaluate(probe)
      const label = `${screen}@${device} ${width}x${height}`

      assert.equal(state.scrollWidth > state.clientWidth, false, `${label}: horizontal overflow (${state.scrollWidth} > ${state.clientWidth})`)
      assert.deepEqual(state.stranded, [], `${label}: heading/action stranded across the bottom nav -> ${JSON.stringify(state.stranded)}`)

      // Anything reported below the fold must be reachable and unobstructed.
      for (const item of state.belowFold) {
        // Centre it explicitly: a partially visible element would not move for
        // scrollIntoViewIfNeeded, leaving a misleading overlap measurement.
        await page.locator(item.selector).first().evaluate(el => el.scrollIntoView({ block: 'center' }))
        await page.waitForTimeout(200)
        const scrolled = await page.evaluate(overlapWithNav, item.selector)
        assert.ok(scrolled.skipped || scrolled.overlap <= 1, `${label}: ${item.selector} still behind nav after scroll -> ${JSON.stringify(scrolled)}`)
      }

      assert.deepEqual(errors, [], `${label}: browser errors -> ${JSON.stringify(errors)}`)
      results.push({ screen, device, viewport: `${width}x${height}`, nav: state.nav, belowFold: state.belowFold.map(item => item.selector), horizontalOverflow: false, consoleErrors: errors.length })
      console.log(`${label.padEnd(26)} clear of bottom nav, no horizontal overflow${state.belowFold.length ? ` (${state.belowFold.length} below fold, verified after scroll)` : ''}`)
      await context.close()
    }
  }
  console.log(JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
