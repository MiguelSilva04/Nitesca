// Drives the floating gem (travels between every [data-gem] anchor as you scroll),
// the portfolio cursor preview, hero entrance animations and anchor-link scrolling.
// Everything is written straight to the DOM once per animation frame.

const HEADER = 72
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t
const lineOffset = () => HEADER + (innerHeight - HEADER) * 0.3
// Scroll dead zone around each anchor where the gem rests. Smaller = the trip spans more scroll.
const hold = gap => Math.min(gap * 0.2, 140)
// How fast the gem catches up with the scroll position, per 60fps frame (0–1). Lower = slower glide.
const FOLLOW = 0.045
const mix = (h1, h2, t) => {
  const p = h => [1, 3, 5].map(o => parseInt((h || '#9AB0A0').slice(o, o + 2), 16))
  const a = p(h1), b = p(h2)
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`
}

// gemMotion: 'viagem' (glides) | 'salto' (jumps between anchors).
export function initGem({ gemMotion = 'viagem', cursorPreview = true } = {}) {
  const s = {
    mouse: { x: -9999, y: -9999 },
    off: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, drag: null,
    pv: { x: 0, y: 0, rot: 0, op: 0, init: false },
    active: 0, hover: false, focusPt: null, gemIntro: 0, p: null, last: 0,
    pin: null, pinMix: 0, pinAt: null,
  }
  const rm = matchMedia('(prefers-reduced-motion: reduce)')
  const coarseMq = matchMedia('(pointer: coarse)')
  const gem = document.querySelector('[data-gem-el]')
  const preview = document.querySelector('[data-preview]')
  const thumbs = [...preview.querySelectorAll('[data-thumb]')]

  // The scroll positions (document y of the gem line) at which the gem arrives at each anchor.
  // Anchors near the bottom can sit below the line even at max scroll; pull them up so the last
  // one is fully reached (t = 1) a little before the end. The margin must exceed the max hold().
  // Shared by the animation and by link scrolling so both agree on where each stop is.
  function stops() {
    const anchors = [...document.querySelectorAll('[data-gem]')]
    const sy = scrollY, n = anchors.length
    const yMax = document.documentElement.scrollHeight - innerHeight + lineOffset() - 160
    const rects = anchors.map(a => a.getBoundingClientRect())
    const eff = rects.map((r, k) => Math.min(r.top + r.height / 2 + sy, yMax - (n - 1 - k) * 90))
    return { anchors, rects, eff, n }
  }

  function frame() {
    const { anchors, rects, eff, n } = stops()
    if (!n) return
    const vh = innerHeight, sy = scrollY, y = sy + lineOffset()
    let i0 = 0
    for (let k = 0; k < n; k++) if (eff[k] <= y) i0 = k
    let t0 = 0
    if (i0 < n - 1) {
      const gap = eff[i0 + 1] - eff[i0], h = hold(gap)
      t0 = clamp((y - eff[i0] - h) / Math.max(1, gap - 2 * h), 0, 1)
    }
    const reduced = rm.matches, coarse = coarseMq.matches
    if (reduced || gemMotion === 'salto') t0 = t0 < 0.5 ? 0 : 1
    // Progress along the anchor chain (anchor index + fraction). The gem eases toward the
    // scroll target instead of sticking to it, so even a fast flick produces a slow glide.
    const target = i0 + t0, now = performance.now()
    const frames = Math.min(4, (now - s.last) / 16.7) // elapsed 60fps frames, so easing is frame-rate independent
    if (s.p == null || reduced) s.p = target
    else {
      s.p += (target - s.p) * (1 - Math.pow(1 - FOLLOW, frames))
      if (Math.abs(target - s.p) < 0.001) s.p = target
    }
    s.last = now
    const i = Math.min(Math.floor(s.p), n - 1), j = Math.min(i + 1, n - 1), t = s.p - i
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const a = rects[i], b = rects[j]
    let cx = lerp(a.left + a.width / 2, b.left + b.width / 2, e)
    let cy = lerp(a.top + a.height / 2, b.top + b.height / 2, e)
    let diag = lerp(a.width, b.width, e)
    if (s.gemIntro) {
      const p = clamp((now - s.gemIntro) / 700, 0, 1)
      if (p < 1) diag *= 1 - Math.pow(1 - p, 3)
      else s.gemIntro = 0
    }
    let side = diag / Math.SQRT2
    // Arc always swings right (anchors hug the left edge on mobile), and never leaves the viewport.
    cx += Math.sin(Math.PI * e) * Math.min(200, Math.abs(b.top - a.top) * 0.25, innerWidth * 0.3)
    cx = clamp(cx, diag / 2 + 8, innerWidth - diag / 2 - 8)
    let color = mix(anchors[i].dataset.gemColor, anchors[j].dataset.gemColor, e)

    // Pinned to a package (its link was clicked): glide onto it and stay until the user scrolls.
    const pin = s.pin?.isConnected ? s.pin : null
    s.pinMix += ((pin ? 1 : 0) - s.pinMix) * (reduced ? 1 : 1 - Math.pow(1 - 0.08, frames))
    if (s.pinMix < 0.001) s.pinMix = 0
    if (pin) {
      const r = pin.getBoundingClientRect()
      s.pinAt = { x: r.left + r.width / 2, y: r.top + r.height / 2, d: r.width, color: pin.dataset.gemColor }
    }
    const m = s.pinAt ? s.pinMix : 0
    if (m) {
      cx = lerp(cx, s.pinAt.x, m); cy = lerp(cy, s.pinAt.y, m); diag = lerp(diag, s.pinAt.d, m)
      side = diag / Math.SQRT2
      if (m > 0.5) color = s.pinAt.color
    }
    const atHero = !m && i === 0 && t === 0 && anchors[0].hasAttribute('data-gem-hero') && sy < vh

    // In the hero the gem is pulled toward the cursor and can be dragged; it springs back.
    let tx = 0, ty = 0
    if (atHero && !s.drag && !reduced && !coarse) {
      const dx = s.mouse.x - cx, dy = s.mouse.y - cy, d = Math.hypot(dx, dy)
      if (d < 280) { const f = (1 - d / 280) * 0.35; tx = dx * f; ty = dy * f }
    }
    if (!s.drag) {
      s.vel.x = (s.vel.x + (tx - s.off.x) * 0.12) * 0.8
      s.vel.y = (s.vel.y + (ty - s.off.y) * 0.12) * 0.8
      s.off.x += s.vel.x; s.off.y += s.vel.y
    }
    const rot = lerp(45 + 90 * e, 45, m) + clamp(s.vel.x * 1.2, -30, 30)
    gem.style.width = gem.style.height = side + 'px'
    gem.style.transform = `translate3d(${cx + s.off.x - side / 2}px,${cy + s.off.y - side / 2}px,0) rotate(${rot}deg)`
    gem.style.background = color
    gem.style.pointerEvents = atHero ? 'auto' : 'none'
    gem.style.cursor = s.drag ? 'grabbing' : 'grab'
    previewFrame(reduced, coarse)
  }

  function previewFrame(reduced, coarse) {
    const enabled = cursorPreview && !coarse
    const pt = s.focusPt || s.mouse
    const show = enabled && (s.hover || !!s.focusPt)
    const W = 360, H = 232
    let tx = pt.x + 32, ty = pt.y - H / 2
    if (tx + W > innerWidth - 16) tx = pt.x - W - 32
    ty = clamp(ty, 88, innerHeight - H - 16)
    const p = s.pv
    if (!p.init && show) { p.x = tx; p.y = ty; p.init = true }
    const k = reduced ? 1 : 0.16
    const dx = tx - p.x
    p.x += dx * k; p.y += (ty - p.y) * k
    p.rot += (clamp(dx * 0.05, -9, 9) - p.rot) * (reduced ? 1 : 0.2)
    p.op += ((show ? 1 : 0) - p.op) * (reduced ? 1 : 0.2)
    if (!show && p.op < 0.01) { p.op = 0; p.init = false }
    preview.style.opacity = p.op
    preview.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${reduced ? 0 : p.rot}deg) scale(${0.9 + 0.1 * p.op})`
    thumbs.forEach((th, idx) => { th.style.opacity = idx === s.active ? 1 : 0 })
  }

  // In-page links scroll so the target section's gem lands exactly where the gem rests.
  document.addEventListener('click', ev => {
    const a = ev.target.closest?.('a[href^="#"]')
    if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey) return
    const href = a.getAttribute('href')
    const sec = document.getElementById(decodeURIComponent(href.slice(1))) // null for a bare "#"
    // A section's own stop wins; pins only apply to targets without one (the package cards).
    const pin = sec && !sec.querySelector('[data-gem]') && (sec.matches('[data-gem-pin]') ? sec : sec.querySelector('[data-gem-pin]'))
    if (pin) {
      ev.preventDefault()
      s.pin = pin
      sec.scrollIntoView({ behavior: rm.matches ? 'auto' : 'smooth', block: 'start' })
      history.pushState(null, '', href)
      return
    }
    s.pin = null
    const anchor = sec?.querySelector('[data-gem]')
    if (!anchor) return
    ev.preventDefault()
    // Land inside this anchor's rest zone [eff, eff + hold] — as close as possible to showing the
    // section from its top — so the gem settles on the anchor instead of stopping mid-trip.
    const { anchors, eff, n } = stops()
    const k = anchors.indexOf(anchor)
    const h = hold(k < n - 1 ? eff[k + 1] - eff[k] : 400)
    const L = lineOffset()
    const wantY = sec.getBoundingClientRect().top + scrollY - HEADER + L
    const y = clamp(wantY, eff[k] + 8, eff[k] + Math.max(8, h - 8))
    const top = clamp(y - L, 0, document.documentElement.scrollHeight - innerHeight)
    scrollTo({ top, behavior: rm.matches ? 'auto' : 'smooth' })
    history.pushState(null, '', href)
  })

  addEventListener('pointermove', e => { s.mouse.x = e.clientX; s.mouse.y = e.clientY }, { passive: true })
  // Any scroll the user starts themselves releases a pinned gem (programmatic smooth scroll doesn't fire these).
  const unpin = () => { s.pin = null }
  const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])
  addEventListener('wheel', unpin, { passive: true })
  addEventListener('touchmove', unpin, { passive: true })
  addEventListener('keydown', e => { if (SCROLL_KEYS.has(e.key) && !e.target.closest?.('input, textarea')) unpin() })

  // Drag the gem while it rests in the hero.
  gem.addEventListener('pointerdown', ev => {
    gem.setPointerCapture(ev.pointerId)
    s.drag = { sx: ev.clientX, sy: ev.clientY, ox: s.off.x, oy: s.off.y }
  })
  gem.addEventListener('pointermove', ev => {
    const d = s.drag
    if (!d) return
    const nx = d.ox + ev.clientX - d.sx, ny = d.oy + ev.clientY - d.sy
    s.vel.x = nx - s.off.x; s.vel.y = ny - s.off.y
    s.off.x = nx; s.off.y = ny
  })
  const drop = () => { s.drag = null }
  gem.addEventListener('pointerup', drop)
  gem.addEventListener('pointercancel', drop)

  // Hero entrance. The inline script in index.html pre-hid these (.enter-pending) so they don't flash;
  // fill: 'backwards' covers each delay, so the class can go as soon as the animations exist.
  if (!rm.matches) {
    document.querySelectorAll('[data-enter="line"]').forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
      { duration: 900, delay: 100 + i * 120, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' }))
    document.querySelectorAll('[data-enter="letter"]').forEach((el, i) => el.animate(
      [{ transform: 'translateY(100%)' }, { transform: 'none' }],
      { duration: 1100, delay: 350 + i * 55, easing: 'cubic-bezier(.2,.8,.1,1)', fill: 'backwards' }))
    s.gemIntro = performance.now() + 900
  }
  document.documentElement.classList.remove('enter-pending')

  const loop = () => { frame(); requestAnimationFrame(loop) }
  loop()

  // Portfolio rows drive which preview card shows and where.
  return {
    rowEnter: k => { s.active = k; s.hover = true },
    rowLeave: () => { s.hover = false },
    rowFocus: (k, row) => {
      const r = row.getBoundingClientRect()
      s.active = k
      s.focusPt = { x: r.left + r.width * 0.4, y: r.top + r.height / 2 }
    },
    rowBlur: () => { s.focusPt = null },
  }
}
