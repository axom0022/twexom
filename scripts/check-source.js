import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'acorn'

const directory = new URL('../src/', import.meta.url).pathname
const files = readdirSync(directory).filter(file => file.endsWith('.js'))
let failed = false

for (const file of files) {
  const source = readFileSync(join(directory, file), 'utf8')
  const comments = []
  const tree = parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    locations: true,
    onComment: comments
  })
  if (comments.length) {
    failed = true
    console.error(`${file}: comments are not allowed`)
  }
  const visit = node => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'Identifier' && !/^[a-z][a-z0-9]*$/.test(node.name)) {
      failed = true
      console.error(`${file}:${node.loc.start.line}: invalid identifier ${node.name}`)
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object' && value.type) visit(value)
    }
  }
  visit(tree)
}

for (const file of readdirSync(directory).filter(file => file.endsWith('.css'))) {
  const source = readFileSync(join(directory, file), 'utf8')
  if (source.includes('/*')) {
    failed = true
    console.error(`${file}: comments are not allowed`)
  }
}

if (failed) process.exit(1)
console.log(`Source rules passed for ${files.length} JavaScript files.`)
