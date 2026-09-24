// Diamond outline that doubles as a waypoint for the floating gem (see useGemMotion).
export default function Mark({ color, size, inner = Math.round(size * 0.62), className = '' }) {
  return (
    <span data-gem="" data-gem-color={color} className={`mark ${className}`} style={{ width: size, height: size }}>
      <span style={{ width: inner, height: inner, borderColor: color }} />
    </span>
  )
}
