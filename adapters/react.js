import { useEffect, useRef } from 'react'
import engine from '../src/twexom.js'

export function useTwexom(callback, dependencies = []) {
  const scope = useRef(null)
  useEffect(() => {
    const context = engine.context(() => callback(scope.current, engine))
    return () => context.revert()
  }, dependencies)
  return scope
}

export function useTwexomTimeline(factory, dependencies = []) {
  const scope = useRef(null)
  const timeline = useRef(null)
  useEffect(() => {
    const context = engine.context(() => {
      timeline.current = factory(scope.current, engine)
    })
    return () => {
      context.revert()
      timeline.current = null
    }
  }, dependencies)
  return { scope, timeline }
}

export default useTwexom
