'use client'

import { useEffect, useState } from "react"
import {
  Brain, Lightbulb, Clock, DollarSign, TrendingUp,
  RefreshCw, AlertCircle, CheckCircle, Upload, Zap
} from "lucide-react"
import { getHospitalProfile } from "@/lib/hospital-store"

interface Recommendation {
  title: string
  description: string
  rationale: string
  cost_estimate: number
  impact_score: number
  priority: number
  implementation_time: string
}

const PRIORITY_CFG: Record<number, { label: string; badge: string; border: string; bg: string }> = {
  1: { label: 'P1 — Immediate', badge: 'bg-red-100 text-red-700 border border-red-200', border: 'border-red-200', bg: 'bg-red-50/50' },
  2: { label: 'P2 — High', badge: 'bg-orange-100 text-orange-700 border border-orange-200', border: 'border-orange-200', bg: 'bg-orange-50/50' },
  3: { label: 'P3 — Medium', badge: 'bg-blue-100 text-blue-700 border border-blue-200', border: 'border-blue-200', bg: 'bg-blue-50/50' },
}

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const cfg = PRIORITY_CFG[rec.priority] ?? PRIORITY_CFG[3]

  return (
    <div className={`bg-white rounded-3xl shadow-lg border ${cfg.border} overflow-hidden hover:shadow-xl transition-all duration-300`}>
      {/* Priority stripe */}
      <div className={`h-1 ${rec.priority === 1 ? 'bg-red-500' : rec.priority === 2 ? 'bg-orange-500' : 'bg-blue-500'}`} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-lg ${
              rec.priority === 1 ? 'bg-red-100 text-red-700' :
              rec.priority === 2 ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{rec.title}</h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge} mt-1 inline-block`}>
                {cfg.label}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 font-medium">Impact</p>
            <p className="text-xl font-bold text-blue-600">{rec.impact_score.toFixed(0)}/100</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{rec.description}</p>

        {/* Impact bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Impact Score</span>
            <span>{rec.impact_score.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                rec.impact_score >= 80 ? 'bg-red-500' :
                rec.impact_score >= 60 ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              style={{ width: `${rec.impact_score}%` }}
            />
          </div>
        </div>

        {/* Rationale */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">AI Rationale</p>
          <p className="text-sm text-gray-700 leading-relaxed">{rec.rationale}</p>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3 border border-green-100">
            <DollarSign className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Est. Cost</p>
              <p className="text-sm font-bold text-green-700">₹{rec.cost_estimate.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Implementation</p>
              <p className="text-sm font-bold text-blue-700">{rec.implementation_time}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bedStress, setBedStress] = useState<number | null>(null)
  const [staffRisk, setStaffRisk] = useState<number | null>(null)
  const [noData, setNoData] = useState(false)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const profile = getHospitalProfile()

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)
    setNoData(false)

    try {
      // First get current stress levels from dashboard
      const url = profile?.hospitalId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/dashboard-data?hospital_id=${profile.hospitalId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/dashboard-data`
      const dashRes = await fetch(url)
      if (!dashRes.ok) {
        throw new Error('Prediction service unavailable. Please ensure the backend is running.')
      }
      const dashData = await dashRes.json()
      const bs = dashData.bed_stress_current ?? 0
      const sr = dashData.staff_risk_current ?? 0

      // Check if there's meaningful data
      if (bs === 0 && sr === 0) {
        setNoData(true)
        setLoading(false)
        return
      }

      setBedStress(bs)
      setStaffRisk(sr)

      // Fetch recommendations
      const recRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bed_stress: bs, staff_risk: sr }),
      })

      if (!recRes.ok) {
        const errData = await recRes.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to generate recommendations')
      }

      const data = await recRes.json()
      setRecs(data.recommendations ?? [])
      setLastFetched(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile) fetchRecommendations()
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium mb-4 border border-purple-100">
            <Brain className="w-4 h-4" />
            AI-Powered Recommendations
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recommendations</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-generated, priority-ranked actions based on current hospital predictions
          </p>
          {lastFetched && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastFetched.toLocaleTimeString('en-IN')}
            </p>
          )}
        </div>
        {profile && (
          <button onClick={fetchRecommendations} disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* No Profile */}
      {!profile && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Hospital Profile Required</h3>
          <p className="text-gray-500 text-sm mb-6">Set up your hospital profile first to access AI recommendations.</p>
          <a href="/hospital/setup"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-200">
            Set Up Hospital
          </a>
        </div>
      )}

      {/* Current Stress Context */}
      {profile && (bedStress !== null || staffRisk !== null) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              (bedStress ?? 0) >= 85 ? 'bg-red-100' : (bedStress ?? 0) >= 70 ? 'bg-amber-100' : 'bg-green-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${(bedStress ?? 0) >= 85 ? 'text-red-600' : (bedStress ?? 0) >= 70 ? 'text-amber-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Current Bed Stress</p>
              <p className="text-2xl font-bold text-gray-900">{(bedStress ?? 0).toFixed(1)}%</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              (staffRisk ?? 0) >= 75 ? 'bg-red-100' : (staffRisk ?? 0) >= 60 ? 'bg-amber-100' : 'bg-green-100'
            }`}>
              <Zap className={`w-6 h-6 ${(staffRisk ?? 0) >= 75 ? 'text-red-600' : (staffRisk ?? 0) >= 60 ? 'text-amber-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Staff Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">{(staffRisk ?? 0).toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && profile && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800 mb-1">Prediction Service Unavailable</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* No data state */}
      {noData && profile && !loading && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Historical Data Available</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Upload a historical hospital CSV file to enable AI-powered predictions and recommendations.
          </p>
          <a href="/upload"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-200">
            <Upload className="w-4 h-4" />
            Upload Hospital Data
          </a>
        </div>
      )}

      {/* Loading */}
      {loading && profile && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600 font-medium">Generating AI Recommendations...</p>
          <p className="text-gray-400 text-sm mt-1">Analyzing predictions and historical patterns</p>
        </div>
      )}

      {/* Recommendations grid */}
      {!loading && recs.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{recs.length} Recommendation{recs.length !== 1 ? 's' : ''} Generated</p>
              <p className="text-xs text-gray-400">Sorted by priority — implement in order shown</p>
            </div>
          </div>
          {recs.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} index={i} />
          ))}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3 mt-4">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              These recommendations are AI-generated based on current predictions. Always validate with medical and operational staff before implementation.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
