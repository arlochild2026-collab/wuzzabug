import { useEffect, useRef } from 'react'

/**
 * BugSplat – renders a single 🐛 that flies from a spawn point to the
 * button centre, squishes flat, then fades away.
 *
 * Props:
 *   startX   – left offset of the spawn point (px, relative to wrapper)
 *   startY   – top  offset of the spawn point (px, relative to wrapper)
 *   tx       – horizontal distance from spawn → button centre (px)
 *   ty       – vertical   distance from spawn → button centre (px)
 *   onComplete – called ~900 ms after mount so the parent can unmount this
 */
export default function BugSplat({ startX, startY, tx, ty, onComplete }) {
  const ref = useRef(null)
  // Generate a random rotation once per instance
  const rot = useRef(`${Math.round(Math.random() * 720 - 360)}deg`).current

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Push the CSS custom properties that drive the keyframe
    el.style.setProperty('--tx', `${tx}px`)
    el.style.setProperty('--ty', `${ty}px`)
    el.style.setProperty('--rot', rot)

    const timer = setTimeout(() => onComplete?.(), 900)
    return () => clearTimeout(timer)
  }, []) // intentionally empty – only run on mount

  return (
    <span
      ref={ref}
      className="bug-splat"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        fontSize: '18px',
        lineHeight: 1,
        display: 'inline-block',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 50,
        animation: 'bugFly 0.8s ease-out forwards',
        transformOrigin: 'center center',
      }}
    >
      🐛
    </span>
  )
}
