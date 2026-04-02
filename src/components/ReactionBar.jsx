import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

const EMOJIS = [
  { emoji: '😂', label: 'Dead' },
  { emoji: '🤮', label: 'Nope' },
  { emoji: '😱', label: 'Horrifying' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💀', label: 'RIP' },
]

export default function ReactionBar({ bugId }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  // counts: { '😂': 4, '🔥': 2, ... }
  const [counts, setCounts] = useState({})
  // myReactions: Set of emojis the current user has reacted with
  const [myReactions, setMyReactions] = useState(new Set())
  const [loading, setLoading] = useState(null) // emoji currently being toggled

  useEffect(() => {
    fetchReactions()
  }, [bugId])

  async function fetchReactions() {
    const { data } = await supabase
      .from('reactions')
      .select('emoji, user_id')
      .eq('bug_id', bugId)

    if (!data) return

    // Tally counts
    const tally = {}
    const mine = new Set()
    for (const row of data) {
      tally[row.emoji] = (tally[row.emoji] || 0) + 1
      if (user && row.user_id === user.id) mine.add(row.emoji)
    }
    setCounts(tally)
    setMyReactions(mine)
  }

  const toggle = async (emoji) => {
    if (!user) {
      navigate('/auth')
      return
    }
    if (loading) return
    setLoading(emoji)

    const reacted = myReactions.has(emoji)

    // Optimistic update
    setCounts((prev) => ({
      ...prev,
      [emoji]: Math.max(0, (prev[emoji] || 0) + (reacted ? -1 : 1)),
    }))
    setMyReactions((prev) => {
      const next = new Set(prev)
      reacted ? next.delete(emoji) : next.add(emoji)
      return next
    })

    try {
      if (reacted) {
        await supabase
          .from('reactions')
          .delete()
          .eq('bug_id', bugId)
          .eq('user_id', user.id)
          .eq('emoji', emoji)
      } else {
        await supabase
          .from('reactions')
          .insert({ bug_id: bugId, user_id: user.id, emoji })
      }
    } catch (err) {
      // Roll back optimistic update on failure
      console.error('Reaction error:', err)
      fetchReactions()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {EMOJIS.map(({ emoji, label }) => {
        const count = counts[emoji] || 0
        const active = myReactions.has(emoji)
        const busy = loading === emoji

        return (
          <button
            key={emoji}
            onClick={() => toggle(emoji)}
            disabled={busy}
            title={label}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold
              border-2 transition-all duration-150 select-none
              disabled:opacity-60 disabled:cursor-not-allowed
              ${active
                ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 scale-105'
                : 'bg-transparent border-[#2a2a2a] text-gray-400 hover:border-gray-500 hover:text-white hover:scale-105'
              }
            `}
          >
            <span className="text-lg leading-none">{emoji}</span>
            {count > 0 && (
              <span className={active ? 'text-yellow-300' : 'text-gray-400'}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
