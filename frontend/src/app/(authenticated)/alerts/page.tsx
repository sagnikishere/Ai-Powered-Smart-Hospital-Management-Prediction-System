'use client'

import { useEffect, useState, useCallback } from "react"
import {
  AlertTriangle, Bell, CheckCircle, Clock, RefreshCw,
  Zap, Users, Activity, Filter, X, ChevronDown
} from "lucide-react"
import {
  getAlerts, updateAlertStatus, getHospitalProfile,
  generateAlertsFromPredictions, type HospitalAlert, type AlertStatus
} from "@/lib/hospital-store"

const SEVERITY_CFG = {
  Critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', ring: 'ring-red-200' },
  High: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', ring: 'ring-orange-200' },
  Medium: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400', ring: 'ring-amber-200' },
  Low: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400', ring: 'ring-blue-200' },
}

const STATUS_CFG = {
  New: { badge: 'bg-red-100 text-red-700 border border-red-200', label: 'New' },
  Acknowledged: { badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Acknowledged' },
  Resolved: { badge: 'bg-green-100 text-green-700 border border-green-200', label: 'Resolved' },
}

const TYPE_ICON = {
  bed_stress: <Activity className="w-4 h-4" />,
  staff_risk: <Users className="w-4 h-4" />,
  capacity: <Bell className="w-4 h-4" />,
  emergency: <Zap className="w-4 h-4" />,
}

function AlertCard({ alert, onUpdate }: { alert: HospitalAlert; onUpdate: () => void }) {
  const sev = SEVERITY_CFG[alert.severity] ?? SEVERITY_CFG.Low
  const sta = STATUS_CFG[alert.status]

  const handleAcknowledge = () => {
    updateAlertStatus(alert.id, 'Acknowledged')
    onUpdate()
  }
  const handleResolve = () => {
    updateAlertStatus(alert.id, 'Resolved')
    onUpdate()
  }

  return (
    <div className={`${sev.bg} ${sev.border} border rounded-3xl p-5 transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Severity dot */}
          <div className="mt-1">
            <span className={`inline-block w-3 h-3 rounded-full ${sev.dot} ${alert.status === 'New' ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-sm">{alert.title}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sev.badge}`}>
                {alert.severity}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sta.badge}`}>
                {sta.label}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">{alert.description}</p>
            <div className="bg-white/70 rounded-xl p-3 border border-white mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Recommended Action</p>
              <p className="text-sm text-gray-800 leading-relaxed">{alert.recommendedAction}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {TYPE_ICON[alert.type]}
              <span className="capitalize">{alert.type.replace('_', ' ')}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{new Date(alert.triggeredAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          {alert.status === 'New' && (
            <button onClick={handleAcknowledge}
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl transition-all whitespace-nowrap">
              Acknowledge
            </button>
          )}
          {alert.status !== 'Resolved' && (
            <button onClick={handleResolve}
              className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl transition-all whitespace-nowrap">
              Resolve
            </button>
          )}
          {alert.status === 'Resolved' && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              Resolved
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<HospitalAlert[]>([])
  const [filter, setFilter] = useState<AlertStatus | 'All'>('All')
  const [severityFilter, setSeverityFilter] = useState<string>('All')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const profile = getHospitalProfile()
    if (!profile) { setLoading(false); return }

    // Try to fetch from backend to generate new alerts based on prediction state
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-data`)
      if (resp.ok) {
        const data = await resp.json()
        generateAlertsFromPredictions(
          profile.hospitalId,
          data.bed_stress_current ?? 0,
          data.staff_risk_current ?? 0,
          data.seven_day_forecast?.predictions ?? []
        )
      }
    } catch {
      // Backend unavailable — show only stored alerts
    }

    setAlerts(getAlerts(profile.hospitalId))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = () => { setLoading(true); load() }

  const filtered = alerts.filter(a => {
    if (filter !== 'All' && a.status !== filter) return false
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false
    return true
  })

  const counts = {
    all: alerts.length,
    new: alerts.filter(a => a.status === 'New').length,
    ack: alerts.filter(a => a.status === 'Acknowledged').length,
    resolved: alerts.filter(a => a.status === 'Resolved').length,
  }

  const profile = getHospitalProfile()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium mb-4 border border-red-100">
            <Bell className="w-4 h-4" />
            Smart Alerts
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hospital Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">Auto-generated alerts based on AI predictions and capacity monitoring</p>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* No profile guard */}
      {!profile && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Set Up Your Hospital First</h3>
          <p className="text-gray-500 text-sm mb-6">Alerts are generated once your hospital profile is configured and data is uploaded.</p>
          <a href="/hospital/setup"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-200">
            Set Up Hospital Profile
          </a>
        </div>
      )}

      {profile && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Alerts', val: counts.all, color: 'blue', icon: Bell },
              { label: 'New', val: counts.new, color: 'red', icon: AlertTriangle },
              { label: 'Acknowledged', val: counts.ack, color: 'amber', icon: Clock },
              { label: 'Resolved', val: counts.resolved, color: 'green', icon: CheckCircle },
            ].map(({ label, val, color, icon: Icon }) => (
              <div key={label} className={`bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center`}>
                <div className={`w-9 h-9 bg-${color}-100 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-4 h-4 text-${color}-600`} />
                </div>
                <p className={`text-2xl font-bold text-${color}-600`}>{val}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              {(['All', 'New', 'Acknowledged', 'Resolved'] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    filter === s ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 border border-gray-200 hover:bg-blue-50'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
              className="ml-auto px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white">
              <option value="All">All Severities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {/* Alerts list */}
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-sm">Loading alerts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">
                {alerts.length === 0 ? 'No Alerts Generated Yet' : 'No Alerts Match Filter'}
              </h3>
              <p className="text-gray-500 text-sm">
                {alerts.length === 0
                  ? 'Upload hospital data to enable AI-powered alert generation.'
                  : 'Try changing the status or severity filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(alert => (
                <AlertCard key={alert.id} alert={alert} onUpdate={() => setAlerts(getAlerts(profile.hospitalId))} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
