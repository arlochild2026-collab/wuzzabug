import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isVideoUrl, timeAgo, copyToClipboard } from '../lib/helpers'
import { supabase } from '../lib/supabaseClient'
import VoteButton from './VoteButton'
import ReactionBar from './ReactionBar'
import CommentSection from './CommentSection'

export default function BugDetail({ bug }) {
  const [copied, setCopied] = useState(false)
  const [submitter, setSubmitter] = useState(null)

  useEffect(() => {
    if (!bug.submitted_by) return
    supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', bug.submitted_by)
      .single()
      .then(({ data }) => setSubmitter(data))
  }, [bug.submitted_by])

  const mediaUrl = bug.image_url || bug.video_url
  const isVideo = isVideoUrl(mediaUrl)
  const shareUrl = window.location.href
  const shareText = `Check out this bug on Wuzzabug: "${bug.title}"`

  const openShare = (platform) => {
    const links = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(bug.title)}`,
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Media */}
      <div className="rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] mb-6">
        {mediaUrl ? (
          isVideo ? (
            <video
              src={mediaUrl}
              controls
              className="w-full max-h-[70vh] object-contain"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={bug.title}
              className="w-full max-h-[70vh] object-contain"
            />
          )
        ) : (
          <div className="h-64 flex items-center justify-center text-8xl">🐛</div>
        )}
      </div>

      {/* Info */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start gap-4 mb-4">
          <h1
            className="text-3xl md:text-5xl font-bold text-white flex-1"
            style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em' }}
          >
            {bug.title}
          </h1>
        </div>

        {bug.description && (
          <p className="text-gray-300 text-lg mb-4 leading-relaxed">{bug.description}</p>
        )}

        {submitter && (
          <p className="text-sm text-gray-500 mb-3">
            submitted by{' '}
            <Link
              to={`/user/${submitter.id}`}
              className="text-yellow-400/80 hover:text-yellow-400 font-medium transition-colors"
            >
              {submitter.display_name || 'Anonymous Bugger'}
            </Link>
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
          {bug.location && (
            <span className="flex items-center gap-1">
              <span>📍</span> {bug.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span>🕐</span> {timeAgo(bug.created_at)}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            bug.status === 'approved'
              ? 'bg-green-400/20 text-green-400'
              : bug.status === 'rejected'
              ? 'bg-red-400/20 text-red-400'
              : 'bg-yellow-400/20 text-yellow-400'
          }`}>
            {bug.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <VoteButton bugId={bug.id} initialScore={bug.funny_score} />

          {/* Share buttons */}
          <div className="flex items-center gap-2">
            {/* X / Twitter */}
            <button
              onClick={() => openShare('twitter')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2a2a2a] text-gray-300 hover:border-gray-500 hover:text-white transition-all text-sm font-medium"
              title="Share on X"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              <span>Post</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => openShare('facebook')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2a2a2a] text-gray-300 hover:border-gray-500 hover:text-white transition-all text-sm font-medium"
              title="Share on Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Share</span>
            </button>

            {/* Reddit */}
            <button
              onClick={() => openShare('reddit')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2a2a2a] text-gray-300 hover:border-gray-500 hover:text-white transition-all text-sm font-medium"
              title="Share on Reddit"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
              <span>Reddit</span>
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2a2a2a] text-gray-300 hover:border-gray-500 hover:text-white transition-all text-sm font-medium"
              title="Copy link"
            >
              {copied ? <span>✅</span> : <span>🔗</span>}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Reactions */}
        <ReactionBar bugId={bug.id} />
      </div>

      {/* Comments */}
      <div className="border-t border-[#2a2a2a] pt-6">
        <CommentSection bugId={bug.id} />
      </div>
    </div>
  )
}
