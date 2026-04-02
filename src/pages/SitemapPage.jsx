/**
 * SitemapPage — Dynamic XML Sitemap
 *
 * Accessible at: /sitemap.xml
 *
 * On mount this component fetches all approved bug IDs from Supabase,
 * builds a valid XML sitemap string, and replaces the entire document
 * with it — so search engine crawlers receive real XML content.
 *
 * NOTE: This approach works for most crawlers. For best results in
 * production, consider generating the sitemap via a serverless function
 * (e.g. a Supabase Edge Function) so the Content-Type header is
 * correctly set to application/xml.
 */

import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const BASE_URL = 'https://wuzzabug.com'

const STATIC_PAGES = [
  { loc: `${BASE_URL}/`,           changefreq: 'daily',   priority: '1.0' },
  { loc: `${BASE_URL}/leaderboard`, changefreq: 'daily',   priority: '0.8' },
  { loc: `${BASE_URL}/submit`,      changefreq: 'monthly', priority: '0.5' },
]

function buildXml(bugRows) {
  const today = new Date().toISOString().split('T')[0]

  const staticUrls = STATIC_PAGES.map(p => `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

  const bugUrls = bugRows.map(bug => `
  <url>
    <loc>${BASE_URL}/bug/${bug.id}</loc>
    <lastmod>${bug.created_at ? bug.created_at.split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${staticUrls}${bugUrls}
</urlset>`
}

export default function SitemapPage() {
  useEffect(() => {
    async function generateSitemap() {
      // Fetch all approved bug IDs + timestamps (lightweight query)
      const { data, error } = await supabase
        .from('bugs')
        .select('id, created_at, image_url, title')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      const bugRows = (!error && data) ? data : []
      const xml = buildXml(bugRows)

      // Replace the entire document content with the XML sitemap.
      // This ensures search engine crawlers receive valid XML.
      document.open('text/xml')
      document.write(xml)
      document.close()
    }

    generateSitemap()
  }, [])

  // Render nothing while the async replacement is happening
  return null
}
