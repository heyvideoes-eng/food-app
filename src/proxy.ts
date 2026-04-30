import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that are always public — no auth needed
const PUBLIC_ROUTES = ['/', '/login']
// Prefixes that bypass auth entirely
const BYPASS_PREFIXES = ['/_next', '/favicon.ico', '/api/', '/static/']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Always bypass Next.js internals and API routes ──
  if (BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next({ request })
  }

  // ── 2. Always allow public pages ──
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If user already has demo-mode and tries to hit /login, bounce them home
    const isDemoOnLogin =
      pathname === '/login' &&
      request.cookies.get('demo-mode')?.value === 'true'
    if (isDemoOnLogin) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  // ── 4. Supabase session check (real auth) ──
  // Use placeholder values so the build never crashes when env vars are absent
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  let user = null
  try {
    // Only attempt Supabase auth if the URL looks real (not placeholder)
    if (!supabaseUrl.includes('placeholder')) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }
  } catch (e) {
    // Backend unreachable — fail open (allow access) to avoid locking users out
    console.warn('Proxy: Supabase auth check failed, allowing access:', e)
    return supabaseResponse
  }

  if (user) {
    // Authenticated user trying to visit /login — bounce to home
    if (pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // ── 5. No session, no demo mode — redirect to login ──
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  // Preserve intended destination for post-login redirect
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico   (favicon)
     * - api routes    (handle their own auth)
     * - image files
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
