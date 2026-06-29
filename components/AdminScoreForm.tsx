'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function AdminScoreForm({ match }: { match: any }) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? '')
  const [awayScore, setAwayScore] = useState(match.away_score ?? '')
  const [penalties, setPenalties] = useState(Boolean(match.penalties))
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hiding, setHiding] = useState(false)

  async function saveScore(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('matches')
      .update({
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        penalties,
        status: 'finished',
      })
      .eq('id', match.id)

    setLoading(false)

    if (error) return alert(error.message)

    alert('Score enregistré')
    window.location.reload()
  }

  async function hideMatch() {
    const ok = confirm(
      `Masquer ${match.home_team} vs ${match.away_team} sans enlever les points ?`
    )

    if (!ok) return

    setHiding(true)

    const { error } = await supabase
      .from('matches')
      .update({ hidden: true })
      .eq('id', match.id)

    setHiding(false)

    if (error) return alert(error.message)

    alert('Match masqué. Les points sont conservés.')
    window.location.reload()
  }

  async function deleteMatch() {
    const ok = confirm(
      `Supprimer définitivement ${match.home_team} vs ${match.away_team} ? Les pronostics et les points liés seront supprimés.`
    )

    if (!ok) return

    setDeleting(true)

    const { error } = await supabase.from('matches').delete().eq('id', match.id)

    setDeleting(false)

    if (error) return alert(error.message)

    alert('Match supprimé avec ses points.')
    window.location.reload()
  }

  return (
    <form onSubmit={saveScore} className="glass rounded-3xl p-5 space-y-4">
      <div>
        <h3 className="text-xl font-black">
          {match.home_team} vs {match.away_team}
        </h3>
        <p className="text-sm text-white/60">
          {match.status} {match.penalties ? '· Penaltys' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="rounded-2xl px-4 py-3 bg-white text-black outline-none"
          type="number"
          min="0"
          placeholder={match.home_team}
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          required
        />

        <input
          className="rounded-2xl px-4 py-3 bg-white text-black outline-none"
          type="number"
          min="0"
          placeholder={match.away_team}
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          required
        />
      </div>

      <label className="rounded-2xl bg-white/10 border border-white/20 p-4 flex items-center gap-3 font-bold text-white">
        <input
          type="checkbox"
          checked={penalties}
          onChange={(e) => setPenalties(e.target.checked)}
        />
        <span>Le match est allé aux penaltys</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button type="submit" className="rounded-2xl bg-fifaGold text-fifaBlue font-black p-4">
          {loading ? 'Sauvegarde...' : 'Valider le score'}
        </button>

        <button
          type="button"
          onClick={hideMatch}
          className="rounded-2xl bg-orange-500 text-white font-black p-4"
        >
          {hiding ? 'Masquage...' : 'Masquer sans enlever les points'}
        </button>

        <button
          type="button"
          onClick={deleteMatch}
          className="rounded-2xl bg-red-600 text-white font-black p-4"
        >
          {deleting ? 'Suppression...' : 'Supprimer avec les points'}
        </button>
      </div>
    </form>
  )
}
