'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/browser'

export default function Connexion() {
  const s = createBrowserSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function login() {
    const { error } = await s.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    else location.href = '/paris'
  }

  return (
    <main className="min-h-screen px-5 py-10 flex items-center justify-center">
      <section className="glass rounded-3xl p-6 w-full max-w-md">
        <h1 className="text-3xl font-black text-white">Connexion</h1>

        <input
          className="mt-6 w-full rounded-2xl px-4 py-3 bg-white text-fifaBlue placeholder:text-gray-400 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mt-3 w-full rounded-2xl px-4 py-3 bg-white text-fifaBlue placeholder:text-gray-400 outline-none"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="mt-5 w-full rounded-2xl bg-fifaGold text-fifaBlue py-3 font-black"
        >
          Se connecter
        </button>

        {msg && <p className="mt-3 text-sm text-red-200">{msg}</p>}

        <Link
          className="block mt-5 text-sm text-white/80 underline"
          href="/inscription"
        >
          Créer un compte
        </Link>
      </section>
    </main>
  )
}