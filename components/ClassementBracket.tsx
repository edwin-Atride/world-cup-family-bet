import { Match } from '@/lib/types'
import { getWinnerSide, teamCode } from '@/lib/bracket'
import { formatDateTime } from '@/lib/utils'

type RoundId = 'r32' | 'r16' | 'qf' | 'sf' | 'f'

const r32Rows = [1, 5, 9, 13, 17, 21, 25, 29]
const r16Rows = [3, 11, 19, 27]
const qfRows = [7, 23]
const sfRows = [15]
const finalRows = [15]

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

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <h3 className="text-2xl font-black text-white">
          🏆 Tableau final
        </h3>

        <p className="text-sm text-white/60">
          Mise à jour automatique avec les scores validés par l’admin.
        </p>
      </div>

      <div className="grid w-full grid-cols-[1.15fr_1fr_.9fr_.8fr_1fr_.8fr_.9fr_1fr_1.15fr] gap-2 items-start">
        <Column title="16èmes" matches={r32.slice(0, 8)} rows={r32Rows} />
        <Column title="8èmes" matches={r16.slice(0, 4)} rows={r16Rows} />
        <Column title="Quarts" matches={qf.slice(0, 2)} rows={qfRows} />
        <Column title="Demi" matches={sf.slice(0, 1)} rows={sfRows} />

        <Column title="Finale" matches={final ? [final] : []} rows={finalRows} final />

        <Column title="Demi" matches={sf.slice(1, 2)} rows={sfRows} />
        <Column title="Quarts" matches={qf.slice(2, 4)} rows={qfRows} />
        <Column title="8èmes" matches={r16.slice(4, 8)} rows={r16Rows} />
        <Column title="16èmes" matches={r32.slice(8, 16)} rows={r32Rows} />
      </div>
    </div>
  )
}

function Column({
  title,
  matches,
  rows,
  final = false,
}: {
  title: string
  matches: Match[]
  rows: number[]
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
            <DisplayMatchCard match={match} final={final} />
          </div>
        ))}
      </div>
    </section>
  )
}

function DisplayMatchCard({
  match,
  final = false,
}: {
  match: Match
  final?: boolean
}) {
  const winner = getWinnerSide(match)

  const winnerName =
    winner === 'home'
      ? match.home_team
      : winner === 'away'
        ? match.away_team
        : null

  return (
    <div
      className={`min-w-0 rounded-xl border p-2 ${
        final
          ? 'border-fifaGold/60 bg-fifaGold/10 shadow-glow'
          : 'border-white/15 bg-white/[0.07]'
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-1 text-[7px] xl:text-[8px] text-white/60">
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
        <p className="mt-1 rounded-lg bg-fifaGold/15 p-1 text-center text-[7px] text-fifaGold font-bold truncate">
          TAB : {match.penalty_winner === 'home' ? match.home_team : match.away_team}
        </p>
      )}

      {final && (
        <div className="mt-2 rounded-lg bg-black/25 p-2 text-center">
          <p className="text-[7px] uppercase text-fifaGold font-black">
            Vainqueur
          </p>

          <p className="truncate text-[10px] xl:text-xs font-black text-white">
            {winnerName || 'À déterminer'}
          </p>
        </div>
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
      className={`mt-1 flex min-w-0 items-center gap-1 rounded-lg px-1 py-1 ${
        active ? 'bg-fifaGold/25' : 'bg-black/25'
      }`}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fifaGold text-fifaBlue text-[7px] font-black">
        {teamCode(name)}
      </div>

      <div className="min-w-0 flex-1 truncate text-[8px] xl:text-[10px] font-black text-white">
        {name || 'À déterminer'}
      </div>

      <div className="w-6 shrink-0 rounded-md border border-white/15 bg-black/30 py-0.5 text-center text-[8px] xl:text-[10px] font-black text-white">
        {score ?? '-'}
      </div>
    </div>
  )
}