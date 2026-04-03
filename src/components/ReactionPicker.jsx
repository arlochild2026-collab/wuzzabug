import { useState, useRef, useEffect } from 'react'

const EMOJI_OPTIONS = [
  { emoji: '😂', label: 'Dead' },
  { emoji: '🤮', label: 'Nope' },
  { emoji: '😱', label: 'Horrifying' },
  { emoji: '😍', label: 'Love it' },
  { emoji: '🔥', label: 'Fire' },
]

/** A single flying emoji particle spawned by the Bug Parade animation. */
function ParadeParticle({ emoji, px, py, spin, delay, onComplete }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--px', `${px}px`)
    el.style.setProperty('--py', `${py}px`)
    el.style.setProperty('--spin', `${spin}deg`)

    const timer = setTimeout(() => onComplete?.(), delay + 1100)
    return () => clearTimeout(timer)
  }, []) // run once on mount

  return (
    <span
      ref={ref}
      className="bug-parade-particle"
      aria-hidden="true"
      style={{
        position: 'absolute',
        // Centre on the button — the keyframe then translates by --px/--py
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '14px',
        lineHeight: 1,
        display: 'inline-block',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 60,
        animation: `bugParade 1s ease-out ${delay}ms forwards`,
        transformOrigin: 'center center',
      }}
    >
      {emoji}
    </span>
  )
}

/** One emoji reaction button that manages its own parade particles. */
function EmojiButton({ emoji, label, count, onClick }) {
  const [particles, setParticles] = useState([])
  const [active, setActive] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    e.preventDefault()

    const numParticles = Math.floor(Math.random() * 3) + 3 // 3–5
    const newParticles = Array.from({ length: numParticles }, (_, i) => {
      const angle = (Math.PI * 2 * i) / numParticles + Math.random() * 0.5
      const distance = 36 + Math.random() * 28
      return {
        id: Date.now() + i,
        px: Math.cos(angle) * distance,
        py: Math.sin(angle) * distance,
        spin: Math.round(Math.random() * 720 - 360),
        delay: i * 50,
      }
    })

    setParticles((prev) => [...prev, ...newParticles])
    setActive(true)
    onClick()
  }

  const removeParticle = (id) =>
    setParticles((prev) => prev.filter((p) => p.id !== id))

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleClick}
        title={label}
        className={`
          flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold
          border transition-all duration-150 select-none
          ${active
            ? 'bg-yellow-400/20 border-yellow-400/60 text-yellow-300 scale-105'
            : 'bg-transparent border-[#2a2a2a] text-gray-500 hover:border-gray-600 hover:text-gray-300 hover:scale-105'
          }
        `}
      >
        <span className="leading-none">{emoji}</span>
        {count > 0 && (
          <span className={active ? 'text-yellow-300' : 'text-gray-500'}>
            {count}
          </span>
        )}
      </button>

      {particles.map((p) => (
        <ParadeParticle
          key={p.id}
          emoji={emoji}
          px={p.px}
          py={p.py}
          spin={p.spin}
          delay={p.delay}
          onComplete={() => removeParticle(p.id)}
        />
      ))}
    </div>
  )
}

/**
 * ReactionPicker – compact emoji reaction row for BugCard.
 * State is stored locally (no Supabase) so it's lightweight on card grids.
 *
 * Props:
 *   bugId – used as a key if you later want to persist state
 */
export default function ReactionPicker({ bugId }) {
  // counts: { '😂': 2, '🔥': 1, … }
  const [counts, setCounts] = useState({})

  const handleReact = (emoji) => {
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
  }

  return (
    <div
      className="flex flex-wrap gap-1"
      onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
    >
      {EMOJI_OPTIONS.map(({ emoji, label }) => (
        <EmojiButton
          key={emoji}
          emoji={emoji}
          label={label}
          count={counts[emoji] || 0}
          onClick={() => handleReact(emoji)}
        />
      ))}
    </div>
  )
}
