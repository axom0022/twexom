import { build } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'

const root = new URL('../', import.meta.url)
const output = new URL('../dist/', import.meta.url)
await mkdir(output, { recursive: true })

const libraries = [
  { input: 'src/twexom.js', name: 'twexom' },
  { input: 'src/all.js', name: 'twexom-all' }
]
const formats = [
  { format: 'esm', suffix: 'esm.js' },
  { format: 'iife', suffix: 'iife.js', globalName: 'Twexom' },
  { format: 'cjs', suffix: 'cjs' }
]
const manifest = []

for (const library of libraries) {
  for (const format of formats) {
    for (const minify of [false, true]) {
      const name = `${library.name}.${minify ? 'min.' : ''}${format.suffix}`
      await build({
        absWorkingDir: root.pathname,
        entryPoints: [library.input],
        outfile: `dist/${name}`,
        bundle: true,
        format: format.format,
        globalName: format.globalName,
        minify,
        sourcemap: true,
        target: ['es2020'],
        legalComments: 'none'
      })
      const data = await readFile(new URL(`../dist/${name}`, import.meta.url))
      manifest.push({ file: `dist/${name}`, format: format.format, minified: minify, bytes: data.length, gzip: gzipSync(data).byteLength })
    }
  }
}

const adapters = [
  { input: 'adapters/react.js', name: 'twexom-react', external: ['react'] },
  { input: 'adapters/vue.js', name: 'twexom-vue', external: ['vue'] },
  { input: 'adapters/svelte.js', name: 'twexom-svelte', external: [] },
  { input: 'adapters/angular.js', name: 'twexom-angular', external: ['@angular/core'] }
]
for (const adapter of adapters) {
  for (const format of ['esm', 'cjs']) {
    const name = `${adapter.name}.${format === 'esm' ? 'esm.js' : 'cjs'}`
    await build({
      absWorkingDir: root.pathname,
      entryPoints: [adapter.input],
      outfile: `dist/${name}`,
      bundle: true,
      format,
      external: adapter.external,
      sourcemap: true,
      target: ['es2020'],
      legalComments: 'none'
    })
    const data = await readFile(new URL(`../dist/${name}`, import.meta.url))
    manifest.push({ file: `dist/${name}`, format, adapter: adapter.name, bytes: data.length, gzip: gzipSync(data).byteLength })
  }
}

await writeFile(new URL('../dist/release-manifest.json', import.meta.url), JSON.stringify({ name: 'twexom', files: manifest }, null, 2) + '\n')
console.log(`Built ${manifest.length} release files in dist/`)
