let core = null

const getrule = selector => {
  if (!core.doc || !selector) return null
  const sheets = core.list.from(core.doc['styleSheets'])
  for (let index = sheets.length - 1; index >= 0; index--) {
    try {
      const rules = core.list.from(sheets[index]['cssRules'] || [])
      for (let rule = rules.length - 1; rule >= 0; rule--) {
        if (rules[rule]['selectorText'] === selector) return rules[rule].style
      }
    } catch (error) {}
  }
  return null
}

const plugin = {
  name: 'CSSRule',
  register(twexom, internals) {
    core = internals
    twexom['CSSRulePlugin'] = { 'getRule': getrule }
  }
}

export { plugin, plugin as cssplugin, getrule }
export default plugin
