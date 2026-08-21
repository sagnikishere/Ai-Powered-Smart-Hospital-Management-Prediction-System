'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Building2, MapPin, Phone, Mail, Globe, Clock, Zap, Users,
  Bed, ChevronRight, ChevronLeft, CheckCircle, Plus, X, Shield,
  Save, AlertCircle, Info
} from "lucide-react"
import { saveHospitalProfile } from "@/lib/hospital-store"

const STEP_LABELS = ['Basic Info', 'Capacity', 'Departments & Services', 'Contact & Hours', 'Review & Save']

const DEPT_SUGGESTIONS = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics',
  'Emergency Medicine', 'Radiology', 'Nephrology', 'Gastroenterology',
  'Urology', 'Gynecology', 'Endocrinology', 'Pulmonology', 'Dermatology',
  'Psychiatry', 'General Medicine', 'General Surgery', 'ENT', 'Ophthalmology',
  'Dental', 'Physiotherapy', 'Pathology', 'Anesthesiology', 'ICU',
]

const SERVICE_SUGGESTIONS = [
  '24/7 Emergency', 'ICU', 'NICU', 'Dialysis', 'Physiotherapy',
  'Blood Bank', 'Pharmacy', 'Diagnostics', 'Ambulance', 'Robotic Surgery',
  'Bone Marrow Transplant', 'Cardiac Catheterization', 'PET Scan',
  'Vaccination', 'Maternity', 'Lab Services',
]

const FACILITY_SUGGESTIONS = [
  'MRI', 'CT Scan', 'Digital X-Ray', 'Cath Lab', 'Operation Theatre',
  'Cafeteria', 'Parking', 'ATM', 'Wheelchair Access', 'PET-CT Scanner',
  '3T MRI', 'Da Vinci Robot', 'ECMO', 'Hybrid OT', 'Helipad',
  'Waiting Lounge', 'ECG', 'Ultrasound',
]

interface FormData {
  name: string; description: string; logoUrl: string; coverImageUrl: string
  totalBeds: number; icuBeds: number; emergencyBeds: number
  departments: string[]; services: string[]; facilities: string[]
  address: string; city: string; state: string; country: string; pinCode: string
  phone: string; email: string; website: string; emergencyContact: string
  operatingHours: string; emergencyAvailable: boolean
  publicStatus: 'Normal' | 'Busy' | 'High Demand'
}

const INITIAL: FormData = {
  name: '', description: '', logoUrl: '', coverImageUrl: '',
  totalBeds: 200, icuBeds: 20, emergencyBeds: 30,
  departments: [], services: [], facilities: [],
  address: '', city: '', state: '', country: 'India', pinCode: '',
  phone: '', email: '', website: '', emergencyContact: '',
  operatingHours: 'OPD: Mon–Sat 8:00 AM – 6:00 PM | Emergency: 24/7',
  emergencyAvailable: true, publicStatus: 'Normal',
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5"

function TagInput({ label, value, onChange, suggestions }: {
  label: string; value: string[]; onChange: (v: string[]) => void; suggestions: string[]
}) {
  const [input, setInput] = useState('')
  const available = suggestions.filter(s => !value.includes(s))
  const filtered = available.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 8)

  const add = (tag: string) => {
    const clean = tag.trim()
    if (clean && !value.includes(clean)) onChange([...value, clean])
    setInput('')
  }
  const remove = (tag: string) => onChange(value.filter(t => t !== tag))

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-blue-200">
            {tag}
            <button onClick={() => remove(tag)} type="button">
              <X className="w-3 h-3 hover:text-red-600" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (input.trim()) add(input) } }}
          placeholder={`Type to search or add custom ${label.toLowerCase()}...`}
          className={inputCls}
        />
        {input && filtered.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-10 overflow-hidden">
            {filtered.map(s => (
              <button key={s} type="button" onClick={() => add(s)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors">
                <Plus className="inline w-3 h-3 mr-1.5" />{s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {available.slice(0, 6).map(s => (
          <button key={s} type="button" onClick={() => add(s)}
            className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 rounded-lg border border-gray-200 transition-all">
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HospitalSetupPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof FormData, val: unknown) => setForm(f => ({ ...f, [field]: val }))

  const validate = (): boolean => {
    if (step === 0 && !form.name.trim()) { setError('Hospital name is required'); return false }
    if (step === 1 && form.totalBeds < 1) { setError('Total beds must be at least 1'); return false }
    if (step === 3 && !form.phone.trim()) { setError('Phone number is required'); return false }
    setError('')
    return true
  }

  const handleNext = () => { if (validate()) setStep(s => s + 1) }
  const handleBack = () => { setError(''); setStep(s => s - 1) }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      const profile = saveHospitalProfile({
        name: form.name,
        description: form.description,
        logoUrl: form.logoUrl || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        pinCode: form.pinCode,
        phone: form.phone,
        email: form.email,
        website: form.website || undefined,
        emergencyContact: form.emergencyContact,
        totalBeds: form.totalBeds,
        icuBeds: form.icuBeds,
        emergencyBeds: form.emergencyBeds,
        departments: form.departments,
        services: form.services,
        facilities: form.facilities,
        operatingHours: form.operatingHours,
        emergencyAvailable: form.emergencyAvailable,
        publicStatus: form.publicStatus,
        adminEmail: session?.user?.email ?? undefined,
      })

      // Also sync to backend
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospital/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hospital_id: profile.hospitalId,
            name: profile.name,
            description: profile.description,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            pin_code: profile.pinCode,
            phone: profile.phone,
            email: profile.email,
            website: profile.website,
            emergency_contact: profile.emergencyContact,
            total_beds: profile.totalBeds,
            icu_beds: profile.icuBeds,
            emergency_beds: profile.emergencyBeds,
            departments: profile.departments,
            services: profile.services,
            facilities: profile.facilities,
            operating_hours: profile.operatingHours,
            emergency_available: profile.emergencyAvailable,
            public_status: profile.publicStatus,
          }),
        })
      } catch {
        // Backend sync is best-effort
      }

      router.push('/dashboard')
    } catch {
      setError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    /* ── Step 0: Basic Info ─────────────────────────────── */
    <div key="basic" className="space-y-5">
      <div>
        <label className={labelCls}>Hospital Name *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="e.g. MedCore General Hospital" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          rows={4} placeholder="Describe your hospital — its specialities, history, and mission..."
          className={`${inputCls} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Hospital Type</label>
          <select value={form.publicStatus} onChange={e => set('publicStatus', e.target.value)}
            className={inputCls}>
            <option>Normal</option>
            <option>Busy</option>
            <option>High Demand</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Initial public capacity status</p>
        </div>
        <div className="flex items-center gap-3 pt-7">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={form.emergencyAvailable}
              onChange={e => set('emergencyAvailable', e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Emergency Services Available</span>
          </label>
        </div>
      </div>
    </div>,

    /* ── Step 1: Capacity ───────────────────────────────── */
    <div key="capacity" className="space-y-6">
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Accurate bed capacity is critical for AI predictions. The prediction engine will use these values to calculate bed stress percentages.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Beds *', field: 'totalBeds', icon: Bed, color: 'blue' },
          { label: 'ICU Beds', field: 'icuBeds', icon: Users, color: 'red' },
          { label: 'Emergency Beds', field: 'emergencyBeds', icon: Zap, color: 'amber' },
        ].map(({ label, field, icon: Icon, color }) => (
          <div key={field}>
            <label className={labelCls}>{label}</label>
            <div className={`relative`}>
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
              </div>
              <input type="number" min={0}
                value={(form as Record<string, unknown>)[field] as number}
                onChange={e => set(field as keyof FormData, parseInt(e.target.value) || 0)}
                className={`${inputCls} pl-12 text-lg font-bold`} />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-sm font-semibold text-gray-700 mb-3">Capacity Summary</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'General Beds', val: Math.max(0, form.totalBeds - form.icuBeds - form.emergencyBeds) },
            { label: 'ICU Beds', val: form.icuBeds },
            { label: 'Emergency Beds', val: form.emergencyBeds },
          ].map(({ label, val }) => (
            <div key={label} className="text-center bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-2xl font-bold text-blue-700">{val}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>,

    /* ── Step 2: Departments & Services ─────────────────── */
    <div key="deps" className="space-y-6">
      <TagInput label="Departments" value={form.departments}
        onChange={v => set('departments', v)} suggestions={DEPT_SUGGESTIONS} />
      <TagInput label="Services" value={form.services}
        onChange={v => set('services', v)} suggestions={SERVICE_SUGGESTIONS} />
      <TagInput label="Facilities & Equipment" value={form.facilities}
        onChange={v => set('facilities', v)} suggestions={FACILITY_SUGGESTIONS} />
    </div>,

    /* ── Step 3: Contact & Hours ─────────────────────────── */
    <div key="contact" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}><MapPin className="inline w-3.5 h-3.5 mr-1 text-gray-400" />Street Address</label>
          <input value={form.address} onChange={e => set('address', e.target.value)}
            placeholder="Building no., Street name, Area" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input value={form.city} onChange={e => set('city', e.target.value)}
            placeholder="Kolkata" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>State</label>
          <input value={form.state} onChange={e => set('state', e.target.value)}
            placeholder="West Bengal" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input value={form.country} onChange={e => set('country', e.target.value)}
            placeholder="India" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>PIN / ZIP Code</label>
          <input value={form.pinCode} onChange={e => set('pinCode', e.target.value)}
            placeholder="700016" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}><Phone className="inline w-3.5 h-3.5 mr-1 text-gray-400" />Phone *</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+91-33-2227-8800" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}><Mail className="inline w-3.5 h-3.5 mr-1 text-gray-400" />Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="info@hospital.in" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}><Globe className="inline w-3.5 h-3.5 mr-1 text-gray-400" />Website</label>
          <input value={form.website} onChange={e => set('website', e.target.value)}
            placeholder="https://hospital.in" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}><Zap className="inline w-3.5 h-3.5 mr-1 text-red-400" />Emergency Contact</label>
          <input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)}
            placeholder="+91-33-2227-8811" className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}><Clock className="inline w-3.5 h-3.5 mr-1 text-gray-400" />Operating Hours</label>
          <input value={form.operatingHours} onChange={e => set('operatingHours', e.target.value)}
            placeholder="OPD: Mon–Sat 8:00 AM – 6:00 PM | Emergency: 24/7" className={inputCls} />
        </div>
      </div>
    </div>,

    /* ── Step 4: Review ──────────────────────────────────── */
    <div key="review" className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'Hospital Name', val: form.name || '—' },
          { label: 'City', val: form.city || '—' },
          { label: 'Total Beds', val: form.totalBeds.toString() },
          { label: 'ICU Beds', val: form.icuBeds.toString() },
          { label: 'Emergency Beds', val: form.emergencyBeds.toString() },
          { label: 'Departments', val: `${form.departments.length} added` },
          { label: 'Services', val: `${form.services.length} added` },
          { label: 'Facilities', val: `${form.facilities.length} added` },
          { label: 'Phone', val: form.phone || '—' },
          { label: 'Emergency Contact', val: form.emergencyContact || '—' },
          { label: 'Emergency Available', val: form.emergencyAvailable ? '✅ Yes' : '❌ No' },
          { label: 'Public Status', val: form.publicStatus },
        ].map(({ label, val }) => (
          <div key={label} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">{label}</span>
            <span className="text-sm font-semibold text-gray-800">{val}</span>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
        <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          A unique <strong>Hospital ID</strong> will be generated automatically and tied to all your data uploads, predictions, and alerts.
        </p>
      </div>
    </div>,
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <Building2 className="w-4 h-4" />
          Hospital Onboarding
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Set Up Your Hospital</h1>
        <p className="text-gray-500 mt-1 text-sm">Configure your hospital profile to start using AI-powered predictions.</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-blue-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-500"
            style={{ width: `${((step) / (STEP_LABELS.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-white font-bold text-lg">{STEP_LABELS[step]}</h2>
          <p className="text-blue-200 text-sm">Step {step + 1} of {STEP_LABELS.length}</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-xl p-3 mb-5 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {steps[step]}
        </div>

        {/* Navigation buttons */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button onClick={handleBack} disabled={step === 0}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all">
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-60">
              {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save & Launch Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
