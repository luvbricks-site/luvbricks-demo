import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const hostname = host.split(':')[0].toLowerCase()

  // If the request is to the apex domain, redirect to the www canonical host
  if (hostname === 'luvbricks.com') {
    const url = new URL(req.url)
    url.hostname = 'www.luvbricks.com'
    url.protocol = 'https:'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/:path*'],
}
