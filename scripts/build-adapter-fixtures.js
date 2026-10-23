import { compile } from 'svelte/compiler'
import { readFile, writeFile } from 'node:fs/promises'

const filename = 'tests/fixtures/svelte-source.svelte'
const source = await readFile(filename, 'utf8')
const result = compile(source, {
  filename,
  generate: 'client',
  css: 'injected',
  dev: true
})
await writeFile('tests/fixtures/svelte-component.js', result.js.code + '\n')
console.log('Compiled the Svelte adapter test host.')
