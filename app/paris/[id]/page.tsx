export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { PredictionForm } from '@/components/PredictionForm'
import { createServerSupabase } from '@/lib/supabase/server'
import { Match, Prediction } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: match } = await supabase.from('matches').select('*').eq('id', id).single()
  const { data: prediction } = await supabase.from('predictions').select('*').eq('match_id', id).eq('user_id', user.id).maybeSingle()

  if (!match) {
    return <AppShell><p>Match introuvable.</p></AppShell>
  }

  return (
    <AppShell isAdmin={profile?.role === 'admin'}>
      <Link href="/paris" className="text-sm text-white/70">← Retour au tableau</Link>

      <section className="text-center my-5 glass rounded-3xl p-5">
        <p className="text-fifaGold font-bold">{formatDateTime(match.kickoff_at)}</p>
        <h1 className="text-3xl font-black mt-2">{match.home_team} vs {match.away_team}</h1>
        <p className="text-white/60">{match.round || 'Tableau final'}</p>
      </section>

      <PredictionForm match={match as Match} existing={prediction as Prediction | null} />
    </AppShell>
  )
}
