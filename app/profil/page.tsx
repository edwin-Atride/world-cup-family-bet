
'use client';
export const dynamic = 'force-dynamic'
import { AppShell } from '@/components/AppShell';import { createBrowserSupabase } from '@/lib/supabase/browser';
export default function Profil(){const supabase=createBrowserSupabase();async function logout(){await supabase.auth.signOut(); location.href='/'} return <AppShell><h1 className="text-3xl font-black">Profil</h1><div className="glass rounded-3xl p-5 mt-5"><p>Ton compte famille Coupe du Monde.</p><button onClick={logout} className="mt-5 w-full rounded-2xl bg-white text-fifaBlue py-3 font-black">Se déconnecter</button></div></AppShell>}
