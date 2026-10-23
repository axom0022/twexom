import { useTwexom, useTwexomTimeline } from 'twexom/react'
import { useTwexom as useVueTwexom, useTwexomTimeline as useVueTimeline } from 'twexom/vue'
import { twexom as twexomAction } from 'twexom/svelte'
import { TwexomDirective, TwexomDirectiveBase } from 'twexom/angular'

const reactScope = useTwexom((element, engine) => {
  if (element) engine.to(element, { x: 100 })
}, [])
const reactTimeline = useTwexomTimeline((element, engine) => engine.timeline({ paused: true }), [])
const vueScope = useVueTwexom((element, engine) => {
  if (element) engine.from(element, { autoAlpha: 0 })
})
const vueTimeline = useVueTimeline((element, engine) => engine.timeline())
const action = twexomAction(document.createElement('div'), { x: 100, duration: 1 })
const directive: typeof TwexomDirectiveBase = TwexomDirective

void reactScope
void reactTimeline
void vueScope
void vueTimeline
void action
void directive
