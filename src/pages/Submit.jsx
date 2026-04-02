import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import UploadForm from '../components/UploadForm'
import SEO from '../components/SEO'

export default function Submit() {
  const { user, loading } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth?next=/submit" replace />
  }

  if (submitted) {
    return (
      <div className="page-container">
        <div className="max-w-xl mx-auto text-center py-20">
          <div className="text-8xl mb-6 animate-bounce">🐛</div>
          <h1
            className="text-4xl text-yellow-400 mb-4"
            style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}
          >
            Bug Submitted!
          </h1>
          <div className="bg-[#1a1a1a] border border-yellow-400/30 rounded-2xl p-6 mb-8">
            <p className="text-xl text-white font-medium mb-2">
              Your bug is pending approval 🐛
            </p>
            <p className="text-gray-400">
              Our crack team of bug-wranglers will review your submission shortly.
              Once approved, it'll be live on the site for the world to admire.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSubmitted(false)}
              className="btn-secondary"
            >
              Submit Another
            </button>
            <Link to="/" className="btn-primary">
              Browse Bugs →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <SEO
        title="Submit Your Bug"
        description="Found a funny, gross, or weird bug? Submit your bug photo to Wuzzabug and let the internet vote on it. All submissions are reviewed before going live."
        url="https://wuzzabug.com/submit"
      />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl text-yellow-400 mb-2"
            style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}
          >
            🐛 Submit a Bug
          </h1>
          <p className="text-gray-400">
            Found a magnificent specimen? Share it with the world.
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 md:p-8">
          <UploadForm onSuccess={() => setSubmitted(true)} />
        </div>

        <p className="text-gray-600 text-xs text-center mt-4">
          By submitting, you confirm you have the right to share this content.
          All submissions are reviewed before going live.
        </p>
      </div>
    </div>
  )
}
