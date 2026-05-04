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
    return NextResponse.next()
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
    return NextResponse.next()
  }

  // ── 3. Handle Auth ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  // Create an initial response
  let response = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    // Only attempt Supabase auth if the URL looks real
    if (!supabaseUrl.includes('placeholder')) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Authenticated user trying to visit /login — bounce to home
        if (pathname === '/login') {
          const url = request.nextUrl.clone()
          url.pathname = '/'
          return NextResponse.redirect(url)
        }
        return response
      }
    }
  } catch (e) {
    console.warn('Proxy: Auth check failed, failing open:', e)
    return response
  }

  // ── 4. No session, no demo mode — check for demo cookie ──
  const isDemoMode = request.cookies.get('demo-mode')?.value === 'true'
  if (isDemoMode) {
    return response
  }

  // ── 5. Redirect to login ──
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
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
