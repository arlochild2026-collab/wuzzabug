import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { formatNumber } from '../lib/helpers'

export default function VoteButton({ bugId, initialScore = 0 }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hasVoted, setHasVoted] = useState(false)
  const [score, setScore] = useState(initialScore)
  const [loading, setLoading] = useState(false)

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

  const handleVote = async () => {
    if (!user) {
      navigate('/auth')
      return
    }
    if (loading) return
    setLoading(true)

    try {
      if (hasVoted) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('bug_id', bugId)
          .eq('user_id', user.id)

        await supabase
          .from('bugs')
          .update({ funny_score: score - 1 })
          .eq('id', bugId)

        setScore(s => s - 1)
        setHasVoted(false)
      } else {
        // Add vote
        await supabase
          .from('votes')
          .insert({ bug_id: bugId, user_id: user.id })

        await supabase
          .from('bugs')
          .update({ funny_score: score + 1 })
          .eq('id', bugId)

        setScore(s => s + 1)
        setHasVoted(true)
      }
    } catch (err) {
      console.error('Vote error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${
        hasVoted
          ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]'
          : 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className="text-2xl">{hasVoted ? '⚡' : '🐛'}</span>
      <span style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}>
        {formatNumber(score)} {hasVoted ? 'Voted!' : 'Vote'}
      </span>
    </button>
  )
}
