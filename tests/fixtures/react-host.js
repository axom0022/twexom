import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { useTwexom } from '../../adapters/react.js'
import engine from '../../src/twexom.js'

export async function run() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  function App() {
    const scope = useTwexom(element => {
      if (element) engine.to(element, { x: 100, duration: 1, ease: 'linear', paused: true, id: 'react-host' })
    }, [])
    return React.createElement('div', { ref: scope, id: 'react-target' })
  }
  const root = createRoot(host)
  flushSync(() => root.render(React.createElement(App)))
  await new Promise(resolve => setTimeout(resolve, 0))
  const animation = engine.getById('react-host')
  if (!animation) throw new Error('React adapter did not create its tween')
  animation.seek(0.5)
  const value = host.querySelector('#react-target').style.transform
  root.unmount()
  const cleaned = !engine.getById('react-host')
  host.remove()
  return { value, cleaned }
}
