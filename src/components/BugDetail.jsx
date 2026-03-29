import { useState } from 'react'
import { isVideoUrl, timeAgo, copyToClipboard } from '../lib/helpers'
import VoteButton from './VoteButton'
import CommentSection from './CommentSection'

export default function BugDetail({ bug }) {
  const [copied, setCopied] = useState(false)
  const mediaUrl = bug.image_url || bug.video_url
  const isVideo = isVideoUrl(mediaUrl)

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href)
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
        <div className="flex flex-wrap items-center gap-3">
          <VoteButton bugId={bug.id} initialScore={bug.funny_score} />

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2a2a2a] text-gray-300 hover:border-gray-500 hover:text-white transition-all text-sm font-medium"
          >
            {copied ? (
              <>
                <span>✅</span>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="border-t border-[#2a2a2a] pt-6">
        <CommentSection bugId={bug.id} />
      </div>
    </div>
  )
}
