import type { FlightStatus } from '@/types'

export const STATUS_LABELS: Record<FlightStatus, string> = {
  scheduled: 'Scheduled',
  boarding: 'Boarding',
  departed: 'Departed',
  arrived: 'Arrived',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
}

export const STATUS_COLORS: Record<FlightStatus, string> = {
  scheduled: 'bg-gray-500/10 text-gray-400',
  boarding: 'bg-yellow-500/10 text-yellow-400',
  departed: 'bg-blue-500/10 text-blue-400',
  arrived: 'bg-green-500/10 text-green-400',
  delayed: 'bg-orange-500/10 text-orange-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

export type Airport = {
  code: string
  city: string
  country: string
  name: string
}

export const AIRPORTS: Record<string, Airport> = {
  DEL: { code: 'DEL', city: 'New Delhi', country: 'India', name: 'Indira Gandhi International Airport' },
  BOM: { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  BLR: { code: 'BLR', city: 'Bangalore', country: 'India', name: 'Kempegowda International Airport' },
  MAA: { code: 'MAA', city: 'Chennai', country: 'India', name: 'Chennai International Airport' },
  HYD: { code: 'HYD', city: 'Hyderabad', country: 'India', name: 'Rajiv Gandhi International Airport' },
  CCU: { code: 'CCU', city: 'Kolkata', country: 'India', name: 'Netaji Subhas Chandra Bose International Airport' },
  COK: { code: 'COK', city: 'Kochi', country: 'India', name: 'Cochin International Airport' },
  AMD: { code: 'AMD', city: 'Ahmedabad', country: 'India', name: 'Sardar Vallabhbhai Patel International Airport' },
  GOI: { code: 'GOI', city: 'Goa', country: 'India', name: 'Goa International Airport' },
  JAI: { code: 'JAI', city: 'Jaipur', country: 'India', name: 'Jaipur International Airport' },
  DXB: { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
  SIN: { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
  LHR: { code: 'LHR', city: 'London', country: 'UK', name: 'Heathrow Airport' },
  JFK: { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy International Airport' },
  BKK: { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
  KUL: { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport' },
  HKG: { code: 'HKG', city: 'Hong Kong', country: 'China', name: 'Hong Kong International Airport' },
  NRT: { code: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Narita International Airport' },
  SYD: { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith Airport' },
  CDG: { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
}

/* ✅ Helpers */

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs}h ${mins}m`
}

export function formatPrice(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function generateBookingRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
