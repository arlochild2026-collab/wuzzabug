import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { timeAgo, isVideoUrl } from '../lib/helpers'

export default function ModerationDashboard() {
  const [bugs, setBugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchBugs()
  }, [filter])

  async function fetchBugs() {
    setLoading(true)
    const { data } = await supabase
      .from('bugs')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    setBugs(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    setUpdating(id)
    await supabase.from('bugs').update({ status }).eq('id', id)
    setBugs(prev => prev.filter(b => b.id !== id))
    setUpdating(null)
  }

  const statusCounts = { pending: null, approved: null, rejected: null }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === s
                ? 'bg-yellow-400 text-black'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#2a2a2a]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading bugs...</div>
      ) : bugs.length === 0 ? (
        <div className="text-gray-500 text-center py-12 text-lg">
          No {filter} bugs 🐛
        </div>
      ) : (
        <div className="space-y-4">
          {bugs.map(bug => {
            const mediaUrl = bug.image_url || bug.video_url
            const isVideo = isVideoUrl(mediaUrl)
            return (
              <div key={bug.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex gap-4">
                {/* Preview */}
                <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#0f0f0f]">
                  {mediaUrl ? (
                    isVideo ? (
                      <video src={mediaUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={mediaUrl} alt={bug.title} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🐛</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white mb-1 truncate">{bug.title}</h3>
                  {bug.description && (
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{bug.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    {bug.location && <span>📍 {bug.location}</span>}
                    <span>🕐 {timeAgo(bug.created_at)}</span>
                    <span>⚡ {bug.funny_score} votes</span>
                    <span className="font-mono text-gray-600">{bug.id.slice(0, 8)}...</span>
                  </div>

                  {/* Actions */}
                  {filter === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(bug.id, 'approved')}
                        disabled={updating === bug.id}
                        className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => updateStatus(bug.id, 'rejected')}
                        disabled={updating === bug.id}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        ❌ Reject
                      </button>
                      <a
                        href={`/bug/${bug.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-300 border border-[#2a2a2a] px-3 py-1.5 rounded-lg text-sm transition-all"
                      >
                        View →
                      </a>
                    </div>
                  )}
                  {filter !== 'pending' && (
                    <div className="flex gap-2">
                      {filter === 'approved' && (
                        <button
                          onClick={() => updateStatus(bug.id, 'rejected')}
                          disabled={updating === bug.id}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        >
                          ❌ Reject
                        </button>
                      )}
                      {filter === 'rejected' && (
                        <button
                          onClick={() => updateStatus(bug.id, 'approved')}
                          disabled={updating === bug.id}
                          className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        >
                          ✅ Approve
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(bug.id, 'pending')}
                        disabled={updating === bug.id}
                        className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        🔄 Reset to Pending
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
