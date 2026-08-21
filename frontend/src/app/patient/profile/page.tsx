'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  User, Mail, Phone, Calendar, MapPin, Heart,
  Shield, Save, CheckCircle, AlertCircle, Building2,
  Edit3, X, Star
} from "lucide-react"
import { getPatientByEmail, updatePatient, getHospitalById } from "@/lib/patient-store"
import type { Hospital } from "@/types"

interface ProfileForm {
  fullName: string
  phone: string
  dateOfBirth: string
  gender: string
  city: string
  emergencyContact: string
}

export default function PatientProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [form, setForm] = useState<ProfileForm>({
    fullName: '', phone: '', dateOfBirth: '', gender: '', city: '', emergencyContact: '',
  })
  const [email, setEmail] = useState('')
  const [patientId, setPatientId] = useState<string | null>(null)
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.user?.email) return
    setEmail(session.user.email)
    const patient = getPatientByEmail(session.user.email)
    if (patient) {
      setPatientId(patient.id)
      setForm({
        fullName: patient.fullName,
        phone: patient.phone ?? '',
        dateOfBirth: patient.dateOfBirth ?? '',
        gender: patient.gender ?? '',
        city: patient.city ?? '',
        emergencyContact: patient.emergencyContact ?? '',
      })
      if (patient.preferredHospitalId) {
        const h = getHospitalById(patient.preferredHospitalId)
        setHospital(h)
      }
    } else {
      // Seeded from Google OAuth
      setForm(f => ({ ...f, fullName: session.user?.name ?? '' }))
      setEditing(true)
    }
  }, [session])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName.trim()) { setError('Full name is required'); return }
    if (!form.phone.trim()) { setError('Phone number is required'); return }
    setError('')
    setSaving(true)

    await new Promise(r => setTimeout(r, 600)) // Simulate save

    if (patientId) {
      updatePatient(patientId, { ...form })
    }

    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleRemoveHospital = () => {
    if (!patientId) return
    updatePatient(patientId, { preferredHospitalId: undefined })
    setHospital(null)
  }

  const initials = form.fullName
    ? form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : email.charAt(0).toUpperCase()

  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400`

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: Avatar + Info ────────────────────────────── */}
        <div className="space-y-5">

          {/* Avatar card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-xl shadow-teal-200">
              {initials}
            </div>
            <h2 className="font-bold text-gray-900 text-lg">{form.fullName || 'Your Name'}</h2>
            <p className="text-sm text-gray-500">{email}</p>
            <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-100 mt-3">
              <Shield className="w-3 h-3" />
              Patient Account
            </div>
          </div>

          {/* Selected hospital mini-card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-500" />
              My Hospital
            </h3>
            {hospital ? (
              <div>
                <p className="font-semibold text-gray-800 text-sm">{hospital.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />{hospital.city}, {hospital.state}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => router.push(`/patient/hospitals/${hospital.id}`)}
                    className="flex-1 text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 hover:bg-teal-50 py-1.5 rounded-lg transition-all"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleRemoveHospital}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-xs text-gray-400 mb-3">No hospital selected yet</p>
                <button
                  onClick={() => router.push('/patient/hospitals')}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 hover:bg-teal-50 px-4 py-1.5 rounded-lg transition-all"
                >
                  Find a Hospital
                </button>
              </div>
            )}
          </div>

          {/* Privacy note */}
          <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-teal-800 mb-1">Your Privacy</p>
                <p className="text-xs text-teal-700 leading-relaxed">
                  Your profile data is stored locally on your device and never shared with hospitals without your consent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Profile Form ────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Form header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-semibold border border-teal-200 hover:bg-teal-50 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Banners */}
              {error && (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-xl p-3 text-sm border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {saved && (
                <div className="flex items-center gap-3 bg-teal-50 text-teal-700 rounded-xl p-3 text-sm border border-teal-100">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Profile updated successfully!
                </div>
              )}

              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-500" />
                  Full Name *
                </label>
                <input
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  disabled={!editing}
                  className={inputClass}
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-500" />
                  Email Address
                </label>
                <input
                  value={email}
                  disabled
                  className={`${inputClass} cursor-not-allowed`}
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone + DOB row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-500" />
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    disabled={!editing}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-500" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                    disabled={!editing}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Gender + City row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    disabled={!editing}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-500" />
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="Your city"
                    disabled={!editing}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Emergency contact */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  Emergency Contact
                </label>
                <input
                  value={form.emergencyContact}
                  onChange={e => setForm({ ...form, emergencyContact: e.target.value })}
                  placeholder="Name and phone number of emergency contact"
                  disabled={!editing}
                  className={inputClass}
                />
              </div>

              {/* Save button */}
              {editing && (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-200 transition-all disabled:opacity-60"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
