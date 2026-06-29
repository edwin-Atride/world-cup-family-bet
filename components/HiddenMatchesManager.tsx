'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Match } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'

export function HiddenMatchesManager({ matches }: { matches: Match[] }) {
  const [open, setOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function restoreMatch(match: Match) {
    setBusyId(match.id)

    const { error } = await supabase
      .from('matches')
      .update({ hidden: false })
      .eq('id', match.id)

    setBusyId(null)

    if (error) return alert(error.message)

    alert('Match réaffiché')
    window.location.reload()
  }

  async function deleteMatch(match: Match) {
    const ok = confirm(
      `Supprimer définitivement le match #${match.match_number || ''} ${match.home_team} vs ${match.away_team} ?\n\nLes pronostics et les points liés à ce match seront supprimés aussi.`
    )

    if (!ok) return

    setBusyId(match.id)

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', match.id)

    setBusyId(null)

    if (error) return alert(error.message)

    alert('Match supprimé avec ses pronostics et ses points')
    window.location.reload()
  }

  return (
    <section className="glass rounded-3xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Matchs masqués</h2>
          <p className="text-white/70 text-sm mt-1">
            Ici tu peux voir les matchs masqués, les réafficher ou les supprimer définitivement avec leurs points.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-2xl bg-white text-fifaBlue font-black px-5 py-3"
        >
          {open ? 'Masquer la liste' : `Voir les matchs masqués (${matches.length})`}
        </button>
      </div>

      {open && (
        <div className="space-y-3">
          {matches.length === 0 && (
            <div className="rounded-2xl bg-black/20 p-4 text-center text-white/70">
              Aucun match masqué.
            </div>
          )}

          {matches.map((match) => (
            <div
              key={match.id}
              className="rounded-2xl bg-black/25 border border-white/10 p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-black">
                    #{match.match_number || '-'} · {match.home_team || 'À déterminer'} vs {match.away_team || 'À déterminer'}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    {match.bracket_round || 'match'} · {formatDateTime(match.kickoff_at)} · {match.status}
                  </p>
                </div>

                <div className="text-xl font-black text-fifaGold">
                  {match.home_score ?? '-'} - {match.away_score ?? '-'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => restoreMatch(match)}
                  disabled={busyId === match.id}
                  className="rounded-2xl bg-fifaGold text-fifaBlue font-black p-3 disabled:opacity-60"
                >
                  {busyId === match.id ? 'Patiente...' : 'Réafficher'}
                </button>

                <button
                  type="button"
                  onClick={() => deleteMatch(match)}
                  disabled={busyId === match.id}
                  className="rounded-2xl bg-red-600 text-white font-black p-3 disabled:opacity-60"
                >
                  {busyId === match.id ? 'Patiente...' : 'Supprimer avec les points'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
