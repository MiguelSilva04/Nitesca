// Contact endpoint check, no network: Resend is stubbed. Run: npm run test:worker
import assert from 'node:assert/strict'
import worker from './index.js'

const sent = []
let resendStatus = 200
globalThis.fetch = async (url, init) => {
  sent.push({ url, body: JSON.parse(init.body), auth: init.headers.Authorization })
  return new Response('{}', { status: resendStatus })
}
console.error = () => {} // the provider-failure case logs on purpose
const env = {
  RESEND_API_KEY: 're_test', CONTACT_TO: 'geral@nitesca.com', CONTACT_FROM: 'Nitesca <site@nitesca.com>',
  ASSETS: { fetch: () => new Response('static') },
}
const ORIGIN = 'https://nitesca.com'
const post = (body, headers = {}) => worker.fetch(new Request(`${ORIGIN}/api/contact`, {
  method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
}), env)
const good = { nome: 'Ana Silva', email: 'ana@example.com', tipo: 'Florista', mensagem: 'Olá!\nQueria um site.', website: '', lang: 'pt', elapsed: 9000 }
const status = async p => (await p).status

assert.equal(await status(worker.fetch(new Request(`${ORIGIN}/api/contact`), env)), 405, 'GET is rejected')
assert.equal(await status(post(good, { Origin: 'https://evil.example' })), 403, 'other origins are rejected')
assert.equal(await status(post({ ...good, email: 'not-an-email' })), 400, 'bad email')
assert.equal(await status(post({ ...good, mensagem: '   ' })), 400, 'empty message')
assert.equal(await status(post({ ...good, nome: 'x'.repeat(101) })), 400, 'name too long')
assert.equal(sent.length, 0, 'nothing sent for invalid input')

assert.equal(await status(post({ ...good, website: 'http://spam' })), 200, 'honeypot answers ok…')
assert.equal(await status(post({ ...good, elapsed: 500 })), 200, 'too-fast answers ok…')
assert.equal(sent.length, 0, '…but bots never trigger an email')

const ok = await post(good)
assert.equal(ok.status, 200)
assert.deepEqual(await ok.json(), { ok: true })
assert.equal(sent.length, 1, 'valid form sends one email')
const mail = sent[0]
assert.equal(mail.url, 'https://api.resend.com/emails')
assert.equal(mail.auth, 'Bearer re_test')
assert.deepEqual(mail.body.to, ['geral@nitesca.com'])
assert.equal(mail.body.reply_to, 'ana@example.com', 'reply goes straight to the client')
assert.equal(mail.body.subject, 'Novo contacto: Ana Silva (Florista)')
assert.match(mail.body.text, /Nome: Ana Silva\nEmail: ana@example\.com\nTipo de negócio: Florista/)
assert.match(mail.body.text, /Olá!\nQueria um site\./)

await post({ ...good, nome: 'Bob\r\nBcc: x@y.z' })
assert.equal(sent.at(-1).body.subject, 'Novo contacto: Bob Bcc: x@y.z (Florista)', 'no line breaks in the subject')

resendStatus = 500
assert.equal(await status(post(good)), 502, 'provider failure is reported, not swallowed')

assert.equal(await (await worker.fetch(new Request(`${ORIGIN}/en/`), env)).text(), 'static', 'other paths go to the static site')
assert.equal(await status(worker.fetch(new Request(`${ORIGIN}/api/other`), env)), 404)
console.log('worker ok: contact endpoint validates, filters bots and sends the right email')
