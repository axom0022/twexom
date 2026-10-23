import twexom from '../src/twexom.js'

const select = selector => document.querySelector(selector)
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const dragger = select('#dragger')
const dragStatus = select('#drag-status')
const dragX = select('#drag-x')
const dragY = select('#drag-y')
let statusTimer = null

const updateCoordinates = () => {
  const x = Math.round(twexom.getProperty(dragger, 'x')) || 0
  const y = Math.round(twexom.getProperty(dragger, 'y')) || 0
  dragX.value = `${x < 0 ? '-' : ''}${String(Math.abs(x)).padStart(3, '0')}`
  dragY.value = `${y < 0 ? '-' : ''}${String(Math.abs(y)).padStart(3, '0')}`
}

const intro = twexom.timeline({ paused: true })
twexom.set('.field-line > span', { yPercent: 110, rotation: 3 })
twexom.set('.field-reveal', { autoAlpha: 0, y: 24 })
intro
  .to('.field-line > span', { yPercent: 0, rotation: 0, duration: 1.15, stagger: 0.1, ease: 'power4.out' }, 0.1)
  .to('.field-reveal', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out' }, 0.5)

if (reducedMotion.matches) intro.totalProgress(1)
else intro.play()

if (!reducedMotion.matches) {
  twexom.to('.drag-ring', { rotation: 360, duration: 18, repeat: -1, ease: 'none' })
  twexom.to('.scroll-cue i', { y: 7, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' })
}

const dragController = twexom.drag(dragger, {
  bounds: '#playground',
  inertia: true,
  onPress: () => {
    clearTimeout(statusTimer)
    dragStatus.textContent = 'READY TO MOVE'
    twexom.to(dragger, { scale: 1.08, duration: 0.25, ease: 'power2.out' })
  },
  onDragStart: () => {
    dragStatus.textContent = 'IN MOTION'
  },
  onDrag: updateCoordinates,
  onRelease: () => {
    dragStatus.textContent = 'COASTING'
    twexom.to(dragger, { scale: 1, duration: 0.4, ease: 'back.out' })
    updateCoordinates()
    statusTimer = setTimeout(() => {
      dragStatus.textContent = 'READY TO MOVE'
    }, 800)
  }
})

dragger.addEventListener('keydown', event => {
  const directions = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1]
  }
  const direction = directions[event.key]
  if (!direction) return
  event.preventDefault()
  const bounds = dragController.limits()
  const step = event.shiftKey ? 60 : 24
  const x = twexom.utils.clamp(bounds.minx, bounds.maxx, (twexom.getProperty(dragger, 'x') || 0) + direction[0] * step)
  const y = twexom.utils.clamp(bounds.miny, bounds.maxy, (twexom.getProperty(dragger, 'y') || 0) + direction[1] * step)
  twexom.to(dragger, { x, y, duration: 0.35, ease: 'power3.out', onUpdate: updateCoordinates })
})

twexom.set('#scroll-fill', { scaleX: 0 })
twexom.set('.field-numeral', { xPercent: 0, rotation: 0 })

const scrollScene = twexom.timeline({ paused: true })
scrollScene
  .to('.horizontal-track', { xPercent: -66.6667, duration: 3, ease: 'none' }, 0)
  .to('.field-numeral', { xPercent: -28, rotation: 32, duration: 3, ease: 'none' }, 0)
  .to('#scroll-fill', { scaleX: 1, duration: 3, ease: 'none' }, 0)
  .fromTo('.panel-one .panel-copy h2 span', { yPercent: 45, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' }, 0.05)
  .fromTo('.panel-two .panel-copy h2 span', { yPercent: 45, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' }, 0.85)
  .fromTo('.panel-three .panel-copy h2 span', { yPercent: 45, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' }, 1.85)
  .to('.panel-shapes i', { rotation: 140, duration: 1.1, stagger: 0.12, ease: 'power2.inOut' }, 0.9)
  .to('.responsive-mark', { rotation: 360, duration: 1.25, ease: 'none' }, 1.75)

twexom.scroll({
  trigger: '#scroll-study',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  animation: scrollScene,
  onUpdate: self => {
    const percent = Math.round(self.progress * 100)
    select('#scroll-percent').textContent = `${String(percent).padStart(3, '0')}%`
    select('#panel-current').textContent = String(Math.min(3, Math.floor(self.progress * 3) + 1)).padStart(2, '0')
  }
})

twexom.from('.feature-card', {
  y: 90,
  autoAlpha: 0,
  duration: 0.9,
  stagger: { each: 0.1, from: 'start' },
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.feature-grid',
    start: 'top 88%',
    end: 'top 35%',
    scrub: true
  }
})

twexom.from('.feature-heading > p', {
  y: 40,
  autoAlpha: 0,
  duration: 1,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.feature-heading',
    start: 'top 80%',
    end: 'top 45%',
    scrub: true
  }
})

const nextLink = select('.next-demo a')
nextLink.addEventListener('pointerenter', () => {
  twexom.to('.next-demo i', { x: 10, y: -10, duration: 0.4, ease: 'power3.out' })
})
nextLink.addEventListener('pointerleave', () => {
  twexom.to('.next-demo i', { x: 0, y: 0, duration: 0.5, ease: 'power3.out' })
})

select('#back-top').addEventListener('click', event => {
  event.preventDefault()
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' })
})

updateCoordinates()
