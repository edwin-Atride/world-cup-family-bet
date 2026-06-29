export const dynamic = 'force-dynamic'

import { AppShell } from '@/components/AppShell'
import { BracketBoard } from '@/components/BracketBoard'
import { createServerSupabase } from '@/lib/supabase/server'
import { Match, Prediction } from '@/lib/types'

export default async function Paris() {
  const supabase = createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <AppShell>
        <div className="glass rounded-3xl p-6 text-center">
          <h1 className="text-3xl font-black">Connexion requise</h1>
          <p className="text-white/70 mt-3">Tu dois être connecté pour voir le tableau.</p>
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

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('hidden', false)
    .not('bracket_round', 'is', null)
    .order('match_number', { ascending: true })

  const matchIds = ((matches as Match[]) || []).map((m) => m.id)

  const { data: predictions } = matchIds.length
    ? await supabase
        .from('predictions')
        .select('match_id,pick,pred_home,pred_away,pred_penalties,points')
        .eq('user_id', user.id)
        .in('match_id', matchIds)
    : { data: [] as Prediction[] }

  return (
    <AppShell isAdmin={profile?.role === 'admin'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black">🏆 Tableau final</h1>
          <p className="text-white/70 mt-2">16èmes → 8èmes → quarts → demis → finale. Clique sur un match pour faire ton pronostic.</p>
        </div>

        <div className="glass rounded-3xl p-4 text-sm text-white/75 grid gap-2 sm:grid-cols-3">
          <p>✅ Bon vainqueur : <b>1 pt</b></p>
          <p>🎯 Score exact : <b>+2 pts</b></p>
          <p>🥅 Tirs au but : <b>+2 pts</b> ou <b>-1 pt</b></p>
        </div>

        <BracketBoard matches={(matches as Match[]) || []} predictions={(predictions as any) || []} />
      </div>
    </AppShell>
  )
}
