import Link from 'next/link'
import { Match } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'

export function MatchCard({
  match,
  voted = false,
}: {
  match: Match
  voted?: boolean
}) {
  return (
    <Link
      href={`/paris/${match.id}`}
      className="block glass rounded-3xl p-5 shadow-glow"
    >
      <div className="flex justify-between text-xs text-white/70">
        <span>{match.round || 'Coupe du Monde 2026'}</span>
        <span>{voted ? '✅ Voté' : 'À voter'}</span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Team name={match.home_team} />
        <div className="text-fifaGold font-black">VS</div>
        <Team name={match.away_team} />
      </div>

      <p className="mt-4 text-center text-sm text-white/70">
        {formatDateTime(match.kickoff_at)}
      </p>
    </Link>
  )
}

function Team({ name }: { name: string }) {
  const code = name
    .trim()
    .toUpperCase()
    .substring(0, 3)

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-fifaGold text-fifaBlue font-black text-xl flex items-center justify-center">
        {code}
      </div>

      <div className="mt-2 font-bold text-sm sm:text-base">
        {name}
      </div>
    </div>
  )
}