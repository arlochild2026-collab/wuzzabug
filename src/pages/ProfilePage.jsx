import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { formatNumber, timeAgo } from '../lib/helpers'

function StatBox({ label, value }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 text-center">
      <div className="text-2xl font-black text-yellow-400" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function BugGrid({ bugs, isOwner }) {
  if (bugs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-5xl mb-3">🐛</div>
        <p>{isOwner ? "You haven't submitted any bugs yet." : "No approved bugs yet."}</p>
        {isOwner && (
          <Link to="/submit" className="btn-primary mt-4 inline-block">Submit your first bug →</Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {bugs.map((bug) => (
        <Link
          key={bug.id}
          to={`/bug/${bug.id}`}
          className="group relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] hover:border-yellow-400/40 transition-all"
        >
          {/* Image */}
          <div className="aspect-square overflow-hidden">
            {bug.image_url ? (
              <img
                src={bug.image_url}
                alt={bug.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center text-4xl">🐛</div>
            )}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <p className="text-white text-xs font-bold line-clamp-2" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em', fontSize: '0.85rem' }}>
              {bug.title}
            </p>
            <p className="text-yellow-400 text-xs">{formatNumber(bug.funny_score)} 😂</p>
          </div>

          {/* Status badge for owner */}
          {isOwner && bug.status !== 'approved' && (
            <div className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded ${
              bug.status === 'pending' ? 'bg-yellow-400/80 text-black' : 'bg-red-500/80 text-white'
            }`}>
              {bug.status}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOwner = user?.id === id

  const [profile, setProfile] = useState(null)
  const [bugs, setBugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [id])

  async function fetchAll() {
    setLoading(true)

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (!profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)
    setDisplayName(profileData.display_name || '')

    // Fetch bugs — all for owner, approved-only for others
    let query = supabase
      .from('bugs')
      .select('*')
      .eq('submitted_by', id)
      .order('created_at', { ascending: false })

    if (!isOwner) {
      query = query.eq('status', 'approved')
    }

    const { data: bugsData } = await query
    setBugs(bugsData || [])
    setLoading(false)
  }

  const saveDisplayName = async () => {
    if (!displayName.trim()) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', id)
    setProfile((p) => ({ ...p, display_name: displayName.trim() }))
    setEditing(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="page-container max-w-3xl mx-auto animate-pulse space-y-4 pt-8">
        <div className="h-24 w-24 rounded-full bg-[#1a1a1a] mx-auto" />
        <div className="h-8 bg-[#1a1a1a] rounded w-48 mx-auto" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#1a1a1a] rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="page-container text-center py-24">
        <div className="text-7xl mb-4">🐛</div>
        <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Bangers, cursive' }}>
          User Not Found
        </h1>
        <p className="text-gray-500 mb-6">This bugger doesn't exist.</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    )
  }

  const approvedBugs = bugs.filter(b => b.status === 'approved')
  const totalScore = approvedBugs.reduce((sum, b) => sum + (b.funny_score || 0), 0)
  const name = profile.display_name || 'Anonymous Bugger'

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center text-4xl mx-auto mb-4">
          🐛
        </div>

        {/* Name */}
        {editing ? (
          <div className="flex items-center justify-center gap-2 mb-2">
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveDisplayName()}
              maxLength={40}
              autoFocus
              className="bg-[#1a1a1a] border border-yellow-400 text-white text-xl font-bold text-center rounded-lg px-3 py-1 outline-none"
              style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em' }}
            />
            <button
              onClick={saveDisplayName}
              disabled={saving}
              className="bg-yellow-400 text-black text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              {saving ? '...' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setDisplayName(profile.display_name || '') }}
              className="text-gray-500 hover:text-white text-sm px-2 py-1.5 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1
              className="text-3xl text-white font-bold"
              style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em' }}
            >
              {name}
            </h1>
            {isOwner && (
              <button
                onClick={() => setEditing(true)}
                className="text-gray-500 hover:text-yellow-400 transition-colors text-sm"
                title="Edit display name"
              >
                ✏️
              </button>
            )}
          </div>
        )}

        <p className="text-gray-500 text-sm">
          Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatBox label="Bugs Submitted" value={formatNumber(approvedBugs.length)} />
        <StatBox label="Total Votes" value={formatNumber(totalScore)} />
        <StatBox label="Avg Score" value={approvedBugs.length ? formatNumber(Math.round(totalScore / approvedBugs.length)) : '—'} />
      </div>

      {/* Bugs grid */}
      <div>
        <h2 className="text-yellow-400 font-bold text-sm uppercase tracking-widest mb-4">
          {isOwner ? 'Your Bugs' : `${name}'s Bugs`}
          {isOwner && bugs.length !== approvedBugs.length && (
            <span className="ml-2 text-gray-500 normal-case tracking-normal font-normal">
              (including {bugs.length - approvedBugs.length} pending/rejected)
            </span>
          )}
        </h2>
        <BugGrid bugs={bugs} isOwner={isOwner} />
      </div>
    </div>
  )
}
