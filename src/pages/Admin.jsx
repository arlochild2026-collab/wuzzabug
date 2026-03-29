import { useAuth } from '../lib/AuthContext'
import ModerationDashboard from '../components/ModerationDashboard'

export default function Admin() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1
          className="text-4xl md:text-5xl text-yellow-400 mb-2"
          style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}
        >
          🐛 Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Logged in as <span className="text-yellow-400">{user?.email}</span>
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Moderation Queue', desc: 'Review pending submissions below' },
          { label: 'Admin Access', desc: 'Full moderation privileges' },
          { label: 'Ad Management', desc: 'Manage ad slots via Supabase dashboard' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-yellow-400 font-bold text-sm">{stat.label}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Moderation */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}>
          Bug Moderation
        </h2>
        <ModerationDashboard />
      </div>
    </div>
  )
}
