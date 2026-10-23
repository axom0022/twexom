let core = null

const pathelement = value => {
  if (!value) return null
  if (typeof value === 'string' && /^[\s]*[Mm]/.test(value)) {
    const path = core.doc['createElementNS']('http://www.w3.org/2000/svg', 'path')
    path['setAttribute']('d', value)
    return path
  }
  return core.one(value)
}
const linear = points => {
  const output = []
  let length = 0
  for (let index = 0; index < points.length - 1; index++) {
    const first = points[index]
    const second = points[index + 1]
    const distance = core.math.sqrt(core.math.pow(second.x - first.x, 2) + core.math.pow(second.y - first.y, 2))
    const steps = core.math.max(2, core.math.ceil(distance / 4))
    for (let step = 0; step < steps; step++) {
      const progress = step / steps
      output.push({ x: first.x + (second.x - first.x) * progress, y: first.y + (second.y - first.y) * progress, length: length + distance * progress })
    }
    length += distance
  }
  if (points.length) output.push({ ...points[points.length - 1], length })
  return output
}
const sample = value => {
  if (core.list['isArray'](value)) return linear(value)
  const path = pathelement(value && value.path ? value.path : value)
  if (!path || !path['getTotalLength']) return []
  const length = path['getTotalLength']()
  const count = core.math.max(80, core.math.min(500, core.math.ceil(length / 3)))
  const points = []
  for (let index = 0; index <= count; index++) {
    const distance = length * index / count
    const point = path['getPointAtLength'](distance)
    points.push({ x: point.x, y: point.y, length: distance })
  }
  return points
}
const position = (points, progress) => {
  if (!points.length) return { x: 0, y: 0, angle: 0 }
  const total = points[points.length - 1].length || 1
  const distance = core.bound(progress) * total
  let low = 0
  let high = points.length - 1
  while (low < high) {
    const middle = core.math.floor((low + high) / 2)
    if (points[middle].length < distance) low = middle + 1
    else high = middle
  }
  const second = points[mathmax(1, low)]
  const first = points[mathmax(0, low - 1)]
  const span = second.length - first.length || 1
  const amount = core.bound((distance - first.length) / span)
  const x = first.x + (second.x - first.x) * amount
  const y = first.y + (second.y - first.y) * amount
  return { x, y, angle: core.math.atan2(second.y - first.y, second.x - first.x) * 180 / core.math['PI'] }
}
const mathmax = (first, second) => core.math.max(first, second)
const effect = (target, values, context) => {
  const source = values.mode === 'from' ? values.start : values.end
  const vars = core.isobj(source) && !core.list['isArray'](source) ? core.lower(source) : { path: source }
  const points = sample(vars.path || source)
  if (!points.length) return null
  const element = core.isel(target)
  const state = element ? core.transformstate(target) : target
  const first = points[0]
  const align = vars.align === true || vars.align === 'start'
  const offsetx = vars.offsetx || (align ? state.x - first.x : 0)
  const offsety = vars.offsety || (align ? state.y - first.y : 0)
  const start = vars.start === undefined ? 0 : vars.start
  const end = vars.end === undefined ? 1 : vars.end
  const rotate = vars.autorotate === undefined ? false : vars.autorotate
  context.group.transform = element
  return {
    transform: element,
    render(progress) {
      const point = position(points, start + (end - start) * progress)
      state.x = point.x + offsetx
      state.y = point.y + offsety
      if (rotate !== false) state.rotation = point.angle + (core.isobj(rotate) ? rotate.offset || 0 : typeof rotate === 'number' ? rotate : 0)
    }
  }
}
const plugin = {
  name: 'MotionPath',
  register(twexom, internals) {
    core = internals
    core.registereffect('motionPath', effect)
    twexom['MotionPathPlugin'] = {
      'getRawPath': sample,
      'stringToRawPath': sample,
      'pointsToSegment': linear,
      'getPositionOnPath': position,
      'rawPathToString': points => points.length ? points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ') : ''
    }
  }
}

export { plugin, plugin as motionpathplugin, sample, position }
export default plugin
