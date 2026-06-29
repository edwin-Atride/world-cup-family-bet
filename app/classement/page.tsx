export const dynamic = 'force-dynamic'

import { AppShell } from '@/components/AppShell'
import { BracketBoard } from '@/components/BracketBoard'
import { createServerSupabase } from '@/lib/supabase/server'
import { LeaderboardRow, Match } from '@/lib/types'

export default async function Classement() {
  const supabase = createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <AppShell>
        <div className="glass rounded-3xl p-6 text-center">
          <h1 className="text-3xl font-black">Connexion requise</h1>

          <p className="text-white/70 mt-3">
            Tu dois être connecté pour voir le classement.
          </p>

          <a
            href="/connexion"
            className="block mt-5 rounded-2xl bg-fifaGold text-fifaBlue font-black p-4"
          >
            Se connecter
          </a>
        </div>
      </AppShell>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: rows } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_points', { ascending: false })
    .order('exact_scores', { ascending: false })

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('hidden', false)
    .not('bracket_round', 'is', null)
    .order('match_number', { ascending: true })

  return (
    <AppShell isAdmin={profile?.role === 'admin'}>
      <h1 className="text-3xl font-black mb-5">
        🏆 Classement général
      </h1>

      <div className="glass rounded-3xl overflow-hidden">
        {(rows as LeaderboardRow[] | null)?.map((row, index) => (
          <div
            key={row.user_id}
            className="flex items-center justify-between p-4 border-b border-white/10 last:border-0"
          >
            <div>
              <span className="text-fifaGold font-black mr-3">
                #{index + 1}
              </span>

              <span className="font-bold">
                {row.username}
              </span>

              <p className="text-xs text-white/60">
                {row.correct_results} bons résultats · {row.exact_scores} scores exacts
              </p>
            </div>

            <div className="text-2xl font-black">
              {row.total_points}
            </div>
          </div>
        ))}

        {!rows?.length && (
          <div className="p-6 text-center text-white/70">
            Aucun point pour le moment.
          </div>
        )}
      </div>

      <section className="mt-8 space-y-4">
        <div>
          <h2 className="text-2xl font-black">📊 Tableau final en direct</h2>
          <p className="text-white/70 text-sm mt-1">
            Ce tableau se met à jour avec les matchs et les scores validés par l’admin.
          </p>
        </div>

        {(matches as Match[] | null)?.length ? (
          <BracketBoard matches={(matches as Match[]) || []} />
        ) : (
          <div className="glass rounded-3xl p-6 text-center text-white/70">
            Aucun tableau créé pour le moment.
          </div>
        )}
      </section>
    </AppShell>
  )
}
