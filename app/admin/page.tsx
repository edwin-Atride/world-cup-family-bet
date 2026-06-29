export const dynamic = 'force-dynamic'

import { AppShell } from '@/components/AppShell'
import { BracketSeeder } from '@/components/BracketSeeder'
import { BracketAdminMatchForm } from '@/components/BracketAdminMatchForm'
import { HiddenMatchesManager } from '@/components/HiddenMatchesManager'
import { createServerSupabase } from '@/lib/supabase/server'
import { Match } from '@/lib/types'
import { BRACKET_ROUNDS } from '@/lib/bracket'

export default async function Admin() {
  const supabase = createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <AppShell>
        <div className="glass rounded-3xl p-6 text-center">
          <h1 className="text-3xl font-black">Connexion requise</h1>
          <a href="/connexion" className="block mt-5 rounded-2xl bg-fifaGold text-fifaBlue font-black p-4">Se connecter</a>
        </div>
      </AppShell>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <AppShell>
        <div className="glass rounded-3xl p-6 text-center">Accès réservé à l'admin.</div>
      </AppShell>
    )
  }

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('hidden', false)
    .not('bracket_round', 'is', null)
    .order('match_number', { ascending: true })

  const { data: hiddenMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('hidden', true)
    .not('bracket_round', 'is', null)
    .order('match_number', { ascending: true })

  const bracketMatches = (matches as Match[]) || []
  const hiddenBracketMatches = (hiddenMatches as Match[]) || []

  return (
    <AppShell isAdmin>
      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-6">
        <div>
          <h1 className="text-3xl font-black">Administration du tableau</h1>
          <p className="text-white/70 mt-2">Remplis les équipes des 16èmes, les dates, puis les vrais résultats. Les vainqueurs avancent automatiquement.</p>
        </div>

        <BracketSeeder />

        <HiddenMatchesManager matches={hiddenBracketMatches} />

        <a className="block rounded-2xl bg-white text-fifaBlue font-black p-4 text-center" href="/api/score?manual=1">
          Calculer les points
        </a>

        {BRACKET_ROUNDS.map((round) => {
          const roundMatches = bracketMatches.filter((m) => m.bracket_round === round.id)
          return (
            <section key={round.id} className="space-y-3">
              <h2 className="text-2xl font-black">{round.label}</h2>
              {roundMatches.map((match) => (
                <BracketAdminMatchForm key={match.id} match={match} />
              ))}
            </section>
          )
        })}

        {!bracketMatches.length && (
          <div className="glass rounded-3xl p-6 text-center text-white/75">Aucun tableau créé. Clique sur “Initialiser le tableau final”.</div>
        )}
      </div>
    </AppShell>
  )
}
