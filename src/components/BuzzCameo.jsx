import { useEffect, useRef } from 'react'
import buzzMascot from '../assets/buzz-mascot.png'

/**
 * BuzzCameo – Buzz the mascot slides in from the right to celebrate the
 * very first vote on a bug, holds up a "FIRST!" sign, then slides back out.
 *
 * Props:
 *   onComplete – called once the exit animation finishes (~1.8 s total)
 */
export default function BuzzCameo({ onComplete }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Slide in
    el.style.animation = 'buzzSlideIn 0.4s ease-out forwards'

    // After 1.2 s switch to slide-out
    const holdTimer = setTimeout(() => {
      if (el) el.style.animation = 'buzzSlideOut 0.5s ease-in forwards'
    }, 1200)

    // After slide-out completes, notify parent to unmount
    const doneTimer = setTimeout(() => onComplete?.(), 1800)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(doneTimer)
    }
  }, []) // run once on mount

  return (
    <div
      ref={ref}
      className="buzz-cameo"
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '-4px',
        right: '-10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 100,
        // Start off-screen; the useEffect sets the real animation
        transform: 'translateX(110px)',
        opacity: 0,
      }}
    >
      {/* Speech bubble */}
      <div
        style={{
          background: '#facc15',
          color: '#000',
          fontFamily: 'Bangers, cursive',
          fontSize: '11px',
          letterSpacing: '0.08em',
          padding: '3px 8px',
          borderRadius: '8px',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          position: 'relative',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
        }}
      >
        FIRST!
        {/* Arrow pointing down toward mascot */}
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '6px solid #facc15',
          }}
        />
      </div>

      {/* Mascot image */}
      <img
        src={buzzMascot}
        alt="Buzz mascot celebrating the first vote"
        style={{
          width: 60,
          height: 60,
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
        }}
      />
    </div>
  )
}
