let core = null

class splittext {
  constructor(targets, vars = {}) {
    this.vars = core.lower(vars)
    this.elements = core.resolve(targets)
    this.chars = []
    this.words = []
    this.lines = []
    this.records = []
    this.elements['forEach'](element => this.split(element))
  }
  split(element) {
    const original = element['textContent'] || ''
    this.records.push({ element, html: element['innerHTML'] })
    element['setAttribute']('aria-label', original)
    element['textContent'] = ''
    const types = this.vars.type || 'chars,words,lines'
    const words = original.split(/(\s+)/)
    const wordelements = []
    words['forEach'](part => {
      if (!part) return
      if (/^\s+$/.test(part)) {
        element['appendChild'](core.doc['createTextNode'](part))
        return
      }
      const word = core.doc['createElement']('span')
      word.style.display = 'inline-block'
      word.style['whiteSpace'] = 'pre'
      if (this.vars.wordsclass) word['className'] = this.vars.wordsclass
      if (types.includes('chars')) {
        listfrom(part)['forEach'](character => {
          const span = core.doc['createElement']('span')
          span.style.display = 'inline-block'
          span['textContent'] = character
          if (this.vars.charsclass) span['className'] = this.vars.charsclass
          word['appendChild'](span)
          this.chars.push(span)
        })
      } else {
        word['textContent'] = part
      }
      element['appendChild'](word)
      this.words.push(word)
      wordelements.push(word)
    })
    if (types.includes('lines') && wordelements.length) {
      const groups = []
      wordelements['forEach'](word => {
        const top = word['offsetTop']
        let group = groups.find(item => item.top === top)
        if (!group) {
          group = { top, words: [] }
          groups.push(group)
        }
        group.words.push(word)
      })
      groups['forEach'](group => {
        const line = core.doc['createElement']('span')
        line.style.display = 'block'
        if (this.vars.linesclass) line['className'] = this.vars.linesclass
        element['insertBefore'](line, group.words[0])
        group.words['forEach']((word, index) => {
          if (index) line['appendChild'](core.doc['createTextNode'](' '))
          line['appendChild'](word)
        })
        this.lines.push(line)
      })
    }
    return this
  }
  revert() {
    this.records['forEach'](record => {
      record.element['innerHTML'] = record.html
      record.element['removeAttribute']('aria-label')
    })
    this.chars = []
    this.words = []
    this.lines = []
    return this
  }
}
const listfrom = value => core.list.from(value)
const textvalue = (value, fallback) => {
  if (value === undefined) return fallback
  if (core.isobj(value)) return value.value === undefined ? fallback : core.text(value.value)
  return core.text(value)
}
const texteffect = (target, values) => {
  const current = target['textContent'] || ''
  const first = values.mode === 'to' ? current : textvalue(values.start, current)
  const last = values.mode === 'from' ? current : textvalue(values.end, current)
  return {
    render(progress) {
      const count = core.math.round(last.length * progress)
      target['textContent'] = last.slice(0, count)
    }
  }
}
const characters = value => {
  if (value === '01') return '01'
  if (value === 'uppercase' || value === 'upperCase') return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (value === 'lowercase' || value === 'lowerCase') return 'abcdefghijklmnopqrstuvwxyz'
  return value || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
}
const scrambleeffect = (target, values) => {
  const current = target['textContent'] || ''
  const source = values.mode === 'from' ? values.start : values.end
  const vars = core.isobj(source) ? core.lower(source) : { text: source }
  const last = core.text(vars.text === undefined ? current : vars.text)
  const first = values.mode === 'from' ? core.text(values.start && values.start.text || current) : current
  const set = characters(vars.chars)
  const reveal = vars.revealdelay || 0
  return {
    render(progress) {
      const adjusted = core.bound((progress - reveal) / (1 - reveal || 1))
      const count = core.math.floor(last.length * adjusted)
      let output = last.slice(0, count)
      for (let index = count; index < last.length; index++) {
        if (/\s/.test(last[index])) output += last[index]
        else {
          const seed = core.math.abs(core.math.sin((index + 1) * 91.7 + progress * 137.3) * 10000)
          output += set[core.math.floor(seed) % set.length]
        }
      }
      target['textContent'] = output || first.slice(0, core.math.floor(first.length * (1 - adjusted)))
    }
  }
}
const plugin = {
  name: 'Text',
  register(twexom, internals) {
    core = internals
    core.registereffect('text', texteffect)
    core.registereffect('scrambleText', scrambleeffect)
    twexom['SplitText'] = splittext
    twexom['TextPlugin'] = { split: (targets, vars) => new splittext(targets, vars) }
    twexom['ScrambleTextPlugin'] = { chars: characters }
  }
}

export { plugin, plugin as textplugin, splittext }
export default plugin
