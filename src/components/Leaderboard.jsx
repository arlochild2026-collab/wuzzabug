import { Link } from 'react-router-dom'
import { formatNumber, timeAgo } from '../lib/helpers'

export default function Leaderboard({ bugs, title, icon, hallOfFame = false }) {
  if (!bugs || bugs.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}>
          {icon} {title}
        </h2>
        <p className="text-gray-500 text-center py-6">No bugs yet! 🐛</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
      <h2
        className="text-2xl font-bold mb-4"
        style={{
          fontFamily: 'Bangers, cursive',
          letterSpacing: '0.05em',
          color: hallOfFame ? '#f472b6' : '#facc15'
        }}
      >
        {icon} {title}
      </h2>

      <div className="space-y-3">
        {bugs.map((bug, index) => (
          <Link
            key={bug.id}
            to={`/bug/${bug.id}`}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#0f0f0f] transition-colors group"
          >
            {/* Rank */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
              index === 0
                ? 'bg-yellow-400 text-black'
                : index === 1
                ? 'bg-gray-400 text-black'
                : index === 2
                ? 'bg-amber-700 text-white'
                : 'bg-[#2a2a2a] text-gray-400'
            }`} style={index < 3 ? { fontFamily: 'Bangers, cursive' } : {}}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </div>

            {/* Thumbnail */}
            {(bug.image_url || bug.video_url) && (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#0f0f0f]">
                <img
                  src={bug.image_url || bug.video_url}
                  alt={bug.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white group-hover:text-yellow-400 transition-colors truncate">
                {bug.title}
              </p>
              <p className="text-xs text-gray-500">{timeAgo(bug.created_at)}</p>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-right">
              <div className={`font-bold text-lg ${hallOfFame ? 'text-pink-400' : 'text-yellow-400'}`}
                style={{ fontFamily: 'Bangers, cursive' }}>
                {formatNumber(bug.funny_score)}
              </div>
              <div className="text-xs text-gray-500">votes</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
