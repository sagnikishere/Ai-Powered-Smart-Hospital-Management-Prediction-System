'use client'

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import PatientNavigation from "@/components/patient-navigation"
import { Heart } from "lucide-react"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Auth pages are public — render them WITHOUT any session guard or nav
  const isAuthPage = pathname?.startsWith('/patient/auth')

  useEffect(() => {
    if (isAuthPage) return       // never redirect on auth pages
    if (status === 'loading') return

    if (!session) {
      router.push('/patient/auth/login')
      return
    }

    // Hospital admins shouldn't be in patient portal
    const role = (session.user as any)?.role
    if (role && role !== 'PATIENT') {
      router.push('/dashboard')
    }
  }, [session, status, router, isAuthPage])

  // Auth pages: render children directly, no nav, no loading gate
  if (isAuthPage) {
    return <>{children}</>
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
          <p className="text-sm text-gray-500 font-medium">Loading Patient Portal...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const role = (session.user as any)?.role
  if (role && role !== 'PATIENT') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/20">
      <PatientNavigation />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}

