// Contact endpoint check, no network: Resend is stubbed. Run: npm run test:worker
import assert from 'node:assert/strict'
import worker from './index.js'

let sent = []
let failWhen = () => false // decide per message whether Resend "fails"
globalThis.fetch = async (url, init) => {
  const body = JSON.parse(init.body)
  sent.push({ url, body, auth: init.headers.Authorization })
  return new Response('{}', { status: failWhen(body) ? 500 : 200 })
}
console.error = () => {} // the failure cases log on purpose
const env = {
  RESEND_API_KEY: 're_test', CONTACT_TO: 'geral@nitesca.com',
  CONTACT_FROM: 'Nitesca · site <site@nitesca.com>', CONTACT_REPLY_FROM: 'Nitesca <geral@nitesca.com>',
  ASSETS: { fetch: () => new Response('static') },
}
const ORIGIN = 'https://nitesca.com'
const post = (body, headers = {}) => worker.fetch(new Request(`${ORIGIN}/api/contact`, {
  method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
}), env)
const good = { nome: 'Ana Silva', email: 'ana@example.com', tipo: 'Florista', mensagem: 'Olá!\nQueria um site.', website: '', lang: 'pt', elapsed: 9000 }
const status = async p => (await p).status

// Rejections send nothing
assert.equal(await status(worker.fetch(new Request(`${ORIGIN}/api/contact`), env)), 405, 'GET is rejected')
assert.equal(await status(post(good, { Origin: 'https://evil.example' })), 403, 'other origins are rejected')
assert.equal(await status(post({ ...good, email: 'not-an-email' })), 400, 'bad email')
assert.equal(await status(post({ ...good, mensagem: '   ' })), 400, 'empty message')
assert.equal(await status(post({ ...good, nome: 'x'.repeat(101) })), 400, 'name too long')
assert.equal(await status(post({ ...good, website: 'http://spam' })), 200, 'honeypot answers ok…')
assert.equal(await status(post({ ...good, elapsed: 500 })), 200, 'too-fast answers ok…')
assert.equal(sent.length, 0, '…and nothing was sent for any of the above')

// Valid PT submission: lead to the inbox + receipt to the client
const ok = await post(good)
assert.equal(ok.status, 200)
assert.deepEqual(await ok.json(), { ok: true })
assert.equal(sent.length, 2, 'two emails: lead + receipt')
const [lead, receipt] = sent.map(s => s.body)
assert.equal(sent[0].url, 'https://api.resend.com/emails')
assert.equal(sent[0].auth, 'Bearer re_test')

assert.deepEqual(lead.to, ['geral@nitesca.com'])
assert.equal(lead.reply_to, 'ana@example.com', 'replying to the lead reaches the client')
assert.equal(lead.subject, 'Novo contacto: Ana Silva (Florista)')
assert.match(lead.text, /Nome: Ana Silva\nEmail: ana@example\.com\nTipo de negócio: Florista/)
assert.match(lead.text, /Olá!\nQueria um site\./)
assert.equal(lead.headers['Auto-Submitted'], 'auto-generated', 'inbox autoresponders must not answer the lead')

assert.deepEqual(receipt.to, ['ana@example.com'], 'receipt goes to the address typed in the form')
assert.equal(receipt.from, 'Nitesca <geral@nitesca.com>', 'receipt comes from the real inbox')
assert.equal(receipt.reply_to, 'geral@nitesca.com')
assert.equal(receipt.subject, 'Recebemos a sua mensagem | Nitesca')
assert.match(receipt.text, /^Olá,\n\nObrigado por nos escrever/)
assert.match(receipt.text, /Miguel Silva e Tiago Candeias/)
assert.equal(receipt.headers['Auto-Submitted'], 'auto-replied')
for (const typed of ['Ana', 'Florista', 'Queria um site']) assert.ok(!receipt.text.includes(typed), `receipt never echoes user input ("${typed}")`)

// EN page → EN receipt
sent = []
await post({ ...good, lang: 'en' })
assert.equal(sent[1].body.subject, 'We received your message | Nitesca')
assert.match(sent[1].body.text, /^Hello,\n\nThank you for getting in touch/)
assert.match(sent[1].body.text, /Miguel Silva and Tiago Candeias/)

// Header injection attempt stays on one line
sent = []
await post({ ...good, nome: 'Bob\r\nBcc: x@y.z' })
assert.equal(sent[0].body.subject, 'Novo contacto: Bob Bcc: x@y.z (Florista)', 'no line breaks in the subject')

// Lead fails → error, and no receipt (the client must not be told it worked)
sent = []
failWhen = m => m.to[0] === 'geral@nitesca.com'
assert.equal(await status(post(good)), 502, 'lead failure is reported')
assert.equal(sent.length, 1, 'no receipt when the lead failed')

// Only the receipt fails → still a success: the lead reached the inbox
sent = []
failWhen = m => m.to[0] === 'ana@example.com'
assert.equal(await status(post(good)), 200, 'receipt failure does not fail the submission')
assert.equal(sent.length, 2)

// Turnstile configured: token required; a verified sender gets a copy of their message
failWhen = () => false
const tsEnv = { ...env, TURNSTILE_SECRET: 'ts_secret' }
const realFetch = globalThis.fetch
let verifyCalls = []
globalThis.fetch = async (url, init) => {
  if (String(url).includes('turnstile')) {
    const body = JSON.parse(init.body)
    verifyCalls.push(body)
    return Response.json({ success: body.response === 'good-token' && body.secret === 'ts_secret' })
  }
  return realFetch(url, init)
}
const postTs = body => worker.fetch(new Request(`${ORIGIN}/api/contact`, {
  method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' }, body: JSON.stringify(body),
}), tsEnv)

sent = []
assert.equal(await status(postTs(good)), 403, 'no token → rejected')
assert.equal(await status(postTs({ ...good, token: 'forged' })), 403, 'bad token → rejected')
assert.equal(sent.length, 0, 'failed checks send nothing')
assert.equal(verifyCalls.at(-1).remoteip, '203.0.113.7', 'visitor IP is passed to Turnstile')

const verifiedRes = await postTs({ ...good, token: 'good-token' })
assert.equal(verifiedRes.status, 200)
assert.equal(sent.length, 2)
const copy = sent[1].body.text
assert.match(copy, /— A sua mensagem —\n\nNome: Ana Silva\nEmail: ana@example\.com\nTipo de negócio: Florista\n\nOlá!\nQueria um site\.$/, 'verified receipt ends with a copy of the message')
assert.ok(copy.startsWith('Olá,\n\nObrigado por nos escrever'), 'copy comes after the normal receipt')
sent = []
await postTs({ ...good, lang: 'en', token: 'good-token' })
assert.match(sent[1].body.text, /— Your message —\n\nName: Ana Silva\nEmail: ana@example\.com\nType of business: Florista/)
globalThis.fetch = realFetch

// Routing
assert.equal(await (await worker.fetch(new Request(`${ORIGIN}/en/`), env)).text(), 'static', 'other paths go to the static site')
assert.equal(await status(worker.fetch(new Request(`${ORIGIN}/api/other`), env)), 404)
console.log('worker ok: validates, filters bots, emails the lead to geral@ and a receipt to the client')
