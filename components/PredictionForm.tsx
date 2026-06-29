'use client'

import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/browser'
import { Match, Prediction, PredictionPick } from '@/lib/types'
import { isLocked } from '@/lib/bracket'

export function PredictionForm({ match, existing }: { match: Match; existing: Prediction | null }) {
  const supabase = createBrowserSupabase()

  const [pick, setPick] = useState<PredictionPick>(existing?.pick || 'home')
  const [home, setHome] = useState(existing?.pred_home?.toString() || '')
  const [away, setAway] = useState(existing?.pred_away?.toString() || '')
  const [penalties, setPenalties] = useState(!!existing?.pred_penalties)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const locked = isLocked(match.kickoff_at)

  async function save() {
    setMsg('')
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      setMsg('Connexion requise')
      return
    }

    if (locked) {
      setLoading(false)
      setMsg('Ce match est verrouillé 10 minutes avant le début.')
      return
    }

    const ph = home === '' ? null : Number(home)
    const pa = away === '' ? null : Number(away)

    const { error } = await supabase.from('predictions').upsert(
      {
        user_id: user.id,
        match_id: match.id,
        pick,
        pred_home: ph,
        pred_away: pa,
        pred_penalties: penalties,
      },
      { onConflict: 'user_id,match_id' }
    )

    setLoading(false)

    if (error) setMsg(error.message)
    else {
      setMsg('Pronostic sauvegardé ✅')
      setTimeout(() => (location.href = '/paris'), 500)
    }
  }

  return (
    <div className="glass rounded-3xl p-5 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white">Ton pronostic</h2>
        <p className="text-white/70 text-sm mt-1">Tu peux modifier ton pronostic jusqu’à 10 minutes avant le match.</p>
      </div>

      {locked && (
        <p className="rounded-2xl bg-red-500/20 border border-red-400/30 p-3 text-sm text-white">🔒 Ce match est verrouillé.</p>
      )}

      <div className="grid gap-3">
        <ChoiceButton value="home" pick={pick} setPick={setPick} disabled={locked}>Victoire {match.home_team}</ChoiceButton>
        <ChoiceButton value="draw" pick={pick} setPick={setPick} disabled={locked}>Match nul</ChoiceButton>
        <ChoiceButton value="away" pick={pick} setPick={setPick} disabled={locked}>Victoire {match.away_team}</ChoiceButton>
      </div>

      <div>
        <p className="text-sm text-white/80 mb-3 font-semibold">Score prévu</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input disabled={locked} min="0" type="number" className="rounded-2xl px-4 py-4 bg-white text-black placeholder:text-gray-500 font-black text-center text-xl outline-none disabled:opacity-60" placeholder={match.home_team} value={home} onChange={(e) => setHome(e.target.value)} />
          <input disabled={locked} min="0" type="number" className="rounded-2xl px-4 py-4 bg-white text-black placeholder:text-gray-500 font-black text-center text-xl outline-none disabled:opacity-60" placeholder={match.away_team} value={away} onChange={(e) => setAway(e.target.value)} />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl bg-black/25 p-4 font-bold">
        <input disabled={locked} type="checkbox" checked={penalties} onChange={(e) => setPenalties(e.target.checked)} />
        {pick === 'home' ? `${match.home_team} gagne aux tirs au but` : pick === 'away' ? `${match.away_team} gagne aux tirs au but` : 'Match décidé aux tirs au but'}
      </label>

      <button disabled={locked || loading} onClick={save} className="w-full rounded-2xl bg-fifaGold text-fifaBlue font-black py-4 disabled:opacity-50">
        {loading ? 'Sauvegarde...' : 'Sauvegarder mon pronostic'}
      </button>

      {msg && <p className="rounded-2xl bg-black/30 p-3 text-sm text-white">{msg}</p>}
    </div>
  )
}

function ChoiceButton({
  value,
  pick,
  setPick,
  disabled,
  children,
}: {
  value: PredictionPick
  pick: PredictionPick
  setPick: (v: PredictionPick) => void
  disabled: boolean
  children: React.ReactNode
}) {
  const selected = pick === value
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setPick(value)}
      className={`rounded-2xl border p-4 text-left font-bold transition ${selected ? 'bg-fifaGold text-fifaBlue border-fifaGold' : 'bg-white/10 text-white border-white/20'} disabled:opacity-60`}
    >
      {children}
    </button>
  )
}
