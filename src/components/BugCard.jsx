import { Link } from 'react-router-dom'
import { timeAgo, isVideoUrl, formatNumber } from '../lib/helpers'
import ReactionPicker from './ReactionPicker'

export default function BugCard({ bug }) {
  const isVideo = isVideoUrl(bug.image_url || bug.video_url)
  const mediaUrl = bug.image_url || bug.video_url

  return (
    <div
      className="card group relative block cursor-pointer"
      style={{ transform: 'scale(1)', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Clickable area: media + title/meta → navigates to bug page */}
      <Link to={`/bug/${bug.id}`} className="block">
        {/* Media */}
        <div className="relative aspect-video bg-[#0f0f0f] overflow-hidden">
          {mediaUrl ? (
            isVideo ? (
              <video
                src={mediaUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                onMouseEnter={e => e.target.play()}
                onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0 }}
              />
            ) : (
              <img
                src={mediaUrl}
                alt={bug.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🐛
            </div>
          )}

          {/* Vote overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bangers text-yellow-400" style={{ fontFamily: 'Bangers, cursive' }}>
                {formatNumber(bug.funny_score)}
              </div>
              <div className="text-yellow-300 text-sm font-medium">votes</div>
            </div>
          </div>

          {/* Video badge */}
          {isVideo && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Video
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 pb-2">
          <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 group-hover:text-yellow-400 transition-colors">
            {bug.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>{formatNumber(bug.funny_score)} votes</span>
            </div>
            <div className="flex items-center gap-3">
              {bug.location && (
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate max-w-[80px]">{bug.location}</span>
                </span>
              )}
              <span>{timeAgo(bug.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Reaction picker – lives outside the Link so clicks don't navigate */}
      <div className="px-4 pb-3 pt-1">
        <ReactionPicker bugId={bug.id} />
      </div>
    </div>
  )
}
