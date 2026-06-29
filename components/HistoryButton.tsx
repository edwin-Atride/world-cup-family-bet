'use client'

import { useState } from 'react'
import { Match } from '@/lib/types'

type HistoryPrediction = {
  match_id: string
  pick: 'home' | 'draw' | 'away'
  pred_home: number | null
  pred_away: number | null
  pred_penalties: boolean
  points: number
}

export function HistoryButton({
  matches,
  predictions,
}: {
  matches: Match[]
  predictions: HistoryPrediction[]
}) {
  const [open, setOpen] = useState(false)

  function getPickLabel(match: Match, pick: string) {
    if (pick === 'home') return `Victoire ${match.home_team}`
    if (pick === 'away') return `Victoire ${match.away_team}`
    return 'Match nul'
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full rounded-2xl bg-white text-fifaBlue font-black p-4"
      >
        {open ? 'Masquer l’historique' : 'Voir l’historique'}
      </button>

      {open && (
        <div className="mt-4 grid gap-3">
          {matches.length === 0 && (
            <div className="glass rounded-3xl p-5 text-center text-white/70">
              Aucun match terminé.
            </div>
          )}

          {matches.map((match) => {
            const prediction = predictions.find((p) => p.match_id === match.id)

            return (
              <div key={match.id} className="glass rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold">{match.home_team}</span>

                  <span className="text-2xl font-black text-fifaGold">
                    {match.home_score} - {match.away_score}
                  </span>

                  <span className="font-bold text-right">{match.away_team}</span>
                </div>

                {match.penalties && (
                  <p className="text-center text-xs font-bold text-fifaGold">
                    Match décidé aux penaltys
                  </p>
                )}

                <div className="rounded-2xl bg-black/25 p-3 text-sm">
                  {prediction ? (
                    <>
                      <p className="font-bold text-white">
                        Ton pronostic : {getPickLabel(match, prediction.pick)}
                      </p>

                      <p className="text-white/70 mt-1">
                        Score prédit :{' '}
                        {prediction.pred_home !== null && prediction.pred_away !== null
                          ? `${prediction.pred_home} - ${prediction.pred_away}`
                          : 'Non renseigné'}
                      </p>

                      <p className="text-white/70 mt-1">
                        Penaltys prédits : {prediction.pred_penalties ? 'Oui' : 'Non'}
                      </p>

                      <p className="mt-2 font-black text-fifaGold">
                        {prediction.points >= 0 ? '+' : ''}
                        {prediction.points} point{Math.abs(prediction.points) > 1 ? 's' : ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-white/70">Tu n’avais pas parié sur ce match.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
