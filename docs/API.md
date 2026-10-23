# Twexom API

Twexom is a dependency-free animation engine with a small core and optional feature modules. The core handles tweens, timelines, transforms, interpolation, scroll scenes, pointer gestures, contexts, and utilities. Optional modules add advanced scrolling, motion paths, Flip, SVG, text, physics, advanced easing, and diagnostics.

The API is GSAP-inspired, but this document describes Twexom's implemented behavior rather than promising drop-in GSAP compatibility.

## Installation and module choices

```js
import twexom from 'twexom'
```

Use the all-module entry when an application wants the optional APIs registered together:

```js
import twexom from 'twexom/all'
```

Register only the modules an application needs:

```js
import twexom from 'twexom'
import scroll from './src/scroll.js'
import motionPath from './src/motionpath.js'

twexom.register(scroll, motionPath)
```

Package releases include ESM, minified ESM, CommonJS, minified CommonJS, IIFE, and minified IIFE files. The `twexom` files contain the core; `twexom-all` files contain the core and all optional modules. Source modules are also included for custom bundling.

## Targets and values

A target can be a CSS selector, an Element, an array, a NodeList, or a plain object. A tween can write numeric properties, unit-bearing values, named or hexadecimal colors, complex strings containing numbers, CSS variables, CSS properties, transforms, and SVG attributes.

```js
twexom.to('.card', {
  x: 120,
  y: '2rem',
  rotation: 8,
  backgroundColor: '#c7ff4a',
  duration: 0.8,
  ease: 'power3.out'
})

twexom.to({ value: 0 }, { value: 100, duration: 1 })
twexom.to('svg circle', { attr: { cx: 80, r: 12 } })
```

Transform properties include `x`, `y`, `z`, `xPercent`, `yPercent`, `scale`, `scaleX`, `scaleY`, `scaleZ`, `rotation`, `rotationX`, `rotationY`, `rotationZ`, `skewX`, `skewY`, and `transformPerspective`.

## Tween construction

```js
const tween = twexom.to('.item', { x: 200, duration: 1 })
const fromTween = twexom.from('.item', { autoAlpha: 0, y: 30 })
const fromToTween = twexom.fromTo('.item', { x: -20 }, { x: 20 })
twexom.set('.item', { autoAlpha: 1 })
```

Common options:

| Option | Behavior |
| --- | --- |
| `duration` | Active duration in seconds |
| `delay` | Delay before the active portion |
| `ease` | Named ease or a function receiving normalized progress |
| `repeat` | Number of repeats; `-1` repeats indefinitely |
| `repeatDelay` | Delay between cycles |
| `repeatRefresh` | Rebuilds function-based values when a new cycle begins |
| `yoyo` | Reverses every other cycle |
| `yoyoEase` | Optional separate ease for yoyo cycles |
| `stagger` | Number or stagger configuration object |
| `paused` | Creates an animation without starting playback |
| `overwrite` | `true` kills overlapping tweens; `'auto'` removes conflicting tracks |
| `timeScale` | Playback-rate multiplier |
| `immediateRender` | Controls initial rendering for `from`/`fromTo` creation |
| `onStart`, `onUpdate`, `onRepeat`, `onComplete` | Cycle callbacks |
| `onReverseComplete`, `onInterrupt` | Reverse and interruption callbacks |

`seek(time, suppressEvents)` is deterministic and defaults to suppressing callbacks. Pass `false` as the second argument when callbacks should run during a seek.

### Per-property controls

Use a property object when one property needs its own curve, snap, or modifier:

```js
twexom.to('.counter', {
  x: {
    value: 97,
    ease: 'power1.in',
    snap: 5,
    modifier: value => value + 1
  },
  duration: 1,
  ease: 'linear'
})
```

A `modifiers` map can also be supplied at the tween level. Snap accepts an increment, an array of candidates, a function, or an object with `increment`/`step`.

### Keyframes

Array keyframes sequence in order. Percentage keyframes distribute frames across the requested total duration.

```js
twexom.to('.item', {
  keyframes: [
    { x: 80, duration: 0.4 },
    { y: 40, duration: 0.6 },
    { rotation: 0, duration: 0.3 }
  ]
})

twexom.to('.item', {
  keyframes: {
    0: { x: 0, opacity: 0 },
    50: { x: 100, opacity: 1 },
    100: { x: 0, opacity: 0 }
  },
  duration: 2
})
```

## Playback and timelines

```js
const scene = twexom.timeline({
  paused: true,
  defaults: { duration: 0.6, ease: 'power2.out' }
})

scene
  .addLabel('intro')
  .to('.title', { yPercent: 0 }, 'intro')
  .to('.art', { scale: 1 }, '<0.15')
  .from('.caption', { autoAlpha: 0 }, '-=0.2')
  .addLabel('ready')
  .call(() => console.log('ready'), [], 'ready')

scene.play()
scene.pause()
scene.reverse()
scene.restart()
scene.seek(1.2)
scene.progress(0.5)
scene.totalProgress(0.75)
scene.timeScale(1.5)
```

Positions support numbers, labels, `'<'`, `'>'`, relative `'+=0.2'`/`'-=0.2'` values, and label offsets. Navigation helpers include `currentLabel()`, `nextLabel()`, `previousLabel()`, `addPause()`, `tweenTo()`, and `tweenFromTo()`.

`defaults()` reads or updates the defaults applied to subsequently added children. `getChildren()`, `remove()`, `clear()`, `invalidate()`, and `kill()` support composition and cleanup.

## Core scrolling

```js
const horizontal = twexom.timeline({ paused: true })
horizontal.to('.track', { xPercent: -60, duration: 2, ease: 'none' })

const scene = twexom.scroll({
  trigger: '.scroll-space',
  start: 'top top',
  end: 'bottom bottom',
  animation: horizontal,
  scrub: true,
  onUpdate: self => console.log(self.progress)
})
```

Core scroll scenes support selectors or element scrollers, horizontal measurements, scroll proxies, `once`, `reverse`, `toggleClass`, numeric scrub smoothing, and refresh/update methods. Call `twexom.scroll.refresh()` after layout changes.

## Advanced scrolling module

After registering `src/scroll.js` or importing `twexom/all`:

```js
const scene = twexom.ScrollTrigger.create({
  trigger: '.panel',
  start: 'top top',
  end: '+=600',
  pin: true,
  pinSpacing: true,
  scrub: true,
  snap: { snapTo: [0, 0.5, 1], duration: 0.25 },
  toggleActions: 'play pause resume reverse',
  invalidateOnRefresh: true,
  onEnter: () => {},
  onLeaveBack: () => {}
})
```

The advanced module adds pinning and pin spacing, snapping, directional callbacks, toggle actions, refresh invalidation, container-animation measurement, `normalizeScroll()`, `ScrollSmoother.create()`, and seekable `scrollTo` tween effects.

```js
twexom.to(window, { scrollTo: { y: 800 }, duration: 1 })
twexom.to('.scroller', { scrollTo: { x: 'max' }, duration: 0.8 })
```

```js
const smoother = twexom.ScrollSmoother.create({
  wrapper: '#wrapper',
  content: '#content',
  smooth: 0.8
})

const normalizer = twexom.normalizeScroll({ target: document })
```

These APIs are intentionally optional. Applications that only need tweening do not pay their module cost.

## Gestures

The core `twexom.drag()` API supports pointer-based dragging, bounds, directional types, inertia, and lifecycle callbacks. The gestures module adds rotation dragging, edge resistance, snapping, richer inertia, `Observer`, and `Draggable` compatibility APIs.

```js
const draggable = twexom.Draggable.create('.handle', {
  type: 'x,y',
  bounds: '.playground',
  edgeResistance: 0.7,
  snap: { x: [0, 80, 160], y: 0 },
  inertia: true,
  onDrag: self => console.log(self.x, self.y)
})[0]

const observer = twexom.Observer.create({
  target: '.stage',
  type: 'wheel,touch,pointer',
  onChangeY: self => console.log(self.deltaY)
})
```

Use `type: 'x'` or `type: 'y'` when perpendicular native touch scrolling should remain available. Call `kill()` on gesture instances during teardown.

## Motion paths

```js
twexom.to('.ship', {
  motionPath: {
    path: '#route',
    align: true,
    autoRotate: true,
    start: 0,
    end: 1
  },
  duration: 3,
  ease: 'none'
})
```

Paths can be SVG path elements, SVG path data, or arrays of `{ x, y }` points. `MotionPathPlugin` exposes raw-path sampling and conversion helpers. Motion paths can also animate plain object `x`/`y` properties.

## Flip layout animation

```js
const state = twexom.Flip.getState('.card')
container.classList.toggle('expanded')
const flip = twexom.Flip.from(state, { duration: 0.65, ease: 'power3.inOut' })

// Later: flip.pause(), flip.reverse(), or flip.kill()
```

`Flip.getState()`, `Flip.from()`, `Flip.to()`, and `Flip.fit()` capture layout rectangles and transform state. Layout changes should be applied before calling `from()` or `to()`.

## SVG and text

```js
twexom.to('.draw-path', { drawSVG: '0% 100%', duration: 1 })
twexom.to('.shape', { morphSVG: '#other-shape', duration: 1 })

const split = new twexom.SplitText('.headline', {
  type: 'chars,words,lines',
  charsClass: 'character'
})
twexom.from(split.chars, { yPercent: 100, stagger: 0.02 })
split.revert()

twexom.to('.status', { text: 'Complete', duration: 0.8 })
twexom.to('.status', { scrambleText: { text: 'Complete', chars: '01' }, duration: 1 })
```

The SVG module includes draw-range animation, morph sampling, geometry length measurement, and shape-to-path conversion. The text module includes reversible splitting, text tweening, and deterministic scramble rendering.

The optional CSS-rule module can return a stylesheet declaration for tweening. Cross-origin stylesheet rules are skipped when the browser blocks access.

```js
const rule = twexom.CSSRulePlugin.getRule('.shared-state')
if (rule) twexom.to(rule, { color: '#c7ff4a', duration: 0.5 })
```

## Physics and advanced easing

```js
twexom.to('.ball', {
  physics2D: { velocity: 240, angle: -35, gravity: 500, friction: 0.02 },
  duration: 2
})

twexom.to('.ball', {
  physicsProps: {
    x: { velocity: 180, acceleration: 20 },
    rotation: { velocity: 90, friction: 0.1 }
  },
  duration: 1.5
})

const ease = twexom.CustomEase.create('brand', 'M0,0 C0.2,0 0.8,1 1,1')
twexom.to('.item', { x: 100, ease, duration: 1 })
twexom.CustomBounce.create('landing', { strength: 0.7, squash: 2 })
twexom.CustomWiggle.create('attention', { wiggles: 8 })
```

Physics effects are seekable because they calculate from elapsed animation time rather than accumulating frame-local impulses. `RoughEase`, `SlowMo`, and `SteppedEase` are also available in the easing module.

## Diagnostics

```js
const panel = twexom.DevTools.create()
// panel.pause(), panel.resume(), panel.step(), panel.kill()
```

The optional in-page panel shows active animation counts, frame counts, elapsed frame time, and approximate FPS. It is a lightweight diagnostic surface, not a claim of feature parity with a mature visual timeline editor.

## Contexts and framework adapters

Use a context for framework-independent cleanup:

```js
const context = twexom.context(() => {
  twexom.to('.item', { x: 100 })
})
context.revert()
```

Optional entry points are provided for React, Vue, Svelte, and Angular:

```js
// React
import twexom from 'twexom'
import { useTwexom } from 'twexom/react'

function Card() {
  const scope = useTwexom(element => {
    if (element) twexom.to(element, { x: 100 })
  })
  return <div ref={scope}>Card</div>
}
```

```js
// Vue
import { useTwexom } from 'twexom/vue'
const scope = useTwexom(element => {
  if (element) twexom.to(element, { opacity: 1 })
})
```

```svelte
<div use:twexom={{ x: 100, duration: 0.8 }}>Card</div>
<script>
  import { twexom } from 'twexom/svelte'
</script>
```

Angular's optional entry exports a standalone `TwexomDirective` and its base class. React, Vue, and Angular remain optional peer dependencies; none is bundled into the core.

## Utilities and extensibility

```js
const moveX = twexom.quickTo('.cursor', 'x', { duration: 0.25 })
moveX(180)
twexom.quickSetter('.cursor', 'opacity')(0.8)

twexom.utils.clamp(0, 100, 120)
twexom.utils.mapRange(0, 1, 0, 500, 0.5)
twexom.utils.interpolate(0, 100, 0.25)
twexom.utils.random(0, 100, 5)
twexom.utils.snap(10, 47)

twexom.registerEffect('pulse', (target, values) => ({
  render(progress) {
    target.style.opacity = 1 - progress * 0.5
  }
}))
```

`twexom.ticker.lagSmoothing(threshold, adjusted)` controls long-frame handling. `twexom.ticker.add()` and `.remove()` manage shared ticker jobs. `getById()`, `getTweensOf()`, and `killTweensOf()` help inspect and control animation ownership.

## Accessibility and lifecycle

Respect `prefers-reduced-motion` in application code, provide non-motion alternatives for essential information, and keep controls outside auto-alpha intro groups. Use `context.revert()`, `kill()`, and observer/gesture cleanup when components unmount. Pointer gestures use Pointer Events and configurable `touch-action`; test actual touch hardware before release.

## Scope and support

Twexom has no runtime dependencies in the core. The implementation targets modern evergreen browsers with CSS transforms, Pointer Events, SVG geometry APIs, and `requestAnimationFrame`. It does not claim GSAP's complete plugin catalog, visual authoring tools, long support history, community size, or production adoption. See `COMPARISON.md` for the evidence boundaries and `BENCHMARKS.md` for workload-specific measurements.
