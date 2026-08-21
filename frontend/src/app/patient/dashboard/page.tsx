'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  MapPin, Phone, Clock, Search, ExternalLink, Bell,
  ChevronRight, Building2, Stethoscope, Zap, Heart,
  AlertTriangle, CheckCircle, Info, X, Star
} from "lucide-react"
import {
  getHospitalById, getAnnouncementsByHospital, getPatientByEmail, updatePatient
} from "@/lib/patient-store"
import type { Hospital, HospitalAnnouncement } from "@/types"

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    Normal: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: '🟢 Normal', msg: 'Hospital currently operating normally.' },
    Busy: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: '🟡 Busy', msg: 'Hospital is currently experiencing higher demand.' },
    'High Demand': { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', label: '🔴 High Demand', msg: 'Please contact the hospital before visiting for non-emergencies.' },
  }[status] ?? { color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400', label: status, msg: '' }

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.color}`}>
        <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
        {cfg.label}
      </span>
      {cfg.msg && <p className="text-xs text-gray-500 ml-1">{cfg.msg}</p>}
    </div>
  )
}

function AnnouncementIcon({ type }: { type: string }) {
  if (type === 'urgent') return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
  if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
  return <Info className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PatientDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [announcements, setAnnouncements] = useState<HospitalAnnouncement[]>([])
  const [displayName, setDisplayName] = useState('there')

  useEffect(() => {
    if (!session?.user?.email) return

    // Load patient profile
    const patient = getPatientByEmail(session.user.email)
    if (patient) {
      setDisplayName(patient.fullName.split(' ')[0])
      if (patient.preferredHospitalId) {
        const h = getHospitalById(patient.preferredHospitalId)
        if (h) {
          setHospital(h)
          setAnnouncements(getAnnouncementsByHospital(h.id))
        }
      }
    } else {
      // Google-authed patient with no profile yet
      setDisplayName(session.user.name?.split(' ')[0] ?? 'there')
    }
  }, [session])

  const handleRemoveHospital = () => {
    if (!session?.user?.email) return
    const patient = getPatientByEmail(session.user.email)
    if (patient) updatePatient(patient.id, { preferredHospitalId: undefined })
    setHospital(null)
    setAnnouncements([])
  }

  const quickActions = [
    { label: 'Find Hospital', icon: Search, color: 'from-teal-500 to-teal-600', href: '/patient/hospitals' },
    { label: 'Hospital Profile', icon: Building2, color: 'from-blue-500 to-blue-600', href: hospital ? `/patient/hospitals/${hospital.id}` : '/patient/hospitals' },
    { label: 'Emergency Info', icon: Zap, color: 'from-red-500 to-red-600', href: '#emergency' },
    { label: 'My Profile', icon: Star, color: 'from-purple-500 to-purple-600', href: '/patient/profile' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* ── Welcome ──────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, <span className="text-teal-600">{displayName}</span> 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => router.push('/patient/hospitals')}
            className="hidden sm:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200"
          >
            <Search className="w-4 h-4" />
            Find Hospital
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left Column ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Selected Hospital Card */}
          {hospital ? (
            <div className="bg-white rounded-3xl shadow-xl shadow-teal-100/40 border border-teal-100/60 overflow-hidden">
              {/* Header band */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-teal-200 text-xs font-semibold tracking-widest uppercase">My Hospital</p>
                    <h2 className="text-white font-bold text-lg leading-tight">{hospital.name}</h2>
                  </div>
                </div>
                <button
                  onClick={handleRemoveHospital}
                  className="text-teal-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                  title="Remove hospital"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {/* Status */}
                <div className="mb-4">
                  <StatusBadge status={hospital.publicStatus} />
                </div>

                {/* Info grid */}
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Location</p>
                      <p className="text-sm font-semibold text-gray-800">{hospital.city}, {hospital.state}</p>
                      <p className="text-xs text-gray-500">{hospital.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Contact</p>
                      <p className="text-sm font-semibold text-gray-800">{hospital.phone}</p>
                      {hospital.emergencyAvailable && (
                        <p className="text-xs text-red-500 font-medium">Emergency: {hospital.emergencyContact}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Operating Hours</p>
                      <p className="text-xs font-medium text-gray-700 leading-relaxed">{hospital.operatingHours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${hospital.emergencyAvailable ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <Zap className={`w-4 h-4 ${hospital.emergencyAvailable ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Emergency</p>
                      <p className={`text-sm font-semibold ${hospital.emergencyAvailable ? 'text-red-600' : 'text-gray-500'}`}>
                        {hospital.emergencyAvailable ? '🚨 Available 24/7' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Departments */}
                <div className="mb-5">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Departments</p>
                  <div className="flex flex-wrap gap-2">
                    {hospital.departments.slice(0, 6).map(d => (
                      <span key={d} className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium border border-teal-100">
                        {d}
                      </span>
                    ))}
                    {hospital.departments.length > 6 && (
                      <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium">
                        +{hospital.departments.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => router.push(`/patient/hospitals/${hospital.id}`)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Profile
                  </button>
                  <button
                    onClick={() => router.push('/patient/hospitals')}
                    className="flex items-center gap-2 border border-teal-200 text-teal-700 hover:bg-teal-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Change Hospital
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* No hospital selected */
            <div className="bg-white rounded-3xl shadow-xl shadow-teal-100/30 border border-teal-100/60 p-8 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Hospital Selected</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                Search and select your preferred hospital to see its status, departments, and announcements here.
              </p>
              <button
                onClick={() => router.push('/patient/hospitals')}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-teal-200 transition-all"
              >
                <Search className="w-4 h-4" />
                Find a Hospital
              </button>
            </div>
          )}

          {/* Announcements */}
          {hospital && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Hospital Announcements</h3>
                  <p className="text-xs text-gray-400">Public updates from {hospital.name}</p>
                </div>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-teal-300" />
                  <p className="text-sm">No announcements at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map(a => (
                    <div
                      key={a.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${
                        a.type === 'urgent' ? 'bg-red-50 border-red-100' :
                        a.type === 'warning' ? 'bg-amber-50 border-amber-100' :
                        'bg-teal-50/50 border-teal-100'
                      }`}
                    >
                      <AnnouncementIcon type={a.type} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{a.message}</p>
                        <p className="text-xs text-gray-400 mt-1.5">{formatDate(a.publishedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right Column ──────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(action => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-md hover:scale-105 transition-all duration-200`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold text-center leading-tight">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Emergency info card */}
          <div id="emergency" className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-lg p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold">Emergency</h3>
            </div>
            <p className="text-red-100 text-xs mb-3 leading-relaxed">
              For medical emergencies, call <strong className="text-white">112</strong> (national emergency) or contact your hospital's emergency line directly.
            </p>
            {hospital?.emergencyAvailable && (
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-100">Your Hospital Emergency:</p>
                <p className="text-white font-bold text-lg">{hospital.emergencyContact}</p>
              </div>
            )}
            <p className="text-red-200 text-xs mt-3">
              🏥 National Emergency: <strong className="text-white">112</strong><br />
              🚑 Ambulance: <strong className="text-white">108</strong>
            </p>
          </div>

          {/* Health tips */}
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl shadow-lg p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5" />
              <h3 className="font-bold text-sm">Health Tip of the Day</h3>
            </div>
            <p className="text-teal-100 text-xs leading-relaxed">
              Stay hydrated! Drinking 8 glasses of water daily helps maintain organ function, improves skin health, and boosts energy levels throughout the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
