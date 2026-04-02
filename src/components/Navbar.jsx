import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`transition-colors duration-200 font-medium ${
        location.pathname === to
          ? 'text-yellow-400'
          : 'text-gray-300 hover:text-yellow-400'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Wuzzabug" className="h-14" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/', 'Home')}
            {navLink('/leaderboard', 'Leaderboard')}
            {isAdmin && navLink('/admin', 'Admin')}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/submit" className="btn-primary text-sm">
                  + Submit Bug
                </Link>
                <Link
                  to={`/user/${user.id}`}
                  className="w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-base hover:bg-yellow-400/30 transition-colors"
                  title="My Profile"
                >
                  🐛
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary text-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#2a2a2a] py-4 flex flex-col gap-4">
            {navLink('/', 'Home')}
            {navLink('/leaderboard', 'Leaderboard')}
            {isAdmin && navLink('/admin', 'Admin')}
            {user ? (
              <>
                <Link to="/submit" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">
                  + Submit Bug
                </Link>
                <Link to={`/user/${user.id}`} onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-yellow-400 text-sm transition-colors">
                  🐛 My Profile
                </Link>
                <button onClick={handleSignOut} className="text-gray-400 text-sm text-left">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
