import test from 'node:test'
import assert from 'node:assert/strict'
import twexom from '../src/twexom.js'

const near = (actual, expected, tolerance = 0.0001) => {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} is not near ${expected}`)
}

test('tweens numeric object properties and seeks deterministically', () => {
  const target = { x: 0, opacity: 1 }
  const animation = twexom.to(target, { x: 100, opacity: 0.2, duration: 2, ease: 'linear', paused: true })
  animation.seek(1)
  near(target.x, 50)
  near(target.opacity, 0.6)
  near(animation.time(), 1)
  near(animation.duration(), 2)
  animation.seek(2)
  near(target.x, 100)
  animation.kill()
})

test('fromTo captures explicit endpoints', () => {
  const target = { x: 90 }
  const animation = twexom.fromTo(target, { x: 10 }, { x: 110, duration: 1, ease: 'linear', paused: true })
  animation.seek(0.25)
  near(target.x, 35)
  animation.kill()
})

test('from animates from supplied values to current values', () => {
  const target = { x: 20 }
  const animation = twexom.from(target, { x: 0, duration: 1, ease: 'linear', paused: true })
  animation.seek(0.5)
  near(target.x, 10)
  animation.kill()
})

test('relative values and set are supported', () => {
  const target = { x: 20 }
  const animation = twexom.to(target, { x: '+=30', duration: 1, ease: 'linear', paused: true })
  animation.seek(1)
  near(target.x, 50)
  twexom.set(target, { x: 12 })
  near(target.x, 12)
  animation.kill()
})

test('repeat, repeatDelay and yoyo fold time correctly', () => {
  const target = { x: 0 }
  const animation = twexom.to(target, { x: 100, duration: 1, repeat: 1, repeatDelay: 0.5, yoyo: true, ease: 'linear', paused: true })
  near(animation.totalDuration(), 2.5)
  animation.seek(1.25)
  near(target.x, 100)
  animation.seek(1.75)
  near(target.x, 75)
  animation.seek(2.5)
  near(target.x, 0)
  animation.kill()
})

test('stagger extends total duration and offsets targets', () => {
  const targets = [{ x: 0 }, { x: 0 }, { x: 0 }]
  const animation = twexom.to(targets, { x: 100, duration: 1, stagger: 0.2, ease: 'linear', paused: true })
  near(animation.totalDuration(), 1.4)
  animation.seek(0.3)
  near(targets[0].x, 30)
  near(targets[1].x, 10)
  near(targets[2].x, 0)
  animation.kill()
})

test('timelines sequence and overlap child tweens', () => {
  const target = { x: 0, y: 0 }
  const animation = twexom.timeline({ paused: true })
  animation.to(target, { x: 100, duration: 1, ease: 'linear' })
  animation.to(target, { y: 100, duration: 1, ease: 'linear' }, '<0.5')
  near(animation.duration(), 1.5)
  animation.seek(1)
  near(target.x, 100)
  near(target.y, 50)
  animation.seek(0)
  near(target.x, 0)
  near(target.y, 0)
  animation.kill()
})

test('timeline from tweens use the correct mode', () => {
  const target = { x: 50 }
  const animation = twexom.timeline({ paused: true })
  animation.from(target, { x: 0, duration: 1, ease: 'linear' })
  animation.seek(0.5)
  near(target.x, 25)
  animation.kill()
})

test('colors and complex strings interpolate', () => {
  const target = { color: '#000000', shadow: '0px 0px 0px' }
  const animation = twexom.to(target, { color: '#ffffff', shadow: '10px 20px 30px', duration: 1, ease: 'linear', paused: true })
  animation.seek(0.5)
  assert.equal(target.color, 'rgba(128, 128, 128, 1)')
  assert.equal(target.shadow, '5px 10px 15px')
  animation.kill()
})

test('callbacks fire when events are not suppressed', () => {
  const target = { x: 0 }
  let started = 0
  let completed = 0
  const animation = twexom.to(target, {
    x: 1,
    duration: 1,
    paused: true,
    onStart: () => started++,
    onComplete: () => completed++
  })
  animation.seek(0.5, false)
  animation.seek(1, false)
  assert.equal(started, 1)
  assert.equal(completed, 1)
  animation.kill()
})

test('easing and utilities are exposed', () => {
  near(twexom.ease.linear(0.25), 0.25)
  near(twexom.ease['power2.out'](0), 0)
  near(twexom.ease['power2.out'](1), 1)
  near(twexom.utils.clamp(0, 10, 20), 10)
  near(twexom.utils.mapRange(0, 100, 0, 1, 25), 0.25)
  near(twexom.utils.interpolate(10, 20, 0.5), 15)
  near(twexom.utils.snap(5, 12), 10)
})

test('timeScale and totalProgress provide playback control', () => {
  const target = { x: 0 }
  const animation = twexom.to(target, { x: 100, duration: 2, ease: 'linear', paused: true })
  animation.timeScale(2)
  assert.equal(animation.timeScale(), 2)
  animation.totalProgress(0.5)
  near(animation.time(), 1)
  near(target.x, 50)
  animation.kill()
})

test('quickTo reuses its tween and redirects from the current value', () => {
  const target = { x: 0 }
  const move = twexom.quickTo(target, 'x', { duration: 1, ease: 'linear' })
  const first = move(100)
  first.seek(0.5)
  near(target.x, 50)
  const second = move(200)
  assert.equal(first, second)
  second.seek(0.5)
  near(target.x, 125)
  second.seek(1)
  near(target.x, 200)
  second.kill()
})
