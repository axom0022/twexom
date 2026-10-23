let core = null

const capture = targets => ({
  items: core.resolve(targets).map(target => {
    const rect = target['getBoundingClientRect']()
    const transform = core.transformstate(target)
    return {
      target,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      x: transform.x,
      y: transform.y,
      scalex: transform.scalex,
      scaley: transform.scaley,
      scale: transform.scale,
      rotation: transform.rotation
    }
  })
})
const animate = (state, vars = {}, reverse = false) => {
  const config = core.lower(vars)
  const master = new core.timeline({ paused: true, oncomplete: config.oncomplete, onupdate: config.onupdate })
  state.items['forEach']((item, index) => {
    const rect = item.target['getBoundingClientRect']()
    const transform = core.transformstate(item.target)
    const dx = item.rect.left - rect.left
    const dy = item.rect.top - rect.top
    const sx = item.rect.width / (rect.width || 1)
    const sy = item.rect.height / (rect.height || 1)
    const initial = {
      x: transform.x + dx,
      y: transform.y + dy,
      scalex: transform.scalex * sx,
      scaley: transform.scaley * sy,
      scale: transform.scale,
      rotation: transform.rotation
    }
    const destination = { x: transform.x, y: transform.y, scalex: transform.scalex, scaley: transform.scaley, scale: transform.scale, rotation: transform.rotation }
    const options = { ...destination, duration: config.duration || 0.65, ease: config.ease || 'power3.inOut' }
    if (config.absolute) item.target.style.position = 'absolute'
    if (reverse) master.fromto(item.target, destination, { ...initial, ...options }, index * (config.stagger || 0))
    else master.fromto(item.target, initial, options, index * (config.stagger || 0))
  })
  if (!config.paused) master.play()
  return master
}
const fit = (target, destination, vars = {}) => {
  const element = core.one(target)
  const dest = core.one(destination)
  if (!element || !dest) return null
  const first = capture(element)
  const rect = dest['getBoundingClientRect']()
  const current = element['getBoundingClientRect']()
  const transform = core.transformstate(element)
  const config = core.lower(vars)
  return new core.tween(element, {
    x: transform.x + rect.left - current.left,
    y: transform.y + rect.top - current.top,
    scalex: transform.scalex * rect.width / (current.width || 1),
    scaley: transform.scaley * rect.height / (current.height || 1),
    duration: config.duration || 0.65,
    ease: config.ease || 'power3.inOut',
    paused: config.paused
  })
}
const plugin = {
  name: 'Flip',
  register(twexom, internals) {
    core = internals
    twexom['Flip'] = {
      'getState': capture,
      from: (state, vars) => animate(state, vars, false),
      to: (state, vars) => animate(state, vars, true),
      fit
    }
  }
}

export { plugin, plugin as flipplugin, capture }
export default plugin
