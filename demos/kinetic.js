import twexom from '../src/twexom.js'

const select = selector => document.querySelector(selector)
const playButton = select('#master-play')
const scrubber = select('#scrubber')
const timeOutput = select('#time-output')
const easeSelect = select('#ease-select')
const easeLabel = select('#ease-label')
const speedButton = select('#speed-button')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const finePointer = window.matchMedia('(pointer: fine)')
const speeds = [0.5, 1, 1.5, 2]
let speedIndex = 1
let master = null
let wasPlaying = false

const formatTime = value => `00:${String(Math.max(0, Math.floor(value))).padStart(2, '0')}`

const updateInterface = () => {
  if (!master) return
  const progress = master.totalProgress()
  scrubber.value = Math.round(progress * 1000)
  scrubber.style.setProperty('--progress', `${progress * 100}%`)
  timeOutput.value = `${formatTime(master.time())} / ${formatTime(master.totalDuration())}`
  playButton.classList.toggle('paused', master.paused)
  playButton.setAttribute('aria-label', master.paused ? 'Play animation' : 'Pause animation')
}

const resetScene = () => {
  twexom.set('.title-inner', { yPercent: 110, rotation: 5 })
  twexom.set('.hero-title', { x: 0 })
  twexom.set('.hero-reveal', { autoAlpha: 0, y: 18 })
  twexom.set('.orbit-shell', { autoAlpha: 0, scale: 0.74, rotation: -24 })
  twexom.set('.motion-card', { autoAlpha: 0, scale: 0.68, y: 28 })
  twexom.set('.core', { scale: 0.55, rotation: -90 })
  twexom.set('.scene-rule', { scaleX: 0, transformOrigin: 'left center' })
  twexom.set('.stagger-bars i', { scaleY: 0, transformOrigin: 'center bottom' })
  twexom.set('.mini-track i', { scaleX: 0, transformOrigin: 'left center' })
  twexom.set('.curve-line', { strokeDasharray: 200, strokeDashoffset: 200 })
  twexom.set('.orbit-ring', { rotation: 0 })
}

const buildMaster = () => {
  if (master) master.kill()
  resetScene()
  const easing = easeSelect.value
  easeLabel.textContent = easing
  master = twexom.timeline({
    paused: true,
    onUpdate: updateInterface,
    onComplete: updateInterface
  })

  master
    .to('.orbit-shell', { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.35, ease: easing }, 0)
    .to('.title-inner', { yPercent: 0, rotation: 0, duration: 1.2, stagger: 0.09, ease: easing }, 0.12)
    .to('.hero-reveal', { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.07, ease: 'power3.out' }, 0.68)
    .to('.motion-card', { autoAlpha: 1, scale: 1, y: 0, duration: 1.05, stagger: { each: 0.12, from: 'center' }, ease: easing }, 0.72)
    .to('.core', { scale: 1, rotation: 0, duration: 1.25, ease: easing }, 0.76)
    .to('.scene-rule', { scaleX: 1, duration: 1.25, stagger: 0.1, ease: 'power3.out' }, 0.9)
    .to('.curve-line', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' }, 1.05)
    .to('.stagger-bars i', { scaleY: 1, duration: 0.7, stagger: { each: 0.06, from: 'center' }, ease: 'back.out' }, 1.1)
    .to('.mini-track i', { scaleX: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out' }, 1.2)
    .to('.orbit-ring-one', { rotation: 360, duration: 5.4, ease: 'none' }, 1.4)
    .to('.orbit-ring-two', { rotation: -360, duration: 5.4, ease: 'none' }, 1.4)
    .to('.core', { scale: 1.1, duration: 1.15, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 1.6)
    .to('.card-one', { x: 12, y: -18, rotation: 3, duration: 1.8, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 1.8)
    .to('.card-two', { x: -14, y: 20, rotation: -3, duration: 2, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 2.05)
    .to('.card-three', { x: 9, y: -14, rotation: 2, duration: 1.7, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 2.25)
    .to('.hero-title', { x: 12, duration: 2, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 2.1)

  master.timeScale(speeds[speedIndex])
  updateInterface()
  if (reducedMotion.matches) master.totalProgress(1)
  else master.play()
  updateInterface()
}

const togglePlayback = () => {
  if (!master) return
  if (master.paused) master.play()
  else master.pause()
  updateInterface()
}

playButton.addEventListener('click', togglePlayback)
select('#master-reverse').addEventListener('click', () => {
  master.reverse()
  updateInterface()
})

const restart = () => {
  master.restart()
  updateInterface()
}

select('#master-restart').addEventListener('click', restart)
select('#hero-replay').addEventListener('click', restart)

scrubber.addEventListener('input', () => {
  master.pause()
  master.totalProgress(Number(scrubber.value) / 1000)
  updateInterface()
})

easeSelect.addEventListener('change', buildMaster)

speedButton.addEventListener('click', () => {
  speedIndex = (speedIndex + 1) % speeds.length
  const speed = speeds[speedIndex]
  master.timeScale(speed)
  speedButton.querySelector('strong').textContent = `${speed}×`
  speedButton.setAttribute('aria-label', `Playback speed ${speed} times. Activate to change.`)
})

window.addEventListener('keydown', event => {
  const tag = event.target.tagName
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'BUTTON' || tag === 'A') return
  if (event.code === 'Space') {
    event.preventDefault()
    togglePlayback()
  }
  if (event.key.toLowerCase() === 'r') restart()
})

if (finePointer.matches && !reducedMotion.matches) {
  const scene = select('.scene')
  const rotateX = twexom.quickTo('.scene-parallax', 'rotationX', { duration: 0.8, ease: 'power3.out' })
  const rotateY = twexom.quickTo('.scene-parallax', 'rotationY', { duration: 0.8, ease: 'power3.out' })
  scene.addEventListener('pointermove', event => {
    const bounds = scene.getBoundingClientRect()
    rotateY(((event.clientX - bounds.left) / bounds.width - 0.5) * 13)
    rotateX(-((event.clientY - bounds.top) / bounds.height - 0.5) * 13)
  })
  scene.addEventListener('pointerleave', () => {
    rotateX(0)
    rotateY(0)
  })
}

if (!reducedMotion.matches) {
  twexom.to('.ambient-orb', { x: -70, y: 45, scale: 1.18, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    wasPlaying = master && !master.paused
    master?.pause()
  } else if (wasPlaying) {
    master?.play()
  }
  updateInterface()
})

buildMaster()
