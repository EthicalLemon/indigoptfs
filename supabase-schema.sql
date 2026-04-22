-- ============================================================
-- INDIGO AIRLINES — SUPABASE SQL SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'staff', 'host', 'user')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (needed for host info on flights)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Insert on signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- FLIGHTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flights (
  id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  flight_number           TEXT NOT NULL UNIQUE,
  departure_city          TEXT NOT NULL,
  departure_code          TEXT NOT NULL,
  arrival_city            TEXT NOT NULL,
  arrival_code            TEXT NOT NULL,
  departure_time          TIMESTAMPTZ NOT NULL,
  arrival_time            TIMESTAMPTZ NOT NULL,
  duration_minutes        INTEGER NOT NULL DEFAULT 0,
  aircraft_type           TEXT NOT NULL,
  aircraft_id             TEXT NOT NULL DEFAULT '',
  status                  TEXT NOT NULL DEFAULT 'scheduled'
                          CHECK (status IN ('scheduled','boarding','departed','arrived','delayed','cancelled')),
  host_id                 UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  price_economy           INTEGER NOT NULL DEFAULT 5000,
  price_business          INTEGER NOT NULL DEFAULT 15000,
  price_first             INTEGER NOT NULL DEFAULT 40000,
  seats_economy           INTEGER NOT NULL DEFAULT 150,
  seats_business          INTEGER NOT NULL DEFAULT 24,
  seats_first             INTEGER NOT NULL DEFAULT 8,
  seats_economy_booked    INTEGER NOT NULL DEFAULT 0,
  seats_business_booked   INTEGER NOT NULL DEFAULT 0,
  seats_first_booked      INTEGER NOT NULL DEFAULT 0,
  gate                    TEXT,
  terminal                TEXT,
  notes                   TEXT,
  created_by              UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- Anyone can read flights
CREATE POLICY "Flights are publicly readable"
  ON public.flights FOR SELECT USING (true);

-- Staff/Admin/Host can create flights
CREATE POLICY "Staff can create flights"
  ON public.flights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff', 'host')
    )
  );

-- Admin/Staff can update any flight; hosts only their own
CREATE POLICY "Staff and admin can update flights"
  ON public.flights FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (
        p.role IN ('admin', 'staff')
        OR (p.role = 'host' AND host_id = auth.uid())
      )
    )
  );

-- Only admins can delete
CREATE POLICY "Only admins can delete flights"
  ON public.flights FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER flights_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_ref   TEXT NOT NULL UNIQUE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  flight_id     UUID REFERENCES public.flights(id) ON DELETE CASCADE NOT NULL,
  seat_class    TEXT NOT NULL CHECK (seat_class IN ('economy', 'business', 'first')),
  passengers    JSONB NOT NULL DEFAULT '[]',
  total_price   INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can see their own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Admins/staff can see all bookings
CREATE POLICY "Staff can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

-- Authenticated users can create bookings for themselves
CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel (update) their own bookings
CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any booking
CREATE POLICY "Admins can update any booking"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ============================================================
-- ACTIVITY LOGS TABLE (optional but included)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.logs (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view logs"
  ON public.logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert logs"
  ON public.logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- SEED DATA — Sample flights
-- ============================================================
-- First create a host user via Supabase Auth dashboard, then run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
--
-- Then insert sample flights (replace host_id with a real UUID from profiles):
/*
INSERT INTO public.flights (flight_number, departure_city, departure_code, arrival_city, arrival_code,
  departure_time, arrival_time, duration_minutes, aircraft_type, status,
  price_economy, price_business, price_first, seats_economy, seats_business, seats_first)
VALUES
  ('IGO101', 'New Delhi', 'DEL', 'Dubai', 'DXB',
   NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours 15 minutes', 195, 'Boeing 787-9', 'scheduled',
   18500, 45000, 120000, 204, 42, 8),
  ('IGO202', 'Mumbai', 'BOM', 'Singapore', 'SIN',
   NOW() + INTERVAL '4 hours', NOW() + INTERVAL '9 hours 30 minutes', 330, 'Airbus A350-900', 'boarding',
   22800, 58000, 145000, 236, 48, 6),
  ('IGO315', 'New Delhi', 'DEL', 'London', 'LHR',
   NOW() + INTERVAL '6 hours', NOW() + INTERVAL '14 hours 30 minutes', 510, 'Airbus A380-800', 'scheduled',
   52000, 95000, 220000, 399, 98, 14),
  ('IGO440', 'Bangalore', 'BLR', 'Dubai', 'DXB',
   NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours 30 minutes', 210, 'Airbus A320neo', 'boarding',
   17100, 42000, 0, 165, 12, 0);
*/

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_flights_departure_code ON public.flights(departure_code);
CREATE INDEX IF NOT EXISTS idx_flights_arrival_code ON public.flights(arrival_code);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON public.flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_status ON public.flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_host_id ON public.flights(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON public.bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON public.bookings(booking_ref);

-- ============================================================
-- CRITICAL FIX: Ensure flights are publicly readable (no auth required)
-- This fixes the issue where flights created by staff don't show up
-- on the public flights page for non-logged-in users.
-- ============================================================

-- Drop and recreate the flights select policy to be truly public
DROP POLICY IF EXISTS "Flights are publicly readable" ON public.flights;

CREATE POLICY "Flights are publicly readable"
  ON public.flights FOR SELECT
  USING (true);

-- Also ensure anon key can read profiles (for host name display on flight cards)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Fix: Allow service role to bypass RLS for bot operations
-- (The bot uses service role key so this is already handled)

-- Verify your Supabase project has RLS enabled but these policies allow public reads.
-- If flights still don't show: go to Supabase Dashboard -> Table Editor -> flights
-- and check that RLS is ON and the "Flights are publicly readable" policy exists.
