import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/twexom.js', import.meta.url), 'utf8')
mkdirSync(new URL('../public/', import.meta.url), { recursive: true })
writeFileSync(new URL('../public/twexom.js', import.meta.url), source)
