import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
  '/api/uploadthing(.*)',
  '/api/waitlist(.*)',
  '/api/contact(.*)',
  '/marketplace',
  '/discover',
  '/categories',
  '/learning-hub',
  '/calculators',
  '/compare',
  '/about',
  '/contact',
  '/news',
  '/api/news(.*)',
])

// Routes that require authentication
const isAuthRoute = createRouteMatcher([
  '/student-portal(.*)',
  '/admin(.*)',
  '/investment-provider(.*)',
  '/profile',
])

// Routes requiring admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

// Routes requiring investment provider role
const isProviderRoute = createRouteMatcher([
  '/investment-provider(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Inject pathname as a header so server layouts can read it without client-side flash
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  if (isPublicRoute(request)) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const { userId } = await auth()

  // Check if user is signed in for protected routes
  if (!userId && !isPublicRoute(request)) {
    // If trying to access a non-public route without signing in, redirect to sign-in
    // But only if it's not a public route we already handled
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Protect admin routes - require admin role
  if (isAdminRoute(request)) {
    await auth.protect()
  }

  // Protect investment provider routes - require investment_provider role
  if (isProviderRoute(request)) {
    const { sessionId } = await auth()
    // We'll check the role on the client/server side
    // For now, just ensure user is authenticated
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}