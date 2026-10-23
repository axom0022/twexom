import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const esm = await import('../dist/twexom.esm.js')
const all = await import('../dist/twexom-all.esm.js')
const require = createRequire(import.meta.url)
const cjs = require('../dist/twexom.cjs')
const engine = esm.default
const common = cjs.default || cjs.twexom
assert.equal(engine.version, '1.0.0')
assert.equal(common.version, engine.version)
assert.equal(typeof all.default.CustomEase.create, 'function')
assert.equal(typeof all.default.ScrollTrigger.create, 'function')
const packaged = await import('twexom')
const packagedAll = await import('twexom/all')
const packagedCommon = require('twexom')
assert.equal(packaged.default.version, engine.version)
assert.equal(packagedAll.default.version, engine.version)
assert.equal((packagedCommon.default || packagedCommon.twexom).version, engine.version)
await import('@angular/compiler')
for (const [name, exportName] of [['twexom/react', 'useTwexom'], ['twexom/vue', 'useTwexom'], ['twexom/svelte', 'twexom'], ['twexom/angular', 'TwexomDirective']]) {
  const adapter = await import(name)
  assert.ok(adapter[exportName], `${name} is missing ${exportName}`)
}
const target = { x: 0 }
const tween = engine.to(target, { x: 100, duration: 1, ease: 'linear', paused: true })
tween.seek(0.5)
assert.equal(target.x, 50)
tween.kill()
const manifest = JSON.parse(await readFile(new URL('../dist/release-manifest.json', import.meta.url), 'utf8'))
for (const name of ['twexom.esm.js', 'twexom.min.esm.js', 'twexom.iife.js', 'twexom.min.iife.js', 'twexom.cjs', 'twexom.min.cjs', 'twexom-all.min.esm.js', 'twexom-react.esm.js', 'twexom-vue.esm.js', 'twexom-svelte.esm.js', 'twexom-angular.esm.js']) {
  assert.ok(manifest.files.some(item => item.file === `dist/${name}`), name)
}
const browser = { console }
vm.createContext(browser)
vm.runInContext(await readFile(new URL('../dist/twexom.min.iife.js', import.meta.url), 'utf8'), browser)
assert.equal(browser.twexom.version, engine.version)
console.log('Release formats, package exports, adapter entry points, optional bundle and tween smoke checks passed.')
