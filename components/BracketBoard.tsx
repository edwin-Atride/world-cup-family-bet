import Link from 'next/link'
import { Match, Prediction } from '@/lib/types'
import { getWinnerSide, teamCode, isLocked } from '@/lib/bracket'
import { formatDateTime } from '@/lib/utils'

type Pred = Pick<
  Prediction,
  'match_id' | 'pick' | 'pred_home' | 'pred_away' | 'pred_penalties' | 'points'
>

type RoundId = 'r32' | 'r16' | 'qf' | 'sf' | 'f'

const r32Rows = [1, 5, 9, 13, 17, 21, 25, 29]
const r16Rows = [3, 11, 19, 27]
const qfRows = [7, 23]
const sfRows = [15]
const finalRows = [15]

export function BracketBoard({
  matches,
  predictions = [],
}: {
  matches: Match[]
  predictions?: Pred[]
}) {
  const predictionByMatch = new Map(predictions.map((p) => [p.match_id, p]))

  const byRound = (round: RoundId) =>
    matches
      .filter((m) => m.bracket_round === round)
      .sort((a, b) => (a.match_number || 0) - (b.match_number || 0))

  const r32 = byRound('r32')
  const r16 = byRound('r16')
  const qf = byRound('qf')
  const sf = byRound('sf')
  const final = byRound('f')[0]

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-[1.15fr_1fr_.9fr_.8fr_1fr_.8fr_.9fr_1fr_1.15fr] gap-2 items-start">
        <Column
          title="16èmes"
          matches={r32.slice(0, 8)}
          rows={r32Rows}
          predictionByMatch={predictionByMatch}
        />

        <Column
          title="8èmes"
          matches={r16.slice(0, 4)}
          rows={r16Rows}
          predictionByMatch={predictionByMatch}
        />

        <Column
          title="Quarts"
          matches={qf.slice(0, 2)}
          rows={qfRows}
          predictionByMatch={predictionByMatch}
        />

        <Column
          title="Demi"
          matches={sf.slice(0, 1)}
          rows={sfRows}
          predictionByMatch={predictionByMatch}
        />

        <Column
          title="Finale"
          matches={final ? [final] : []}
          rows={finalRows}
          predictionByMatch={predictionByMatch}
          final
        />

        <Column
          title="Demi"
          matches={sf.slice(1, 2)}
          rows={sfRows}
          predictionByMatch={predictionByMatch}
        />

        <Column
          title="Quarts"
          matches={qf.slice(2, 4)}
          rows={qfRows}
          predictionByMatch={predictionByMatch}
        />

        <Column
          title="8èmes"
          matches={r16.slice(4, 8)}
          rows={r16Rows}
          predictionByMatch={predictionByMatch}
        />

        <Column
          title="16èmes"
          matches={r32.slice(8, 16)}
          rows={r32Rows}
          predictionByMatch={predictionByMatch}
        />
      </div>
    </div>
  )
}

function Column({
  title,
  matches,
  rows,
  predictionByMatch,
  final = false,
}: {
  title: string
  matches: Match[]
  rows: number[]
  predictionByMatch: Map<string, Pred>
  final?: boolean
}) {
  return (
    <section className="min-w-0">
      <h4
        className={`mb-2 text-center text-[9px] xl:text-[10px] font-black uppercase ${
          final ? 'text-fifaGold' : 'text-white'
        }`}
      >
        {title}
      </h4>

      <div className="grid h-[720px] grid-rows-[repeat(32,minmax(0,1fr))]">
        {matches.map((match, index) => (
          <div
            key={match.id}
            style={{ gridRow: `${rows[index] || 1} / span ${final ? 5 : 3}` }}
          >
            <BracketMatchCard
              match={match}
              prediction={predictionByMatch.get(match.id)}
              final={final}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function BracketMatchCard({
  match,
  prediction,
  final = false,
}: {
  match: Match
  prediction?: Pred
  final?: boolean
}) {
  const winner = getWinnerSide(match)
  const locked = isLocked(match.kickoff_at)

  const wrongHome =
    match.status === 'finished' &&
    prediction?.pick === 'home' &&
    winner !== 'home'

  const wrongAway =
    match.status === 'finished' &&
    prediction?.pick === 'away' &&
    winner !== 'away'

  return (
    <Link
      href={`/paris/${match.id}`}
      className={`block min-w-0 rounded-xl border p-2 transition hover:bg-white/[0.12] ${
        final
          ? 'border-fifaGold/60 bg-fifaGold/10 shadow-glow'
          : 'border-white/15 bg-white/[0.07]'
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-1 text-[7px] xl:text-[8px] text-white/60">
        <span className="font-bold">#{match.match_number || '-'}</span>
        <span className="truncate">{formatDateTime(match.kickoff_at)}</span>
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

      <div className="mt-1 flex items-center justify-between gap-1 text-[7px] xl:text-[8px] text-white/60">
        <span>{locked ? '🔒' : prediction ? '✅ Voté' : 'À voter'}</span>
      </div>

      {match.penalties && match.penalty_winner && (
        <p className="mt-1 rounded-lg bg-fifaGold/15 p-1 text-center text-[7px] text-fifaGold font-bold truncate">
          TAB : {match.penalty_winner === 'home' ? match.home_team : match.away_team}
        </p>
      )}

      {prediction && (
        <p className="mt-1 text-[7px] xl:text-[8px] text-white/65 truncate">
          {prediction.pick === 'home'
            ? match.home_team
            : prediction.pick === 'away'
              ? match.away_team
              : 'Nul'}

          {prediction.pred_home !== null && prediction.pred_away !== null
            ? ` · ${prediction.pred_home}-${prediction.pred_away}`
            : ''}

          {prediction.pred_penalties ? ' · TAB' : ''}

          {match.status === 'finished'
            ? ` · ${prediction.points} pt${
                prediction.points > 1 || prediction.points < -1 ? 's' : ''
              }`
            : ''}
        </p>
      )}

      {final && (
        <p className="mt-2 rounded-lg bg-black/25 p-1 text-center text-[7px] xl:text-[8px] font-black text-fifaGold">
          Finale
        </p>
      )}
    </Link>
  )
}

function TeamRow({
  name,
  score,
  active,
  wrong,
}: {
  name: string
  score: number | null
  active: boolean
  wrong: boolean
}) {
  return (
    <div
      className={`mt-1 flex min-w-0 items-center gap-1 rounded-lg px-1 py-1 ${
        active ? 'bg-fifaGold/25' : 'bg-black/25'
      }`}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fifaGold text-fifaBlue text-[7px] font-black">
        {teamCode(name)}
      </div>

      <div className="min-w-0 flex-1 truncate text-[8px] xl:text-[10px] font-black text-white">
        {wrong ? (
          <span className="text-red-300 line-through decoration-2">
            {name}
          </span>
        ) : (
          name || 'À déterminer'
        )}
      </div>

      {wrong && <span className="text-red-400 font-black text-[9px]">✕</span>}

      <div className="w-6 shrink-0 rounded-md border border-white/15 bg-black/30 py-0.5 text-center text-[8px] xl:text-[10px] font-black text-white">
        {score ?? '-'}
      </div>
    </div>
  )
}