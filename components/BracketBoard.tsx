import Link from 'next/link'
import { Match, Prediction } from '@/lib/types'
import { getWinnerSide, teamCode, isLocked } from '@/lib/bracket'
import { formatDateTime } from '@/lib/utils'

type Pred = Pick<
  Prediction,
  'match_id' | 'pick' | 'pred_home' | 'pred_away' | 'pred_penalties' | 'points'
>

type RoundId = 'r32' | 'r16' | 'qf' | 'sf' | 'f'

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

  const leftR32 = r32.slice(0, 8)
  const rightR32 = r32.slice(8, 16)

  const leftR16 = r16.slice(0, 4)
  const rightR16 = r16.slice(4, 8)

  const leftQf = qf.slice(0, 2)
  const rightQf = qf.slice(2, 4)

  const leftSf = sf.slice(0, 1)
  const rightSf = sf.slice(1, 2)

  return (
    <div className="w-full">
      <div className="mx-auto w-full grid grid-cols-[150px_135px_120px_105px_140px_105px_120px_135px_150px] gap-2 items-start">
        <BracketColumn
          title="16èmes"
          matches={leftR32}
          offset="mt-0"
          gap="gap-2"
          predictionByMatch={predictionByMatch}
        />

        <BracketColumn
          title="8èmes"
          matches={leftR16}
          offset="mt-8"
          gap="gap-7"
          predictionByMatch={predictionByMatch}
        />

        <BracketColumn
          title="Quarts"
          matches={leftQf}
          offset="mt-24"
          gap="gap-20"
          predictionByMatch={predictionByMatch}
        />

        <BracketColumn
          title="Demi"
          matches={leftSf}
          offset="mt-48"
          gap="gap-0"
          predictionByMatch={predictionByMatch}
        />

        <FinalCard
          match={final}
          prediction={final ? predictionByMatch.get(final.id) : undefined}
        />

        <BracketColumn
          title="Demi"
          matches={rightSf}
          offset="mt-48"
          gap="gap-0"
          predictionByMatch={predictionByMatch}
        />

        <BracketColumn
          title="Quarts"
          matches={rightQf}
          offset="mt-24"
          gap="gap-20"
          predictionByMatch={predictionByMatch}
        />

        <BracketColumn
          title="8èmes"
          matches={rightR16}
          offset="mt-8"
          gap="gap-7"
          predictionByMatch={predictionByMatch}
        />

        <BracketColumn
          title="16èmes"
          matches={rightR32}
          offset="mt-0"
          gap="gap-2"
          predictionByMatch={predictionByMatch}
        />
      </div>
    </div>
  )
}

function BracketColumn({
  title,
  matches,
  offset,
  gap,
  predictionByMatch,
}: {
  title: string
  matches: Match[]
  offset: string
  gap: string
  predictionByMatch: Map<string, Pred>
}) {
  return (
    <section className="min-w-0">
      <h4 className="mb-2 text-center text-[10px] font-black uppercase text-white">
        {title}
      </h4>

      <div className={`${offset} grid ${gap}`}>
        {matches.map((match) => (
          <BracketMatchCard
            key={match.id}
            match={match}
            prediction={predictionByMatch.get(match.id)}
          />
        ))}
      </div>
    </section>
  )
}

function FinalCard({
  match,
  prediction,
}: {
  match?: Match
  prediction?: Pred
}) {
  if (!match) return null

  return (
    <section className="min-w-0 mt-40">
      <h4 className="mb-2 text-center text-[10px] font-black uppercase text-fifaGold">
        Finale
      </h4>

      <BracketMatchCard match={match} prediction={prediction} />
    </section>
  )
}

function BracketMatchCard({
  match,
  prediction,
}: {
  match: Match
  prediction?: Pred
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
      className="block min-w-0 rounded-xl border border-white/15 bg-white/[0.07] hover:bg-white/[0.11] transition p-2 shadow-glow"
    >
      <div className="mb-1 flex items-center justify-between gap-1 text-[8px] text-white/60">
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

      <div className="mt-1 flex items-center justify-between gap-1 text-[8px] text-white/60">
        <span>{locked ? '🔒' : prediction ? '✅ Voté' : 'À voter'}</span>
      </div>

      {match.penalties && match.penalty_winner && (
        <p className="mt-1 rounded-lg bg-fifaGold/15 p-1 text-center text-[8px] text-fifaGold font-bold truncate">
          TAB : {match.penalty_winner === 'home' ? match.home_team : match.away_team}
        </p>
      )}

      {prediction && (
        <p className="mt-1 text-[8px] text-white/65">
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
            ? ` · ${prediction.points} pt${prediction.points > 1 || prediction.points < -1 ? 's' : ''}`
            : ''}
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
      className={`mt-1 flex min-w-0 items-center gap-1 rounded-lg px-1.5 py-1.5 ${
        active ? 'bg-fifaGold/20' : 'bg-black/20'
      }`}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fifaGold text-fifaBlue text-[8px] font-black">
        {teamCode(name)}
      </div>

      <div className="min-w-0 flex-1 truncate text-[10px] font-black">
        {wrong ? (
          <span className="text-red-300 line-through decoration-2">
            {name}
          </span>
        ) : (
          name
        )}
      </div>

      {wrong && <span className="text-red-400 font-black text-[10px]">✕</span>}

      <div className="w-7 shrink-0 rounded-md border border-white/15 bg-black/20 py-0.5 text-center text-[10px] font-black text-white">
        {score ?? '-'}
      </div>
    </div>
  )
}