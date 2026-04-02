import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import BugCard from '../components/BugCard'
import BugCarousel from '../components/BugCarousel'
import BugOfTheDay from '../components/BugOfTheDay'
import AdSlot from '../components/AdSlot'
import SEO from '../components/SEO'
import { getWeekStart } from '../lib/helpers'
import heroBanner from '../assets/hero-banner.png'
import buzzMascot from '../assets/buzz-mascot.png'

// FAQ items — targeting "what is X bug", "are bugs dangerous", etc.
// These drive Google AI Overviews, People Also Ask, and Featured Snippets.
const FAQ_ITEMS = [
  {
    q: 'What is the funniest bug people find in their house?',
    a: 'The most commonly photographed (and mocked) house bugs are cockroaches, house centipedes, silverfish, and stinkbugs. House centipedes in particular go viral frequently because of their alarming number of legs and terrifying speed. On Wuzzabug, cockroach and centipede photos consistently earn the most votes.',
  },
  {
    q: 'How do I identify a bug I found?',
    a: 'The fastest way to identify an unknown bug is to look at its number of legs (insects have 6, spiders have 8), body segments, wings, and size. Common house insects include ants, cockroaches, silverfish, earwigs, and carpet beetles. You can also submit your mystery bug photo to Wuzzabug — the community loves a good "what is this thing?" post.',
  },
  {
    q: 'Are house bugs dangerous?',
    a: 'Most common house bugs are harmless nuisances. Cockroaches can spread bacteria and trigger allergies. Black widow and brown recluse spiders can deliver medically significant bites. Bed bugs cause itchy welts but carry no disease. Wasps and bees sting when threatened. The vast majority of bugs you\'ll find indoors are completely harmless — they\'re just gross.',
  },
  {
    q: 'Why do dead bugs end up on their backs?',
    a: 'Dead bugs often end up on their backs because of their high center of gravity. When a bug loses muscle control after death, gravity pulls the heavier abdomen over. Insecticides also cause muscle spasms that flip bugs over. Once on their backs, most insects can\'t right themselves — especially roaches — so they stay that way.',
  },
  {
    q: 'What is the grossest bug in the world?',
    a: 'Beauty (or grossness) is in the eye of the beholder, but frequent contenders include the botfly (whose larvae burrow under skin), the giant water bug (which injects digestive enzymes into prey), the cockroach (universally reviled), and the horse fly (for its painful bite). The Wuzzabug community votes on the internet\'s grossest bug photos daily — check the leaderboard.',
  },
  {
    q: 'How can I submit a funny bug photo?',
    a: 'Head to wuzzabug.com/submit, create a free account, and upload your photo or short video. Add a title and description, and our moderation team will review it. Once approved, your bug goes live and the community can vote and react. The funniest, grossest, and weirdest bugs climb the leaderboard.',
  },
]

// Combined JSON-LD: WebSite + FAQPage using @graph for multi-schema on one page
const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Wuzzabug',
      url: 'https://wuzzabug.com',
      description: 'The internet\'s funniest bug photos, ranked by the community.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://wuzzabug.com/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ],
}

// Collapsible FAQ item component
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#2a2a2a] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-[#1a1a1a] transition-colors group"
        aria-expanded={open}
      >
        <h3 className="text-white font-medium text-sm md:text-base group-hover:text-yellow-400 transition-colors">
          {q}
        </h3>
        <span className={`text-yellow-400 text-xl flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

const SORT_OPTIONS = [
  { value: 'votes', label: '⚡ Most Votes' },
  { value: 'newest', label: '🆕 Newest' },
  { value: 'weekly', label: '📅 Weekly Top' },
]

const PAGE_SIZE = 12

export default function Home() {
  const navigate = useNavigate()
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

  async function goRandom() {
    const { data } = await supabase
      .from('bugs')
      .select('id')
      .eq('status', 'approved')
    if (!data?.length) return
    const pick = data[Math.floor(Math.random() * data.length)]
    navigate(`/bug/${pick.id}`)
  }

  return (
    <div className="page-container">
      <SEO
        description="Browse thousands of funny, gross, and weird bug photos submitted by the community. Vote for your favorites and see which creepy-crawlies top the charts."
        url="https://wuzzabug.com/"
        jsonLd={homeJsonLd}
      />

      {/* Hero Banner */}
      <img src={heroBanner} alt="Wuzzabug - Funny Bug Photos" className="w-full h-auto rounded-xl mb-6" />

      {/* Banner Ad */}
      <AdSlot position="banner-top" className="w-full h-24 mb-6" />

      {/* Bug of the Day */}
      <BugOfTheDay />

      {/* Carousel */}
      <BugCarousel />

      {/* Sort controls */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <p className="text-gray-500 text-sm">{total} bugs found</p>
          <button
            onClick={goRandom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-gray-400 hover:border-yellow-400/50 hover:text-yellow-400 transition-all text-sm font-medium"
            title="Jump to a random bug"
          >
            🎲 Random
          </button>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {SORT_OPTIONS.map((opt) => (
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
        <div className="flex flex-col items-center py-20 gap-4">
          <img src={buzzMascot} alt="Buzz" className="w-48 opacity-80" />
          <p className="text-yellow-400 font-bold text-xl">No bugs yet. Be the first degenerate.</p>
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

      {/* ─── FAQ Section ───────────────────────────────────────────────────── */}
      {/* Targets "what is X bug", "are bugs dangerous", etc. for AEO/AI Overviews */}
      <section className="mt-20 mb-8" aria-labelledby="faq-heading">
        <div className="text-center mb-8">
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl text-yellow-400 mb-2"
            style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}
          >
            🐛 Bug FAQs
          </h2>
          <p className="text-gray-500 text-sm">Everything you were afraid to ask</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>
    </div>
  )
}
