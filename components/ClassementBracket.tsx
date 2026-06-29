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
    <div className="w-full overflow-x-auto pb-10">
      <div className="min-w-[1900px] px-4">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-black text-white">
            🏆 Tableau final
          </h3>
          <p className="text-sm text-white/60">
            Mise à jour automatique avec les scores validés par l’admin.
          </p>
        </div>

        <div className="grid grid-cols-[260px_230px_230px_220px_260px_220px_230px_230px_260px] gap-8 items-start">
          <BracketColumn
            title="16èmes"
            matches={leftR32}
            gap="gap-4"
            marginTop="mt-0"
          />

          <BracketColumn
            title="8èmes"
            matches={leftR16}
            gap="gap-16"
            marginTop="mt-16"
          />

          <BracketColumn
            title="Quarts"
            matches={leftQf}
            gap="gap-40"
            marginTop="mt-40"
          />

          <BracketColumn
            title="Demi"
            matches={leftSf}
            gap="gap-0"
            marginTop="mt-[330px]"
          />

          <FinalCard match={final} />

          <BracketColumn
            title="Demi"
            matches={rightSf}
            gap="gap-0"
            marginTop="mt-[330px]"
          />

          <BracketColumn
            title="Quarts"
            matches={rightQf}
            gap="gap-40"
            marginTop="mt-40"
          />

          <BracketColumn
            title="8èmes"
            matches={rightR16}
            gap="gap-16"
            marginTop="mt-16"
          />

          <BracketColumn
            title="16èmes"
            matches={rightR32}
            gap="gap-4"
            marginTop="mt-0"
          />
        </div>
      </div>
    </div>
  )
}

function BracketColumn({
  title,
  matches,
  gap,
  marginTop,
}: {
  title: string
  matches: Match[]
  gap: string
  marginTop: string
}) {
  return (
    <section>
      <h4 className="mb-4 text-center text-sm font-black uppercase text-white">
        {title}
      </h4>

      <div className={`${marginTop} grid ${gap}`}>
        {matches.map((match) => (
          <DisplayMatchCard key={match.id} match={match} />
        ))}

        {!matches.length && (
          <EmptyCard />
        )}
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
    <section className="mt-[290px]">
      <h4 className="mb-4 text-center text-sm font-black uppercase text-fifaGold">
        Finale
      </h4>

      {match ? (
        <div className="rounded-3xl border border-fifaGold/60 bg-fifaGold/10 p-4 shadow-glow">
          <div className="mb-3 text-center text-xs text-white/65">
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

          <div className="mt-4 rounded-2xl bg-black/25 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-fifaGold font-black">
              Vainqueur
            </p>

            <p className="mt-2 text-xl font-black text-white">
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
    <div className="relative rounded-2xl border border-white/15 bg-white/[0.07] p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-white/60">
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
        <p className="mt-2 rounded-xl bg-fifaGold/15 p-2 text-center text-[10px] text-fifaGold font-bold">
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
      className={`mt-2 flex items-center gap-2 rounded-xl px-2 py-2 ${
        active ? 'bg-fifaGold/25' : 'bg-black/25'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fifaGold text-fifaBlue text-[10px] font-black">
        {teamCode(name)}
      </div>

      <div className="min-w-0 flex-1 truncate text-sm font-black text-white">
        {name || 'À déterminer'}
      </div>

      <div className="w-9 rounded-lg border border-white/15 bg-black/30 py-1 text-center text-sm font-black text-white">
        {score ?? '-'}
      </div>
    </div>
  )
}

function EmptyCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center text-sm text-white/50">
      À déterminer
    </div>
  )
}