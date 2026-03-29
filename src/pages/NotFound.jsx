import React from 'react'
import { Link } from 'react-router-dom'
import buzzMascot from '../assets/buzz-mascot.png'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-6 text-center px-4">
      <img src={buzzMascot} alt="Buzz" className="w-56" />
      <h1 className="text-yellow-400 text-6xl font-bold" style={{fontFamily: 'Bangers, cursive'}}>404</h1>
      <p className="text-white text-xl">This page is deader than Buzz.</p>
      <Link to="/" className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full hover:bg-yellow-300 transition">
        Take Me Home 🐛
      </Link>
    </div>
  )
}
