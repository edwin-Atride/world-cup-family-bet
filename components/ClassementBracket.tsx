import { Match } from '@/lib/types'
import { getWinnerSide, teamCode } from '@/lib/bracket'
import { formatDateTime } from '@/lib/utils'

type RoundId = 'r32' | 'r16' | 'qf' | 'sf' | 'f'

const r32Rows = [1, 6, 11, 16, 21, 26, 31, 36]
const r16Rows = [3, 13, 23, 33]
const qfRows = [8, 28]
const sfRows = [18]
const finalRows = [18]

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

      <div className="w-full overflow-auto rounded-2xl pb-4 max-h-[75vh] lg:overflow-visible lg:max-h-none lg:pb-0">
        <div className="min-w-[1200px] lg:min-w-0 grid w-full grid-cols-[1.15fr_1fr_.9fr_.8fr_1fr_.8fr_.9fr_1fr_1.15fr] gap-2 items-start">
          <Column title="16èmes" matches={r32.slice(0, 8)} rows={r32Rows} />
          <Column title="8èmes" matches={r16.slice(0, 4)} rows={r16Rows} />
          <Column title="Quarts" matches={qf.slice(0, 2)} rows={qfRows} />
          <Column title="Demi" matches={sf.slice(0, 1)} rows={sfRows} />

          <Column
            title="Finale"
            matches={final ? [final] : []}
            rows={finalRows}
            final
          />

          <Column title="Demi" matches={sf.slice(1, 2)} rows={sfRows} />
          <Column title="Quarts" matches={qf.slice(2, 4)} rows={qfRows} />
          <Column title="8èmes" matches={r16.slice(4, 8)} rows={r16Rows} />
          <Column title="16èmes" matches={r32.slice(8, 16)} rows={r32Rows} />
        </div>
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

      <div className="grid h-[1050px] grid-rows-[repeat(40,minmax(0,1fr))]">
        {matches.map((match, index) => (
          <div
            key={match.id}
            style={{ gridRow: `${rows[index] || 1} / span ${final ? 5 : 4}` }}
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