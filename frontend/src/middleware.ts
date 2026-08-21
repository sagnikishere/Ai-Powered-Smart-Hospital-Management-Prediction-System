import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    const role = req.nextauth?.token?.role

    // Patients attempting to access hospital admin routes → redirect to patient portal
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/upload') ||
        pathname.startsWith('/simulator') || pathname.startsWith('/chat')) {
      if (role === 'PATIENT') {
        return NextResponse.redirect(new URL('/patient/dashboard', req.url))
      }
    }

    // Hospital admins attempting to access patient routes → redirect to hospital portal
    if (pathname.startsWith('/patient/dashboard') || pathname.startsWith('/patient/profile')) {
      if (role === 'HOSPITAL_ADMIN' || role === 'HOSPITAL_STAFF') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Patient auth pages are public (they handle their own session check)
        if (pathname.startsWith('/patient/auth')) return true
        // All other protected routes require a token
        if (pathname.startsWith('/patient/') || pathname.startsWith('/dashboard') ||
            pathname.startsWith('/upload') || pathname.startsWith('/simulator') ||
            pathname.startsWith('/chat')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/simulator/:path*",
    "/chat/:path*",
    "/patient/:path*",
  ]
}