import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'Paris Coupe du Monde Famille', description:'Pronostics familiaux Coupe du Monde 2026' };
export default function RootLayout({children}:{children:React.ReactNode}){ return <html lang="fr"><body>{children}</body></html> }
