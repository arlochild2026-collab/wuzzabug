import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdSlot({ position, className = '' }) {
  const [ad, setAd] = useState(null)

  useEffect(() => {
    async function fetchAd() {
      const { data } = await supabase
        .from('ad_slots')
        .select('*')
        .eq('position', position)
        .eq('active', true)
        .single()
      setAd(data)
    }
    fetchAd()
  }, [position])

  if (!ad) return null

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] ${className}`}>
      <div className="absolute top-1 left-1 z-10 text-[10px] text-gray-600 bg-black/80 px-1 rounded">
        Sponsored
      </div>
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        {ad.image_url ? (
          <img
            src={ad.image_url}
            alt={ad.sponsor_name || 'Advertisement'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-4 text-center">
            <p className="text-yellow-400 font-bold">{ad.sponsor_name}</p>
          </div>
        )}
      </a>
    </div>
  )
}
