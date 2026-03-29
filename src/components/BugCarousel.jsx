import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { formatNumber } from '../lib/helpers'

export default function BugCarousel() {
  const [bugs, setBugs] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    async function fetchTopBugs() {
      const { data } = await supabase
        .from('bugs')
        .select('*')
        .eq('status', 'approved')
        .order('funny_score', { ascending: false })
        .limit(5)
      if (data) setBugs(data)
    }
    fetchTopBugs()
  }, [])

  useEffect(() => {
    if (bugs.length === 0) return
    const interval = setInterval(() => {
      setCurrent(c => (c + 1) % bugs.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [bugs.length])

  if (bugs.length === 0) return null

  const bug = bugs[current]

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] mb-8">
      {/* Image — full image always visible, container grows to fit */}
      {bug.image_url && (
        <img
          src={bug.image_url}
          alt={bug.title}
          className="w-full h-auto block"
          style={{ maxHeight: '640px', objectFit: 'contain' }}
        />
      )}

      {/* Gradient overlay at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="inline-block bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mb-3">
          🔥 TOP BUG
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 line-clamp-2" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em' }}>
          {bug.title}
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-yellow-400 font-bold">{formatNumber(bug.funny_score)} votes</span>
          <Link
            to={`/bug/${bug.id}`}
            className="btn-primary text-sm"
          >
            View Bug →
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute top-4 right-4 flex gap-2">
        {bugs.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-yellow-400 w-6' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Prev/Next arrows */}
      <button
        onClick={() => setCurrent(c => (c - 1 + bugs.length) % bugs.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % bugs.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
      >
        ›
      </button>
    </div>
  )
}
