import { build } from 'esbuild'
import { gzipSync } from 'node:zlib'
import { mkdir, writeFile } from 'node:fs/promises'

const engines = [
  {
    name: 'twexom-baseline',
    global: 'benchTwexomBaseline',
    code: "import twexom from './benchmarks/twexom-baseline.js'; window.benchTwexomBaseline = twexom"
  },
  {
    name: 'twexom-current',
    global: 'benchTwexomCurrent',
    code: "import twexom from './src/twexom.js'; window.benchTwexomCurrent = twexom"
  },
  {
    name: 'gsap',
    global: 'benchGsap',
    code: "import { gsap } from 'gsap'; window.benchGsap = gsap"
  }
]

await mkdir('benchmarks/bundles', { recursive: true })
const manifest = []

for (const engine of engines) {
  const result = await build({
    stdin: {
      contents: engine.code,
      resolveDir: process.cwd(),
      sourcefile: `${engine.name}-entry.js`
    },
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    legalComments: 'none',
    write: false
  })
  const source = result.outputFiles[0].text
  await writeFile(`benchmarks/bundles/${engine.name}.js`, source)
  manifest.push({
    name: engine.name,
    global: engine.global,
    bytes: Buffer.byteLength(source),
    gzip: gzipSync(source).byteLength
  })
}

await writeFile('benchmarks/bundle-manifest.json', JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify(manifest, null, 2))
