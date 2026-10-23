let core = null

const physicsvalue = (start, velocity, acceleration, friction, time) => {
  const resistance = friction || 0
  const distance = resistance ? velocity / resistance * (1 - core.math.exp(-resistance * time)) : velocity * time
  return start + distance + acceleration * time * time / 2
}
const physics2deffect = (target, values, context) => {
  const source = values.mode === 'from' ? values.start : values.end
  const vars = core.lower(source || {})
  const element = core.isel(target)
  const state = element ? core.transformstate(target) : { x: target.x || 0, y: target.y || 0 }
  const startx = state.x
  const starty = state.y
  const angle = (vars.angle || 0) * core.math['PI'] / 180
  const velocity = vars.velocity === undefined ? 100 : vars.velocity
  const acceleration = vars.acceleration || 0
  const gravity = vars.gravity || 0
  const friction = vars.friction || 0
  context.group.transform = element
  return {
    transform: element,
    render(progress, data) {
      const time = progress * data.tween.base
      state.x = physicsvalue(startx, core.math.cos(angle) * velocity, core.math.cos(angle) * acceleration, friction, time)
      state.y = physicsvalue(starty, core.math.sin(angle) * velocity, core.math.sin(angle) * acceleration + gravity, friction, time)
      if (!element) {
        target.x = state.x
        target.y = state.y
      }
    }
  }
}
const physicspropseffect = (target, values, context) => {
  const source = values.mode === 'from' ? values.start : values.end
  const vars = core.lower(source || {})
  const element = core.isel(target)
  const state = element ? core.transformstate(target) : target
  const starts = {}
  core.dict.keys(vars)['forEach'](key => {
    starts[key] = element && core.transforms && core.transforms.has(key) ? state[key] : target[key] || 0
  })
  context.group.transform = element && !!(vars.x || vars.y || vars.rotation)
  return {
    transform: element,
    render(progress, data) {
      const time = progress * data.tween.base
      core.dict.keys(vars)['forEach'](key => {
        const config = core.lower(vars[key])
        const output = physicsvalue(starts[key], config.velocity || 0, config.acceleration || 0, config.friction || 0, time)
        if (element && ['x', 'y', 'z', 'rotation', 'scale'].includes(key)) {
          state[key] = output
          context.group.transform = true
        } else {
          target[key] = output
        }
      })
    }
  }
}
const inertiaeffect = (target, values, context) => {
  const source = values.mode === 'from' ? values.start : values.end
  const vars = core.lower(source || {})
  const element = core.isel(target)
  const state = element ? core.transformstate(target) : target
  const starts = {}
  core.dict.keys(vars)['forEach'](key => {
    starts[key] = state[key] === undefined ? target[key] || 0 : state[key]
  })
  context.group.transform = element
  return {
    transform: element,
    render(progress, data) {
      const time = progress * data.tween.base
      core.dict.keys(vars)['forEach'](key => {
        const config = core.lower(vars[key])
        const output = physicsvalue(starts[key], config.velocity || 0, 0, config.friction || config.resistance || 1, time)
        const min = config.min === undefined ? -1 / 0 : config.min
        const max = config.max === undefined ? 1 / 0 : config.max
        const value = core.bound(output, min, max)
        if (state[key] !== undefined) state[key] = value
        else target[key] = value
      })
    }
  }
}
const plugin = {
  name: 'Physics',
  register(twexom, internals) {
    core = internals
    core.registereffect('physics2D', physics2deffect)
    core.registereffect('physicsProps', physicspropseffect)
    core.registereffect('inertia', inertiaeffect)
    twexom['Physics2DPlugin'] = { calculate: physicsvalue }
    twexom['PhysicsPropsPlugin'] = { calculate: physicsvalue }
    twexom['InertiaPlugin'] = { calculate: physicsvalue }
  }
}

export { plugin, plugin as physicsplugin, physicsvalue }
export default plugin
