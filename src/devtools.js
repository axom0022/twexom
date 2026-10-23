let core = null
let api = null

class debugpanel {
  constructor(vars = {}) {
    if (!core.doc) return
    this.vars = core.lower(vars)
    this.paused = []
    this.last = 0
    this.element = core.doc['createElement']('div')
    this.element.style['cssText'] = 'position:fixed;z-index:99999;right:12px;bottom:12px;width:230px;padding:12px;border:1px solid #444;border-radius:6px;color:#eee;background:#111;font:11px monospace;box-shadow:0 8px 30px #0006'
    this.header = core.doc['createElement']('div')
    this.header['textContent'] = 'TWEXOM DEBUG'
    this.header.style['cssText'] = 'margin-bottom:10px;color:#c7ff4a;font-weight:bold'
    this.stats = core.doc['createElement']('pre')
    this.stats.style['cssText'] = 'margin:0 0 10px;white-space:pre-wrap'
    this.controls = core.doc['createElement']('div')
    this.button('PAUSE', () => this.pause())
    this.button('RESUME', () => this.resume())
    this.button('STEP', () => this.step())
    this.element['appendChild'](this.header)
    this.element['appendChild'](this.stats)
    this.element['appendChild'](this.controls)
    core.doc.body['appendChild'](this.element)
    this.update = this.update.bind(this)
    core.ticker.add(this.update)
    this.render()
  }
  button(label, callback) {
    const button = core.doc['createElement']('button')
    button['textContent'] = label
    button.style['cssText'] = 'margin:0 4px 0 0;padding:4px 6px;border:1px solid #555;background:#222;color:#eee;font:9px monospace;cursor:pointer'
    button['addEventListener']('click', callback)
    this.controls['appendChild'](button)
  }
  pause() {
    this.paused = core.list.from(core.roots)
    this.paused['forEach'](item => item.pause())
    this.render()
    return this
  }
  resume() {
    this.paused['forEach'](item => item.play())
    this.paused = []
    return this
  }
  step() {
    this.paused['forEach'](item => item.render(item.now + 1 / 60))
    this.render()
    return this
  }
  update() {
    const now = core.root['performance'].now()
    if (now - this.last > 250) {
      this.last = now
      this.render()
    }
  }
  render() {
    if (!this.stats) return
    const elapsed = core.settings.elapsed
    this.stats['textContent'] = `version  ${api.version}\nactive   ${core.roots.size}\nanimations ${core.living.size}\nframes   ${core.settings.frames}\nframe    ${elapsed['toFixed'](1)}ms\nfps      ${elapsed ? (1000 / elapsed)['toFixed'](1) : '—'}`
  }
  kill() {
    core.ticker.remove(this.update)
    if (this.element) this.element.remove()
    return this
  }
}
const plugin = {
  name: 'DevTools',
  register(twexom, internals) {
    core = internals
    api = twexom
    twexom.debug = vars => new debugpanel(vars)
    twexom['DevTools'] = { create: vars => new debugpanel(vars) }
  }
}

export { plugin, plugin as devtoolsplugin, debugpanel }
export default plugin
