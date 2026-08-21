'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Search,
  User,
  LogOut,
  Heart,
  Bell,
  Activity,
  ChevronDown,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"
import { getPatientByEmail } from "@/lib/patient-store"

export default function PatientNavigation() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Find Hospital', href: '/patient/hospitals', icon: Search },
    { name: 'My Profile', href: '/patient/profile', icon: User },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Derive first name from session
  const displayName = session?.user?.name
    ? session.user.name.split(' ')[0]
    : session?.user?.email?.split('@')[0] ?? 'Patient'

  if (!session) return null

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/97 border-b border-teal-100/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/patient/dashboard')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-gray-900 tracking-tight">MedCore Health</span>
              <p className="text-[10px] text-teal-600 font-medium -mt-0.5 tracking-wide">PATIENT PORTAL</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                      : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              )
            })}
          </div>

          {/* Right: user + actions */}
          <div className="flex items-center gap-3">
            {/* Status dot */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
              <Activity className="h-3 w-3 text-teal-500" />
              Patient Portal
            </div>

            {/* Notification bell */}
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-teal-50">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-teal-500 rounded-full border-2 border-white" />
            </Button>

            {/* Avatar + name */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-none">{displayName}</p>
                <p className="text-xs text-teal-600 leading-none mt-0.5">Patient</p>
              </div>
            </div>

            {/* Sign out */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="rounded-xl border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-600 transition-all"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-teal-50"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <button
                  key={item.name}
                  onClick={() => { router.push(item.href); setMobileOpen(false) }}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl mb-1 transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-teal-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
