/**
 * Format a date to a relative string (e.g. "2 days ago")
 */
export function timeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

/**
 * Truncate text to a given length
 */
export function truncate(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Get the start of the current week (7 days ago)
 */
export function getWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString()
}

/**
 * Check if a URL is a video file
 */
export function isVideoUrl(url) {
  if (!url) return false
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
}

/**
 * Copy text to clipboard and return success boolean
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const success = document.execCommand('copy')
    document.body.removeChild(el)
    return success
  }
}

/**
 * Format a number with commas (e.g. 1000 → 1,000)
 */
export function formatNumber(n) {
  return (n || 0).toLocaleString()
}
