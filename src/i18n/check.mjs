// Fails if the translations drift: pt and en must have identical keys and list lengths,
// and every data-i18n / data-i18n-attr path used in index.html must resolve to a string in both.
// Run: npm run check:i18n
import { readFileSync } from 'node:fs'
import { dict } from './dictionary.js'

const errors = []
function walk(a, b, path) {
  if (Array.isArray(a) !== Array.isArray(b) || typeof a !== typeof b) return errors.push(`${path}: type differs`)
  if (Array.isArray(a)) {
    if (a.length !== b.length) errors.push(`${path}: ${a.length} vs ${b.length} items`)
    return a.forEach((v, i) => b[i] !== undefined && walk(v, b[i], `${path}[${i}]`))
  }
  if (typeof a !== 'object' || a === null) {
    if (typeof a === 'string' && !a.trim()) errors.push(`${path}: empty string`)
    return
  }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (!(k in a)) errors.push(`${path}.${k}: missing in pt`)
    else if (!(k in b)) errors.push(`${path}.${k}: missing in en`)
    else walk(a[k], b[k], `${path}.${k}`)
  }
}
walk(dict.pt, dict.en, 'dict')

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
const keys = [
  ...[...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]),
  ...[...html.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap(m => m[1].split(';').map(p => p.split(':')[1])),
]
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)
for (const key of new Set(keys))
  for (const lang of ['pt', 'en'])
    if (typeof get(dict[lang], key) !== 'string') errors.push(`index.html uses "${key}", not a string in ${lang}`)

if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
console.log(`i18n ok: pt and en match, ${new Set(keys).size} keys used in index.html all resolve`)
