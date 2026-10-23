import { test, expect } from '@playwright/test'

const errors = []

test.beforeEach(async ({ page }) => {
  errors.length = 0
  page.on('pageerror', error => errors.push(error.message))
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

test('optional motion, physics, text, SVG, Flip and devtools modules run in a browser', async ({ page }) => {
  await page.goto('/index.html')
  const result = await page.evaluate(async () => {
    const { default: twexom } = await import('/src/all.js')
    const fixture = document.createElement('div')
    fixture.id = 'plugin-fixture'
    fixture.style.cssText = 'position:relative;height:500px;padding:20px;background:#fff'
    document.body.appendChild(fixture)
    const target = document.createElement('div')
    target.style.cssText = 'width:20px;height:20px;background:#000'
    fixture.appendChild(target)
    const motion = twexom.to(target, {
      motionPath: { path: [{ x: 0, y: 0 }, { x: 100, y: 50 }] },
      duration: 1,
      ease: 'linear',
      paused: true
    })
    motion.seek(0.5)
    const motionTransform = target.style.transform
    const body = { x: 0, y: 0 }
    const physics = twexom.to(body, { physics2D: { velocity: 100, angle: 0, gravity: 100 }, duration: 1, ease: 'linear', paused: true })
    physics.seek(0.5)
    const text = document.createElement('p')
    text.textContent = 'Twexom text'
    fixture.appendChild(text)
    const split = new twexom.SplitText(text, { type: 'chars,words' })
    const characterCount = split.chars.length
    const wordCount = split.words.length
    split.revert()
    const restoredText = text.textContent
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '120')
    svg.setAttribute('height', '30')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M0 10 L100 10')
    path.setAttribute('stroke', '#000')
    path.setAttribute('fill', 'none')
    svg.appendChild(path)
    fixture.appendChild(svg)
    const draw = twexom.to(path, { drawSVG: '50%', duration: 1, ease: 'linear', paused: true })
    draw.seek(1)
    const dash = path.style.strokeDasharray
    const flipTarget = document.createElement('div')
    flipTarget.style.cssText = 'position:absolute;left:0;top:100px;width:40px;height:40px;background:#000'
    fixture.appendChild(flipTarget)
    const state = twexom.Flip.getState(flipTarget)
    flipTarget.style.left = '100px'
    const flip = twexom.Flip.from(state, { duration: 1, ease: 'linear', paused: true })
    flip.seek(0.5)
    const flipTransform = flipTarget.style.transform
    const style = document.createElement('style')
    style.textContent = '.css-rule-fixture{color:rgb(0,0,0)}'
    document.head.appendChild(style)
    const cssTarget = document.createElement('div')
    cssTarget.className = 'css-rule-fixture'
    fixture.appendChild(cssTarget)
    const rule = twexom.CSSRulePlugin.getRule('.css-rule-fixture')
    const css = twexom.to(rule, { color: 'rgb(255,0,0)', duration: 1, ease: 'linear', paused: true })
    css.seek(0.5)
    const ruleColor = rule.color
    const panel = twexom.DevTools.create()
    const panelExists = !!panel.element && document.body.contains(panel.element)
    panel.kill()
    css.kill()
    style.remove()
    motion.kill()
    physics.kill()
    draw.kill()
    flip.kill()
    fixture.remove()
    return { motionTransform, physicsX: body.x, physicsY: body.y, characterCount, wordCount, restoredText, dash, flipTransform, ruleColor, panelExists }
  })
  expect(result.motionTransform).toContain('50px')
  expect(result.physicsX).toBeCloseTo(50, 3)
  expect(result.physicsY).toBeCloseTo(12.5, 3)
  expect(result.characterCount).toBe(10)
  expect(result.wordCount).toBe(2)
  expect(result.restoredText).toBe('Twexom text')
  expect(result.dash).toContain('50px')
  expect(result.flipTransform).toContain('-50px')
  expect(result.ruleColor).toBe('rgb(128, 0, 0)')
  expect(result.panelExists).toBe(true)
})

test('advanced scrolling supports element scrollers and reversible callbacks', async ({ page }) => {
  await page.goto('/index.html')
  const result = await page.evaluate(async () => {
    const { default: twexom } = await import('/src/all.js')
    const fixture = document.createElement('div')
    fixture.style.cssText = 'position:relative;width:220px;height:180px;overflow:auto;background:#fff'
    const content = document.createElement('div')
    content.style.cssText = 'height:900px;padding-top:20px'
    const target = document.createElement('div')
    target.style.cssText = 'width:40px;height:40px;background:#000'
    content.appendChild(target)
    fixture.appendChild(content)
    document.body.appendChild(fixture)
    const targetState = { value: 0 }
    const animation = twexom.to(targetState, { value: 100, duration: 1, ease: 'linear', paused: true })
    let enters = 0
    let leaves = 0
    const scene = twexom.scroll({
      trigger: target,
      scroller: fixture,
      start: 'top top',
      end: 'bottom top',
      animation,
      scrub: true,
      onEnter: () => { enters++ },
      onLeaveBack: () => { leaves++ }
    })
    scene.refresh()
    fixture.scrollTop = 160
    scene.update()
    const progressed = targetState.value
    fixture.scrollTop = 0
    scene.update()
    const returned = targetState.value
    const scrollTween = twexom.to(fixture, { scrollTo: { y: 120 }, duration: 1, ease: 'linear', paused: true })
    scrollTween.seek(0.5)
    const scrolled = fixture.scrollTop
    scene.kill()
    animation.kill()
    scrollTween.kill()
    fixture.remove()
    return { progressed, returned, scrolled, enters, leaves }
  })
  expect(result.progressed).toBeGreaterThan(0)
  expect(result.returned).toBe(0)
  expect(result.scrolled).toBe(60)
  expect(result.enters).toBeGreaterThan(0)
  expect(result.leaves).toBeGreaterThan(0)
})

test('gesture module exposes draggable and observer APIs without desktop-only assumptions', async ({ page }) => {
  await page.goto('/index.html')
  const result = await page.evaluate(async () => {
    const { default: twexom } = await import('/src/all.js')
    const target = document.createElement('div')
    target.style.cssText = 'width:80px;height:80px;touch-action:none;background:#000'
    document.body.appendChild(target)
    const draggable = twexom.Draggable.create(target, { type: 'x,y' })[0]
    const observer = twexom.Observer.create({ target, type: 'touch,pointer', onPress: () => {} })
    const state = { rotation: 0 }
    const rotation = twexom.to(state, { rotation: 90, duration: 1, ease: 'linear', paused: true })
    rotation.seek(0.5)
    const enabled = typeof draggable.disable === 'function' && typeof observer.disable === 'function'
    draggable.kill()
    observer.kill()
    rotation.kill()
    target.remove()
    return { enabled, rotation: state.rotation }
  })
  expect(result.enabled).toBe(true)
  expect(result.rotation).toBe(45)
})
