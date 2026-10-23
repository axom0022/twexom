import { test, expect } from '@playwright/test'

test('both demos and reduced-motion controls work across browser engines', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/index.html')
  await expect(page.locator('#master-play')).toBeVisible()
  await expect(page.locator('#time-output')).not.toHaveText('00:00 / 00:00')
  await page.locator('#master-play').click()
  await expect(page.locator('#master-play')).toHaveAttribute('aria-label', 'Pause animation')
  await page.locator('#master-play').click()
  await expect(page.locator('#master-play')).toHaveAttribute('aria-label', 'Play animation')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  await page.goto('/gesture.html')
  await expect(page.locator('#dragger')).toBeVisible()
  await expect(page.locator('#scroll-study')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
})

test('optional bundle and custom easing load in every browser engine', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/index.html')
  const result = await page.evaluate(async () => {
    const { default: twexom } = await import('/src/all.js')
    const target = { x: 0 }
    const animation = twexom.to(target, { x: 100, duration: 1, ease: 'linear', paused: true })
    animation.seek(0.25)
    const ease = twexom.CustomEase.create('cross-browser-ease', 'M0,0 C0.2,0 0.8,1 1,1')
    const splitTarget = document.createElement('span')
    splitTarget.textContent = 'Cross browser'
    document.body.appendChild(splitTarget)
    const split = new twexom.SplitText(splitTarget, { type: 'chars,words' })
    const chars = split.chars.length
    split.revert()
    splitTarget.remove()
    animation.kill()
    return { value: target.x, ease: ease(0.5), chars }
  })
  expect(result.value).toBe(25)
  expect(result.ease).toBeGreaterThan(0)
  expect(result.ease).toBeLessThan(1)
  expect(result.chars).toBe(12)
  expect(errors).toEqual([])
})
