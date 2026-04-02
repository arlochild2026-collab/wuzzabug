import { useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export default function UploadForm({ onSuccess }) {
  const { user } = useAuth()
  const fileInputRef = useRef()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [generating, setGenerating] = useState(null) // 'title' | 'description' | null

  const generateContent = async (field) => {
    if (!ANTHROPIC_KEY) {
      setError('Add VITE_ANTHROPIC_API_KEY to your .env file to use AI generation.')
      return
    }
    setGenerating(field)
    try {
      const prompt = field === 'title'
        ? `You write punchy, funny headlines for a site called Wuzzabug — a place people share photos of dead, weird, or hilarious bugs. The tagline is "It's Dead Jim. We Promised." Generate a single witty headline (5–10 words, no quotes, no explanation) for a bug photo submission.${description ? ` Context from the user: "${description}"` : ''}`
        : `You write short, irreverent descriptions for bug photos on Wuzzabug — a site with the tagline "It's Dead Jim. We Promised." Write 1–2 funny sentences (max 120 chars) describing a bug photo.${title ? ` The headline is: "${title}"` : ''} Return only the description, no quotes.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 120,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(`AI error: ${data.error?.message || res.statusText}`)
        return
      }
      const text = data.content?.[0]?.text?.trim()
      if (text) {
        if (field === 'title') setTitle(text.slice(0, 100))
        else setDescription(text.slice(0, 500))
      }
    } catch (err) {
      setError('AI generation failed. Check your API key and try again.')
    } finally {
      setGenerating(null)
    }
  }

  const handleFile = (f) => {
    if (!f) return
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, WebM).')
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('File must be under 10MB.')
      return
    }
    setError('')
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview({ url, isVideo: f.type.startsWith('video/') })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    if (!file) { setError('Please upload a file.'); return }
    setError('')
    setUploading(true)

    try {
      // Upload file to Supabase storage
      const ext = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bugs')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bugs')
        .getPublicUrl(uploadData.path)

      const isVideo = file.type.startsWith('video/')

      // Insert bug record
      const { error: insertError } = await supabase
        .from('bugs')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          image_url: isVideo ? null : publicUrl,
          video_url: isVideo ? publicUrl : null,
          submitted_by: user.id,
          status: 'pending',
        })

      if (insertError) throw insertError

      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Title <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => generateContent('title')}
            disabled={generating !== null}
            className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating === 'title' ? (
              <>
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>✨ Generate headline</>
            )}
          </button>
        </div>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What's the bug? Give it a great headline..."
          className="input-field"
          maxLength={100}
          required
        />
        <p className="text-gray-600 text-xs mt-1">{title.length}/100</p>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Description <span className="text-gray-500">(optional)</span>
          </label>
          <button
            type="button"
            onClick={() => generateContent('description')}
            disabled={generating !== null}
            className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating === 'description' ? (
              <>
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>✨ Generate description</>
            )}
          </button>
        </div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Tell the story... where did you find this magnificent creature?"
          rows={3}
          className="input-field resize-none"
          maxLength={500}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Location <span className="text-gray-500">(optional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. My bathroom, The garden, Work kitchen..."
          className="input-field"
          maxLength={100}
        />
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Photo or Video <span className="text-red-400">*</span>
        </label>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-yellow-400 bg-yellow-400/10'
              : 'border-[#2a2a2a] hover:border-yellow-400/50 hover:bg-[#1a1a1a]'
          }`}
        >
          {preview ? (
            <div className="relative">
              {preview.isVideo ? (
                <video src={preview.url} className="max-h-48 mx-auto rounded-lg" controls />
              ) : (
                <img src={preview.url} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              )}
              <p className="text-green-400 text-sm mt-3">✅ {file.name}</p>
              <p className="text-gray-500 text-xs">Click to change</p>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-3">📷</div>
              <p className="text-white font-medium mb-1">Drag & drop or click to upload</p>
              <p className="text-gray-500 text-sm">Images (JPG, PNG, GIF, WebP) or Videos (MP4, WebM) · Max 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={e => handleFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || !title.trim() || !file}
        className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading...
          </span>
        ) : '🐛 Submit Bug'}
      </button>
    </form>
  )
}
