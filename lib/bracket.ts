import { Match } from './types'

export type BracketRound = 'r32' | 'r16' | 'qf' | 'sf' | 'f'

export const BRACKET_ROUNDS: { id: BracketRound; label: string; short: string }[] = [
  { id: 'r32', label: '16èmes de finale', short: '16e' },
  { id: 'r16', label: '8èmes de finale', short: '8e' },
  { id: 'qf', label: 'Quarts de finale', short: 'Quart' },
  { id: 'sf', label: 'Demi-finales', short: 'Demi' },
  { id: 'f', label: 'Finale', short: 'Finale' },
]

export function teamCode(name?: string | null) {
  const cleaned = (name || 'TBD').trim()
  if (!cleaned || cleaned.toLowerCase() === 'tbd' || cleaned === 'À déterminer') return 'TBD'
  return cleaned.toUpperCase().slice(0, 3)
}

export function getWinnerSide(match: Pick<Match, 'home_score' | 'away_score' | 'penalties' | 'penalty_winner'>) {
  if (match.home_score === null || match.home_score === undefined || match.away_score === null || match.away_score === undefined) return null
  if (match.home_score > match.away_score) return 'home'
  if (match.away_score > match.home_score) return 'away'
  if (match.penalties && match.penalty_winner) return match.penalty_winner
  return 'draw'
}

export function getWinnerTeam(match: Match) {
  const side = getWinnerSide(match)
  if (side === 'home') return match.home_team
  if (side === 'away') return match.away_team
  return null
}

export function lockDate(kickoff: string) {
  return new Date(new Date(kickoff).getTime() - 10 * 60 * 1000)
}

export function isLocked(kickoff: string) {
  return lockDate(kickoff).getTime() <= Date.now()
}
