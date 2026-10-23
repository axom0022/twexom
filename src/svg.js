let core = null

const length = target => {
  if (target['getTotalLength']) return target['getTotalLength']()
  const tag = target['tagName']['toLowerCase']()
  if (tag === 'circle') return 2 * core.math['PI'] * core.float(target['getAttribute']('r') || 0)
  if (tag === 'line') {
    const x = core.float(target['getAttribute']('x2') || 0) - core.float(target['getAttribute']('x1') || 0)
    const y = core.float(target['getAttribute']('y2') || 0) - core.float(target['getAttribute']('y1') || 0)
    return core.math.sqrt(x * x + y * y)
  }
  return 0
}
const range = (value, size) => {
  if (value === true || value === undefined) return [0, size]
  if (typeof value === 'number') return [0, size * value]
  const parts = core.text(value).trim().split(/\s+/)
  const parse = part => part && part['endsWith']('%') ? core.float(part) / 100 * size : core.float(part) || 0
  if (parts.length === 1) return [0, parse(parts[0])]
  return [parse(parts[0]), parse(parts[1])]
}
const draweffect = (target, values) => {
  const size = length(target)
  if (!size) return null
  const current = [0, size]
  const first = values.mode === 'to' ? current : range(values.start, size)
  const last = values.mode === 'from' ? current : range(values.end, size)
  return {
    render(progress) {
      const start = first[0] + (last[0] - first[0]) * progress
      const end = first[1] + (last[1] - first[1]) * progress
      const visible = core.math.max(0, end - start)
      target.style['strokeDasharray'] = `${visible}px ${size + 1}px`
      target.style['strokeDashoffset'] = `${-start}px`
    }
  }
}
const convert = target => {
  const element = core.one(target)
  if (!element) return ''
  const tag = element['tagName']['toLowerCase']()
  const attr = name => core.float(element['getAttribute'](name) || 0)
  if (tag === 'path') return element['getAttribute']('d') || ''
  if (tag === 'circle') {
    const x = attr('cx')
    const y = attr('cy')
    const r = attr('r')
    return `M${x - r},${y}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0Z`
  }
  if (tag === 'ellipse') {
    const x = attr('cx')
    const y = attr('cy')
    const rx = attr('rx')
    const ry = attr('ry')
    return `M${x - rx},${y}a${rx},${ry} 0 1,0 ${rx * 2},0a${rx},${ry} 0 1,0 ${-rx * 2},0Z`
  }
  if (tag === 'rect') {
    const x = attr('x')
    const y = attr('y')
    const width = attr('width')
    const height = attr('height')
    return `M${x},${y}h${width}v${height}h${-width}Z`
  }
  if (tag === 'line') return `M${attr('x1')},${attr('y1')}L${attr('x2')},${attr('y2')}`
  if (tag === 'polygon' || tag === 'polyline') {
    const values = (element['getAttribute']('points') || '').match(/[-+]?(?:\d+\.?\d*|\.\d+)/g) || []
    let data = ''
    for (let index = 0; index + 1 < values.length; index += 2) data += `${index ? 'L' : 'M'}${values[index]},${values[index + 1]}`
    return data + (tag === 'polygon' ? 'Z' : '')
  }
  return ''
}
const path = value => {
  if (typeof value === 'string' && /^[\s]*[Mm]/.test(value)) return value
  const element = core.one(value)
  return element ? convert(element) : ''
}
const points = value => {
  const data = path(value)
  if (!data) return []
  const element = core.doc['createElementNS']('http://www.w3.org/2000/svg', 'path')
  element['setAttribute']('d', data)
  const size = element['getTotalLength']()
  const output = []
  for (let index = 0; index <= 80; index++) {
    const point = element['getPointAtLength'](size * index / 80)
    output.push(point)
  }
  return output
}
const morpheffect = (target, values) => {
  const current = target['getAttribute']('d') || ''
  const first = points(values.mode === 'to' ? current : values.start)
  const last = points(values.mode === 'from' ? current : values.end)
  if (!first.length || !last.length) return null
  return {
    render(progress) {
      let data = ''
      for (let index = 0; index < first.length; index++) {
        const x = first[index].x + (last[index].x - first[index].x) * progress
        const y = first[index].y + (last[index].y - first[index].y) * progress
        data += `${index ? 'L' : 'M'}${core.math.round(x * 100) / 100},${core.math.round(y * 100) / 100}`
      }
      target['setAttribute']('d', data + 'Z')
    }
  }
}
const plugin = {
  name: 'SVG',
  register(twexom, internals) {
    core = internals
    core.registereffect('drawSVG', draweffect)
    core.registereffect('morphSVG', morpheffect)
    twexom['DrawSVGPlugin'] = { 'getLength': length, 'convertToPath': convert }
    twexom['MorphSVGPlugin'] = { 'convertToPath': convert }
  }
}

export { plugin, plugin as svgplugin, convert, length }
export default plugin
