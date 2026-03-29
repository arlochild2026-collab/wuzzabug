import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import BugCard from '../components/BugCard'
import BugCarousel from '../components/BugCarousel'
import AdSlot from '../components/AdSlot'
import { getWeekStart } from '../lib/helpers'

const SORT_OPTIONS = [
  { value: 'votes', label: '⚡ Most Votes' },
  { value: 'newest', label: '🆕 Newest' },
  { value: 'weekly', label: '📅 Weekly Top' },
]

const PAGE_SIZE = 12

export default function Home() {
  const [bugs, setBugs] = useState([])
  const [sort, setSort] = useState('votes')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPage(0)
  }, [sort])

  useEffect(() => {
    fetchBugs()
  }, [sort, page])

  async function fetchBugs() {
    setLoading(true)
    let query = supabase
      .from('bugs')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')

    if (sort === 'weekly') {
      query = query.gte('created_at', getWeekStart())
    }

    if (sort === 'votes' || sort === 'weekly') {
      query = query.order('funny_score', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    const { data, count } = await query
    setBugs(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="page-container">
      {/* Banner Ad */}
      <AdSlot position="banner-top" className="w-full h-24 mb-6" />

      {/* Hero */}
      <div className="text-center mb-8">
        <h1
          className="text-5xl md:text-7xl text-yellow-400 mb-3"
          style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}
        >
          🐛 Wuzzabug
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          The internet's greatest bugs. Curated by people with too much time.
        </p>
      </div>

      {/* Carousel */}
      <BugCarousel />

      {/* Sort controls */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">{total} bugs found</p>
        <div className="flex gap-2 flex-wrap justify-end">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                sort === opt.value
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-transparent text-gray-400 border-[#2a2a2a] hover:border-yellow-400/50 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-[#2a2a2a]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#2a2a2a] rounded w-3/4" />
                <div className="h-3 bg-[#2a2a2a] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : bugs.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-7xl mb-4">🐛</div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Bangers, cursive' }}>
            No bugs here... yet
          </h2>
          <p className="text-gray-500 mb-6">
            {sort === 'weekly' ? "No bugs submitted this week." : "Be the first to submit a bug!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bugs.map(bug => (
              <BugCard key={bug.id} bug={bug} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-yellow-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(i => Math.abs(i - page) <= 2 || i === 0 || i === totalPages - 1)
                .reduce((acc, i, idx, arr) => {
                  if (idx > 0 && i - arr[idx - 1] > 1) acc.push('...')
                  acc.push(i)
                  return acc
                }, [])
                .map((item, i) => (
                  item === '...' ? (
                    <span key={`ellipsis-${i}`} className="text-gray-600 px-2">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        page === item
                          ? 'bg-yellow-400 text-black'
                          : 'border border-[#2a2a2a] text-gray-400 hover:border-yellow-400/50 hover:text-white'
                      }`}
                    >
                      {item + 1}
                    </button>
                  )
                ))
              }

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-yellow-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
