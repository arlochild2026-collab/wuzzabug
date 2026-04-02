import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { formatNumber, timeAgo } from '../lib/helpers'

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export default function BotdPicker() {
  const { user } = useAuth()
  const [current, setCurrent] = useState(null)       // current BOTD row from DB
  const [currentBug, setCurrentBug] = useState(null) // full bug data for current pick
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchCurrent()
  }, [])

  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
    const t = setTimeout(() => doSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  async function fetchCurrent() {
    const { data } = await supabase
      .from('bug_of_the_day')
      .select('bug_id, set_at')
      .eq('id', 1)
      .single()

    setCurrent(data)

    if (data?.bug_id) {
      const { data: bug } = await supabase
        .from('bugs')
        .select('id, title, image_url, funny_score')
        .eq('id', data.bug_id)
        .single()
      setCurrentBug(bug)
    }
  }

  async function doSearch(q) {
    setSearching(true)
    const { data } = await supabase
      .from('bugs')
      .select('id, title, image_url, funny_score')
      .eq('status', 'approved')
      .ilike('title', `%${q}%`)
      .order('funny_score', { ascending: false })
      .limit(8)
    setResults(data || [])
    setSearching(false)
  }

  async function setPick(bug) {
    setSaving(true)
    await supabase
      .from('bug_of_the_day')
      .upsert({ id: 1, bug_id: bug.id, set_at: new Date().toISOString(), set_by: user.id })
    setCurrent({ bug_id: bug.id, set_at: new Date().toISOString() })
    setCurrentBug(bug)
    setSearch('')
    setResults([])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function clearPick() {
    await supabase
      .from('bug_of_the_day')
      .update({ bug_id: null })
      .eq('id', 1)
    setCurrent(null)
    setCurrentBug(null)
  }

  const isExpired = current?.set_at
    ? Date.now() - new Date(current.set_at).getTime() >= TWENTY_FOUR_HOURS
    : true

  return (
    <div className="space-y-6">
      {/* Current pick */}
      <div>
        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Current Bug of the Day</h3>
        {currentBug && current?.bug_id ? (
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${isExpired ? 'border-red-500/30 bg-red-500/5' : 'border-yellow-400/30 bg-yellow-400/5'}`}>
            {currentBug.image_url && (
              <img src={currentBug.image_url} alt={currentBug.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em', fontSize: '1rem' }}>
                {currentBug.title}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {formatNumber(currentBug.funny_score)} votes ·{' '}
                {isExpired
                  ? <span className="text-red-400 font-medium">Expired — falling back to top scorer</span>
                  : <span className="text-yellow-400/80">set {timeAgo(current.set_at)} · expires in ~{Math.round((new Date(current.set_at).getTime() + TWENTY_FOUR_HOURS - Date.now()) / 3600000)}h</span>
                }
              </p>
            </div>
            <button
              onClick={clearPick}
              className="text-gray-500 hover:text-red-400 text-xs transition-colors flex-shrink-0"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#111] text-gray-500 text-sm">
            No admin pick — showing top scorer automatically.
          </div>
        )}
        {saved && (
          <p className="text-green-400 text-sm mt-2">✓ Bug of the Day updated!</p>
        )}
      </div>

      {/* Search & pick */}
      <div>
        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Pick a Bug</h3>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search approved bugs by title…"
          className="w-full bg-[#111] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400/50 placeholder-gray-600"
        />

        {searching && (
          <p className="text-gray-500 text-xs mt-2">Searching…</p>
        )}

        {results.length > 0 && (
          <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
            {results.map(bug => (
              <button
                key={bug.id}
                onClick={() => setPick(bug)}
                disabled={saving}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#2a2a2a] hover:border-yellow-400/40 hover:bg-yellow-400/5 transition-all text-left disabled:opacity-50"
              >
                {bug.image_url && (
                  <img src={bug.image_url} alt={bug.title} className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em' }}>
                    {bug.title}
                  </p>
                  <p className="text-gray-500 text-xs">{formatNumber(bug.funny_score)} votes</p>
                </div>
                <span className="text-yellow-400 text-xs font-bold flex-shrink-0">Set →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
