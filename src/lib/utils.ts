import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, differenceInMinutes } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(dateStr: string) {
  return format(parseISO(dateStr), 'HH:mm')
}

export function formatDate(dateStr: string) {
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price)
}

export function generateBookingRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let ref = 'IGO'
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

export const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  boarding: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  departed: 'bg-green-500/20 text-green-300 border-green-500/30',
  arrived: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  delayed: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
}

export const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  boarding: 'Now Boarding',
  departed: 'Departed',
  arrived: 'Arrived',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
}

export const AIRPORTS: Record<string, { city: string; country: string }> = {
  DEL: { city: 'New Delhi', country: 'India' },
  BOM: { city: 'Mumbai', country: 'India' },
  BLR: { city: 'Bangalore', country: 'India' },
  MAA: { city: 'Chennai', country: 'India' },
  HYD: { city: 'Hyderabad', country: 'India' },
  CCU: { city: 'Kolkata', country: 'India' },
  COK: { city: 'Kochi', country: 'India' },
  AMD: { city: 'Ahmedabad', country: 'India' },
  GOI: { city: 'Goa', country: 'India' },
  JAI: { city: 'Jaipur', country: 'India' },
  DXB: { city: 'Dubai', country: 'UAE' },
  SIN: { city: 'Singapore', country: 'Singapore' },
  LHR: { city: 'London', country: 'UK' },
  JFK: { city: 'New York', country: 'USA' },
  BKK: { city: 'Bangkok', country: 'Thailand' },
  KUL: { city: 'Kuala Lumpur', country: 'Malaysia' },
  HKG: { city: 'Hong Kong', country: 'China' },
  NRT: { city: 'Tokyo', country: 'Japan' },
  SYD: { city: 'Sydney', country: 'Australia' },
  CDG: { city: 'Paris', country: 'France' },
}
