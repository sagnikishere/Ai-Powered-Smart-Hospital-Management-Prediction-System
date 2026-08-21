'use client'

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search, SlidersHorizontal, MapPin, Phone, Zap, Building2,
  ChevronRight, X, Filter, Star, Clock
} from "lucide-react"
import { getHospitals, searchHospitals } from "@/lib/patient-store"
import type { Hospital } from "@/types"

function StatusDot({ status }: { status: string }) {
  const color = status === 'Normal' ? 'bg-emerald-500' : status === 'Busy' ? 'bg-amber-500' : 'bg-red-500'
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
      status === 'Normal' ? 'text-emerald-700' : status === 'Busy' ? 'text-amber-700' : 'text-red-700'
    }`}>
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {status}
    </span>
  )
}

const HOSPITAL_TYPES = ['All', 'Multi-speciality', 'General', "Children's", 'Maternity', 'Trauma', 'Cancer']
const CITIES = ['All Cities', 'Kolkata', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad']

function HospitalCard({ hospital, onView }: { hospital: Hospital; onView: () => void }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 hover:border-teal-100 transition-all duration-300 overflow-hidden group">
      {/* Card top stripe */}
      <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {/* Logo placeholder */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shrink-0 border border-teal-200/50">
              <Building2 className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-teal-700 transition-colors">
                {hospital.name}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                {hospital.type}
              </span>
            </div>
          </div>
          <StatusDot status={hospital.publicStatus} />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          <span>{hospital.address}, {hospital.city}, {hospital.state}</span>
        </div>

        {/* Emergency badge */}
        {hospital.emergencyAvailable && (
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100 mb-3">
            <Zap className="w-3 h-3" />
            Emergency 24/7
          </div>
        )}

        {/* Departments */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-medium mb-1.5">Key Departments</p>
          <div className="flex flex-wrap gap-1.5">
            {hospital.departments.slice(0, 4).map(d => (
              <span key={d} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-xs font-medium border border-teal-100">
                {d}
              </span>
            ))}
            {hospital.departments.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-xs font-medium">
                +{hospital.departments.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Contact + Hours */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {hospital.phone}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-teal-200 hover:shadow-teal-300"
        >
          View Hospital
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function FindHospitalPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedType, setSelectedType] = useState('All')
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([])

  useEffect(() => {
    setAllHospitals(getHospitals())
  }, [])

  const results = useMemo(() => {
    return searchHospitals(query, {
      city: selectedCity !== 'All Cities' ? selectedCity : undefined,
      type: selectedType !== 'All' ? selectedType : undefined,
      emergencyOnly: emergencyOnly || undefined,
    })
  }, [query, selectedCity, selectedType, emergencyOnly, allHospitals])

  const clearFilters = () => {
    setQuery('')
    setSelectedCity('All Cities')
    setSelectedType('All')
    setEmergencyOnly(false)
  }

  const hasFilters = query || selectedCity !== 'All Cities' || selectedType !== 'All' || emergencyOnly

  return (
    <div className="min-h-screen">
      {/* Hero search section */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-white/20">
            <Search className="w-3.5 h-3.5" />
            Hospital Discovery
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Find Your Hospital
          </h1>
          <p className="text-teal-200 mb-8 text-base">
            Search hospitals by name, city, or department. View real-time availability and select your preferred hospital.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by hospital name, city, or department..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-2xl text-gray-900 text-base shadow-2xl border-0 outline-none focus:ring-2 focus:ring-teal-300"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick city pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {['Kolkata', 'Mumbai', 'Delhi'].map(city => (
              <button
                key={city}
                onClick={() => setQuery(city)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full border border-white/20 transition-all backdrop-blur-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              showFilters ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* City filter */}
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-teal-400/30 outline-none"
          >
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-teal-400/30 outline-none"
          >
            {HOSPITAL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          {/* Emergency toggle */}
          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              emergencyOnly
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Emergency Available
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}

          <div className="ml-auto text-sm text-gray-400 font-medium">
            {results.length} hospital{results.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Results grid */}
        {results.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No hospitals found</h3>
            <p className="text-gray-500 text-sm mb-4">Try a different search term or clear the filters.</p>
            <button onClick={clearFilters} className="text-teal-600 hover:text-teal-700 font-semibold text-sm">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
            {results.map(h => (
              <HospitalCard
                key={h.id}
                hospital={h}
                onView={() => router.push(`/patient/hospitals/${h.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
