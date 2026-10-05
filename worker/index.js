// Cloudflare Worker for nitesca.com. Static files are served straight from ./dist by the assets
// layer; only /api/* reaches this code (see "run_worker_first" in wrangler.jsonc).
//
// POST /api/contact — validates the contact form and emails it to CONTACT_TO through Resend.
// Needs the secret RESEND_API_KEY (Worker → Settings → Variables and Secrets) and nitesca.com
// verified as a sending domain in Resend.

const LIMITS = { nome: 100, email: 200, tipo: 150, mensagem: 5000 }
const MIN_FILL_MS = 3000 // humans don't fill and send the form in under 3 s
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
})
const oneLine = s => s.replace(/[\r\n]+/g, ' ').trim()

async function contact(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' })
  // Only the site's own pages may post here.
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json(403, { ok: false, error: 'origin' })
  if (Number(request.headers.get('Content-Length') || 0) > 20_000) return json(413, { ok: false, error: 'size' })

  if (env.CONTACT_LIMIT) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const { success } = await env.CONTACT_LIMIT.limit({ key: ip })
    if (!success) return json(429, { ok: false, error: 'rate' })
  }

  let data
  try { data = await request.json() } catch { return json(400, { ok: false, error: 'json' }) }
  const field = k => (typeof data?.[k] === 'string' ? data[k].trim() : '')
  const nome = field('nome'), email = field('email'), tipo = field('tipo'), mensagem = field('mensagem')
  const lang = data?.lang === 'en' ? 'en' : 'pt'

  // Bots: the hidden "website" field gets filled, or the form is sent impossibly fast.
  // Answer as if it worked so they don't learn to adapt.
  if (field('website') || !(Number(data?.elapsed) >= MIN_FILL_MS)) return json(200, { ok: true })

  if (!nome || !mensagem || !EMAIL_RE.test(email)) return json(400, { ok: false, error: 'fields' })
  for (const [k, max] of Object.entries(LIMITS)) if (field(k).length > max) return json(400, { ok: false, error: 'fields' })

  const text = [
    `Nome: ${nome}`,
    `Email: ${email}`,
    `Tipo de negócio: ${tipo || '—'}`,
    `Idioma do site: ${lang === 'en' ? 'inglês' : 'português'}`,
    '',
    mensagem,
    '',
    '—',
    'Enviado pelo formulário de contacto de nitesca.com. Responda a este email para responder diretamente ao cliente.',
  ].join('\n')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: oneLine(`Novo contacto: ${nome}${tipo ? ` (${tipo})` : ''}`).slice(0, 150),
      text,
    }),
  })
  if (!res.ok) {
    console.error('resend failed', res.status, await res.text())
    return json(502, { ok: false, error: 'send' })
  }
  return json(200, { ok: true })
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/contact') return contact(request, env)
    if (pathname.startsWith('/api/')) return json(404, { ok: false, error: 'not_found' })
    return env.ASSETS.fetch(request)
  },
}
