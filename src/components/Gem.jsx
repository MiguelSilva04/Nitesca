export default function Gem({ motion }) {
  return (
    <div
      data-gem-el=""
      aria-hidden="true"
      className="gem"
      onPointerDown={motion.gemDown}
      onPointerMove={motion.gemMove}
      onPointerUp={motion.gemUp}
      onPointerCancel={motion.gemUp}
    />
  )
}
