import test from 'node:test'
import assert from 'node:assert/strict'
import twexom from '../src/all.js'

const near = (actual, expected, tolerance = 0.0001) => {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} is not near ${expected}`)
}

test('array keyframes sequence automatically', () => {
  const target = { x: 0 }
  const animation = twexom.to(target, { keyframes: [{ x: 50, duration: 1 }, { x: 100, duration: 1 }], ease: 'linear', paused: true })
  animation.seek(0.5)
  near(target.x, 25)
  animation.seek(1.5)
  near(target.x, 75)
  animation.kill()
})

test('percentage keyframes use total duration', () => {
  const target = { x: 0 }
  const animation = twexom.to(target, { keyframes: { 0: { x: 0 }, 50: { x: 100 }, 100: { x: 0 } }, duration: 2, ease: 'linear', paused: true })
  animation.seek(1)
  near(target.x, 100)
  animation.seek(1.5)
  near(target.x, 50)
  animation.kill()
})

test('timeline defaults cascade to children', () => {
  const target = { x: 0 }
  const animation = twexom.timeline({ paused: true, defaults: { duration: 2, ease: 'linear' } })
  animation.to(target, { x: 100 })
  animation.seek(1)
  near(target.x, 50)
  assert.equal(animation.defaults().duration, 2)
  animation.kill()
})

test('per-property ease, snap and modifier are applied', () => {
  const target = { x: 0, y: 0 }
  const animation = twexom.to(target, {
    x: { value: 97, snap: 5, modifier: value => value + 1 },
    y: { value: 100, ease: 'power1.in' },
    duration: 1,
    ease: 'linear',
    paused: true
  })
  animation.seek(0.5)
  near(target.x, 51)
  near(target.y, 25)
  animation.kill()
})

test('repeatRefresh reevaluates function values', () => {
  const target = { x: 0 }
  let end = 100
  const animation = twexom.to(target, {
    x: () => end,
    duration: 1,
    repeat: 1,
    repeatRefresh: true,
    ease: 'linear',
    paused: true,
    onRepeat: () => { end = 200 }
  })
  animation.seek(0.999, false)
  animation.seek(1, false)
  animation.seek(1.5, false)
  near(target.x, 150, 0.2)
  animation.kill()
})

test('yoyoEase is independent from forward ease', () => {
  const target = { x: 0 }
  const animation = twexom.to(target, { x: 100, duration: 1, repeat: 1, yoyo: true, yoyoEase: 'power1.in', ease: 'linear', paused: true })
  animation.seek(1.25)
  near(target.x, 56.25)
  animation.kill()
})

test('overwrite auto removes only conflicting properties', () => {
  const target = { x: 0, y: 0 }
  const first = twexom.to(target, { x: 100, y: 100, duration: 1, ease: 'linear', paused: true })
  first.seek(0)
  const second = twexom.to(target, { x: 200, duration: 1, overwrite: 'auto', paused: true })
  second.seek(0)
  first.seek(1)
  near(target.x, 0)
  near(target.y, 100)
  first.kill()
  second.kill()
})

test('timeline labels and tweenTo navigate playback', () => {
  const target = { x: 0 }
  const animation = twexom.timeline({ paused: true })
  animation.to(target, { x: 100, duration: 1, ease: 'linear' })
  animation.addLabel('middle', 0.5)
  assert.equal(animation.currentLabel(), '')
  const seek = animation.tweenTo('middle', { duration: 1, ease: 'linear', paused: true })
  seek.seek(0.5, false)
  near(animation.time(), 0.25)
  assert.equal(animation.nextLabel(), 'middle')
  animation.seek(1)
  assert.equal(animation.currentLabel(), 'middle')
  seek.kill()
  animation.kill()
})

test('custom effects use the plugin render path', () => {
  twexom.registerEffect('double', (target, values) => ({
    render(progress) {
      target.x = values.end * 2 * progress
    }
  }))
  const target = { x: 0 }
  const animation = twexom.to(target, { double: 50, duration: 1, ease: 'linear', paused: true })
  animation.seek(0.5)
  near(target.x, 50)
  animation.kill()
})

test('advanced easing registers custom named eases', () => {
  const custom = twexom.CustomEase.create('testease', 'M0,0 C0.2,0 0.8,1 1,1')
  near(custom(0), 0)
  near(custom(1), 1)
  assert.equal(typeof twexom.CustomBounce.create('testbounce'), 'function')
  assert.equal(twexom.ease.testease, custom)
})
