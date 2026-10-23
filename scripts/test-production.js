import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'

const origin = 'http://127.0.0.1:4173'
let server = null
const alive = async () => {
  try {
    return (await fetch(`${origin}/index.html`)).ok
  } catch {
    return false
  }
}

if (!(await alive())) {
  server = spawn('npm', ['run', 'preview', '--', '--port', '4173'], { cwd: process.cwd(), stdio: 'ignore' })
  for (let attempt = 0; attempt < 80 && !(await alive()); attempt++) {
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}
assert.ok(await alive(), 'Production preview did not start')

const files = await readdir('dist')
assert.deepEqual(files.filter(file => file.endsWith('.html')).sort(), ['gesture.html', 'index.html'])
const browser = await chromium.launch({ headless: true })
const errors = []
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${origin}/index.html`)
  await page.waitForTimeout(2200)
  assert.notEqual(await page.locator('#time-output').textContent(), '00:00 / 00:00')
  await page.locator('#master-play').click()
  const paused = await page.locator('#time-output').textContent()
  await page.waitForTimeout(200)
  assert.equal(await page.locator('#time-output').textContent(), paused)
  await page.locator('#master-restart').click()
  await page.waitForTimeout(150)
  assert.equal(await page.locator('#master-play').getAttribute('aria-label'), 'Pause animation')

  await page.goto(`${origin}/gesture.html`)
  await page.waitForTimeout(1500)
  const box = await page.locator('#dragger').boundingBox()
  assert.ok(box)
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 65, box.y + box.height / 2 + 35, { steps: 6 })
  await page.mouse.up()
  await page.waitForTimeout(650)
  assert.notEqual(await page.locator('#drag-x').textContent(), '000')
  await page.locator('#scroll-study').scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, 300))
  await page.waitForTimeout(300)
  assert.notEqual(await page.locator('#scroll-percent').textContent(), '000%')

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const mobilePage = await mobile.newPage()
  mobilePage.on('pageerror', error => errors.push(error.message))
  for (const path of ['index.html', 'gesture.html']) {
    await mobilePage.goto(`${origin}/${path}`)
    await mobilePage.waitForTimeout(500)
    const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    assert.ok(overflow <= 1, `${path} has ${overflow}px horizontal overflow`)
  }
  await mobile.close()
  assert.deepEqual(errors, [])
  console.log('Production preview passed both demos, controls, dragging, scrolling, mobile overflow, and exactly-two-demos checks.')
} finally {
  await browser.close()
  if (server) server.kill()
}
