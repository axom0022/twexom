import { createApp, defineComponent, h, nextTick } from 'vue'
import { useTwexom } from '../../adapters/vue.js'
import engine from '../../src/twexom.js'

export async function run() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const App = defineComponent({
    setup() {
      const scope = useTwexom(element => {
        if (element) engine.to(element, { x: 100, duration: 1, ease: 'linear', paused: true, id: 'vue-host' })
      })
      return () => h('div', { ref: scope, id: 'vue-target' })
    }
  })
  const app = createApp(App)
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  const animation = engine.getById('vue-host')
  if (!animation) throw new Error('Vue adapter did not create its tween')
  animation.seek(0.5)
  const value = host.querySelector('#vue-target').style.transform
  app.unmount()
  const cleaned = !engine.getById('vue-host')
  host.remove()
  return { value, cleaned }
}
