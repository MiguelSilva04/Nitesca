import { useEffect, useRef } from 'react'

// Drives the floating gem (travels between every [data-gem] anchor as you scroll),
// the portfolio cursor preview, hero entrance animations and anchor-link scrolling.
// Works on the DOM directly each frame — no React re-renders.

const HEADER = 72
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t
const lineOffset = () => HEADER + (innerHeight - HEADER) * 0.3
const hold = gap => Math.min(gap * 0.35, 220)
const mix = (h1, h2, t) => {
  const p = h => [1, 3, 5].map(o => parseInt((h || '#9AB0A0').slice(o, o + 2), 16))
  const a = p(h1), b = p(h2)
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`
}

export function useGemMotion({ gemMotion = 'viagem', cursorPreview = true } = {}) {
  const s = useRef({
    mouse: { x: -9999, y: -9999 },
    off: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, drag: null,
    pv: { x: 0, y: 0, rot: 0, op: 0, init: false },
    active: 0, hover: false, focusPt: null, gemIntro: 0,
  }).current
  const opts = useRef()
  opts.current = { gemMotion, cursorPreview }

  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)')
    const coarseMq = matchMedia('(pointer: coarse)')

    function frame() {
      const gem = document.querySelector('[data-gem-el]')
      const anchors = [...document.querySelectorAll('[data-gem]')]
      if (!gem || !anchors.length) return
      const vh = innerHeight, sy = scrollY, y = sy + lineOffset()
      const yMax = document.documentElement.scrollHeight - vh * 0.5
      const rects = anchors.map(a => a.getBoundingClientRect())
      const n = anchors.length
      const eff = rects.map((r, k) => Math.min(r.top + r.height / 2 + sy, yMax - (n - 1 - k) * 90))
      let i = 0
      for (let k = 0; k < n; k++) if (eff[k] <= y) i = k
      const j = Math.min(i + 1, n - 1)
      let t = 0
      if (j > i) {
        const gap = eff[j] - eff[i], h = hold(gap)
        t = clamp((y - eff[i] - h) / Math.max(1, gap - 2 * h), 0, 1)
      }
      const reduced = rm.matches, coarse = coarseMq.matches
      if (reduced || opts.current.gemMotion === 'salto') t = t < 0.5 ? 0 : 1
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const a = rects[i], b = rects[j]
      let cx = lerp(a.left + a.width / 2, b.left + b.width / 2, e)
      const cy = lerp(a.top + a.height / 2, b.top + b.height / 2, e)
      let diag = lerp(a.width, b.width, e)
      if (s.gemIntro) {
        const p = clamp((performance.now() - s.gemIntro) / 700, 0, 1)
        if (p < 1) diag *= 1 - Math.pow(1 - p, 3)
        else s.gemIntro = 0
      }
      const side = diag / Math.SQRT2
      // Arc always swings right (anchors hug the left edge on mobile), and never leaves the viewport.
      cx += Math.sin(Math.PI * e) * Math.min(200, Math.abs(b.top - a.top) * 0.25, innerWidth * 0.3)
      cx = clamp(cx, diag / 2 + 8, innerWidth - diag / 2 - 8)
      const color = mix(anchors[i].dataset.gemColor, anchors[j].dataset.gemColor, e)
      const atHero = i === 0 && t === 0 && anchors[0].hasAttribute('data-gem-hero') && sy < vh

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
      const rot = 45 + 90 * e + clamp(s.vel.x * 1.2, -30, 30)
      gem.style.width = gem.style.height = side + 'px'
      gem.style.transform = `translate3d(${cx + s.off.x - side / 2}px,${cy + s.off.y - side / 2}px,0) rotate(${rot}deg)`
      gem.style.background = color
      gem.style.pointerEvents = atHero ? 'auto' : 'none'
      gem.style.cursor = s.drag ? 'grabbing' : 'grab'
      previewFrame(reduced, coarse)
    }

    function previewFrame(reduced, coarse) {
      const el = document.querySelector('[data-preview]')
      if (!el) return
      const enabled = opts.current.cursorPreview && !coarse
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
      el.style.opacity = p.op
      el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${reduced ? 0 : p.rot}deg) scale(${0.9 + 0.1 * p.op})`
      el.querySelectorAll('[data-thumb]').forEach((th, idx) => { th.style.opacity = idx === s.active ? 1 : 0 })
    }

    // In-page links scroll so the target section's gem lands exactly where the gem rests.
    const onNav = ev => {
      const a = ev.target.closest?.('a[href^="#"]')
      if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey) return
      const sec = document.querySelector(a.getAttribute('href'))
      const gem = sec?.querySelector('[data-gem]')
      if (!gem) return
      ev.preventDefault()
      const all = [...document.querySelectorAll('[data-gem]')]
      const k = all.indexOf(gem)
      const docY = el => { const b = el.getBoundingClientRect(); return b.top + b.height / 2 + scrollY }
      const gy = docY(gem)
      const gap = k < all.length - 1 ? docY(all[k + 1]) - gy : 400
      const L = lineOffset(), h = hold(gap)
      let top = sec.getBoundingClientRect().top + scrollY - HEADER
      const view = gy - top
      if (view > L - 16) top = gy - (L - 24)
      else if (view < L - h + 24) top = gy - (L - h + 40)
      top = clamp(top, 0, document.documentElement.scrollHeight - innerHeight)
      scrollTo({ top, behavior: rm.matches ? 'auto' : 'smooth' })
      history.pushState(null, '', a.getAttribute('href'))
    }
    const onMove = e => { s.mouse.x = e.clientX; s.mouse.y = e.clientY }

    addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('click', onNav)

    const anims = []
    if (!rm.matches) {
      document.querySelectorAll('[data-enter="line"]').forEach((el, i) => anims.push(el.animate(
        [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, delay: 100 + i * 120, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' })))
      document.querySelectorAll('[data-enter="letter"]').forEach((el, i) => anims.push(el.animate(
        [{ transform: 'translateY(100%)' }, { transform: 'none' }],
        { duration: 1100, delay: 350 + i * 55, easing: 'cubic-bezier(.2,.8,.1,1)', fill: 'backwards' })))
      s.gemIntro = performance.now() + 900
    }

    let raf
    const loop = () => { frame(); raf = requestAnimationFrame(loop) }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      anims.forEach(a => a.cancel())
      removeEventListener('pointermove', onMove)
      document.removeEventListener('click', onNav)
    }
  }, [s])

  return {
    rowEnter: k => { s.active = k; s.hover = true },
    rowLeave: () => { s.hover = false },
    rowFocus: (k, ev) => {
      const r = ev.currentTarget.closest('[data-row]').getBoundingClientRect()
      s.active = k
      s.focusPt = { x: r.left + r.width * 0.4, y: r.top + r.height / 2 }
    },
    rowBlur: () => { s.focusPt = null },
    gemDown: ev => {
      ev.currentTarget.setPointerCapture(ev.pointerId)
      s.drag = { sx: ev.clientX, sy: ev.clientY, ox: s.off.x, oy: s.off.y }
    },
    gemMove: ev => {
      const d = s.drag
      if (!d) return
      const nx = d.ox + ev.clientX - d.sx, ny = d.oy + ev.clientY - d.sy
      s.vel.x = nx - s.off.x; s.vel.y = ny - s.off.y
      s.off.x = nx; s.off.y = ny
    },
    gemUp: () => { s.drag = null },
  }
}
