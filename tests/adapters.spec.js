import { test, expect } from '@playwright/test'

const adapters = [
  { name: 'React', fixture: '/tests/fixtures/react-host.js' },
  { name: 'Vue', fixture: '/tests/fixtures/vue-host.js' },
  { name: 'Svelte', fixture: '/tests/fixtures/svelte-host.js' },
  { name: 'Angular', fixture: '/tests/fixtures/angular-host.js' }
]

for (const adapter of adapters) {
  test(`${adapter.name} adapter mounts, animates and cleans up in its real host runtime`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/index.html')
    const result = await page.evaluate(async fixture => {
      const module = await import(fixture)
      return module.run()
    }, adapter.fixture)
    expect(result.value).toContain('50px')
    expect(result.cleaned).toBe(true)
    expect(errors).toEqual([])
  })
}
