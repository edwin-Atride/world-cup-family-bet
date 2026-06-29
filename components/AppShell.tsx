import { ReactNode } from 'react'
import { Nav } from './Nav'

export function AppShell({
  children,
  isAdmin = false,
}: {
  children: ReactNode
  isAdmin?: boolean
}) {
  return (
    <>
      <main className="mx-auto w-full max-w-[1500px] px-3 sm:px-4 lg:px-5 pt-6 pb-28">
        {children}
      </main>

      <Nav isAdmin={isAdmin} />
    </>
  )
}