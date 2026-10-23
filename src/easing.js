let core = null

const bezier = (firstx, firsty, secondx, secondy) => {
  const sample = (a, b, t) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t
  return value => {
    if (value <= 0 || value >= 1) return value
    let low = 0
    let high = 1
    let time = value
    for (let index = 0; index < 24; index++) {
      const estimate = sample(firstx, secondx, time)
      if (core.math.abs(estimate - value) < 0.00001) break
      if (estimate < value) low = time
      else high = time
      time = (low + high) / 2
    }
    return sample(firsty, secondy, time)
  }
}
const createease = (id, path) => {
  const values = core.text(path).match(/[-+]?(?:\d+\.?\d*|\.\d+)/g).map(core.float)
  const points = values.length >= 8 ? values.slice(2, 6) : values.slice(0, 4)
  const eased = bezier(points[0], points[1], points[2], points[3])
  if (id) core.ease[id] = eased
  return eased
}
const createbounce = (id, vars = {}) => {
  const config = core.lower(vars)
  const strength = config.strength || 0.7
  const squash = config.squash || 2
  const eased = value => {
    if (value === 0 || value === 1) return value
    const bounce = core.ease['bounce.out'](value)
    const wave = core.math.sin(value * core.math['PI'] * squash) * (1 - value) * (1 - strength)
    return core.bound(bounce + wave, -0.5, 1.5)
  }
  if (id) core.ease[id] = eased
  return eased
}
const createwiggle = (id, vars = {}) => {
  const config = core.lower(vars)
  const count = config.wiggles || 10
  const amplitude = config.amplitude || 1
  const eased = value => {
    if (value === 0 || value === 1) return value
    return value + core.math.sin(value * count * core.math['PI']) * (1 - value) * 0.2 * amplitude
  }
  if (id) core.ease[id] = eased
  return eased
}
const rough = (id, vars = {}) => {
  const config = core.lower(vars)
  const strength = config.strength || 0.15
  const points = config.points || 20
  const eased = value => {
    const step = core.math.round(value * points) / points
    const noise = core.math.sin(step * 91.17) * strength * value * (1 - value)
    return value + noise
  }
  if (id) core.ease[id] = eased
  return eased
}
const slow = (id, linearratio = 0.7, power = 0.7) => {
  const eased = value => {
    const linear = value * linearratio
    const curved = core.ease['sine.inout'](value) * (1 - linearratio)
    return linear + curved * power
  }
  if (id) core.ease[id] = eased
  return eased
}
const stepped = (id, steps = 12) => {
  const eased = value => core.math.ceil(value * steps) / steps
  if (id) core.ease[id] = eased
  return eased
}
const plugin = {
  name: 'AdvancedEasing',
  register(twexom, internals) {
    core = internals
    twexom['CustomEase'] = { create: createease }
    twexom['CustomBounce'] = { create: createbounce }
    twexom['CustomWiggle'] = { create: createwiggle }
    twexom['RoughEase'] = { create: rough }
    twexom['SlowMo'] = { create: slow }
    twexom['SteppedEase'] = { create: stepped }
  }
}

export { plugin, plugin as easingplugin, createease, createbounce, createwiggle, bezier }
export default plugin
