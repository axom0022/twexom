let core = null
let basedown = null
let baseup = null

const snapvalue = (value, rule) => {
  if (rule === undefined || rule === null || rule === false) return value
  if (core.isfn(rule)) return rule(value)
  if (core.list['isArray'](rule)) return rule.reduce((closest, item) => core.math.abs(item - value) < core.math.abs(closest - value) ? item : closest, rule[0])
  const increment = core.isobj(rule) ? core.float(rule.increment || rule.step || 0) : core.float(rule)
  return increment ? core.math.round(value / increment) * increment : value
}
const propertyrule = (vars, key, live) => {
  const rule = live ? vars.livesnap || vars.snap : vars.snap
  if (core.isobj(rule) && !core.list['isArray'](rule)) return rule[key] === undefined ? rule : rule[key]
  return rule
}
const ensure = gesture => {
  if (!gesture.advanced) gesture.advanced = { rotation: 0, angle: 0, time: 0, velocity: 0 }
  return gesture.advanced
}
const angle = (event, center) => core.math.atan2(event['clientY'] - center.y, event['clientX'] - center.x) * 180 / core.math['PI']
const snaptarget = (gesture, state, live) => {
  state.x = snapvalue(state.x, propertyrule(gesture.vars, 'x', live))
  state.y = snapvalue(state.y, propertyrule(gesture.vars, 'y', live))
  state.rotation = snapvalue(state.rotation, propertyrule(gesture.vars, 'rotation', live))
}

class observer {
  constructor(vars = {}) {
    this.vars = core.lower(vars)
    this.target = core.one(this.vars.target) || core.root
    this.active = false
    this.enabled = true
    this.x = 0
    this.y = 0
    this.down = this.down.bind(this)
    this.move = this.move.bind(this)
    this.up = this.up.bind(this)
    this.wheel = this.wheel.bind(this)
    const passive = this.vars.preventdefault ? { passive: false } : { passive: true }
    this.target['addEventListener']('wheel', this.wheel, passive)
    this.target['addEventListener']('pointerdown', this.down, { passive: true })
    this.target['addEventListener']('pointermove', this.move, passive)
    this.target['addEventListener']('pointerup', this.up, { passive: true })
    this.target['addEventListener']('pointercancel', this.up, { passive: true })
  }
  emit(name, event, dx = 0, dy = 0) {
    this.dx = dx
    this.dy = dy
    this.event = event
    if (core.isfn(this.vars[name])) this.vars[name].call(this, this, event)
    if (core.isfn(this.vars.onchange)) this.vars.onchange.call(this, this, event)
  }
  wheel(event) {
    if (!this.enabled) return
    if (this.vars.preventdefault && event.cancelable) event['preventDefault']()
    const dx = event['deltaX'] || 0
    const dy = event['deltaY'] || 0
    if (core.math.abs(dy) >= (this.vars.tolerance || 0)) this.emit(dy < 0 ? 'onup' : 'ondown', event, dx, dy)
    if (core.math.abs(dx) >= (this.vars.tolerance || 0)) this.emit(dx < 0 ? 'onleft' : 'onright', event, dx, dy)
    this.emit('onwheel', event, dx, dy)
  }
  down(event) {
    if (!this.enabled) return
    this.active = true
    this.x = event['clientX']
    this.y = event['clientY']
    this.emit('onpress', event)
  }
  move(event) {
    if (!this.active || !this.enabled) return
    if (this.vars.preventdefault && event.cancelable) event['preventDefault']()
    const dx = event['clientX'] - this.x
    const dy = event['clientY'] - this.y
    const tolerance = this.vars.tolerance || 4
    this.emit('ondrag', event, dx, dy)
    if (core.math.abs(dx) >= tolerance) {
      this.emit(dx < 0 ? 'onleft' : 'onright', event, dx, dy)
      this.x = event['clientX']
    }
    if (core.math.abs(dy) >= tolerance) {
      this.emit(dy < 0 ? 'onup' : 'ondown', event, dx, dy)
      this.y = event['clientY']
    }
  }
  up(event) {
    if (!this.active) return
    this.active = false
    this.emit('onrelease', event)
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
    this.target['removeEventListener']('wheel', this.wheel)
    this.target['removeEventListener']('pointerdown', this.down)
    this.target['removeEventListener']('pointermove', this.move)
    this.target['removeEventListener']('pointerup', this.up)
    this.target['removeEventListener']('pointercancel', this.up)
    return this
  }
}

const plugin = {
  name: 'AdvancedGestures',
  register(twexom, internals) {
    core = internals
    basedown = core.gesture.prototype.down
    baseup = core.gesture.prototype.up
    core.gesture.prototype.down = function(event) {
      ensure(this)
      basedown.call(this, event)
      if (!this.active) return
      const state = this.advanced
      const rect = this.target['getBoundingClientRect']()
      state.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      state.angle = angle(event, state.center)
      state.rotation = core.transformstate(this.target).rotation
      state.time = core.root['performance'].now()
    }
    core.gesture.prototype.move = function(event) {
      if (!this.active || event['pointerId'] !== this.pointer) return
      const state = core.transformstate(this.target)
      const extra = ensure(this)
      const type = this.vars.type || 'x,y'
      if (type === 'rotation') {
        const next = angle(event, extra.center)
        const delta = next - extra.angle
        const now = core.root['performance'].now()
        extra.velocity = delta / core.math.max(0.008, (now - extra.time) / 1000)
        extra.time = now
        extra.angle = next
        state.rotation += delta
        snaptarget(this, state, true)
        core.writetransform(this.target)
        if (!this.moved) {
          this.moved = true
          this.emit('ondragstart', event)
        }
        this.emit('ondrag', event)
        return
      }
      const resistance = this.vars.edgeresistance || 0
      const rawx = type.includes('x') ? this.x + event['clientX'] - this.px : this.x
      const rawy = type.includes('y') ? this.y + event['clientY'] - this.py : this.y
      const clamp = (value, min, max) => {
        if (value < min) return min + (value - min) * (1 - resistance)
        if (value > max) return max + (value - max) * (1 - resistance)
        return value
      }
      const nextx = core.bound(clamp(rawx, this.bounds.minx, this.bounds.maxx), this.bounds.minx - (resistance ? 100 : 0), this.bounds.maxx + (resistance ? 100 : 0))
      const nexty = core.bound(clamp(rawy, this.bounds.miny, this.bounds.maxy), this.bounds.miny - (resistance ? 100 : 0), this.bounds.maxy + (resistance ? 100 : 0))
      const now = core.root['performance'].now()
      const delta = core.math.max(0.008, (now - this.lasttime) / 1000)
      this.vx = this.vx * 0.65 + (nextx - this.lastx) / delta * 0.35
      this.vy = this.vy * 0.65 + (nexty - this.lasty) / delta * 0.35
      state.x = nextx
      state.y = nexty
      snaptarget(this, state, true)
      core.writetransform(this.target)
      this.lastx = state.x
      this.lasty = state.y
      this.lasttime = now
      if (!this.moved && core.math.abs(nextx - this.x) + core.math.abs(nexty - this.y) >= (this.vars.minimummovement || 0)) {
        this.moved = true
        this.emit('ondragstart', event)
      } else if (!this.moved && !(this.vars.minimummovement)) {
        this.moved = true
        this.emit('ondragstart', event)
      }
      this.emit('ondrag', event)
    }
    core.gesture.prototype.up = function(event) {
      if (!this.active || event['pointerId'] !== this.pointer) return
      const extra = ensure(this)
      const type = this.vars.type || 'x,y'
      if (type === 'rotation') {
        this.active = false
        this.target['releasePointerCapture']?.(this.pointer)
        const state = core.transformstate(this.target)
        if (this.vars.inertia || this.vars.throwprops) state.rotation += extra.velocity * 0.12
        snaptarget(this, state, false)
        if (this.vars.inertia || this.vars.throwprops || this.vars.snap) this.tween = new core.tween(this.target, { rotation: state.rotation, duration: this.vars.inertiaduration || 0.65, ease: 'power3.out' })
        this.emit('onrelease', event)
        if (this.moved) this.emit('ondragend', event)
        return
      }
      baseup.call(this, event)
      if (!this.vars.snap && !this.vars.inertiaduration) return
      if (this.tween) this.tween.kill()
      const state = core.transformstate(this.target)
      if (this.vars.inertia || this.vars.throwprops) {
        state.x += this.vx * 0.08
        state.y += this.vy * 0.08
      }
      state.x = core.bound(state.x, this.bounds.minx, this.bounds.maxx)
      state.y = core.bound(state.y, this.bounds.miny, this.bounds.maxy)
      snaptarget(this, state, false)
      this.tween = new core.tween(this.target, { x: state.x, y: state.y, duration: this.vars.inertiaduration || 0.65, ease: 'power3.out' })
    }
    twexom['Observer'] = { create: vars => new observer(vars) }
    twexom['Draggable'] = { create: (targets, vars) => core.resolve(targets).map(target => new core.gesture(target, vars)) }
  }
}

export { plugin, plugin as gesturesplugin, observer }
export default plugin
