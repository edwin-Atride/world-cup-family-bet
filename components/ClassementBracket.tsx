import { Match } from '@/lib/types'
import { getWinnerSide, teamCode } from '@/lib/bracket'
import { formatDateTime } from '@/lib/utils'

type RoundId = 'r32' | 'r16' | 'qf' | 'sf' | 'f'

export function ClassementBracket({ matches }: { matches: Match[] }) {
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
    <div className="w-full pb-10">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-black text-white">
          🏆 Tableau final
        </h3>

        <p className="text-sm text-white/60">
          Mise à jour automatique avec les scores validés par l’admin.
        </p>
      </div>

      <div className="mx-auto grid w-full grid-cols-[1.15fr_1fr_0.95fr_0.85fr_1.15fr_0.85fr_0.95fr_1fr_1.15fr] gap-2 xl:gap-3 items-start">
        <BracketColumn title="16èmes" matches={leftR32} top="mt-0" gap="gap-2" />
        <BracketColumn title="8èmes" matches={leftR16} top="mt-10" gap="gap-8" />
        <BracketColumn title="Quarts" matches={leftQf} top="mt-28" gap="gap-24" />
        <BracketColumn title="Demi" matches={leftSf} top="mt-56" gap="gap-0" />

        <FinalCard match={final} />

        <BracketColumn title="Demi" matches={rightSf} top="mt-56" gap="gap-0" />
        <BracketColumn title="Quarts" matches={rightQf} top="mt-28" gap="gap-24" />
        <BracketColumn title="8èmes" matches={rightR16} top="mt-10" gap="gap-8" />
        <BracketColumn title="16èmes" matches={rightR32} top="mt-0" gap="gap-2" />
      </div>
    </div>
  )
}

function BracketColumn({
  title,
  matches,
  top,
  gap,
}: {
  title: string
  matches: Match[]
  top: string
  gap: string
}) {
  return (
    <section className="min-w-0">
      <h4 className="mb-3 text-center text-[10px] xl:text-xs font-black uppercase text-white">
        {title}
      </h4>

      <div className={`${top} grid ${gap}`}>
        {matches.map((match) => (
          <DisplayMatchCard key={match.id} match={match} />
        ))}

        {!matches.length && <EmptyCard />}
      </div>
    </section>
  )
}

function FinalCard({ match }: { match?: Match }) {
  const winner = match ? getWinnerSide(match) : null

  const winnerName =
    match && winner === 'home'
      ? match.home_team
      : match && winner === 'away'
        ? match.away_team
        : null

  return (
    <section className="min-w-0 mt-48">
      <h4 className="mb-3 text-center text-[10px] xl:text-xs font-black uppercase text-fifaGold">
        Finale
      </h4>

      {match ? (
        <div className="rounded-2xl border border-fifaGold/60 bg-fifaGold/10 p-2 xl:p-3 shadow-glow">
          <div className="mb-2 text-center text-[9px] xl:text-[10px] text-white/65 truncate">
            #{match.match_number || '-'} · {formatDateTime(match.kickoff_at)}
          </div>

          <TeamLine
            name={match.home_team}
            score={match.home_score}
            active={winner === 'home'}
          />

          <TeamLine
            name={match.away_team}
            score={match.away_score}
            active={winner === 'away'}
          />

          <div className="mt-3 rounded-xl bg-black/25 p-2 text-center">
            <p className="text-[9px] uppercase tracking-wide text-fifaGold font-black">
              Vainqueur
            </p>

            <p className="mt-1 truncate text-sm xl:text-base font-black text-white">
              {winnerName || 'À déterminer'}
            </p>
          </div>
        </div>
      ) : (
        <EmptyCard />
      )}
    </section>
  )
}

function DisplayMatchCard({ match }: { match: Match }) {
  const winner = getWinnerSide(match)

  return (
    <div className="min-w-0 rounded-xl border border-white/15 bg-white/[0.07] p-2">
      <div className="mb-1 flex items-center justify-between gap-1 text-[8px] xl:text-[10px] text-white/60">
        <span className="font-bold">#{match.match_number || '-'}</span>
        <span className="truncate">{formatDateTime(match.kickoff_at)}</span>
      </div>

      <TeamLine
        name={match.home_team}
        score={match.home_score}
        active={winner === 'home'}
      />

      <TeamLine
        name={match.away_team}
        score={match.away_score}
        active={winner === 'away'}
      />

      {match.penalties && match.penalty_winner && (
        <p className="mt-1 rounded-lg bg-fifaGold/15 p-1 text-center text-[8px] text-fifaGold font-bold truncate">
          TAB : {match.penalty_winner === 'home' ? match.home_team : match.away_team}
        </p>
      )}
    </div>
  )
}

function TeamLine({
  name,
  score,
  active,
}: {
  name: string
  score: number | null
  active: boolean
}) {
  return (
    <div
      className={`mt-1 flex min-w-0 items-center gap-1 rounded-lg px-1.5 py-1.5 ${
        active ? 'bg-fifaGold/25' : 'bg-black/25'
      }`}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fifaGold text-fifaBlue text-[8px] font-black">
        {teamCode(name)}
      </div>

      <div className="min-w-0 flex-1 truncate text-[10px] xl:text-xs font-black text-white">
        {name || 'À déterminer'}
      </div>

      <div className="w-7 shrink-0 rounded-md border border-white/15 bg-black/30 py-0.5 text-center text-[10px] xl:text-xs font-black text-white">
        {score ?? '-'}
      </div>
    </div>
  )
}

function EmptyCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-center text-[10px] text-white/50">
      À déterminer
    </div>
  )
}