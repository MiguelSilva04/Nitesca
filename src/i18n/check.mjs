// Fails if pt and en drift apart: same keys everywhere, same array lengths. Run: npm run check:i18n
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
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
console.log('i18n ok: pt and en have identical structure')
