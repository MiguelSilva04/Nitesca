// Runs after `vite build`. Social and search crawlers don't execute JS, so each language needs
// its own static HTML. From dist/index.html (Portuguese) this writes:
//   dist/index.html      PT, with JSON-LD filled in
//   dist/en/index.html   EN, every data-i18n / data-i18n-attr string swapped from the dictionary
//   dist/sitemap.xml     both URLs with hreflang alternates
//   dist/404.html        noindex, bilingual
//   dist/llms.txt        plain-language summary for AI agents (llmstxt.org)
// The stylesheet is inlined into both pages: it's ~4.5 KB gzipped and saves a render-blocking request.
// It fails the build if any tagged string can't be translated, so a page never ships half-translated.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dict } from '../src/i18n/dictionary.js'

const DIST = new URL('../dist/', import.meta.url)
const ORIGIN = 'https://nitesca.com'
const template = readFileSync(new URL('index.html', DIST), 'utf8')
const cssTag = template.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/)
if (!cssTag) { console.error('prerender: no stylesheet link in dist/index.html'); process.exit(1) }
const inlineCss = `<style>${readFileSync(new URL('.' + cssTag[1], DIST), 'utf8')}</style>`

const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)
const esc = v => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const fail = msg => { console.error(`prerender: ${msg}`); process.exit(1) }

function str(tr, key, lang) {
  const v = get(tr, key)
  if (typeof v !== 'string') fail(`"${key}" is not a string in ${lang}`)
  return v
}

function jsonLd(tr) {
  const offers = Object.values(tr.services.packages).map(p => {
    const min = Number((p.price.match(/\d+/) || [])[0])
    return {
      '@type': 'Offer',
      name: p.name,
      description: p.desc,
      ...(min ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: min, priceCurrency: 'EUR' } } : {}),
    }
  })
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Nitesca',
    url: tr.meta.url,
    description: tr.meta.description,
    inLanguage: tr.meta.htmlLang,
    image: tr.meta.ogImage,
    makesOffer: offers,
  }
  return JSON.stringify(data).replace(/</g, '\\u003c') // never close the <script> early
}

function render(lang) {
  const tr = dict[lang]
  let html = template
  const expected = (html.match(/\sdata-i18n="/g) || []).length
  let done = 0
  // Leaf elements only (text, no child tags) — that's how index.html is written.
  html = html.replace(/<([a-z][a-z0-9]*)((?:\s[^>]*?)?\sdata-i18n="([^"]+)"[^>]*)>([^<]*)<\/\1>/g, (m, tag, attrs, key) => {
    done++
    return `<${tag}${attrs}>${esc(str(tr, key, lang))}</${tag}>`
  })
  if (done !== expected) fail(`${lang}: translated ${done} of ${expected} data-i18n elements (one has child tags?)`)

  html = html.replace(/<[^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g, (tag, spec) => {
    for (const pair of spec.split(';')) {
      const [attr, key] = pair.split(':')
      const re = new RegExp(`(\\s${attr}=")[^"]*(")`)
      if (!re.test(tag)) fail(`${lang}: <${tag.slice(1, 30)}…> has no ${attr}="" to translate`)
      tag = tag.replace(re, `$1${esc(str(tr, key, lang))}$2`)
    }
    return tag
  })

  html = html
    .replace('<html lang="pt-PT">', `<html lang="${tr.meta.htmlLang}">`)
    .replace(/<script type="application\/ld\+json" data-jsonld>[^<]*<\/script>/, `<script type="application/ld+json" data-jsonld>${jsonLd(tr)}</script>`)
  html = html.replace(cssTag[0], inlineCss)
  if (lang !== 'pt') {
    html = html
      .replace('data-lang="pt" aria-current="page"', 'data-lang="pt"')
      .replace('data-lang="en"', 'data-lang="en" aria-current="page"')
  }
  if (tr.meta.title.length > 60) console.warn(`prerender: ${lang} <title> is ${tr.meta.title.length} chars (Google cuts ~60)`)
  if (tr.meta.description.length > 160) console.warn(`prerender: ${lang} description is ${tr.meta.description.length} chars (keep ≤ 160)`)
  return html
}

writeFileSync(new URL('index.html', DIST), render('pt'))
mkdirSync(new URL('en/', DIST), { recursive: true })
writeFileSync(new URL('en/index.html', DIST), render('en'))

const today = new Date().toISOString().slice(0, 10)
const alternates = ['<xhtml:link rel="alternate" hreflang="pt-PT" href="' + ORIGIN + '/"/>',
  '<xhtml:link rel="alternate" hreflang="en" href="' + ORIGIN + '/en/"/>',
  '<xhtml:link rel="alternate" hreflang="x-default" href="' + ORIGIN + '/"/>'].join('\n    ')
writeFileSync(new URL('sitemap.xml', DIST), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['/', '/en/'].map(path => `  <url>
    <loc>${ORIGIN}${path}</loc>
    <lastmod>${today}</lastmod>
    ${alternates}
  </url>`).join('\n')}
</urlset>
`)

// 404: same stylesheet (fonts, colours, buttons), no JS, both languages.
const css = cssTag[1]
writeFileSync(new URL('404.html', DIST), `<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Página não encontrada · Page not found — Nitesca</title>
<meta name="theme-color" content="#16333A">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" crossorigin href="${css}">
</head>
<body>
<main style="min-height:100vh;max-width:720px;margin:0 auto;padding:clamp(56px,14vh,160px) var(--pad);display:flex;flex-direction:column;gap:24px">
  <p class="eyebrow" style="color:var(--sage)">404</p>
  <h1 class="h2">Esta página não existe.</h1>
  <p class="lead" lang="en" style="color:var(--sage)">This page doesn’t exist.</p>
  <div class="btns" style="margin-top:16px">
    <a class="btn btn-solid" href="/">Voltar ao início</a>
    <a class="btn btn-ghost" href="/en/" lang="en">Back to home</a>
  </div>
</main>
</body>
</html>
`)
// llms.txt — generated from the dictionary so prices and copy never drift from the site.
const pt = dict.pt, en = dict.en
const pkgLines = tr => Object.values(tr.services.packages).map(p => `- **${p.name}** (${/\d/.test(p.price) ? `${p.from} ${p.price}` : `${p.price}, ${p.from}`}): ${p.desc} ${p.items.join('; ')}.`).join('\n')
writeFileSync(new URL('llms.txt', DIST), `# Nitesca

> ${pt.meta.description} / ${en.meta.description}

${pt.hero.lead}

## Páginas / Pages

- [Nitesca — português](${ORIGIN}/): ${pt.hero.eyebrow.toLowerCase()}
- [Nitesca — English](${ORIGIN}/en/): ${en.hero.eyebrow.toLowerCase()}

## ${pt.services.eyebrow.charAt(0) + pt.services.eyebrow.slice(1).toLowerCase()}

${pkgLines(pt)}

${pt.services.final} ${pt.services.note}

## ${en.services.eyebrow.charAt(0) + en.services.eyebrow.slice(1).toLowerCase()}

${pkgLines(en)}

${en.services.final} ${en.services.note}

## ${pt.process.title}

${pt.process.steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.text}`).join('\n')}

## Contacto / Contact

- [${pt.contact.title}](${ORIGIN}/#contacto)
- [${en.contact.title}](${ORIGIN}/en/#contacto)
`)
console.log(`prerender: wrote index.html, en/index.html, sitemap.xml, 404.html, llms.txt (stylesheet inlined)`)
