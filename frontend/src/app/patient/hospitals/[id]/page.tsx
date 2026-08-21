'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  MapPin, Phone, Mail, Globe, Clock, Zap, Building2,
  ChevronLeft, CheckCircle, Star, AlertTriangle,
  Stethoscope, Shield, Wifi, Heart
} from "lucide-react"
import { getHospitalById, getAnnouncementsByHospital, getPatientByEmail, updatePatient } from "@/lib/patient-store"
import type { Hospital, HospitalAnnouncement } from "@/types"

function StatusBanner({ status }: { status: string }) {
  const cfg = {
    Normal: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      label: '🟢 Normal',
      desc: 'Hospital is currently operating normally. You may visit without prior appointment for OPD.',
    },
    Busy: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      label: '🟡 Busy',
      desc: 'Hospital is experiencing higher than usual demand. Expect longer wait times. Consider calling ahead.',
    },
    'High Demand': {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      dot: 'bg-red-500',
      label: '🔴 High Demand',
      desc: 'Hospital is experiencing high demand. Emergency patients should contact the hospital before visiting when appropriate.',
    },
  }[status] ?? { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400', label: status, desc: '' }

  return (
    <div className={`border rounded-2xl p-4 ${cfg.bg}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-3 h-3 rounded-full ${cfg.dot} animate-pulse`} />
        <span className={`font-bold text-sm ${cfg.text}`}>{cfg.label}</span>
      </div>
      <p className={`text-sm ${cfg.text} opacity-80`}>{cfg.desc}</p>
    </div>
  )
}

const DEPT_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-amber-50 text-amber-700 border-amber-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100',
]

export default function HospitalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [announcements, setAnnouncements] = useState<HospitalAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(false)
  const [selecting, setSelecting] = useState(false)

  useEffect(() => {
    const id = params.id as string
    const h = getHospitalById(id)
    if (!h) {
      router.push('/patient/hospitals')
      return
    }
    setHospital(h)
    setAnnouncements(getAnnouncementsByHospital(h.id))

    // Check if already selected
    if (session?.user?.email) {
      const patient = getPatientByEmail(session.user.email)
      if (patient?.preferredHospitalId === id) setSelected(true)
    }
    setLoading(false)
  }, [params.id, session, router])

  const handleSelectHospital = async () => {
    if (!session?.user?.email || !hospital) return
    setSelecting(true)
    const patient = getPatientByEmail(session.user.email)
    if (patient) {
      updatePatient(patient.id, { preferredHospitalId: hospital.id })
    }
    setSelected(true)
    setSelecting(false)
    // Small delay then navigate
    setTimeout(() => router.push('/patient/dashboard'), 800)
  }

  if (loading || !hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Cover */}
      <div className="h-52 sm:h-64 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6 sm:p-8">
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">

        {/* Profile header card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center border-4 border-white shadow-lg shrink-0">
              <Building2 className="w-10 h-10 text-teal-600" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {hospital.name}
                  </h1>
                  <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-100 mt-1.5">
                    {hospital.type}
                  </span>
                </div>

                {/* Select button */}
                {selected ? (
                  <div className="flex items-center gap-2 bg-teal-50 text-teal-700 font-semibold px-5 py-2.5 rounded-xl border border-teal-200">
                    <CheckCircle className="w-4 h-4" />
                    Your Hospital ✓
                  </div>
                ) : (
                  <button
                    onClick={handleSelectHospital}
                    disabled={selecting}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-teal-200 transition-all disabled:opacity-60"
                  >
                    {selecting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                    Select This Hospital
                  </button>
                )}
              </div>

              <p className="text-gray-600 text-sm mt-3 leading-relaxed max-w-2xl">{hospital.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main Content ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Public Status */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                Public Capacity Status
              </h2>
              <StatusBanner status={hospital.publicStatus} />
              <p className="text-xs text-gray-400 mt-2">
                * Status is updated by the hospital. This is a general indicator only — not exact capacity data.
              </p>
            </div>

            {/* Departments */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Departments ({hospital.departments.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {hospital.departments.map((d, i) => (
                  <span
                    key={d}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${DEPT_COLORS[i % DEPT_COLORS.length]}`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-teal-600" />
                Medical Services
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {hospital.services.map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-teal-600" />
                Facilities
              </h2>
              <div className="flex flex-wrap gap-2">
                {hospital.facilities.map(f => (
                  <span key={f} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium border border-gray-100">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4">📢 Announcements</h2>
                <div className="space-y-3">
                  {announcements.map(a => (
                    <div
                      key={a.id}
                      className={`p-4 rounded-2xl border ${
                        a.type === 'urgent' ? 'bg-red-50 border-red-100' :
                        a.type === 'warning' ? 'bg-amber-50 border-amber-100' :
                        'bg-teal-50/50 border-teal-100'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-800 mb-1">{a.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{a.message}</p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(a.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Contact info */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="text-sm text-gray-700">{hospital.address}, {hospital.city}, {hospital.state} {hospital.pinCode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-700">{hospital.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-700">{hospital.email}</p>
                  </div>
                </div>
                {hospital.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-teal-600 hover:underline"
                      >
                        {hospital.website.replace('https://', '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operating hours */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-500" />
                Operating Hours
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{hospital.operatingHours}</p>
            </div>

            {/* Emergency */}
            <div className={`rounded-3xl p-5 border ${hospital.emergencyAvailable ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className={`w-4 h-4 ${hospital.emergencyAvailable ? 'text-red-500' : 'text-gray-400'}`} />
                <h3 className="font-bold text-sm text-gray-900">Emergency Services</h3>
              </div>
              {hospital.emergencyAvailable ? (
                <>
                  <p className="text-red-600 font-bold text-base">{hospital.emergencyContact}</p>
                  <p className="text-xs text-red-500 mt-1">Available 24 hours / 7 days</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Emergency services not available. Please call 112.</p>
              )}
            </div>

            {/* Select CTA sticky */}
            {!selected && (
              <button
                onClick={handleSelectHospital}
                disabled={selecting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-teal-200 transition-all hover:shadow-teal-300 disabled:opacity-60"
              >
                <Star className="w-5 h-5" />
                Select This Hospital
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
