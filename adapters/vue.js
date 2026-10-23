import { onBeforeUnmount, onMounted, ref } from 'vue'
import engine from '../src/twexom.js'

export function useTwexom(callback) {
  const scope = ref(null)
  let context = null
  onMounted(() => {
    context = engine.context(() => callback(scope.value, engine))
  })
  onBeforeUnmount(() => {
    if (context) context.revert()
    context = null
  })
  return scope
}

export function useTwexomTimeline(factory) {
  const scope = ref(null)
  const timeline = ref(null)
  let context = null
  onMounted(() => {
    context = engine.context(() => {
      timeline.value = factory(scope.value, engine)
    })
  })
  onBeforeUnmount(() => {
    if (context) context.revert()
    context = null
    timeline.value = null
  })
  return { scope, timeline }
}

export default useTwexom
