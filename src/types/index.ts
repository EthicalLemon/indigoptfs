export type UserRole = 'admin' | 'staff' | 'host' | 'user'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export type FlightStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled'

export interface Flight {
  id: string
  flight_number: string
  departure_city: string
  departure_code: string
  arrival_city: string
  arrival_code: string
  departure_time: string
  arrival_time: string
  duration_minutes: number
  aircraft_type: string
  aircraft_id: string
  status: FlightStatus
  host_id: string
  host?: Profile
  price_economy: number
  price_business: number
  price_first: number
  seats_economy: number
  seats_business: number
  seats_first: number
  seats_economy_booked: number
  seats_business_booked: number
  seats_first_booked: number
  created_by: string
  created_at: string
  updated_at: string
  gate: string | null
  terminal: string | null
  notes: string | null
}

export type SeatClass = 'economy' | 'business' | 'first'

export interface Booking {
  id: string
  booking_ref: string
  user_id: string
  flight_id: string
  flight?: Flight
  seat_class: SeatClass
  passengers: Passenger[]
  total_price: number
  status: 'confirmed' | 'cancelled' | 'pending'
  created_at: string
  user?: Profile
}

export interface Passenger {
  first_name: string
  last_name: string
  email: string
  phone: string
  passport_number?: string
  date_of_birth?: string
}

export interface Aircraft {
  id: string
  name: string
  type: string
  manufacturer: string
  seats_economy: number
  seats_business: number
  seats_first: number
  range_km: number
  speed_kmh: number
  image_url: string
  description: string
}

export interface Route {
  from_city: string
  from_code: string
  to_city: string
  to_code: string
  frequency: string
  duration_minutes: number
}
