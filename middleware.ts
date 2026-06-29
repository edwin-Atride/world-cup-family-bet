import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  const protectedPath = req.nextUrl.pathname.startsWith('/paris') || req.nextUrl.pathname.startsWith('/classement') || req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/profil');
  if (protectedPath && !session) { const url=req.nextUrl.clone(); url.pathname='/connexion'; return NextResponse.redirect(url); }
  if (session && (req.nextUrl.pathname === '/connexion' || req.nextUrl.pathname === '/inscription')) { const url=req.nextUrl.clone(); url.pathname='/paris'; return NextResponse.redirect(url); }
  return res;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
