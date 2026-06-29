'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function AdminManualMatchForm() {
  const [home, setHome] = useState('')
  const [away, setAway] = useState('')
  const [kickoff, setKickoff] = useState('')
  const [venue, setVenue] = useState('')
  const [loading, setLoading] = useState(false)

  async function createMatch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('matches').insert({
      home_team: home,
      away_team: away,
      kickoff_at: kickoff,
      venue,
      status: 'upcoming',
    })

    setLoading(false)

    if (error) return alert(error.message)

    alert('Match créé')
    window.location.reload()
  }

  return (
    <form onSubmit={createMatch} className="glass rounded-3xl p-5 sm:p-6 space-y-4">
      <h2 className="text-2xl font-black">Créer un match</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="rounded-2xl px-4 py-3 bg-white/95 text-fifaBlue placeholder:text-fifaBlue/50 outline-none" placeholder="Équipe domicile" value={home} onChange={e => setHome(e.target.value)} required />
        <input className="rounded-2xl px-4 py-3 bg-white/95 text-fifaBlue placeholder:text-fifaBlue/50 outline-none" placeholder="Équipe extérieur" value={away} onChange={e => setAway(e.target.value)} required />
        <input className="rounded-2xl px-4 py-3 bg-white/95 text-fifaBlue outline-none" type="datetime-local" value={kickoff} onChange={e => setKickoff(e.target.value)} required />
        <input className="rounded-2xl px-4 py-3 bg-white/95 text-fifaBlue placeholder:text-fifaBlue/50 outline-none" placeholder="Stade / ville" value={venue} onChange={e => setVenue(e.target.value)} />
      </div>

      <button className="w-full rounded-2xl bg-fifaGold text-fifaBlue font-black p-4">
        {loading ? 'Création...' : 'Créer le match'}
      </button>
    </form>
  )
}