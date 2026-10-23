const root = typeof window === 'undefined' ? (0, eval)('this') : window
const math = root['Math']
const number = root['Number']
const text = root['String']
const list = root['Array']
const dict = root['Object']
const float = root['parseFloat']
const infinite = 1 / 0
const doc = typeof document === 'undefined' ? null : document
const living = new root['Set']()
const roots = new root['Set']()
const jobs = new root['Set']()
const states = new root['WeakMap']()
const scrolls = new root['Set']()
const defaults = { duration: 0.5, ease: 'power2.out' }
const effects = new root['Map']()
const plugins = new root['Map']()
const settings = { lagthreshold: 500, adjustedlag: 33, frames: 0, elapsed: 0 }
let current = null
let frame = 0
let last = 0
let running = false
let overwriting = false

const bound = (value, min = 0, max = 1) => math.max(min, math.min(max, value))
const isobj = value => value !== null && typeof value === 'object'
const isfn = value => typeof value === 'function'
const isel = value => value && value['nodeType'] === 1
const isstyle = value => value && typeof value['setProperty'] === 'function' && typeof value['getPropertyValue'] === 'function'
const lower = value => {
  const output = {}
  dict.keys(value || {})['forEach'](key => {
    output[key['toLowerCase']()] = value[key]
  })
  return output
}
const resolve = value => {
  if (!value) return []
  if (typeof value === 'string') return doc ? list.from(doc['querySelectorAll'](value)) : []
  if (list['isArray'](value)) return value
  if (isel(value) || isstyle(value) || typeof value === 'object' && !value.length && !value[0]) return [value]
  return list.from(value).filter(value => !!value)
}
const one = value => resolve(value)[0] || null
const clock = () => root['performance'] ? root['performance'].now() : root['Date'].now()
const cssname = (key, low) => {
  const names = {
    autoalpha: 'opacity',
    backgroundcolor: 'background-color',
    bordercolor: 'border-color',
    borderwidth: 'border-width',
    borderradius: 'border-radius',
    boxshadow: 'box-shadow',
    textshadow: 'text-shadow',
    fontsize: 'font-size',
    fontweight: 'font-weight',
    lineheight: 'line-height',
    letterspacing: 'letter-spacing',
    transformorigin: 'transform-origin',
    transformstyle: 'transform-style',
    clippath: 'clip-path',
    backdropfilter: 'backdrop-filter',
    margintop: 'margin-top',
    marginright: 'margin-right',
    marginbottom: 'margin-bottom',
    marginleft: 'margin-left',
    paddingtop: 'padding-top',
    paddingright: 'padding-right',
    paddingbottom: 'padding-bottom',
    paddingleft: 'padding-left',
    zindex: 'z-index'
  }
  if (key['startsWith']('--')) return key
  return names[low] || key.replace(/[A-Z]/g, letter => '-' + letter['toLowerCase']())
}
const transforms = new root['Set'](['x', 'y', 'z', 'xpercent', 'ypercent', 'scale', 'scalex', 'scaley', 'scalez', 'rotation', 'rotationx', 'rotationy', 'rotationz', 'skewx', 'skewy', 'perspective', 'transformperspective'])
const reserved = new root['Set'](['duration', 'delay', 'ease', 'repeat', 'repeatdelay', 'yoyo', 'paused', 'stagger', 'overwrite', 'onstart', 'onupdate', 'oncomplete', 'onrepeat', 'onreversecomplete', 'callbackscope', 'timescale', 'immediaterender', 'scrolltrigger', 'attr', 'keyframes', 'id', 'data', 'parent', 'defaults', 'repeatrefresh', 'yoyoease', 'oninterrupt', 'lazy', 'autoround', 'callbackparams', 'modifiers', 'snap'])

const outback = value => {
  const amount = 1.70158
  return 1 + (amount + 1) * math.pow(value - 1, 3) + amount * math.pow(value - 1, 2)
}
const outbounce = value => {
  const base = 7.5625
  const unit = 2.75
  if (value < 1 / unit) return base * value * value
  if (value < 2 / unit) return base * (value -= 1.5 / unit) * value + 0.75
  if (value < 2.5 / unit) return base * (value -= 2.25 / unit) * value + 0.9375
  return base * (value -= 2.625 / unit) * value + 0.984375
}
const outelastic = value => {
  if (value === 0 || value === 1) return value
  const period = 0.3
  return math.pow(2, -10 * value) * math.sin((value - period / 4) * (2 * math['PI']) / period) + 1
}
const ease = {
  linear: value => value,
  none: value => value,
  'sine.in': value => 1 - math.cos(value * math['PI'] / 2),
  'sine.out': value => math.sin(value * math['PI'] / 2),
  'sine.inout': value => -(math.cos(math['PI'] * value) - 1) / 2,
  'expo.in': value => value === 0 ? 0 : math.pow(2, 10 * value - 10),
  'expo.out': value => value === 1 ? 1 : 1 - math.pow(2, -10 * value),
  'expo.inout': value => {
    if (value === 0 || value === 1) return value
    return value < 0.5 ? math.pow(2, 20 * value - 10) / 2 : (2 - math.pow(2, -20 * value + 10)) / 2
  },
  'circ.in': value => 1 - math.sqrt(1 - value * value),
  'circ.out': value => math.sqrt(1 - math.pow(value - 1, 2)),
  'circ.inout': value => value < 0.5 ? (1 - math.sqrt(1 - 4 * value * value)) / 2 : (math.sqrt(1 - math.pow(-2 * value + 2, 2)) + 1) / 2,
  'back.in': value => 2.70158 * value * value * value - 1.70158 * value * value,
  'back.out': outback,
  'back.inout': value => {
    const amount = 1.70158 * 1.525
    return value < 0.5 ? (math.pow(2 * value, 2) * ((amount + 1) * 2 * value - amount)) / 2 : (math.pow(2 * value - 2, 2) * ((amount + 1) * (value * 2 - 2) + amount) + 2) / 2
  },
  'bounce.in': value => 1 - outbounce(1 - value),
  'bounce.out': outbounce,
  'bounce.inout': value => value < 0.5 ? (1 - outbounce(1 - 2 * value)) / 2 : (1 + outbounce(2 * value - 1)) / 2,
  'elastic.in': value => value === 0 || value === 1 ? value : -math.pow(2, 10 * value - 10) * math.sin((value * 10 - 10.75) * (2 * math['PI'] / 3)),
  'elastic.out': outelastic,
  'elastic.inout': value => {
    if (value === 0 || value === 1) return value
    const amount = 2 * math['PI'] / 4.5
    return value < 0.5 ? -(math.pow(2, 20 * value - 10) * math.sin((20 * value - 11.125) * amount)) / 2 : math.pow(2, -20 * value + 10) * math.sin((20 * value - 11.125) * amount) / 2 + 1
  }
}
;[1, 2, 3, 4]['forEach'](power => {
  const curved = value => math.pow(value, power + 1)
  ease['power' + power + '.in'] = curved
  ease['power' + power + '.out'] = value => 1 - math.pow(1 - value, power + 1)
  ease['power' + power + '.inout'] = value => value < 0.5 ? math.pow(2, power) * math.pow(value, power + 1) : 1 - math.pow(-2 * value + 2, power + 1) / 2
})
const findease = value => {
  if (isfn(value)) return value
  if (typeof value !== 'string') return ease[defaults.ease] || ease['power2.out']
  const name = value['toLowerCase']().replace(/\s/g, '')
  if (name['startsWith']('steps(')) {
    const count = math.max(1, float(name.match(/[\d.]+/)?.[0] || 1))
    return input => math.ceil(input * count) / count
  }
  const base = name.split('(')[0]
  return ease[name] || ease[base] || ease['power2.out']
}

const wake = () => {
  if (running || !root['requestAnimationFrame']) return
  running = true
  frame = root['requestAnimationFrame'](tick)
}
const sleep = () => {
  if (frame && root['cancelAnimationFrame']) root['cancelAnimationFrame'](frame)
  frame = 0
  running = false
  last = 0
}
function tick(stamp) {
  const elapsed = last ? stamp - last : 0
  const delta = elapsed / 1000
  const adjusted = settings.lagthreshold && elapsed > settings.lagthreshold ? settings.adjustedlag / 1000 : delta
  settings.frames++
  settings.elapsed = elapsed
  last = stamp
  for (const item of roots) item.advance(adjusted)
  for (const item of jobs) item(adjusted, stamp)
  if (roots.size || jobs.size) {
    frame = root['requestAnimationFrame'](tick)
  } else {
    sleep()
  }
}

class motion {
  constructor(vars = {}) {
    this.vars = vars
    this.delay = math.max(0, float(vars.delay || 0))
    this.size = math.max(0, vars.duration === undefined ? defaults.duration : float(vars.duration))
    this.repeat = vars.repeat === undefined ? 0 : float(vars.repeat)
    this.repeatdelay = math.max(0, float(vars.repeatdelay || 0))
    this.yoyo = !!vars.yoyo
    this.speed = vars.timescale === undefined ? 1 : float(vars.timescale)
    this.paused = !!vars.paused
    this.direction = 1
    this.now = 0
    this.iteration = 0
    this.lastprogress = 0
    this.started = false
    this.completed = false
    this.parent = null
    this.dead = false
    this.id = vars.id || ''
    this.data = vars.data
    living.add(this)
    if (current) current.animations.push(this)
  }
  activespan() {
    return this.repeat === -1 ? infinite : this.size * (this.repeat + 1) + this.repeatdelay * this.repeat
  }
  span() {
    return this.delay + this.activespan()
  }
  emit(name) {
    const callback = this.vars[name]
    if (isfn(callback)) callback.call(this.vars.callbackscope || this, this)
  }
  cycle(value, silent = false) {
    const span = this.span()
    const time = bound(value, 0, span)
    const active = math.max(0, time - this.delay)
    const total = this.activespan()
    let iteration = 0
    let local = 0
    let done = false
    if (this.size === 0) {
      iteration = active > 0 && this.repeat > 0 ? math.min(this.repeat, math.floor(active / math.max(this.repeatdelay, 0.000001))) : 0
      done = active >= total
    } else {
      const length = this.size + this.repeatdelay
      iteration = math.floor(active / length)
      if (this.repeat !== -1) iteration = math.min(iteration, this.repeat)
      if (this.repeat !== -1 && active >= total) {
        iteration = this.repeat
        done = true
      }
      let within = active - iteration * length
      if (done || within > this.size) within = this.size
      local = bound(within, 0, this.size)
      if (this.yoyo && iteration % 2 === 1) local = this.size - local
    }
    if (time < this.delay) local = 0
    if (time >= this.delay && !this.started) {
      this.started = true
      if (!silent) this.emit('onstart')
    }
    if (iteration > this.iteration && !silent) this.emit('onrepeat')
    if (!done) this.completed = false
    if (done && !this.completed) {
      this.completed = true
      if (!silent) this.emit('oncomplete')
    }
    this.now = time
    this.iteration = iteration
    this.lastprogress = this.size ? local / this.size : 1
    return local
  }
  advance(delta) {
    if (this.paused || this.dead || this.parent) return
    const span = this.span()
    let next = this.now + delta * this.speed * this.direction
    if (this.direction > 0 && next >= span) next = span
    if (this.direction < 0 && next <= 0) next = 0
    this.render(next)
    if ((this.direction > 0 && next >= span) || (this.direction < 0 && next <= 0)) {
      this.paused = true
      roots.delete(this)
      if (this.direction < 0) this.emit('onreversecomplete')
    }
  }
  play() {
    if (this.dead) return this
    if (this.now >= this.span() && this.span() > 0) {
      this.now = 0
      this.started = false
      this.completed = false
      this.iteration = 0
      this.render(0, true)
    }
    this.paused = false
    this.direction = 1
    if (!this.parent) {
      roots.add(this)
      wake()
    }
    return this
  }
  pause() {
    this.paused = true
    roots.delete(this)
    return this
  }
  resume() {
    return this.play()
  }
  reverse() {
    if (this.dead) return this
    if (this.now <= 0) this.now = this.span() === infinite ? this.size : this.span()
    this.paused = false
    this.direction = -1
    if (!this.parent) {
      roots.add(this)
      wake()
    }
    return this
  }
  restart() {
    this.now = 0
    this.iteration = 0
    this.started = false
    this.completed = false
    this.direction = 1
    this.render(0, true)
    return this.play()
  }
  seek(value, silent = true) {
    this.render(math.max(0, float(value) || 0), silent)
    return this
  }
  progress(value) {
    if (value === undefined) return this.lastprogress
    return this.seek(this.delay + this.iteration * (this.size + this.repeatdelay) + bound(value) * this.size)
  }
  totalprogress(value) {
    if (value === undefined) return this.span() ? bound(this.now / this.span()) : 0
    return this.seek(bound(value) * this.span())
  }
  duration(value) {
    if (value === undefined) return this.size
    this.size = math.max(0, float(value) || 0)
    return this
  }
  timescale(value) {
    if (value === undefined) return this.speed
    this.speed = float(value) || 0
    return this
  }
  timevalue(value) {
    if (value === undefined) return this.now
    return this.seek(value)
  }
  kill() {
    if (!this.dead && !this.completed) this.emit('oninterrupt')
    this.dead = true
    this.paused = true
    roots.delete(this)
    living.delete(this)
    if (this.parent) {
      this.parent.children = this.parent.children.filter(child => child.item !== this)
      this.parent = null
    }
    return this
  }
}

motion.prototype['time'] = motion.prototype.timevalue
motion.prototype['timeScale'] = motion.prototype.timescale
motion.prototype['totalProgress'] = motion.prototype.totalprogress
motion.prototype['totalDuration'] = function() { return this.span() }

const transformstate = target => {
  if (states.has(target)) return states.get(target)
  const state = { x: 0, y: 0, z: 0, xpercent: 0, ypercent: 0, scale: 1, scalex: 1, scaley: 1, scalez: 1, rotation: 0, rotationx: 0, rotationy: 0, rotationz: 0, skewx: 0, skewy: 0, perspective: 0, transformperspective: 0 }
  if (isel(target) && root['getComputedStyle']) {
    try {
      const value = root['getComputedStyle'](target).transform
      if (value && value !== 'none' && root['DOMMatrixReadOnly']) {
        const matrix = new root['DOMMatrixReadOnly'](value)
        state.x = matrix.m41 || 0
        state.y = matrix.m42 || 0
        state.scalex = math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b) || 1
        state.scaley = math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d) || 1
        state.rotation = math.atan2(matrix.b, matrix.a) * 180 / math['PI']
      }
    } catch (error) {}
  }
  states.set(target, state)
  return state
}
const writetransform = (target, existing) => {
  const state = existing || transformstate(target)
  const scalex = state.scalex * state.scale
  const scaley = state.scaley * state.scale
  const scalez = state.scalez * state.scale
  const rotation = state.rotation + state.rotationz
  let value = state.xpercent || state.ypercent ? `translate(${state.xpercent}%, ${state.ypercent}%) ` : ''
  value += `translate3d(${state.x}px, ${state.y}px, ${state.z}px)`
  if (state.rotationx) value += ` rotateX(${state.rotationx}deg)`
  if (state.rotationy) value += ` rotateY(${state.rotationy}deg)`
  if (rotation) value += ` rotate(${rotation}deg)`
  if (state.skewx || state.skewy) value += ` skew(${state.skewx}deg, ${state.skewy}deg)`
  if (scalex !== 1 || scaley !== 1 || scalez !== 1) value += ` scale3d(${scalex}, ${scaley}, ${scalez})`
  const perspective = state.transformperspective || state.perspective
  target.style.transform = perspective ? `perspective(${perspective}px) ${value}` : value
}
const reader = (target, key, low) => {
  if (transforms.has(low) && isel(target)) return () => transformstate(target)[low]
  if (isel(target)) {
    const property = cssname(key, low)
    return () => {
      const inline = target.style['getPropertyValue'](property)
      const computed = root['getComputedStyle'] ? root['getComputedStyle'](target)['getPropertyValue'](property) : ''
      const value = inline || computed
      if (value !== '') return value
      return low === 'opacity' || low === 'autoalpha' ? 1 : 0
    }
  }
  return () => target[key]
}
const writer = (target, key, low, defer = false) => {
  if (transforms.has(low) && isel(target)) {
    const state = transformstate(target)
    if (defer) return value => {
      state[low] = typeof value === 'number' ? value : float(value) || 0
    }
    return value => {
      state[low] = typeof value === 'number' ? value : float(value) || 0
      writetransform(target)
    }
  }
  if (low === 'autoalpha' && isel(target)) {
    const style = target.style
    return value => {
      style.opacity = value
      style.visibility = (typeof value === 'number' ? value : float(value)) === 0 ? 'hidden' : 'visible'
    }
  }
  if (isel(target)) {
    const property = cssname(key, low)
    const style = target.style
    if (low === 'opacity') return value => {
      style.opacity = value
    }
    return value => style['setProperty'](property, value)
  }
  return value => {
    const output = typeof value === 'string' && /^[-+]?\d*\.?\d+$/.test(value) ? float(value) : value
    target[key] = output
  }
}
let colorcanvas = null
const color = value => {
  if (typeof value !== 'string') return null
  const input = value.trim()['toLowerCase']()
  if (/^#[0-9a-f]{3,8}$/.test(input)) {
    const raw = input.slice(1)
    const full = raw.length < 5 ? raw.split('').map(part => part + part).join('') : raw
    return [number('0x' + full.slice(0, 2)), number('0x' + full.slice(2, 4)), number('0x' + full.slice(4, 6)), full.length === 8 ? number('0x' + full.slice(6, 8)) / 255 : 1]
  }
  const rgb = input.match(/^rgba?\(([^)]+)\)$/)
  if (rgb) {
    const parts = rgb[1].split(/[\s,\/]+/).filter(value => !!value).map(float)
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1]
  }
  const hsl = input.match(/^hsla?\(([^)]+)\)$/)
  if (hsl) {
    const parts = hsl[1].split(/[\s,\/]+/).filter(value => !!value)
    const hue = ((float(parts[0]) % 360) + 360) % 360 / 360
    const saturation = float(parts[1]) / 100
    const lightness = float(parts[2]) / 100
    const alpha = parts[3] === undefined ? 1 : float(parts[3])
    if (saturation === 0) {
      const gray = lightness * 255
      return [gray, gray, gray, alpha]
    }
    const second = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation
    const first = 2 * lightness - second
    const channel = offset => {
      let value = hue + offset
      if (value < 0) value += 1
      if (value > 1) value -= 1
      if (value < 1 / 6) return first + (second - first) * 6 * value
      if (value < 1 / 2) return second
      if (value < 2 / 3) return first + (second - first) * (2 / 3 - value) * 6
      return first
    }
    return [channel(1 / 3) * 255, channel(0) * 255, channel(-1 / 3) * 255, alpha]
  }
  if (doc) {
    if (!colorcanvas) colorcanvas = doc['createElement']('canvas')['getContext']('2d')
    if (colorcanvas) {
      colorcanvas['fillStyle'] = '#010203'
      colorcanvas['fillStyle'] = input
      const first = colorcanvas['fillStyle']
      colorcanvas['fillStyle'] = '#040506'
      colorcanvas['fillStyle'] = input
      const second = colorcanvas['fillStyle']
      if (first === second && first !== input) return color(first)
    }
  }
  return null
}
const unitless = new root['Set'](['opacity', 'autoalpha', 'zindex', 'scale', 'scalex', 'scaley', 'scalez', 'rotation', 'rotationx', 'rotationy', 'rotationz', 'skewx', 'skewy', 'fontweight'])
const lengthunits = new root['Set'](['px', 'rem', 'em', '%', 'vw', 'vh', 'vmin', 'vmax'])
const unitinfo = value => typeof value === 'number' ? [value, ''] : typeof value === 'string' ? (value.trim().match(/^([-+]?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/) || []).slice(1) : []
const unitpixels = (value, unit, target, low) => {
  if (!unit || unit === 'px') return value
  if (!lengthunits.has(unit)) return null
  if (unit === 'rem') return value * float(root['getComputedStyle'](doc['documentElement'])['fontSize'])
  if (unit === 'em') return value * float(root['getComputedStyle'](target)['fontSize'])
  if (unit === 'vw' || unit === 'vmin' || unit === 'vmax') {
    const width = root['innerWidth'] || 0
    const height = root['innerHeight'] || 0
    return value / 100 * (unit === 'vw' ? width : unit === 'vmin' ? math.min(width, height) : math.max(width, height))
  }
  if (unit === 'vh') return value / 100 * (root['innerHeight'] || 0)
  const parent = target['parentElement']
  if (!parent) return null
  const rect = parent['getBoundingClientRect']()
  const vertical = /height|top|bottom|\by\b/.test(low)
  return value / 100 * (vertical ? rect.height : rect.width)
}
const compatible = (start, end, target, low) => {
  if (!isel(target) || unitless.has(low) || !root['getComputedStyle']) return [start, end]
  const first = unitinfo(start)
  const last = unitinfo(end)
  if (first.length < 2 || last.length < 2) return [start, end]
  let from = first[1] || (typeof start === 'number' ? 'px' : '')
  let to = last[1] || from
  if (!lengthunits.has(from) || !lengthunits.has(to)) return [start, end]
  if (!last[1] && typeof end === 'number') end = text(end) + from
  if (from === to) return [start, end]
  const base = unitpixels(float(first[0]), from, target, low)
  const divisor = unitpixels(1, to, target, low)
  if (base === null || !divisor) return [start, end]
  return [base / divisor + to, end]
}
const expandcolors = value => typeof value === 'string' ? value.replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi, part => {
  const channels = color(part)
  return channels ? `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${channels[3]})` : part
}) : value
const blend = (start, end) => {
  if (typeof end === 'string' && /^[-+]=/.test(end)) {
    const amount = float(end.slice(2))
    const base = float(start) || 0
    const unit = text(start).replace(/^[-+]?[\d.]+/, '') || end.slice(2).replace(/^[-+]?[\d.]+/, '')
    end = (end['startsWith']('+=') ? base + amount : base - amount) + unit
  }
  if (typeof start === 'number' && typeof end === 'number') return value => start + (end - start) * value
  const firstcolor = color(text(start))
  const lastcolor = color(text(end))
  if (firstcolor && lastcolor) return value => {
    const channels = firstcolor.map((part, index) => part + (lastcolor[index] - part) * value)
    return `rgba(${math.round(channels[0])}, ${math.round(channels[1])}, ${math.round(channels[2])}, ${math.round(channels[3] * 1000) / 1000})`
  }
  start = expandcolors(start)
  end = expandcolors(end)
  const first = text(start).trim().match(/^([-+]?(?:\d+\.?\d*|\.\d+))(.*)$/)
  const last = text(end).trim().match(/^([-+]?(?:\d+\.?\d*|\.\d+))(.*)$/)
  if (first && last && !/\d/.test(first[2]) && !/\d/.test(last[2])) {
    const from = float(first[1])
    const to = float(last[1])
    const unit = last[2] || first[2]
    return value => from + (to - from) * value + unit
  }
  const pattern = /[-+]?(?:\d+\.?\d*|\.\d+)/g
  const firstparts = text(start).match(pattern) || []
  const lastparts = text(end).match(pattern) || []
  if (lastparts.length && firstparts.length === lastparts.length) {
    const numbers = firstparts.map((part, index) => [float(part), float(lastparts[index])])
    let cursor = 0
    const chunks = []
    text(end).replace(pattern, (part, offset) => {
      chunks.push(text(end).slice(cursor, offset))
      cursor = offset + part.length
      return part
    })
    chunks.push(text(end).slice(cursor))
    return value => chunks[0] + numbers.map((pair, index) => (pair[0] + (pair[1] - pair[0]) * value) + chunks[index + 1]).join('')
  }
  return value => value < 1 ? start : end
}
const staggered = (count, value) => {
  if (!value) return list(count).fill(0)
  if (typeof value === 'number') return list(count).fill(0).map((part, index) => index * value)
  if (isfn(value)) return list(count).fill(0).map((part, index) => float(value(index)) || 0)
  const vars = lower(value)
  const amount = vars.amount === undefined ? null : float(vars.amount)
  const each = float(vars.each === undefined ? (amount === null ? 0.05 : 0) : vars.each)
  const grid = vars.grid
  const rows = grid && grid !== 'auto' ? grid[0] : 1
  const cols = grid && grid !== 'auto' ? grid[1] : count
  const distances = list(count).fill(0).map((part, index) => {
    const row = math.floor(index / cols)
    const col = index % cols
    const maxrow = math.max(0, math.ceil(count / cols) - 1)
    const maxcol = math.max(0, cols - 1)
    let from = vars.from === undefined ? 'start' : vars.from
    if (from === 'random') return math.random()
    if (typeof from === 'number') {
      const targetrow = math.floor(from / cols)
      const targetcol = from % cols
      return math.sqrt(math.pow(row - targetrow, 2) + math.pow(col - targetcol, 2))
    }
    if (from === 'center') return math.sqrt(math.pow(row - maxrow / 2, 2) + math.pow(col - maxcol / 2, 2))
    if (from === 'edges') return -math.sqrt(math.pow(row - maxrow / 2, 2) + math.pow(col - maxcol / 2, 2))
    if (from === 'end') return math.sqrt(math.pow(row - maxrow, 2) + math.pow(col - maxcol, 2))
    if (vars.axis === 'x') return col
    if (vars.axis === 'y') return row
    return grid ? math.sqrt(row * row + col * col) : index
  })
  const min = math.min(...distances)
  const max = math.max(...distances)
  const curved = findease(vars.ease || 'linear')
  return distances.map(distance => {
    const progress = max === min ? 0 : (distance - min) / (max - min)
    return amount === null ? distance * each : curved(progress) * amount
  })
}

const snapped = (value, rule) => {
  if (rule === undefined || rule === null || rule === false) return value
  if (isfn(rule)) return rule(value)
  if (list['isArray'](rule)) return rule.reduce((closest, item) => math.abs(item - value) < math.abs(closest - value) ? item : closest, rule[0])
  const increment = isobj(rule) ? float(rule.increment || rule.step || 0) : float(rule)
  return increment ? math.round(value / increment) * increment : value
}

class tween extends motion {
  constructor(targets, vars = {}, fromvars = null, mode = 'to') {
    const config = lower(vars)
    super(config)
    this.targets = resolve(targets)
    this.original = vars
    this.fromvars = fromvars
    this.mode = mode
    this.base = this.size
    this.offsets = staggered(this.targets.length, config.stagger)
    this.size = this.base + math.max(0, ...this.offsets)
    this.groups = []
    this.built = false
    this.ease = findease(config.ease || defaults.ease)
    this.altease = config.yoyoease ? findease(config.yoyoease) : null
    this.scroll = null
    if (config.overwrite === true) {
      list.from(living)['forEach'](item => {
        if (item !== this && item instanceof tween && item.targets.some(target => this.targets.includes(target))) item.kill()
      })
    }
    if (config.scrolltrigger) {
      this.paused = true
      const options = isobj(config.scrolltrigger) ? config.scrolltrigger : {}
      this.scroll = new scrollscene({ ...options, animation: this })
    }
    if ((mode === 'from' || mode === 'fromto') && config.immediaterender !== false) {
      this.build()
      this.apply(0)
    }
    if (!config.paused && !config.scrolltrigger) this.play()
  }
  build() {
    if (this.built) return
    this.built = true
    const entries = dict.keys(this.original).filter(key => !reserved.has(key['toLowerCase']()))
    const attributes = this.original.attr ? dict.keys(this.original.attr) : []
    const source = this.fromvars ? lower(this.fromvars) : {}
    const modifiers = this.original.modifiers || {}
    for (let index = 0; index < this.targets.length; index++) {
      const target = this.targets[index]
      const element = isel(target)
      const group = { target, offset: this.offsets[index] || 0, tracks: [], transform: false, state: null }
      this.groups.push(group)
      for (let entry = 0; entry < entries.length; entry++) {
        const key = entries[entry]
        const low = key['toLowerCase']()
        const read = reader(target, key, low)
        const write = writer(target, key, low, true)
        let end = this.original[key]
        let property = {}
        if (isobj(end) && !list['isArray'](end) && end.value !== undefined) {
          property = lower(end)
          end = property.value
        }
        if (isfn(end)) end = end(index, target, this.targets)
        let start
        if (this.mode === 'fromto') {
          start = source[low]
          if (isobj(start) && start.value !== undefined) start = lower(start).value
          if (isfn(start)) start = start(index, target, this.targets)
          if (start === undefined) start = read()
        } else if (this.mode === 'from') {
          start = end
          end = read()
        } else {
          start = read()
        }
        const effect = effects.get(low)
        if (effect) {
          const custom = effect(target, { start, end, mode: this.mode, config: property }, { tween: this, index, targets: this.targets, group, read, write, key, low })
          if (custom) {
            group.tracks.push({ effect: true, render: custom.render, context: custom.context || { target, tween: this, group }, read: custom.read || read, curve: property.ease ? findease(property.ease) : null, low, key })
            if (custom.transform) group.transform = true
            continue
          }
        }
        const values = compatible(start, end, target, low)
        start = values[0]
        end = values[1]
        const numeric = typeof start === 'number' && typeof end === 'number'
        group.tracks.push({ write, read, start, end, numeric, interpolate: numeric ? null : blend(start, end), curve: property.ease ? findease(property.ease) : null, snap: property.snap === undefined ? (property.autoround ? 1 : undefined) : property.snap, modifier: property.modifier || modifiers[key] || modifiers[low], low, key })
        if (element && transforms.has(low)) group.transform = true
      }
      if (group.transform) group.state = transformstate(target)
      for (let entry = 0; entry < attributes.length; entry++) {
        const key = attributes[entry]
        let end = this.original.attr[key]
        if (isfn(end)) end = end(index, target, this.targets)
        const start = target['getAttribute'](key) || 0
        group.tracks.push({ write: value => target['setAttribute'](key, value), read: null, interpolate: blend(start, end), low: 'attr:' + key, key })
      }
    }
    if (this.vars.overwrite === 'auto' && !overwriting) {
      overwriting = true
      list.from(living)['forEach'](item => {
        if (item === this || !(item instanceof tween) || item.dead) return
        item.build()
        item.groups = item.groups.filter(group => {
          const own = this.groups.find(value => value.target === group.target)
          if (!own) return true
          group.tracks = group.tracks.filter(track => !own.tracks.some(value => value.low === track.low))
          return group.tracks.length > 0
        })
        if (!item.groups.length) item.kill()
      })
      overwriting = false
    }
  }
  apply(local) {
    const curve = this.altease && this.yoyo && this.iteration % 2 === 1 ? this.altease : this.ease
    const sharedprogress = this.base ? bound(local / this.base) : 1
    const shared = curve(sharedprogress)
    for (let index = 0; index < this.groups.length; index++) {
      const group = this.groups[index]
      const progress = group.offset && this.base ? bound((local - group.offset) / this.base) : sharedprogress
      const eased = group.offset && this.base ? curve(progress) : shared
      for (let track = 0; track < group.tracks.length; track++) {
        const item = group.tracks[track]
        const propertyease = item.curve ? item.curve(progress) : eased
        if (item.effect) {
          item.render(propertyease, item.context)
          continue
        }
        let output = item.numeric ? item.start + (item.end - item.start) * propertyease : item.interpolate(propertyease)
        if (item.snap !== undefined) output = snapped(output, item.snap)
        if (isfn(item.modifier)) output = item.modifier(output, group.target)
        item.write(output)
      }
      if (group.transform) writetransform(group.target, group.state)
    }
  }
  render(value, silent = false) {
    this.build()
    const previous = this.iteration
    const local = this.cycle(value, silent)
    if (this.vars.repeatrefresh && previous !== this.iteration) {
      this.invalidate()
      this.build()
    }
    this.apply(local)
    if (!silent) this.emit('onupdate')
    return this
  }
  redirect(value) {
    this.build()
    for (let index = 0; index < this.groups.length; index++) {
      const group = this.groups[index]
      const track = group.tracks[0]
      const values = compatible(track.read(), value, group.target, track.low)
      track.start = values[0]
      track.end = values[1]
      track.numeric = typeof track.start === 'number' && typeof track.end === 'number'
      track.interpolate = track.numeric ? null : blend(track.start, track.end)
    }
    this.now = 0
    this.iteration = 0
    this.lastprogress = 0
    this.started = false
    this.completed = false
    this.direction = 1
    this.paused = !!this.vars.paused
    if (!this.paused && !this.parent) {
      roots.add(this)
      wake()
    }
    return this
  }
  invalidate() {
    this.built = false
    this.groups = []
    return this
  }
  kill() {
    if (this.scroll) this.scroll.kill()
    return super.kill()
  }
}

class recall extends motion {
  constructor(callback, params, vars = {}) {
    super({ ...vars, duration: 0 })
    this.callback = callback
    this.params = params || []
    this.fired = false
  }
  render(value, silent = false) {
    this.cycle(value, silent)
    if (value >= this.delay && !this.fired) {
      this.fired = true
      if (!silent && isfn(this.callback)) this.callback.apply(this.vars.callbackscope || this, this.params)
    }
    if (value < this.delay) this.fired = false
    if (!silent) this.emit('onupdate')
    return this
  }
}

class timeline extends motion {
  constructor(vars = {}) {
    const config = lower(vars)
    super({ ...config, duration: 0 })
    this.children = []
    this.labels = {}
    this.basevars = lower(config.defaults || {})
    this.recent = null
    if (!config.paused && !config.scrolltrigger) this.play()
  }
  end() {
    return this.children.reduce((value, child) => math.max(value, child.start + child.item.span()), 0)
  }
  position(value) {
    const end = this.end()
    if (value === undefined || value === null) return end
    if (typeof value === 'number') return value
    if (this.labels[value] !== undefined) return this.labels[value]
    if (typeof value === 'string') {
      if (value['startsWith']('<') || value['startsWith']('>')) {
        const base = this.recent ? (value[0] === '<' ? this.recent.start : this.recent.start + this.recent.item.span()) : end
        return math.max(0, base + (float(value.slice(1)) || 0))
      }
      if (/^[+-]=/.test(value)) return math.max(0, end + (value[0] === '+' ? 1 : -1) * (float(value.slice(2)) || 0))
      const match = value.match(/^([^+-]+)([+-]=(?:\d+\.?\d*|\.\d+))?$/)
      if (match && this.labels[match[1]] !== undefined) {
        const offset = match[2] ? (match[2][0] === '+' ? 1 : -1) * float(match[2].slice(2)) : 0
        return this.labels[match[1]] + offset
      }
    }
    return end
  }
  sync() {
    this.size = this.end()
    return this
  }
  add(item, position) {
    let child = item
    if (isfn(item)) child = new recall(item)
    if (!(child instanceof motion)) return this
    child.pause()
    child.parent = this
    this.children.push({ item: child, start: this.position(position) })
    this.recent = this.children[this.children.length - 1]
    this.sync()
    return this
  }
  to(targets, vars, position) {
    if (vars && vars.keyframes) return this.add(keyframes(targets, { ...this.basevars, ...vars, paused: true }), position)
    return this.add(new tween(targets, { ...this.basevars, ...vars, paused: true }), position)
  }
  from(targets, vars, position) {
    return this.add(new tween(targets, { ...this.basevars, ...vars, paused: true, 'immediateRender': false }, null, 'from'), position)
  }
  fromto(targets, fromvars, tovars, position) {
    return this.add(new tween(targets, { ...this.basevars, ...tovars, paused: true, 'immediateRender': false }, fromvars, 'fromto'), position)
  }
  set(targets, vars, position) {
    return this.add(new tween(targets, { ...this.basevars, ...vars, paused: true, duration: 0 }), position)
  }
  call(callback, params, position) {
    return this.add(new recall(callback, params), position)
  }
  addlabel(name, position) {
    this.labels[name] = this.position(position)
    return this
  }
  defaults(value) {
    if (value === undefined) return this.basevars
    this.basevars = { ...this.basevars, ...lower(value) }
    return this
  }
  getchildren(nested = true) {
    const items = this.children.map(child => child.item)
    if (!nested) return items
    return items.reduce((output, item) => output.concat(item instanceof timeline ? item.getchildren(true) : [item]), [])
  }
  remove(item) {
    const child = this.children.find(value => value.item === item)
    if (child) {
      child.item.parent = null
      this.children = this.children.filter(value => value.item !== item)
      this.sync()
    }
    return this
  }
  removelabel(name) {
    delete this.labels[name]
    return this
  }
  currentlabel(value) {
    const names = dict.keys(this.labels).sort((first, second) => this.labels[first] - this.labels[second])
    if (value !== undefined) {
      if (this.labels[value] !== undefined) this.seek(this.labels[value])
      return this
    }
    let current = ''
    names['forEach'](name => {
      if (this.labels[name] <= this.now) current = name
    })
    return current
  }
  nextlabel() {
    const names = dict.keys(this.labels).filter(name => this.labels[name] > this.now).sort((first, second) => this.labels[first] - this.labels[second])
    return names[0] || null
  }
  previouslabel() {
    const names = dict.keys(this.labels).filter(name => this.labels[name] < this.now).sort((first, second) => this.labels[second] - this.labels[first])
    return names[0] || null
  }
  addpause(position, callback, params = []) {
    return this.call(() => {
      this.pause()
      if (isfn(callback)) callback(...params)
    }, [], position)
  }
  tweento(position, vars = {}) {
    const destination = this.position(position)
    const state = { value: this.now }
    const config = lower(vars)
    const callback = config.onupdate
    return new tween(state, { ...vars, value: destination, 'onUpdate': () => {
      this.seek(state.value)
      if (isfn(callback)) callback.call(this)
    } })
  }
  tweenfromto(from, to, vars = {}) {
    this.seek(this.position(from))
    return this.tweento(to, vars)
  }
  render(value, silent = false) {
    const time = this.cycle(value, silent)
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index]
      const local = time - child.start
      if (local < 0) {
        if (child.item.now > 0) child.item.render(0, true)
      } else {
        child.item.render(local, silent)
      }
    }
    if (!silent) this.emit('onupdate')
    return this
  }
  clear() {
    this.children['forEach'](child => child.item.kill())
    this.children = []
    this.recent = null
    this.sync()
    return this
  }
  kill() {
    this.clear()
    return super.kill()
  }
  invalidate() {
    this.children['forEach'](child => child.item.invalidate?.())
    return this
  }
}
timeline.prototype['fromTo'] = timeline.prototype.fromto
timeline.prototype['addLabel'] = timeline.prototype.addlabel
timeline.prototype['getChildren'] = timeline.prototype.getchildren
timeline.prototype['removeLabel'] = timeline.prototype.removelabel
timeline.prototype['currentLabel'] = timeline.prototype.currentlabel
timeline.prototype['nextLabel'] = timeline.prototype.nextlabel
timeline.prototype['previousLabel'] = timeline.prototype.previouslabel
timeline.prototype['addPause'] = timeline.prototype.addpause
timeline.prototype['tweenTo'] = timeline.prototype.tweento
timeline.prototype['tweenFromTo'] = timeline.prototype.tweenfromto

const viewport = scroller => scroller ? scroller['clientHeight'] : root['innerHeight'] || doc?.['documentElement']['clientHeight'] || 0
const scrollvalue = (scroller, horizontal = false) => {
  if (scroller) return horizontal ? scroller['scrollLeft'] : scroller['scrollTop']
  return horizontal ? root['scrollX'] || doc?.['documentElement']['scrollLeft'] || 0 : root['scrollY'] || doc?.['documentElement']['scrollTop'] || 0
}
const edge = (value, size) => {
  if (typeof value === 'number') return value
  if (value === 'top' || value === 'left') return 0
  if (value === 'center') return size / 2
  if (value === 'bottom' || value === 'right') return size
  if (typeof value === 'string' && value['endsWith']('%')) return float(value) / 100 * size
  return float(value) || 0
}
const point = (value, rect, height, offset = scrollvalue()) => {
  const parts = text(value).trim().split(/\s+/)
  return rect.top + offset + edge(parts[0], rect.height) - edge(parts[1], height)
}

class scrollscene {
  constructor(vars = {}) {
    this.vars = lower(vars)
    this.trigger = one(this.vars.trigger) || doc?.body
    this.scroller = one(this.vars.scroller) || null
    this.proxy = this.vars.scrollerproxy || null
    this.horizontal = !!this.vars.horizontal
    this.animation = this.vars.animation || null
    this.start = 0
    this.end = 1
    this.progress = 0
    this.current = 0
    this.smooth = null
    this.dead = false
    this.update = this.update.bind(this)
    this.refresh = this.refresh.bind(this)
    if (this.animation) this.animation.pause()
    if (root['addEventListener']) {
      const target = this.scroller || root
      target['addEventListener']('scroll', this.update, { passive: true })
      root['addEventListener']('resize', this.refresh, { passive: true })
    }
    if (root['ResizeObserver'] && this.trigger) {
      this.observer = new root['ResizeObserver'](this.refresh)
      this.observer.observe(this.trigger)
    }
    scrolls.add(this)
    if (current) current.scenes.push(this)
    this.refresh()
  }
  position() {
    if (this.proxy) {
      const callback = this.horizontal ? this.proxy.scrollleft || this.proxy['scrollLeft'] : this.proxy.scrolltop || this.proxy['scrollTop']
      if (isfn(callback)) return callback()
    }
    return scrollvalue(this.scroller, this.horizontal)
  }
  view() {
    return this.scroller ? this.scroller['clientHeight'] : viewport()
  }
  refresh() {
    if (this.dead || !this.trigger || !this.trigger['getBoundingClientRect']) return this
    const rect = this.trigger['getBoundingClientRect']()
    const frame = this.scroller ? this.scroller['getBoundingClientRect']() : null
    const measured = { top: rect.top - (frame ? frame.top : 0), height: rect.height }
    this.start = point(this.vars.start || 'top 80%', measured, this.view(), this.position())
    this.end = point(this.vars.end || 'bottom 20%', measured, this.view(), this.position())
    if (this.end <= this.start) this.end = this.start + 1
    this.update()
    return this
  }
  update() {
    if (this.dead) return this
    const previous = this.progress
    this.progress = bound((this.position() - this.start) / (this.end - this.start))
    if (this.animation) {
      if (this.vars.scrub) {
        if (typeof this.vars.scrub === 'number') {
          if (this.smooth) this.smooth.kill()
          const state = { value: this.current }
          this.smooth = new tween(state, {
            value: this.progress,
            duration: this.vars.scrub,
            ease: 'power1.out',
            'onUpdate': () => {
              this.current = state.value
              this.animation.seek(this.current * this.animation.span())
            }
          })
        } else {
          this.current = this.progress
          this.animation.seek(this.current * this.animation.span())
        }
      } else if (!this.vars.toggleactions && this.progress > 0 && previous === 0) {
        this.animation.play()
      } else if (!this.vars.toggleactions && this.progress === 0 && previous > 0 && this.vars.reverse !== false) {
        this.animation.reverse()
      }
    }
    if (this.vars.toggleclass && this.trigger) this.trigger['classList'].toggle(this.vars.toggleclass, this.progress > 0 && this.progress < 1)
    if (!this.dead && isfn(this.vars.onupdate)) this.vars.onupdate.call(this, this)
    if (this.vars.once && this.progress >= 1) this.kill()
    return this
  }
  kill() {
    this.dead = true
    if (this.smooth) this.smooth.kill()
    if (root['removeEventListener']) {
      const target = this.scroller || root
      target['removeEventListener']('scroll', this.update)
      root['removeEventListener']('resize', this.refresh)
    }
    if (this.observer) this.observer.disconnect()
    scrolls.delete(this)
    return this
  }
}

class gesture {
  constructor(target, vars = {}) {
    this.target = one(target)
    this.vars = lower(vars)
    this.active = false
    this.enabled = true
    this.moved = false
    this.tween = null
    this.down = this.down.bind(this)
    this.move = this.move.bind(this)
    this.up = this.up.bind(this)
    if (!this.target) return
    this.target['addEventListener']('pointerdown', this.down)
    this.target['addEventListener']('pointermove', this.move)
    this.target['addEventListener']('pointerup', this.up)
    this.target['addEventListener']('pointercancel', this.up)
    const type = this.vars.type || 'x,y'
    this.target.style['setProperty']('touch-action', type === 'x' ? 'pan-y' : type === 'y' ? 'pan-x' : 'none')
    if (current) current.gestures.push(this)
  }
  emit(name, event) {
    if (isfn(this.vars[name])) this.vars[name].call(this, this, event)
  }
  limits() {
    const bounds = this.vars.bounds
    const state = transformstate(this.target)
    if (!bounds) return { minx: -infinite, maxx: infinite, miny: -infinite, maxy: infinite }
    if (isobj(bounds) && !isel(bounds) && typeof bounds !== 'string') return {
      minx: bounds.minx === undefined ? -infinite : bounds.minx,
      maxx: bounds.maxx === undefined ? infinite : bounds.maxx,
      miny: bounds.miny === undefined ? -infinite : bounds.miny,
      maxy: bounds.maxy === undefined ? infinite : bounds.maxy
    }
    const parent = bounds === 'parent' ? this.target['parentElement'] : one(bounds)
    if (!parent) return { minx: -infinite, maxx: infinite, miny: -infinite, maxy: infinite }
    const outer = parent['getBoundingClientRect']()
    const inner = this.target['getBoundingClientRect']()
    return {
      minx: state.x + outer.left - inner.left,
      maxx: state.x + outer.right - inner.right,
      miny: state.y + outer.top - inner.top,
      maxy: state.y + outer.bottom - inner.bottom
    }
  }
  down(event) {
    if (!this.enabled || event.button > 0) return
    if (this.tween) this.tween.kill()
    const state = transformstate(this.target)
    this.active = true
    this.moved = false
    this.pointer = event['pointerId']
    this.px = event['clientX']
    this.py = event['clientY']
    this.x = state.x
    this.y = state.y
    this.lastx = this.x
    this.lasty = this.y
    this.lasttime = clock()
    this.vx = 0
    this.vy = 0
    this.bounds = this.limits()
    this.target['setPointerCapture']?.(this.pointer)
    this.emit('onpress', event)
  }
  move(event) {
    if (!this.active || event['pointerId'] !== this.pointer) return
    const type = this.vars.type || 'x,y'
    const nextx = type.includes('x') ? bound(this.x + event['clientX'] - this.px, this.bounds.minx, this.bounds.maxx) : this.x
    const nexty = type.includes('y') ? bound(this.y + event['clientY'] - this.py, this.bounds.miny, this.bounds.maxy) : this.y
    const time = clock()
    const delta = math.max(0.008, (time - this.lasttime) / 1000)
    this.vx = this.vx * 0.65 + (nextx - this.lastx) / delta * 0.35
    this.vy = this.vy * 0.65 + (nexty - this.lasty) / delta * 0.35
    const state = transformstate(this.target)
    state.x = nextx
    state.y = nexty
    writetransform(this.target)
    this.lastx = nextx
    this.lasty = nexty
    this.lasttime = time
    if (!this.moved) {
      this.moved = true
      this.emit('ondragstart', event)
    }
    this.emit('ondrag', event)
  }
  up(event) {
    if (!this.active || event['pointerId'] !== this.pointer) return
    this.active = false
    this.target['releasePointerCapture']?.(this.pointer)
    const state = transformstate(this.target)
    if (this.vars.inertia && this.moved) {
      const x = bound(state.x + this.vx * 0.16, this.bounds.minx, this.bounds.maxx)
      const y = bound(state.y + this.vy * 0.16, this.bounds.miny, this.bounds.maxy)
      this.tween = new tween(this.target, { x, y, duration: 0.65, ease: 'power3.out' })
    }
    this.emit('onrelease', event)
    if (this.moved) this.emit('ondragend', event)
  }
  enable() {
    this.enabled = true
    return this
  }
  disable() {
    this.enabled = false
    this.active = false
    return this
  }
  kill() {
    if (this.tween) this.tween.kill()
    if (this.target) {
      this.target['removeEventListener']('pointerdown', this.down)
      this.target['removeEventListener']('pointermove', this.move)
      this.target['removeEventListener']('pointerup', this.up)
      this.target['removeEventListener']('pointercancel', this.up)
    }
    this.enabled = false
    return this
  }
}

const keyframes = (targets, vars = {}) => {
  const config = lower(vars)
  const master = new timeline({ ...vars, paused: true })
  const frames = config.keyframes
  const base = {}
  if (config.easeeach || config.ease) base.ease = config.easeeach || config.ease
  if (config.stagger) base.stagger = config.stagger
  if (list['isArray'](frames)) {
    frames['forEach'](frame => {
      const options = { ...base, ...frame }
      if (options.duration === undefined) options.duration = defaults.duration
      master.to(targets, options)
    })
  } else if (isobj(frames)) {
    const total = config.duration === undefined ? 1 : float(config.duration)
    const points = dict.keys(frames).map(value => float(value)).filter(value => !root['isNaN'](value)).sort((first, second) => first - second)
    let previous = points[0] || 0
    points['forEach']((point, index) => {
      const frame = frames[point] || frames[text(point)]
      const options = { ...base, ...frame }
      const position = point / 100 * total
      if (index === 0 && point === 0) master.set(targets, options, 0)
      else {
        options.duration = options.duration === undefined ? math.max(0, position - previous / 100 * total) : options.duration
        master.to(targets, options, previous / 100 * total)
      }
      previous = point
    })
  }
  if (!config.paused) master.play()
  return master
}
const to = (targets, vars = {}) => vars && vars.keyframes ? keyframes(targets, vars) : new tween(targets, vars)
const from = (targets, vars) => new tween(targets, vars, null, 'from')
const fromto = (targets, fromvars, tovars) => new tween(targets, tovars, fromvars, 'fromto')
const set = (targets, vars) => {
  const item = new tween(targets, { ...vars, duration: 0, paused: true })
  item.seek(0)
  return item
}
const maketimeline = vars => new timeline(vars)
const scroll = vars => new scrollscene(vars)
scroll.refresh = () => scrolls['forEach'](item => item.refresh())
scroll.update = () => scrolls['forEach'](item => item.update())
scroll['getAll'] = () => list.from(scrolls)
const drag = (targets, vars) => {
  const items = resolve(targets).map(target => new gesture(target, vars))
  return isel(targets) || !targets.length ? items[0] : items
}
const quickto = (target, property, vars = {}) => {
  let item = null
  return value => {
    if (!item || item.dead) {
      item = new tween(target, { ...vars, [property]: value })
      item.build()
    } else {
      item.redirect(value)
    }
    return item
  }
}
const quicksetter = (target, property) => {
  const items = resolve(target).map(value => writer(value, property, property['toLowerCase']()))
  return value => items['forEach'](write => write(value))
}
const getproperty = (target, property) => {
  const item = one(target)
  return item ? reader(item, property, property['toLowerCase']())() : undefined
}
const killtweens = targets => {
  const items = resolve(targets)
  list.from(living)['forEach'](item => {
    if (item instanceof tween && item.targets.some(target => items.includes(target))) item.kill()
  })
}
const gettweens = targets => {
  const items = resolve(targets)
  return list.from(living).filter(item => item instanceof tween && item.targets.some(target => items.includes(target)))
}
const context = callback => {
  const box = { animations: [], scenes: [], gestures: [], cleanups: [] }
  box.add = (name, callback) => {
    if (isfn(name)) box.cleanups.push(name)
    else if (isfn(callback)) box.cleanups.push(callback)
    return box
  }
  box.revert = () => {
    box.animations['forEach'](item => item.kill())
    box.scenes['forEach'](item => item.kill())
    box.gestures['forEach'](item => item.kill())
    box.cleanups['forEach'](item => item())
  }
  const previous = current
  current = box
  if (isfn(callback)) callback(box)
  current = previous
  return box
}
const media = (queries, callback) => {
  const boxes = []
  const entries = dict.keys(queries).map(query => {
    const querylist = root['matchMedia'](query)
    let box = null
    const check = () => {
      if (querylist.matches && !box) {
        box = context(() => callback(queries[query]))
        boxes.push(box)
      } else if (!querylist.matches && box) {
        box.revert()
        box = null
      }
    }
    querylist['addEventListener']('change', check)
    check()
    return { querylist, check }
  })
  return {
    revert() {
      boxes['forEach'](box => box.revert())
      entries['forEach'](item => item.querylist['removeEventListener']('change', item.check))
    }
  }
}
const clamp = (min, max, value) => value === undefined ? input => bound(input, min, max) : bound(value, min, max)
const maprange = (inmin, inmax, outmin, outmax, value) => value === undefined ? input => outmin + (outmax - outmin) * ((input - inmin) / (inmax - inmin)) : outmin + (outmax - outmin) * ((value - inmin) / (inmax - inmin))
const interpolate = (start, end, progress) => {
  const blendvalue = blend(start, end)
  return progress === undefined ? blendvalue : blendvalue(progress)
}
const random = (min, max, snap = 0) => {
  const value = min + math.random() * (max - min)
  return snap ? math.round(value / snap) * snap : value
}
const snap = (increment, value) => {
  const apply = input => math.round(input / increment) * increment
  return value === undefined ? apply : apply(value)
}
const configure = vars => {
  const config = lower(vars)
  if (config.defaults) dict.assign(defaults, lower(config.defaults))
  return twexom
}
const ticker = {
  add(callback) {
    jobs.add(callback)
    wake()
    return callback
  },
  remove(callback) {
    jobs.delete(callback)
    return callback
  },
  lagsmoothing(threshold = 500, adjusted = 33) {
    settings.lagthreshold = threshold
    settings.adjustedlag = adjusted
    return ticker
  },
  frame() {
    return settings.frames
  },
  deltaratio(fps = 60) {
    return settings.elapsed / (1000 / fps)
  }
}
ticker['lagSmoothing'] = ticker.lagsmoothing
ticker['deltaRatio'] = ticker.deltaratio
const delayedcall = (delay, callback, params = []) => new recall(callback, params, { delay }).play()
const getbyid = id => list.from(living).find(item => item.id === id) || null
const register = (...items) => {
  items['forEach'](plugin => {
    if (!plugin) return
    const name = plugin.name || plugin.id || text(plugin)
    if (plugins.has(name)) return
    plugins.set(name, plugin)
    if (isfn(plugin)) plugin(twexom, internals)
    else if (isfn(plugin.register)) plugin.register(twexom, internals)
    else if (isfn(plugin.init)) plugin.init(twexom, internals)
  })
  return twexom
}
const registereffect = (name, callback) => {
  effects.set(name['toLowerCase'](), callback)
  return twexom
}
const internals = {
  root,
  doc,
  math,
  number,
  text,
  list,
  dict,
  float,
  bound,
  isobj,
  isfn,
  isel,
  resolve,
  one,
  lower,
  reader,
  writer,
  transformstate,
  transforms,
  writetransform,
  blend,
  compatible,
  color,
  findease,
  ease,
  states,
  living,
  roots,
  scrolls,
  motion,
  tween,
  timeline,
  scrollscene,
  gesture,
  registereffect,
  ticker,
  settings
}

const twexom = {
  version: '1.0.0',
  to,
  from,
  set,
  timeline: maketimeline,
  scroll,
  drag,
  context,
  ticker,
  configure,
  quickto,
  quicksetter,
  getproperty,
  killtweens,
  gettweens,
  register,
  registereffect,
  delayedcall,
  getbyid,
  ease,
  'internals': internals,
  utils: {
    'toArray': resolve,
    clamp,
    'mapRange': maprange,
    interpolate,
    random,
    snap
  }
}
twexom['fromTo'] = fromto
twexom['quickTo'] = quickto
twexom['quickSetter'] = quicksetter
twexom['getProperty'] = getproperty
twexom['killTweensOf'] = killtweens
twexom['getTweensOf'] = gettweens
twexom['matchMedia'] = media
twexom['config'] = configure
twexom['registerPlugin'] = register
twexom['registerEffect'] = registereffect
twexom['delayedCall'] = delayedcall
twexom['getById'] = getbyid
root['twexom'] = twexom

export { twexom, ease, to, from, fromto, set, maketimeline, scroll, drag, context, keyframes, register, registereffect }
export default twexom
