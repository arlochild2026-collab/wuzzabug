import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { formatNumber } from '../lib/helpers'

const VISIBLE = 3
const FETCH_LIMIT = 10
const SLIDE_INTERVAL = 5000
const TRANSITION_MS = 500

function ShareButtons({ bug }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/bug/${bug.id}`
  const text = `Check out this bug on Wuzzabug: "${bug.title}"`

  const share = (platform) => {
    const links = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(bug.title)}`,
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const btn = 'w-6 h-6 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/25 transition-colors flex-shrink-0'

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => share('twitter')} className={btn} title="Share on X">
        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      </button>
      <button onClick={() => share('facebook')} className={btn} title="Share on Facebook">
        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>
      <button onClick={() => share('reddit')} className={btn} title="Share on Reddit">
        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      </button>
      <button onClick={copyLink} className={btn} title="Copy link">
        {copied ? (
          <svg className="w-3 h-3 stroke-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-3 h-3 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </button>
    </div>
  )
}

function BugCard({ bug, rank }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null

  return (
    <div className="px-1.5 h-full">
      <div className="rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] flex flex-col h-full">
        {/* Image */}
        <Link to={`/bug/${bug.id}`} className="relative block overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {bug.image_url ? (
            <img src={bug.image_url} alt={bug.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center text-5xl">🐛</div>
          )}
          {/* Rank badge */}
          <div className={`absolute top-2 left-2 text-xs font-black px-1.5 py-0.5 rounded ${medal ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white/80'}`}>
            {medal ? `${medal} #${rank}` : `#${rank}`}
          </div>
        </Link>

        {/* Info */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <h3
            className="text-white leading-tight line-clamp-2"
            style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em', fontSize: '1.05rem' }}
          >
            {bug.title}
          </h3>
          <div className="flex items-center justify-between mt-auto gap-1 flex-wrap">
            <span className="text-yellow-400 text-xs font-bold whitespace-nowrap">
              {formatNumber(bug.funny_score)} 😂
            </span>
            <div className="flex items-center gap-1.5">
              <ShareButtons bug={bug} />
              <Link
                to={`/bug/${bug.id}`}
                className="text-xs bg-yellow-400 text-black font-bold px-2 py-1 rounded hover:bg-yellow-300 transition-colors whitespace-nowrap flex-shrink-0"
              >
                View →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BugCarousel() {
  const [bugs, setBugs] = useState([])
  const [offset, setOffset] = useState(0)
  const [animated, setAnimated] = useState(true)
  const busy = useRef(false)

  useEffect(() => {
    async function fetchTopBugs() {
      const { data } = await supabase
        .from('bugs')
        .select('*')
        .eq('status', 'approved')
        .order('funny_score', { ascending: false })
        .limit(FETCH_LIMIT)
      if (data) setBugs(data)
    }
    fetchTopBugs()
  }, [])

  useEffect(() => {
    if (bugs.length < VISIBLE) return

    const id = setInterval(() => {
      if (busy.current) return
      busy.current = true

      setAnimated(true)
      setOffset((o) => {
        const next = o + 1

        if (next >= bugs.length) {
          // Let the slide-to-clone finish, then snap back invisibly
          setTimeout(() => {
            setAnimated(false)
            setOffset(0)
            // Re-enable animation after one paint
            setTimeout(() => {
              setAnimated(true)
              busy.current = false
            }, 50)
          }, TRANSITION_MS)
        } else {
          setTimeout(() => { busy.current = false }, TRANSITION_MS)
        }

        return next
      })
    }, SLIDE_INTERVAL)

    return () => clearInterval(id)
  }, [bugs.length])

  if (bugs.length === 0) return null

  // Duplicate first VISIBLE items at the end so the loop looks seamless
  const items = [...bugs, ...bugs.slice(0, VISIBLE)]
  const totalCards = items.length

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-yellow-400 font-bold text-sm uppercase tracking-widest">
          🔥 Top Bugs
        </span>
        <span className="text-white/40 text-xs">{bugs.length} ranked</span>
      </div>

      <div className="overflow-hidden">
        <div
          style={{
            display: 'flex',
            width: `${(totalCards / VISIBLE) * 100}%`,
            transform: `translateX(-${(offset / totalCards) * 100}%)`,
            transition: animated ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none',
          }}
        >
          {items.map((bug, i) => (
            <div key={`${bug.id}-${i}`} style={{ width: `${100 / totalCards}%` }}>
              <BugCard bug={bug} rank={bugs.findIndex(b => b.id === bug.id) + 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
