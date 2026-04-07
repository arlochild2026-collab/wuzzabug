import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { formatNumber } from '../lib/helpers'
import BugSplat from './BugSplat'
import BuzzCameo from './BuzzCameo'

export default function VoteButton({ bugId, initialScore = 0 }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hasVoted, setHasVoted] = useState(false)
  const [score, setScore] = useState(initialScore)
  const [loading, setLoading] = useState(false)

  // Animation state
  const [splats, setSplats] = useState([])   // list of active BugSplat instances
  const [showBuzz, setShowBuzz] = useState(false)
  const [bounceKey, setBounceKey] = useState(0) // increment to re-trigger bounce

  const buttonRef = useRef(null)

  useEffect(() => {
    if (!user) return
    async function checkVote() {
      const { data } = await supabase
        .from('votes')
        .select('id')
        .eq('bug_id', bugId)
        .eq('user_id', user.id)
        .single()
      setHasVoted(!!data)
    }
    checkVote()
  }, [bugId, user])

  useEffect(() => {
    setScore(initialScore)
  }, [initialScore])

  // Subscribe to real-time updates on the bugs table for this bug
  useEffect(() => {
    const subscription = supabase
      .channel(`bugs:${bugId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bugs', filter: `id=eq.${bugId}` }, (payload) => {
        setScore(payload.new.funny_score)
      })
      .subscribe()
    return () => subscription.unsubscribe()
  }, [bugId])

  /** Spawn a BugSplat at a random edge of the button, flying toward centre. */
  const spawnSplat = () => {
    const el = buttonRef.current
    if (!el) return

    const w = el.offsetWidth
    const h = el.offsetHeight
    const centerX = w / 2
    const centerY = h / 2

    // Pick a random edge (0=top, 1=right, 2=bottom, 3=left)
    const edge = Math.floor(Math.random() * 4)
    let startX, startY
    if (edge === 0)      { startX = Math.random() * w; startY = -20     }
    else if (edge === 1) { startX = w + 5;              startY = Math.random() * h }
    else if (edge === 2) { startX = Math.random() * w; startY = h + 5   }
    else                 { startX = -20;                startY = Math.random() * h }

    const id = `${Date.now()}-${Math.random()}`
    setSplats((prev) => [
      ...prev,
      { id, startX, startY, tx: centerX - startX, ty: centerY - startY },
    ])
  }

  const removeSplat = (id) =>
    setSplats((prev) => prev.filter((s) => s.id !== id))

  const handleVote = async () => {
    if (!user) {
      navigate('/auth')
      return
    }
    if (loading) return

    // Capture first-vote flag BEFORE any state updates
    const isFirstVote = score === 0 && !hasVoted

    // Trigger bug splat + bounce on every click
    spawnSplat()
    setBounceKey((k) => k + 1)

    setLoading(true)

    try {
      if (hasVoted) {
        // Remove vote — trigger on votes table auto-decrements funny_score
        await supabase
          .from('votes')
          .delete()
          .eq('bug_id', bugId)
          .eq('user_id', user.id)

        setScore((s) => s - 1)
        setHasVoted(false)
      } else {
        // Add vote — trigger on votes table auto-increments funny_score
        await supabase
          .from('votes')
          .insert({ bug_id: bugId, user_id: user.id })

        setScore((s) => s + 1)
        setHasVoted(true)

        // Show Buzz on the very first vote for this bug
        if (isFirstVote) {
          setShowBuzz(true)
        }
      }
    } catch (err) {
      console.error('Vote error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Relative wrapper so BugSplat + BuzzCameo are positioned inside it
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bug splat instances */}
      {splats.map((s) => (
        <BugSplat
          key={s.id}
          startX={s.startX}
          startY={s.startY}
          tx={s.tx}
          ty={s.ty}
          onComplete={() => removeSplat(s.id)}
        />
      ))}

      {/* Buzz first-vote cameo */}
      {showBuzz && (
        <BuzzCameo onComplete={() => setShowBuzz(false)} />
      )}

      <button
        ref={buttonRef}
        onClick={handleVote}
        disabled={loading}
        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${
          hasVoted
            ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]'
            : 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="text-2xl">{hasVoted ? '⚡' : '🐛'}</span>
        {/* key change forces remount → re-triggers countBounce animation */}
        <span
          key={bounceKey}
          className="vote-count-bounce"
          style={{
            fontFamily: 'Bangers, cursive',
            letterSpacing: '0.05em',
            display: 'inline-block',
            animation: bounceKey > 0 ? 'countBounce 0.45s ease-out' : 'none',
          }}
        >
          {formatNumber(score)} {hasVoted ? 'Voted!' : 'Vote'}
        </span>
      </button>
    </div>
  )
}
