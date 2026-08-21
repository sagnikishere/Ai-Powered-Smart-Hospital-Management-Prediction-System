'use client'

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Heart, Shield, Eye, EyeOff, User, Mail, Phone,
  Calendar, MapPin, AlertCircle, CheckCircle, ChevronRight,
  ArrowLeft, Lock
} from "lucide-react"
import {
  getPatientByEmail, createPatient, hashPassword, verifyPassword
} from "@/lib/patient-store"

type Tab = 'login' | 'register'

interface FormErrors {
  [key: string]: string
}

export default function PatientLoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [reg, setReg] = useState({
    fullName: '', email: '', phone: '', dateOfBirth: '',
    gender: '', city: '', emergencyContact: '', password: '', confirmPassword: '',
  })
  const [regErrors, setRegErrors] = useState<FormErrors>({})

  useEffect(() => {
    getSession().then(session => {
      if (session) {
        const role = (session.user as any)?.role
        router.push(role === 'PATIENT' ? '/patient/dashboard' : '/dashboard')
      }
    })
  }, [router])

  // ── Login ────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const patient = getPatientByEmail(loginEmail)
      if (!patient) {
        setError('No account found with this email. Please register first.')
        return
      }
      if (!verifyPassword(loginPassword, patient.passwordHash)) {
        setError('Incorrect password. Please try again.')
        return
      }

      const result = await signIn('patient-credentials', {
        email: loginEmail,
        password: loginPassword,
        patientId: patient.id,
        redirect: false,
        callbackUrl: '/patient/dashboard',
      })

      if (result?.error) {
        setError('Sign-in failed. Please try again.')
      } else {
        router.push('/patient/dashboard')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Register ─────────────────────────────────────────────────────────────

  const validateReg = (): boolean => {
    const errors: FormErrors = {}
    if (!reg.fullName.trim()) errors.fullName = 'Full name is required'
    if (!reg.email.trim() || !/\S+@\S+\.\S+/.test(reg.email)) errors.email = 'Valid email is required'
    if (!reg.phone.trim() || !/^\+?[\d\s-]{7,}$/.test(reg.phone)) errors.phone = 'Valid phone number is required'
    if (!reg.password || reg.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (reg.password !== reg.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    setRegErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateReg()) return

    setLoading(true)
    try {
      const existing = getPatientByEmail(reg.email)
      if (existing) {
        setError('An account with this email already exists. Please log in.')
        setLoading(false)
        return
      }

      const patient = createPatient({
        email: reg.email,
        passwordHash: hashPassword(reg.password),
        fullName: reg.fullName,
        phone: reg.phone,
        dateOfBirth: reg.dateOfBirth,
        gender: reg.gender,
        city: reg.city,
        emergencyContact: reg.emergencyContact,
      })

      setSuccess('Account created! Signing you in...')

      const result = await signIn('patient-credentials', {
        email: reg.email,
        password: reg.password,
        patientId: patient.id,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but sign-in failed. Please try logging in.')
      } else {
        router.push('/patient/dashboard')
      }
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-teal-500/30 ${
      err
        ? 'border-red-300 bg-red-50/50 focus:border-red-400'
        : 'border-gray-200 bg-white/80 focus:border-teal-400 hover:border-teal-300'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50/50 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="flex items-center justify-center gap-3 mb-4 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-200">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="block text-xl font-bold text-gray-900 tracking-tight">MedCore Health</span>
              <span className="block text-xs text-teal-600 font-semibold tracking-widest uppercase">Patient Portal</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium border border-teal-100">
            <Shield className="w-3.5 h-3.5" />
            Secure Patient Access
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-teal-100/50 border border-white/80 overflow-hidden">

          {/* Tab switcher */}
          <div className="flex bg-gray-50/80 p-1.5 m-4 mb-0 rounded-2xl border border-gray-100">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-white text-teal-700 shadow-md shadow-teal-100/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'login' ? '🔑 Sign In' : '✨ Create Account'}
              </button>
            ))}
          </div>

          <div className="p-6 pt-5">
            {/* Error / Success banners */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 text-red-700 rounded-xl p-3 mb-4 text-sm border border-red-100">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 bg-teal-50 text-teal-700 rounded-xl p-3 mb-4 text-sm border border-teal-100">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            {/* ── LOGIN FORM ──────────────────────────────── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className={`${inputClass()} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className={`${inputClass()} pl-10 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-teal-600 hover:text-teal-700 mt-1.5 font-medium"
                    onClick={() => setError('Password reset: please contact support@medcorehealth.in')}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-teal-300 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>Sign In <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>

                <div className="text-center text-sm text-gray-500 mt-2">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => setTab('register')} className="text-teal-600 font-semibold hover:text-teal-700">
                    Create one free
                  </button>
                </div>
              </form>
            )}

            {/* ── REGISTER FORM ───────────────────────────── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  Create your patient account to find and select your preferred hospital.
                </p>

                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" placeholder="Sagnik Roy"
                      value={reg.fullName}
                      onChange={e => setReg({ ...reg, fullName: e.target.value })}
                      className={`${inputClass(regErrors.fullName)} pl-10`}
                    />
                  </div>
                  {regErrors.fullName && <p className="text-red-500 text-xs mt-1">{regErrors.fullName}</p>}
                </div>

                {/* Email + Phone row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="email" placeholder="you@email.com"
                        value={reg.email}
                        onChange={e => setReg({ ...reg, email: e.target.value })}
                        className={`${inputClass(regErrors.email)} pl-9 text-xs`}
                      />
                    </div>
                    {regErrors.email && <p className="text-red-500 text-xs mt-1">{regErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="tel" placeholder="+91 98765 43210"
                        value={reg.phone}
                        onChange={e => setReg({ ...reg, phone: e.target.value })}
                        className={`${inputClass(regErrors.phone)} pl-9 text-xs`}
                      />
                    </div>
                    {regErrors.phone && <p className="text-red-500 text-xs mt-1">{regErrors.phone}</p>}
                  </div>
                </div>

                {/* DOB + Gender row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="date"
                        value={reg.dateOfBirth}
                        onChange={e => setReg({ ...reg, dateOfBirth: e.target.value })}
                        className={`${inputClass()} pl-9 text-xs`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                    <select
                      value={reg.gender}
                      onChange={e => setReg({ ...reg, gender: e.target.value })}
                      className={`${inputClass()} text-xs`}
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text" placeholder="Kolkata"
                      value={reg.city}
                      onChange={e => setReg({ ...reg, city: e.target.value })}
                      className={`${inputClass()} pl-9 text-xs`}
                    />
                  </div>
                </div>

                {/* Emergency contact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Emergency Contact</label>
                  <input
                    type="text" placeholder="Name & phone of emergency contact"
                    value={reg.emergencyContact}
                    onChange={e => setReg({ ...reg, emergencyContact: e.target.value })}
                    className={`${inputClass()} text-xs`}
                  />
                </div>

                {/* Password row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 chars"
                        value={reg.password}
                        onChange={e => setReg({ ...reg, password: e.target.value })}
                        className={`${inputClass(regErrors.password)} pl-9 pr-9 text-xs`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {regErrors.password && <p className="text-red-500 text-xs mt-1">{regErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={reg.confirmPassword}
                      onChange={e => setReg({ ...reg, confirmPassword: e.target.value })}
                      className={`${inputClass(regErrors.confirmPassword)} text-xs`}
                    />
                    {regErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{regErrors.confirmPassword}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-teal-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>Create Free Account <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-2">
                  By creating an account you agree to our privacy policy. We never share your data.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Back to home */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mt-6 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  )
}
