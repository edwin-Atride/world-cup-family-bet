import Link from 'next/link'
import { Match, Prediction } from '@/lib/types'
import { BRACKET_ROUNDS, getWinnerSide, teamCode, isLocked } from '@/lib/bracket'
import { formatDateTime } from '@/lib/utils'

type Pred = Pick<Prediction, 'match_id' | 'pick' | 'pred_home' | 'pred_away' | 'pred_penalties' | 'points'>

export function BracketBoard({
  matches,
  predictions = [],
}: {
  matches: Match[]
  predictions?: Pred[]
}) {
  const predictionByMatch = new Map(predictions.map((p) => [p.match_id, p]))

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div className="min-w-[1180px] grid grid-cols-5 gap-5 items-start">
        {BRACKET_ROUNDS.map((round) => {
          const roundMatches = matches
            .filter((m) => m.bracket_round === round.id)
            .sort((a, b) => (a.match_number || 0) - (b.match_number || 0))

          return (
            <section key={round.id} className="space-y-3">
              <h2 className="text-center text-sm font-black uppercase tracking-wide text-white">
                {round.label}
              </h2>

              <div className="grid gap-3">
                {roundMatches.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    prediction={predictionByMatch.get(match.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function BracketMatchCard({ match, prediction }: { match: Match; prediction?: Pred }) {
  const winner = getWinnerSide(match)
  const locked = isLocked(match.kickoff_at)

  const wrongHome = match.status === 'finished' && prediction?.pick === 'home' && winner !== 'home'
  const wrongAway = match.status === 'finished' && prediction?.pick === 'away' && winner !== 'away'

  return (
    <Link
      href={`/paris/${match.id}`}
      className="block rounded-2xl border border-white/15 bg-white/[0.07] hover:bg-white/[0.11] transition p-3 shadow-glow"
    >
      <div className="mb-2 flex items-center justify-between text-[11px] text-white/60">
        <span>#{match.match_number || '-'}</span>
        <span>{formatDateTime(match.kickoff_at)}</span>
        <span>{locked ? '🔒' : prediction ? '✅' : 'À voter'}</span>
      </div>

      <TeamRow
        name={match.home_team}
        score={match.home_score}
        active={winner === 'home'}
        wrong={wrongHome}
      />

      <TeamRow
        name={match.away_team}
        score={match.away_score}
        active={winner === 'away'}
        wrong={wrongAway}
      />

      {match.penalties && match.penalty_winner && (
        <p className="mt-2 rounded-xl bg-fifaGold/15 p-2 text-center text-[11px] text-fifaGold font-bold">
          Gagné aux tirs au but : {match.penalty_winner === 'home' ? match.home_team : match.away_team}
        </p>
      )}

      {prediction && (
        <p className="mt-2 text-[11px] text-white/65">
          Ton prono : {prediction.pick === 'home' ? match.home_team : prediction.pick === 'away' ? match.away_team : 'Nul'}
          {prediction.pred_home !== null && prediction.pred_away !== null ? ` · ${prediction.pred_home}-${prediction.pred_away}` : ''}
          {prediction.pred_penalties ? ' · TAB' : ''}
          {match.status === 'finished' ? ` · ${prediction.points} pt${prediction.points > 1 || prediction.points < -1 ? 's' : ''}` : ''}
        </p>
      )}
    </Link>
  )
}

function TeamRow({ name, score, active, wrong }: { name: string; score: number | null; active: boolean; wrong: boolean }) {
  return (
    <div className={`mt-2 flex items-center gap-2 rounded-xl px-2 py-2 ${active ? 'bg-fifaGold/20' : 'bg-black/20'}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fifaGold text-fifaBlue text-xs font-black">
        {teamCode(name)}
      </div>
      <div className="min-w-0 flex-1 truncate font-bold text-sm">
        {wrong ? <span className="text-red-300 line-through decoration-2">{name}</span> : name}
      </div>
      {wrong && <span className="text-red-400 font-black">✕</span>}
      <div className="w-9 rounded-lg border border-white/15 bg-black/20 py-1 text-center font-black text-white">
        {score ?? '-'}
      </div>
    </div>
  )
}
