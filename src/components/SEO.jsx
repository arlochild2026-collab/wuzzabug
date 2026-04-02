/**
 * SEO Component — Wuzzabug
 *
 * Manages all <head> meta tags for SEO, Open Graph, Twitter Cards,
 * canonical URLs, and JSON-LD structured data.
 *
 * Zero external dependencies — uses useEffect to directly mutate document.head.
 *
 * Usage:
 *   <SEO title="My Page" description="…" image="https://…" url="https://…" />
 *
 * JSON-LD usage:
 *   <SEO jsonLd={{ "@type": "WebSite", … }} />
 */

import { useEffect } from 'react'

const SITE_NAME = 'Wuzzabug'
const BASE_URL = 'https://wuzzabug.com'
const TWITTER_HANDLE = '@wuzzabug'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`
const DEFAULT_DESCRIPTION =
  'The internet\'s funniest bug photos, ranked by the community. Vote on the grossest, weirdest, and most hilarious insects found in the wild.'

/**
 * Upserts a <meta> tag. Creates it if it doesn't exist.
 * @param {'name'|'property'} attr  - The attribute used to look up the tag
 * @param {string}            key   - The attribute value (e.g. 'og:title')
 * @param {string}            value - The content to set
 */
function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/**
 * Upserts a <link> tag with the given rel attribute.
 */
function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Upserts a JSON-LD <script> tag with id="json-ld".
 */
function setJsonLd(data) {
  let el = document.head.querySelector('script#json-ld')
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.setAttribute('id', 'json-ld')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeJsonLd() {
  const el = document.head.querySelector('script#json-ld')
  if (el) el.remove()
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SEO({
  /** Page title. Appended with " | Wuzzabug" automatically. */
  title,
  /** Meta description. Max ~160 chars. */
  description,
  /** Absolute URL of the OG share image (1200×630 recommended). */
  image,
  /** Canonical URL for this page. */
  url,
  /** og:type — 'website' (default) or 'article' for bug detail pages */
  type = 'website',
  /** If true, adds robots noindex,nofollow */
  noindex = false,
  /** JSON-LD object (will be serialised into application/ld+json script tag). */
  jsonLd = null,
}) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Funny Bug Photos, Ranked by the Internet`
  const metaDesc = description || DEFAULT_DESCRIPTION
  const metaImage = image || DEFAULT_OG_IMAGE
  const metaUrl = url || BASE_URL

  useEffect(() => {
    // ── Page title ─────────────────────────────────────────────────────────
    document.title = fullTitle

    // ── Standard meta ──────────────────────────────────────────────────────
    setMeta('name', 'description', metaDesc)
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')

    // ── Open Graph ─────────────────────────────────────────────────────────
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', metaDesc)
    setMeta('property', 'og:image', metaImage)
    setMeta('property', 'og:image:width', '1200')
    setMeta('property', 'og:image:height', '630')
    setMeta('property', 'og:url', metaUrl)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE_NAME)

    // ── Twitter / X Cards ──────────────────────────────────────────────────
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:site', TWITTER_HANDLE)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', metaDesc)
    setMeta('name', 'twitter:image', metaImage)

    // ── Canonical ──────────────────────────────────────────────────────────
    setLink('canonical', metaUrl)

    // ── JSON-LD ────────────────────────────────────────────────────────────
    if (jsonLd) {
      setJsonLd(jsonLd)
    } else {
      removeJsonLd()
    }

    // Cleanup: restore baseline title when navigating away
    return () => {
      document.title = `${SITE_NAME} 🐛`
      removeJsonLd()
    }
  }, [fullTitle, metaDesc, metaImage, metaUrl, noindex, type, jsonLd])

  return null
}
