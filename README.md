# Twexom

Twexom is a motion engine for expressive web interfaces anim/tween/motion
The lightweight core stays separate from optional modules for advanced scrolling, motion paths, Flip layout animation, SVG, text, physics, advanced easing, and diagnostics. 

## Exactly two demos built-in for showcase for now (in CLI)

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

- **Demo 01 — Kinetic:** timeline choreography with play, pause, reverse, restart, scrubbing, speed control, and live easing changes.
- **Demo 02 — Field:** bounded inertial dragging, touch input, keyboard movement, scroll scrubbing, and responsive reveals.

```bash
npm run build
npm run preview
```

The production build contains both HTML demos and the standalone `/twexom.js` module. No additional demo pages are required by the test suite; browser feature fixtures are created inside tests.

## Quick start

```js
import twexom from 'twexom'

twexom.to('.card', {
  x: 240,
  rotation: 12,
  autoAlpha: 1,
  duration: 0.8,
  ease: 'power4.out'
})
```

Targets can be CSS selectors, elements, arrays, NodeLists, or plain JavaScript objects. For the complete API, see **[docs/API.md](./docs/API.md)**.

For every optional module in one registration:

```js
import twexom from 'twexom/all'
```

Or keep an application-specific bundle small:

```js
import twexom from 'twexom'
import scroll from './src/scroll.js'
import motionPath from './src/motionpath.js'

twexom.register(scroll, motionPath)
```

## Core animation

```js
twexom.from('.badge', {
  y: 40,
  autoAlpha: 0,
  duration: 0.6,
  stagger: 0.08
})

twexom.fromTo('.panel',
  { xPercent: -100 },
  { xPercent: 0, duration: 1, ease: 'expo.out' }
)

twexom.to('.item', {
  keyframes: [{ x: 80, duration: 0.4 }, { y: 40, duration: 0.6 }],
  repeat: 1,
  yoyo: true,
  yoyoEase: 'power1.in',
  repeatRefresh: true
})
```

Supported options include `delay`, `duration`, `ease`, `repeat`, `repeatDelay`, `repeatRefresh`, `yoyo`, `yoyoEase`, `stagger`, `paused`, `overwrite`, `timeScale`, `immediateRender`, per-property easing/snapping/modifiers, keyframes, and lifecycle callbacks.

Transform properties include `x`, `y`, `z`, `xPercent`, `yPercent`, `scale`, `scaleX`, `scaleY`, `scaleZ`, `rotation`, `rotationX`, `rotationY`, `rotationZ`, `skewX`, `skewY`, and `transformPerspective`.

Twexom interpolates numbers, units, named and hexadecimal colors, complex numeric strings, CSS variables, CSS properties, transforms, and SVG attributes through `attr`.

### Per-property controls

```js
twexom.to('.item', {
  x: { value: 97, snap: 5, modifier: value => value + 1 },
  y: { value: 100, ease: 'power1.in' },
  duration: 1,
  ease: 'linear'
})
```

### Stagger

```js
twexom.to('.tile', {
  y: 0,
  duration: 0.7,
  stagger: { amount: 0.8, from: 'center', grid: [3, 4], ease: 'power2.out' }
})
```

Use a number, a function, or an object with `each`, `amount`, `from`, `grid`, `axis`, and `ease`.

## Timelines

```js
const scene = twexom.timeline({
  paused: true,
  defaults: { duration: 0.6, ease: 'power2.out' },
  onUpdate: updateProgress
})

scene
  .addLabel('intro')
  .to('.title', { yPercent: 0 }, 'intro')
  .to('.art', { scale: 1, duration: 1.2 }, '<0.2')
  .from('.caption', { autoAlpha: 0, y: 20 }, '-=0.4')
  .call(showControls, [], '>')
  .addLabel('ready')

scene.play()
scene.pause()
scene.reverse()
scene.restart()
scene.seek(1.5)
scene.progress(0.5)
scene.totalProgress(0.75)
scene.time(2)
scene.timeScale(1.5)
scene.tweenTo('ready')
```

Positions support absolute times, labels, `+=`/`-=` offsets, `<`/`>` references, and label offsets. `currentLabel()`, `nextLabel()`, `previousLabel()`, `addPause()`, `tweenFromTo()`, `getChildren()`, `remove()`, `clear()`, and `kill()` support navigation and composition.

## Scrolling and gestures

Core scrolling supports scrubbing, element scrollers, horizontal measurements, proxies, toggle classes, and refresh:

```js
const horizontal = twexom.timeline({ paused: true })
horizontal.to('.track', { xPercent: -66.6667, duration: 3, ease: 'none' })

twexom.scroll({
  trigger: '.scroll-space',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  animation: horizontal,
  onUpdate: self => console.log(self.progress)
})
```

The optional scrolling module adds `ScrollTrigger.create()`, pinning, pin spacing, snapping, directional callbacks, toggle actions, refresh invalidation, `scrollTo` effects, `normalizeScroll()`, and `ScrollSmoother.create()`.

Core dragging works with mouse, pen, and touch. The optional gestures module adds `Draggable.create()`, `Observer.create()`, rotation, edge resistance, snapping, and richer inertia:

```js
twexom.Draggable.create('.handle', {
  bounds: '.playground',
  type: 'x,y',
  inertia: true,
  edgeResistance: 0.7,
  onDrag: self => console.log(self.x, self.y)
})
```

Use `type: 'x'` or `type: 'y'` to preserve perpendicular native touch scrolling.

## Optional visual and physics modules

```js
twexom.to('.ship', { motionPath: { path: '#route', autoRotate: true }, duration: 3 })

const state = twexom.Flip.getState('.card')
container.classList.toggle('expanded')
twexom.Flip.from(state, { duration: 0.65 })

twexom.to('.draw-path', { drawSVG: '0% 100%', duration: 1 })
const split = new twexom.SplitText('.headline', { type: 'chars,words' })
twexom.from(split.chars, { yPercent: 100, stagger: 0.02 })

twexom.to('.ball', {
  physics2D: { velocity: 240, angle: -35, gravity: 500 },
  duration: 2
})
```

See [the API reference](./docs/API.md) for MorphSVG, text/scramble effects, PhysicsProps, Inertia, CustomEase, CustomBounce, CustomWiggle, RoughEase, SlowMo, SteppedEase, CSSRulePlugin, and DevTools.

## Framework adapters and TypeScript

Optional entry points are available for React, Vue, Svelte, and Angular:

```js
import { useTwexom } from 'twexom/react'
import { useTwexom as useVueTwexom } from 'twexom/vue'
import { twexom as twexomAction } from 'twexom/svelte'
import { TwexomDirective } from 'twexom/angular'
```

Framework runtimes are optional peer dependencies and are not bundled into the core. Declarations are included under `types/` and exposed through package exports. Adapter cleanup uses Twexom contexts and unmount/destroy lifecycle hooks.

## Utilities and extensibility

```js
const moveX = twexom.quickTo('.cursor', 'x', { duration: 0.3 })
moveX(200)

twexom.utils.clamp(0, 100, 120)
twexom.utils.mapRange(0, 1, 0, 500, 0.5)
twexom.utils.interpolate(0, 100, 0.25)
twexom.utils.random(0, 100, 5)
twexom.utils.snap(10, 47)
twexom.utils.toArray('.item')

twexom.registerEffect('pulse', (target, values) => ({
  render(progress) {
    target.style.opacity = 1 - progress * 0.5
  }
}))
```

The easing collection includes linear, power1–4, sine, expo, circ, back, elastic, bounce, steps, and custom functions. `twexom.ticker.lagSmoothing()` controls long-frame handling.

## Releases and CDN tooling

```bash
npm run release
npm run test:release
npm run test:production
npm run release:cdn
```

## Validation

```bash
npm run check
npm test
npm run test:types
npx playwright install chromium firefox webkit
npm run test:browser
npm run test:browser:cross
```

See [docs/TESTING.md](./docs/TESTING.md) for checklist and remote-provider guidance. Support is documented in [SUPPORT.md](./SUPPORT.md)
npm run benchmark
npm run benchmark:report
npm run compare
```



