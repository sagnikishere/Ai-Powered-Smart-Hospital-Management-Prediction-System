/**
 * Type definitions for the Hospital Stress Early Warning System
 */

export interface HospitalRecord {
  date: string
  admissions: number
  beds_occupied: number
  staff_on_duty: number
  overload_flag: boolean
}

export interface DailyPrediction {
  date: string
  predicted_beds: number
  bed_stress: number // 0-100
  confidence: number // 0-100
  is_high_risk: boolean
}

export interface BedForecast {
  predictions: DailyPrediction[]
  overall_confidence: number
  generated_at: string
}

export interface StaffRiskScore {
  risk_score: number // 0-100
  confidence: number // 0-100
  is_critical: boolean
  contributing_factors: string[]
  generated_at: string
}

export interface Recommendation {
  title: string
  description: string
  rationale: string
  cost_estimate: number
  impact_score: number // 0-100
  priority: number // 1, 2, or 3
  implementation_time: string
}

export interface AlertData {
  alert_type: "bed_stress" | "staff_risk"
  risk_score: number
  threshold: number
  predictions: DailyPrediction[]
  recommendations: Recommendation[]
  generated_at: string
}

export interface ScenarioRequest {
  sick_rate: number // 0.0 to 0.5
  admission_surge: number // -0.3 to 1.0
  baseline_date: string
}

export interface ScenarioResult {
  baseline_forecast: BedForecast
  scenario_forecast: BedForecast
  baseline_staff_risk: StaffRiskScore
  scenario_staff_risk: StaffRiskScore
  impact_summary: string
}

export interface DashboardData {
  bed_stress_current: number
  staff_risk_current: number
  active_alerts_count: number
  recommendations_count: number
  seven_day_forecast: BedForecast
  seven_day_staff_risk: StaffRiskScore[]
  trend_indicators: {
    [key: string]: "up" | "down" | "stable"
  }
}

// ─── Patient Portal Types ──────────────────────────────────────────────────

export type HospitalType =
  | 'Multi-speciality'
  | 'General'
  | "Children's"
  | 'Maternity'
  | 'Trauma'
  | 'Psychiatric'
  | 'Cancer'
  | 'Rehabilitation'

export type PublicStatus = 'Normal' | 'Busy' | 'High Demand'

export interface Hospital {
  id: string
  name: string
  type: HospitalType
  description: string
  address: string
  city: string
  state: string
  country: string
  pinCode: string
  phone: string
  email: string
  website?: string
  emergencyContact: string
  logoUrl?: string
  coverImageUrl?: string
  departments: string[]
  services: string[]
  facilities: string[]
  operatingHours: string
  emergencyAvailable: boolean
  publicStatus: PublicStatus
  createdAt: string
  isPublished: boolean
}

export interface HospitalAnnouncement {
  id: string
  hospitalId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'urgent'
  publishedAt: string
}

export interface PatientAccount {
  id: string
  email: string
  passwordHash: string
  fullName: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  city?: string
  emergencyContact?: string
  preferredHospitalId?: string
  createdAt: string
}

export type UserRole = 'PATIENT' | 'HOSPITAL_ADMIN' | 'HOSPITAL_STAFF'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: UserRole
      patientId?: string
    }
  }
  interface User {
    role?: UserRole
    patientId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole
    patientId?: string
  }
}
