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
      <main className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8 pt-6 pb-28">
        {children}
      </main>

      <Nav isAdmin={isAdmin} />
    </>
  )
}