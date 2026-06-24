import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/courses(.*)',
  '/contact(.*)',
  '/api/webhooks(.*)',
  '/api/uploadthing(.*)',
  '/api/waitlist(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Inject pathname as a header so server layouts can read it without client-side flash
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  if (isPublicRoute(request)) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  await auth.protect()

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
