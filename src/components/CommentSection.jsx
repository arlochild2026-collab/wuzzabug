import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { timeAgo } from '../lib/helpers'

export default function CommentSection({ bugId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [bugId])

  async function fetchComments() {
    setFetching(true)
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('bug_id', bugId)
      .order('created_at', { ascending: false })
    setComments(data || [])
    setFetching(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim() || loading) return
    setLoading(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        bug_id: bugId,
        user_id: user.id,
        body: body.trim(),
      })
      .select()
      .single()

    if (!error && data) {
      setComments(prev => [data, ...prev])
      setBody('')
    }
    setLoading(false)
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}>
        💬 Comments ({comments.length})
      </h3>

      {/* Post a comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your thoughts on this magnificent bug..."
            rows={3}
            className="input-field resize-none mb-3"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">{body.length}/500</span>
            <button
              type="submit"
              disabled={!body.trim() || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-6 text-center">
          <p className="text-gray-400 mb-3">Sign in to join the conversation</p>
          <Link to="/auth" className="btn-primary text-sm">Sign In</Link>
        </div>
      )}

      {/* Comments list */}
      {fetching ? (
        <div className="text-gray-500 text-center py-8">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No comments yet. Be the first! 🐛
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-sm">
                    🐛
                  </div>
                  <span className="text-gray-400 text-sm font-medium">
                    {comment.user_id?.slice(0, 8) || 'Anonymous'}...
                  </span>
                </div>
                <span className="text-gray-600 text-xs">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
