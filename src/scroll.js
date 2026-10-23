let core = null
let api = null
let baserefresh = null
let baseupdate = null
let basekill = null

const emit = (scene, name) => {
  const callback = scene.vars[name]
  if (core.isfn(callback)) callback.call(scene, scene)
}
const ensure = scene => {
  if (scene.advanced) return scene.advanced
  scene.advanced = { pin: null, spacer: null, original: null, state: '', snapcall: null, snapdelay: null, measuring: false }
  scene.advanced.pin = scene.vars.pin ? (scene.vars.pin === true ? scene.trigger : core.one(scene.vars.pin)) : null
  return scene.advanced
}
const restorepin = scene => {
  const state = ensure(scene)
  const pin = state.pin
  if (!pin || !state.original) return
  pin.style['cssText'] = state.original.style
  state.original.parent['insertBefore'](pin, state.original.next)
  if (state.spacer && state.spacer['parentNode']) state.spacer['parentNode']['removeChild'](state.spacer)
  state.spacer = null
  state.original = null
  state.state = ''
}
const preparepin = scene => {
  const state = ensure(scene)
  const pin = state.pin
  if (!pin || state.original || !pin['parentNode']) return
  const rect = pin['getBoundingClientRect']()
  const computed = core.root['getComputedStyle'](pin)
  const spacer = core.doc['createElement']('div')
  const distance = mathmax(0, scene.end - scene.start)
  spacer.style.position = 'relative'
  spacer.style.width = rect.width + 'px'
  spacer.style.height = rect.height + (scene.vars.pinspacing === false ? 0 : distance) + 'px'
  spacer.style['marginTop'] = computed['marginTop']
  spacer.style['marginRight'] = computed['marginRight']
  spacer.style['marginBottom'] = computed['marginBottom']
  spacer.style['marginLeft'] = computed['marginLeft']
  spacer.style['pointerEvents'] = 'none'
  const parent = pin['parentNode']
  const next = pin['nextSibling']
  const style = pin.style['cssText']
  parent['insertBefore'](spacer, pin)
  spacer['appendChild'](pin)
  state.spacer = spacer
  state.original = { parent, next, style }
  state.left = rect.left
  state.width = rect.width
  state.height = rect.height
  state.distance = distance
  const parts = core.text(scene.vars.start || 'top top').trim().split(/\s+/)
  const offset = parts[1] || '0'
  state.top = offset['endsWith']('%') ? core.float(offset) / 100 * scene.view() : core.float(offset) || 0
  pin.style.width = state.width + 'px'
  pin.style.height = state.height + 'px'
  pin.style['boxSizing'] = 'border-box'
  pin.style['pointerEvents'] = 'auto'
}
const mathmax = (first, second) => core.math.max(first, second)
const pinupdate = scene => {
  const state = ensure(scene)
  const pin = state.pin
  if (!pin || !state.original) return
  const position = scene.position()
  const next = position < scene.start ? 'before' : position >= scene.end ? 'after' : 'active'
  if (next === state.state) return
  state.state = next
  if (next === 'active') {
    pin.style.position = 'fixed'
    pin.style.top = state.top + 'px'
    pin.style.left = state.left + 'px'
  } else {
    pin.style.position = 'absolute'
    pin.style.top = (next === 'after' ? state.distance : 0) + 'px'
    pin.style.left = '0px'
  }
}
const setscroll = (scene, value) => {
  if (scene.proxy) {
    const callback = scene.horizontal ? scene.proxy.scrollleft || scene.proxy['scrollLeft'] : scene.proxy.scrolltop || scene.proxy['scrollTop']
    if (core.isfn(callback)) {
      callback(value)
      return
    }
  }
  if (scene.scroller) {
    if (scene.horizontal) scene.scroller['scrollLeft'] = value
    else scene.scroller['scrollTop'] = value
  } else if (scene.horizontal) {
    core.root['scrollTo'](value, core.root['scrollY'] || 0)
  } else {
    core.root['scrollTo'](core.root['scrollX'] || 0, value)
  }
}
const snapvalue = (scene, progress) => {
  const config = core.isobj(scene.vars.snap) ? core.lower(scene.vars.snap) : {}
  const rule = config.snapto === undefined ? scene.vars.snap : config.snapto
  if (core.isfn(rule)) return rule(progress)
  if (core.list['isArray'](rule)) return rule.reduce((closest, item) => core.math.abs(item - progress) < core.math.abs(closest - progress) ? item : closest, rule[0])
  if (rule === 'labels' && scene.animation && scene.animation.labels) {
    const labels = core.dict.keys(scene.animation.labels).map(name => scene.animation.labels[name] / scene.animation.size)
    return labels.reduce((closest, item) => core.math.abs(item - progress) < core.math.abs(closest - progress) ? item : closest, labels[0])
  }
  const increment = core.float(rule) || 1
  return core.math.round(progress / increment) * increment
}
const runsnap = scene => {
  const state = ensure(scene)
  const progress = core.bound(snapvalue(scene, scene.progress))
  const destination = scene.start + (scene.end - scene.start) * progress
  if (state.snapcall) state.snapcall.kill()
  const config = core.isobj(scene.vars.snap) ? core.lower(scene.vars.snap) : {}
  const value = { position: scene.position() }
  state.snapcall = new core.tween(value, {
    position: destination,
    duration: config.duration || 0.28,
    delay: config.delay || 0,
    ease: config.ease || 'power2.out',
    onupdate: () => setscroll(scene, value.position)
  })
}
const schedulesnap = scene => {
  const state = ensure(scene)
  if (!scene.vars.snap) return
  if (state.snapdelay) core.root['clearTimeout'](state.snapdelay)
  state.snapdelay = core.root['setTimeout'](() => runsnap(scene), 90)
}
const action = (scene, index) => {
  if (!scene.vars.toggleactions) return
  const actions = core.text(scene.vars.toggleactions).split(/\s+/)
  const animation = scene.animation
  if (!animation) return
  const name = actions[index] || 'none'
  if (name === 'play') animation.play()
  else if (name === 'pause') animation.pause()
  else if (name === 'resume') animation.resume()
  else if (name === 'reverse') animation.reverse()
  else if (name === 'restart') animation.restart()
  else if (name === 'reset') animation.pause().seek(0)
  else if (name === 'complete') animation.pause().seek(animation.span())
}
const callbacks = (scene, previous) => {
  const progress = scene.progress
  if (previous === progress) return
  if (previous <= 0 && progress > 0) {
    emit(scene, 'onenter')
    action(scene, 0)
  }
  if (previous < 1 && progress >= 1) {
    emit(scene, 'onleave')
    action(scene, 1)
  }
  if (previous >= 1 && progress < 1) {
    emit(scene, 'onenterback')
    action(scene, 2)
  }
  if (previous > 0 && progress <= 0) {
    emit(scene, 'onleaveback')
    action(scene, 3)
  }
  if ((previous === 0 || previous === 1) !== (progress === 0 || progress === 1)) emit(scene, 'ontoggle')
}

const scrolltoeffect = (target, values) => {
  const source = values.mode === 'from' ? values.start : values.end
  const vars = core.isobj(source) ? core.lower(source) : { y: source }
  const element = target === core.root ? null : target
  const startx = element ? element['scrollLeft'] || 0 : core.root['scrollX'] || 0
  const starty = element ? element['scrollTop'] || 0 : core.root['scrollY'] || 0
  const maximum = (horizontal) => {
    if (!element) return horizontal ? core.doc['documentElement']['scrollWidth'] - core.root['innerWidth'] : core.doc['documentElement']['scrollHeight'] - core.root['innerHeight']
    return horizontal ? element['scrollWidth'] - element['clientWidth'] : element['scrollHeight'] - element['clientHeight']
  }
  const destination = (value, start, horizontal) => {
    if (value === undefined) return start
    if (value === 'max') return core.math.max(0, maximum(horizontal))
    return core.float(value) || 0
  }
  const endx = destination(vars.x, startx, true)
  const endy = destination(vars.y, starty, false)
  return {
    render(progress) {
      const x = startx + (endx - startx) * progress
      const y = starty + (endy - starty) * progress
      if (element) {
        element['scrollLeft'] = x
        element['scrollTop'] = y
      } else {
        core.root['scrollTo'](x, y)
      }
    }
  }
}

class normalizer {
  constructor(vars = {}) {
    this.vars = core.lower(vars)
    this.target = core.one(this.vars.target) || core.doc
    this.y = 0
    this.scroll = 0
    this.enabled = true
    this.start = this.start.bind(this)
    this.move = this.move.bind(this)
    this.target['addEventListener']('touchstart', this.start, { passive: true })
    this.target['addEventListener']('touchmove', this.move, { passive: false })
  }
  start(event) {
    if (!this.enabled || !event.touches[0]) return
    this.y = event.touches[0]['clientY']
    this.scroll = core.root['scrollY'] || 0
  }
  move(event) {
    if (!this.enabled || !event.touches[0]) return
    if (this.vars.preventdefault !== false && event.cancelable) event['preventDefault']()
    const next = this.scroll + this.y - event.touches[0]['clientY']
    core.root['scrollTo'](0, core.math.max(0, next))
  }
  enable() {
    this.enabled = true
    return this
  }
  disable() {
    this.enabled = false
    return this
  }
  kill() {
    this.target['removeEventListener']('touchstart', this.start)
    this.target['removeEventListener']('touchmove', this.move)
    return this
  }
}

class smoother {
  constructor(vars = {}) {
    this.vars = core.lower(vars)
    this.wrapper = core.one(this.vars.wrapper)
    this.content = core.one(this.vars.content)
    if (!this.wrapper || !this.content) return
    this.original = this.content.style['cssText']
    this.spacer = core.doc['createElement']('div')
    this.content['parentNode']['insertBefore'](this.spacer, this.content)
    this.content.style.position = 'fixed'
    this.content.style.top = '0px'
    this.content.style.left = '0px'
    this.content.style.width = '100%'
    this.content.style['willChange'] = 'transform'
    this.state = { y: 0 }
    this.update = this.update.bind(this)
    this.refresh = this.refresh.bind(this)
    core.root['addEventListener']('scroll', this.update, { passive: true })
    core.root['addEventListener']('resize', this.refresh, { passive: true })
    this.refresh()
  }
  refresh() {
    if (!this.content) return this
    this.spacer.style.height = this.content['scrollHeight'] + 'px'
    this.update()
    return this
  }
  update() {
    if (this.tween) this.tween.kill()
    this.tween = new core.tween(this.state, {
      y: -(core.root['scrollY'] || 0),
      duration: this.vars.smooth || 0.8,
      ease: 'power2.out',
      onupdate: () => {
        this.content.style.transform = `translate3d(0, ${this.state.y}px, 0)`
      }
    })
    return this
  }
  scrolltop(value) {
    core.root['scrollTo'](0, value)
    return this
  }
  kill() {
    if (this.tween) this.tween.kill()
    core.root['removeEventListener']('scroll', this.update)
    core.root['removeEventListener']('resize', this.refresh)
    if (this.content) {
      this.content.style['cssText'] = this.original
      if (this.spacer['parentNode']) this.spacer['parentNode']['removeChild'](this.spacer)
    }
    return this
  }
}

const plugin = {
  name: 'AdvancedScroll',
  register(twexom, internals) {
    api = twexom
    core = internals
    core.registereffect('scrollTo', scrolltoeffect)
    baserefresh = core.scrollscene.prototype.refresh
    baseupdate = core.scrollscene.prototype.update
    basekill = core.scrollscene.prototype.kill
    core.scrollscene.prototype.refresh = function() {
      const state = ensure(this)
      restorepin(this)
      if (this.animation && this.vars.invalidateonrefresh && this.animation.invalidate) this.animation.invalidate()
      const result = baserefresh.call(this)
      preparepin(this)
      pinupdate(this)
      emit(this, 'onrefresh')
      return result
    }
    core.scrollscene.prototype.update = function() {
      const state = ensure(this)
      if (this.vars.containeranimation && !state.measuring) {
        state.measuring = true
        baserefresh.call(this)
        state.measuring = false
      }
      const previous = this.progress
      const result = baseupdate.call(this)
      pinupdate(this)
      callbacks(this, previous)
      schedulesnap(this)
      return result
    }
    core.scrollscene.prototype.kill = function() {
      const state = ensure(this)
      if (state.snapdelay) core.root['clearTimeout'](state.snapdelay)
      if (state.snapcall) state.snapcall.kill()
      restorepin(this)
      return basekill.call(this)
    }
    twexom['ScrollToPlugin'] = { effect: scrolltoeffect }
    twexom['normalizeScroll'] = vars => new normalizer(vars)
    twexom['ScrollTrigger'] = {
      create: vars => new core.scrollscene(vars),
      refresh: () => core.scrolls['forEach'](scene => scene.refresh()),
      update: () => core.scrolls['forEach'](scene => scene.update()),
      'getAll': () => core.list.from(core.scrolls)
    }
    twexom['ScrollSmoother'] = { create: vars => new smoother(vars) }
  }
}

export { plugin, plugin as scrollplugin, normalizer, smoother }
export default plugin
