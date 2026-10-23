import { flushSync, mount, unmount } from 'svelte'
import Component from './svelte-component.js'
import engine from '../../src/twexom.js'

export async function run() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const component = mount(Component, { target: host })
  flushSync()
  const animation = engine.getById('svelte-host')
  if (!animation) throw new Error('Svelte adapter did not create its tween')
  animation.seek(0.5)
  const value = host.querySelector('#svelte-target').style.transform
  await unmount(component)
  const cleaned = !engine.getById('svelte-host')
  host.remove()
  return { value, cleaned }
}
