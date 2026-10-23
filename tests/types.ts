import twexom, { type Timeline, type Tween, type TweenVars } from 'twexom'

const vars: TweenVars = {
  x: 100,
  duration: 1,
  ease: 'power2.out',
  repeatRefresh: true,
  yoyoEase: 'power1.in',
  scrollTrigger: { trigger: '.scene', scrub: true }
}
const animation: Tween | Timeline = twexom.to('.card', vars)
animation.seek(0.5).pause().play().timeScale(1.2)
const timeline: Timeline = twexom.timeline({ defaults: { duration: 0.5 } })
timeline.addLabel('start').to('.card', vars, 'start').tweenTo('start')
const custom: (progress: number) => number = twexom.CustomEase?.create('typed', 'M0,0 C0.2,0 0.8,1 1,1') || (value => value)
custom(0.5)
twexom.ScrollTrigger?.create({ trigger: '.scene', pin: true, snap: 0.5 })
