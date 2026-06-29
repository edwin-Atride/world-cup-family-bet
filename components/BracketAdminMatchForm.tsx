'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Match } from '@/lib/types'
import { getWinnerSide } from '@/lib/bracket'

export function BracketAdminMatchForm({ match }: { match: Match }) {
  const [home, setHome] = useState(match.home_team || '')
  const [away, setAway] = useState(match.away_team || '')
  const [kickoff, setKickoff] = useState(toLocalInputValue(match.kickoff_at))
  const [homeScore, setHomeScore] = useState(match.home_score ?? '')
  const [awayScore, setAwayScore] = useState(match.away_score ?? '')
  const [penalties, setPenalties] = useState(!!match.penalties)
  const [penaltyWinner, setPenaltyWinner] = useState<'home' | 'away' | ''>(
    (match.penalty_winner as any) || ''
  )
  const [loading, setLoading] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const hs = homeScore === '' ? null : Number(homeScore)
    const as = awayScore === '' ? null : Number(awayScore)
    const finished = hs !== null && as !== null

    const { data: updated, error } = await supabase
      .from('matches')
      .update({
        home_team: home || 'À déterminer',
        away_team: away || 'À déterminer',
        kickoff_at: new Date(kickoff).toISOString(),
        home_score: hs,
        away_score: as,
        penalties,
        penalty_winner: penalties ? penaltyWinner || null : null,
        status: finished ? 'finished' : 'upcoming',
      })
      .eq('id', match.id)
      .select('*')
      .single()

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    if (updated?.next_match_number && updated?.next_slot) {
      const winnerSide = getWinnerSide(updated as Match)
      const winnerTeam =
        winnerSide === 'home' ? home : winnerSide === 'away' ? away : null

      if (winnerTeam) {
        const field = updated.next_slot === 'home' ? 'home_team' : 'away_team'

        const { error: nextError } = await supabase
          .from('matches')
          .update({ [field]: winnerTeam })
          .eq('match_number', updated.next_match_number)

        if (nextError) {
          setLoading(false)
          alert(nextError.message)
          return
        }
      }
    }

    setLoading(false)
    alert('Match sauvegardé')
    window.location.reload()
  }

  async function hide() {
    if (!confirm('Masquer ce match sans enlever les points ?')) return

    const { error } = await supabase
      .from('matches')
      .update({ hidden: true })
      .eq('id', match.id)

    if (error) return alert(error.message)

    window.location.reload()
  }

  return (
    <form onSubmit={save} className="glass rounded-3xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black">
          Match #{match.match_number} · {roundLabel(match.bracket_round)}
        </h3>

        <span className="text-xs text-white/60">
          → {match.next_match_number || 'fin'} {match.next_slot || ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="rounded-2xl px-4 py-3 bg-white text-black outline-none"
          value={home}
          onChange={(e) => setHome(e.target.value)}
          placeholder="Équipe 1"
        />

        <input
          className="rounded-2xl px-4 py-3 bg-white text-black outline-none"
          value={away}
          onChange={(e) => setAway(e.target.value)}
          placeholder="Équipe 2"
        />

        <input
          className="rounded-2xl px-4 py-3 bg-white text-black outline-none sm:col-span-2"
          type="datetime-local"
          value={kickoff}
          onChange={(e) => setKickoff(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          className="rounded-2xl px-4 py-3 bg-white text-black outline-none"
          min="0"
          type="number"
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          placeholder="Score équipe 1"
        />

        <input
          className="rounded-2xl px-4 py-3 bg-white text-black outline-none"
          min="0"
          type="number"
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          placeholder="Score équipe 2"
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl bg-black/20 p-3 text-sm font-bold">
        <input
          type="checkbox"
          checked={penalties}
          onChange={(e) => setPenalties(e.target.checked)}
        />

        Match décidé aux tirs au but
      </label>

      {penalties && (
        <select
          className="w-full rounded-2xl px-4 py-3 bg-white text-black outline-none"
          value={penaltyWinner}
          onChange={(e) => setPenaltyWinner(e.target.value as any)}
        >
          <option value="">Qui gagne aux tirs au but ?</option>
          <option value="home">{home || 'Équipe 1'}</option>
          <option value="away">{away || 'Équipe 2'}</option>
        </select>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          className="rounded-2xl bg-fifaGold text-fifaBlue font-black p-4"
          disabled={loading}
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>

        <button
          type="button"
          onClick={hide}
          className="rounded-2xl bg-red-600 text-white font-black p-4"
        >
          Masquer
        </button>
      </div>
    </form>
  )
}

function toLocalInputValue(value: string) {
  if (!value) return ''

  const d = new Date(value)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)

  return local.toISOString().slice(0, 16)
}

function roundLabel(round?: string | null) {
  if (round === 'r32') return '16e'
  if (round === 'r16') return '8e'
  if (round === 'qf') return 'Quart'
  if (round === 'sf') return 'Demi'
  if (round === 'f') return 'Finale'

  return 'Match'
}