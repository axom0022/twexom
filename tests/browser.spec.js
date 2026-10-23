import { test, expect } from '@playwright/test'

const errors = []

test.beforeEach(async ({ page }) => {
  errors.length = 0
  page.on('pageerror', error => errors.push(error.message))
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

test('desktop timeline controls and gesture scene work', async ({ page }) => {
  await page.goto('/index.html')
  await page.waitForTimeout(2400)
  await expect(page.locator('#time-output')).not.toHaveText('00:00 / 00:00')
  await page.screenshot({ path: 'artifacts/kinetic-desktop.png', fullPage: true })

  await page.locator('#master-play').click()
  const pausedTime = await page.locator('#time-output').textContent()
  await page.waitForTimeout(250)
  await expect(page.locator('#time-output')).toHaveText(pausedTime)

  await page.locator('#scrubber').evaluate(element => {
    element.value = '520'
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(page.locator('#scrubber')).toHaveValue('520')
  await page.locator('#ease-select').selectOption('expo.out')
  await expect(page.locator('#ease-label')).toHaveText('expo.out')
  await page.locator('#master-restart').click()
  await page.waitForTimeout(250)
  await expect(page.locator('#master-play')).toHaveAttribute('aria-label', 'Pause animation')

  await page.goto('/gesture.html')
  await page.waitForTimeout(1700)
  const box = await page.locator('#dragger').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 75, box.y + box.height / 2 + 45, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(750)
  await expect(page.locator('#drag-x')).not.toHaveText('000')

  const scrollTop = await page.locator('#scroll-study').evaluate(element => element.offsetTop + element.offsetHeight * 0.45)
  await page.evaluate(value => window.scrollTo(0, value), scrollTop)
  await page.waitForTimeout(400)
  await expect(page.locator('#scroll-percent')).not.toHaveText('000%')
  await page.screenshot({ path: 'artifacts/field-desktop.png', fullPage: false })
})

test('mobile layouts fit and both demos render', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1
  })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/index.html')
  await page.waitForTimeout(2200)
  const kineticOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(kineticOverflow).toBeLessThanOrEqual(1)
  await page.screenshot({ path: 'artifacts/kinetic-mobile.png', fullPage: true })

  await page.goto('http://127.0.0.1:5173/gesture.html')
  await page.waitForTimeout(1700)
  const fieldOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(fieldOverflow).toBeLessThanOrEqual(1)
  await page.screenshot({ path: 'artifacts/field-mobile.png', fullPage: false })

  const box = await page.locator('#dragger').boundingBox()
  const client = await context.newCDPSession(page)
  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y: startY }] })
  for (let step = 1; step <= 6; step++) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX + step * 10, y: startY + step * 6 }] })
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(750)
  await expect(page.locator('#drag-x')).not.toHaveText('000')

  const scrollTop = await page.locator('#scroll-study').evaluate(element => element.offsetTop + element.offsetHeight * 0.42)
  await page.evaluate(value => window.scrollTo(0, value), scrollTop)
  await page.waitForTimeout(350)
  await expect(page.locator('#scroll-percent')).not.toHaveText('000%')
  await page.screenshot({ path: 'artifacts/field-mobile-scroll.png', fullPage: false })
  await context.close()
})

test('reduced motion renders completed intros without autoplay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/index.html')
  await expect(page.locator('#master-play')).toHaveAttribute('aria-label', 'Play animation')
  await expect(page.locator('#time-output')).not.toHaveText('00:00 / 00:00')
  const time = await page.locator('#time-output').textContent()
  const [current, total] = time.split(' / ')
  expect(current).toBe(total)
  await page.goto('/gesture.html')
  await expect(page.locator('#field-title')).toBeVisible()
  await expect(page.locator('#dragger')).toBeVisible()
})
