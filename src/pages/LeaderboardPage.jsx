import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Leaderboard from '../components/Leaderboard'
import { getWeekStart } from '../lib/helpers'

export default function LeaderboardPage() {
  const [allTime, setAllTime] = useState([])
  const [weekly, setWeekly] = useState([])
  const [hallOfFame, setHallOfFame] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboards()
  }, [])

  async function fetchLeaderboards() {
    setLoading(true)

    const [allTimeRes, weeklyRes, hofRes] = await Promise.all([
      // All-time top 10
      supabase
        .from('bugs')
        .select('*')
        .eq('status', 'approved')
        .order('funny_score', { ascending: false })
        .limit(10),

      // Weekly top 5
      supabase
        .from('bugs')
        .select('*')
        .eq('status', 'approved')
        .gte('created_at', getWeekStart())
        .order('funny_score', { ascending: false })
        .limit(5),

      // Hall of Fame: 100+ votes
      supabase
        .from('bugs')
        .select('*')
        .eq('status', 'approved')
        .gte('funny_score', 100)
        .order('funny_score', { ascending: false }),
    ])

    setAllTime(allTimeRes.data || [])
    setWeekly(weeklyRes.data || [])
    setHallOfFame(hofRes.data || [])
    setLoading(false)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-5xl md:text-7xl text-yellow-400 mb-3"
          style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}
        >
          🏆 Leaderboard
        </h1>
        <p className="text-gray-400 text-lg">The most celebrated bugs on the internet</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 animate-pulse">
              <div className="h-8 bg-[#2a2a2a] rounded w-48 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-14 bg-[#2a2a2a] rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hall of Fame — shown first if it has entries */}
          {hallOfFame.length > 0 && (
            <Leaderboard
              bugs={hallOfFame}
              title="Hall of Fame"
              icon="✨"
              hallOfFame
            />
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* All-time top 10 */}
            <Leaderboard
              bugs={allTime}
              title="All-Time Top 10"
              icon="🏆"
            />

            {/* Weekly top 5 */}
            <Leaderboard
              bugs={weekly}
              title="This Week's Top 5"
              icon="📅"
            />
          </div>

          {hallOfFame.length === 0 && (
            <div className="bg-[#1a1a1a] border border-pink-500/30 rounded-2xl p-6 text-center">
              <p className="text-pink-400 font-bold text-lg mb-1" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}>
                ✨ Hall of Fame
              </p>
              <p className="text-gray-500 text-sm">
                Bugs with 100+ votes earn a spot here. Keep voting! 🐛
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
