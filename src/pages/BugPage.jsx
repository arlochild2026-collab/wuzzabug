import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import BugDetail from '../components/BugDetail'
import AdSlot from '../components/AdSlot'
import SEO from '../components/SEO'

export default function BugPage() {
  const { id } = useParams()
  const [bug, setBug] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchBug() {
      const { data, error } = await supabase
        .from('bugs')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setBug(data)
      }
      setLoading(false)
    }
    fetchBug()
  }, [id])

  if (loading) {
    return (
      <div className="page-container">
        <SEO noindex />
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="aspect-video bg-[#1a1a1a] rounded-2xl" />
          <div className="h-12 bg-[#1a1a1a] rounded-xl w-3/4" />
          <div className="h-6 bg-[#1a1a1a] rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="page-container text-center py-24">
        <SEO title="Bug Not Found" noindex />
        <div className="text-7xl mb-4">🐛</div>
        <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Bangers, cursive' }}>
          Bug Not Found
        </h1>
        <p className="text-gray-500 mb-6">This bug has crawled away...</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    )
  }

  // Build JSON-LD for the individual bug (ImageObject schema)
  const bugJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: bug.title,
    description: bug.description || `Funny bug photo: ${bug.title}`,
    contentUrl: bug.image_url,
    url: `https://wuzzabug.com/bug/${bug.id}`,
    datePublished: bug.created_at,
    author: {
      '@type': 'Person',
      identifier: bug.submitted_by,
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: bug.funny_score,
    },
  }

  // Truncate description to ~155 chars for meta
  const metaDesc = bug.description
    ? `${bug.description.slice(0, 140)}… Vote on Wuzzabug!`
    : `Check out "${bug.title}" — a hilarious bug photo on Wuzzabug. Vote and react!`

  return (
    <div className="page-container">
      <SEO
        title={bug.title}
        description={metaDesc}
        image={bug.image_url}
        url={`https://wuzzabug.com/bug/${bug.id}`}
        type="article"
        jsonLd={bugJsonLd}
      />
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <Link to="/" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors flex items-center gap-1">
              ← Back to all bugs
            </Link>
          </div>
          <BugDetail bug={bug} />
        </div>

        {/* Sidebar ad */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <AdSlot position="sidebar" className="w-full h-96 sticky top-24" />
          <AdSlot position="bug-of-week" className="w-full h-48 mt-4 sticky top-[calc(24rem+6rem)]" />
        </div>
      </div>
    </div>
  )
}
