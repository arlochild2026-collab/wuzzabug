import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { formatNumber, timeAgo } from '../lib/helpers'

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export default function BugOfTheDay() {
  const [bug, setBug] = useState(null)
  const [isAdminPick, setIsAdminPick] = useState(false)
  const [expiresAt, setExpiresAt] = useState(null)

  useEffect(() => {
    fetchBotd()
  }, [])

  async function fetchBotd() {
    // Check for an admin-set BOTD
    const { data: botdRow } = await supabase
      .from('bug_of_the_day')
      .select('bug_id, set_at')
      .eq('id', 1)
      .single()

    const isValid =
      botdRow?.bug_id &&
      Date.now() - new Date(botdRow.set_at).getTime() < TWENTY_FOUR_HOURS

    if (isValid) {
      const { data: bugData } = await supabase
        .from('bugs')
        .select('*')
        .eq('id', botdRow.bug_id)
        .eq('status', 'approved')
        .single()

      if (bugData) {
        setBug(bugData)
        setIsAdminPick(true)
        setExpiresAt(new Date(new Date(botdRow.set_at).getTime() + TWENTY_FOUR_HOURS))
        return
      }
    }

    // Fallback: highest funny_score approved bug
    const { data: topBug } = await supabase
      .from('bugs')
      .select('*')
      .eq('status', 'approved')
      .order('funny_score', { ascending: false })
      .limit(1)
      .single()

    if (topBug) setBug(topBug)
  }

  if (!bug) return null

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-8 border border-yellow-400/30 bg-[#1a1a1a]">
      {/* Background image with dark overlay */}
      {bug.image_url && (
        <div className="absolute inset-0">
          <img
            src={bug.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Left: text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded uppercase tracking-wide">
              ☀️ Bug of the Day
            </span>
            {isAdminPick ? (
              <span className="text-yellow-400/60 text-xs">admin pick · expires {expiresAt && timeAgo(expiresAt.toISOString())}</span>
            ) : (
              <span className="text-gray-500 text-xs">top scorer</span>
            )}
          </div>

          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight"
            style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em' }}
          >
            {bug.title}
          </h2>

          {bug.description && (
            <p className="text-gray-300 text-sm md:text-base mb-4 line-clamp-2 max-w-xl">
              {bug.description}
            </p>
          )}

          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-yellow-400 font-bold text-lg">
              {formatNumber(bug.funny_score)} 😂
            </span>
            {bug.location && (
              <span className="text-gray-400 text-sm">📍 {bug.location}</span>
            )}
            <Link
              to={`/bug/${bug.id}`}
              className="btn-primary text-sm"
            >
              View Bug →
            </Link>
          </div>
        </div>

        {/* Right: thumbnail (desktop only) */}
        {bug.image_url && (
          <Link
            to={`/bug/${bug.id}`}
            className="hidden md:block flex-shrink-0 w-48 h-36 rounded-xl overflow-hidden border border-white/10 hover:border-yellow-400/50 transition-colors"
          >
            <img
              src={bug.image_url}
              alt={bug.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        )}
      </div>
    </div>
  )
}
