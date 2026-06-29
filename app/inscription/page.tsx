
'use client'


import Link from 'next/link'
import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/browser'

export default function Inscription() {
  const s = createBrowserSupabase()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [msg, setMsg] = useState('')

  async function signup() {
    const { error } = await s.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) {
      setMsg(error.message)
    } else {
      setMsg(
        'Compte créé. Vérifie ton email si nécessaire puis connecte-toi.'
      )
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 flex items-center justify-center">
      <section className="glass rounded-3xl p-6 w-full max-w-md">
        <h1 className="text-3xl font-black text-white">
          Créer un compte
        </h1>

        <input
          className="mt-6 w-full rounded-2xl px-4 py-3 bg-white text-fifaBlue placeholder:text-gray-400 outline-none"
          placeholder="Pseudo"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="mt-3 w-full rounded-2xl px-4 py-3 bg-white text-fifaBlue placeholder:text-gray-400 outline-none"
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
          onClick={signup}
          className="mt-5 w-full rounded-2xl bg-fifaGold text-fifaBlue py-3 font-black"
        >
          Créer mon compte
        </button>

        {msg && (
          <p className="mt-3 text-sm text-white bg-black/20 rounded-xl p-3">
            {msg}
          </p>
        )}

        <Link
          className="block mt-5 text-sm text-white/80 underline"
          href="/connexion"
        >
          J'ai déjà un compte
        </Link>
      </section>
    </main>
  )
}