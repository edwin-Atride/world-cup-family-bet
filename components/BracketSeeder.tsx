'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Slot = {
  match_number: number
  bracket_round: 'r32' | 'r16' | 'qf' | 'sf' | 'f'
  next_match_number: number | null
  next_slot: 'home' | 'away' | null
}

const SLOTS: Slot[] = [
  ...Array.from({ length: 16 }, (_, i) => ({ match_number: i + 1, bracket_round: 'r32' as const, next_match_number: 17 + Math.floor(i / 2), next_slot: i % 2 === 0 ? 'home' as const : 'away' as const })),
  ...Array.from({ length: 8 }, (_, i) => ({ match_number: i + 17, bracket_round: 'r16' as const, next_match_number: 25 + Math.floor(i / 2), next_slot: i % 2 === 0 ? 'home' as const : 'away' as const })),
  ...Array.from({ length: 4 }, (_, i) => ({ match_number: i + 25, bracket_round: 'qf' as const, next_match_number: 29 + Math.floor(i / 2), next_slot: i % 2 === 0 ? 'home' as const : 'away' as const })),
  ...Array.from({ length: 2 }, (_, i) => ({ match_number: i + 29, bracket_round: 'sf' as const, next_match_number: 31, next_slot: i % 2 === 0 ? 'home' as const : 'away' as const })),
  { match_number: 31, bracket_round: 'f', next_match_number: null, next_slot: null },
]

export function BracketSeeder() {
  const [loading, setLoading] = useState(false)

  async function seed() {
    if (!confirm('Initialiser le tableau 16e → Finale ? Les matchs existants avec les mêmes numéros seront conservés.')) return
    setLoading(true)

    const baseDate = new Date('2026-06-29T18:00:00.000Z')
    const rows = SLOTS.map((slot, index) => ({
      ...slot,
      home_team: index < 16 ? '' : 'À déterminer',
      away_team: index < 16 ? '' : 'À déterminer',
      kickoff_at: new Date(baseDate.getTime() + index * 24 * 60 * 60 * 1000).toISOString(),
      status: 'upcoming',
      round: roundLabel(slot.bracket_round),
      hidden: false,
    }))

    const { error } = await supabase.from('matches').upsert(rows, { onConflict: 'match_number' })
    setLoading(false)

    if (error) return alert(error.message)
    alert('Tableau initialisé. Tu peux maintenant remplir les équipes des 16èmes.')
    window.location.reload()
  }

  return (
    <button onClick={seed} disabled={loading} className="w-full rounded-2xl bg-fifaGold text-fifaBlue font-black p-4">
      {loading ? 'Initialisation...' : 'Initialiser le tableau final'}
    </button>
  )
}

function roundLabel(round: string) {
  if (round === 'r32') return '16èmes de finale'
  if (round === 'r16') return '8èmes de finale'
  if (round === 'qf') return 'Quarts de finale'
  if (round === 'sf') return 'Demi-finales'
  return 'Finale'
}
