import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const packageFile = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const manifest = JSON.parse(await readFile(new URL('../dist/release-manifest.json', import.meta.url), 'utf8'))
const version = packageFile.version
const files = manifest.files.filter(item => item.file.endsWith('.js') || item.file.endsWith('.cjs')).map(item => item.file.replace(/^dist\//, ''))
const cdn = {
  package: packageFile.name,
  version,
  jsdelivr: `https://cdn.jsdelivr.net/npm/${packageFile.name}@${version}/dist/`,
  unpkg: `https://unpkg.com/${packageFile.name}@${version}/dist/`,
  files
}
await mkdir(new URL('../release/', import.meta.url), { recursive: true })
await writeFile(new URL('../release/cdn.json', import.meta.url), JSON.stringify(cdn, null, 2) + '\n')
console.log(`Prepared CDN metadata for ${packageFile.name}@${version}`)
console.log(`jsDelivr: ${cdn.jsdelivr}twexom.min.esm.js`)
console.log(`unpkg: ${cdn.unpkg}twexom.min.iife.js`)

if (process.argv.includes('--publish')) {
  const result = spawnSync('npm', ['publish', '--access', 'public'], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
} else {
  console.log('Dry run only. Run npm run release:cdn -- --publish after validating the package and npm credentials.')
}
