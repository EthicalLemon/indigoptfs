# ✈️ IndiGo Airlines — Full-Stack Airline System

A production-ready airline website with real-time flight management, booking system, staff portal, and Discord bot — all powered by Next.js 14 and Supabase.

---

## 📁 Project Structure

```
indigo-airlines/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home page
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   ├── flights/page.tsx          # Flight search & listing
│   │   ├── booking/[flightId]/       # Booking flow
│   │   ├── fleet/page.tsx            # Aircraft fleet
│   │   ├── routes-network/page.tsx   # Route network
│   │   ├── meals/page.tsx            # Dining & services
│   │   ├── status/page.tsx           # Flight status tracker
│   │   ├── manage/page.tsx           # User booking management
│   │   ├── staff/page.tsx            # Staff portal (role-gated)
│   │   ├── auth/login/page.tsx
│   │   ├── auth/signup/page.tsx
│   │   └── api/
│   │       ├── flights/route.ts
│   │       ├── flights/[id]/route.ts
│   │       └── bookings/route.ts
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── layout/Footer.tsx
│   │   ├── home/HeroSection.tsx
│   │   ├── home/SearchSection.tsx
│   │   ├── home/StatsSection.tsx     (+ Destinations, Fleet, Services, Testimonials)
│   │   ├── flights/FlightCard.tsx
│   │   ├── flights/FlightSearchBar.tsx
│   │   ├── staff/StaffDashboardStats.tsx
│   │   ├── staff/StaffFlightManager.tsx
│   │   ├── staff/StaffUserManager.tsx
│   │   └── ui/
│   │       ├── DevToolsGuard.tsx
│   │       └── ThemeProvider.tsx
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   ├── supabase/middleware.ts
│   │   └── utils.ts
│   ├── types/index.ts
│   └── middleware.ts
├── discord-bot/
│   ├── bot.js
│   ├── package.json
│   └── .env.example
├── supabase-schema.sql
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase-schema.sql`
3. Go to **Authentication → Providers** — enable Email/Password
4. Copy your Project URL and API keys from **Settings → API**

### 2. Website Setup

```bash
# Clone / download the project
cd indigo-airlines

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Create Your Admin User

1. Sign up at `http://localhost:3000/auth/signup`
2. In Supabase → SQL Editor, run:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Visit `http://localhost:3000/staff` — you now have full admin access

### 4. Seed Sample Flights

In Supabase SQL Editor, uncomment and run the seed section at the bottom of `supabase-schema.sql`, or create flights via the Staff Portal.

### 5. Discord Bot Setup

```bash
cd discord-bot
npm install
cp .env.example .env

# Edit .env with:
# DISCORD_TOKEN=     (from Discord Developer Portal → Bot → Token)
# DISCORD_CLIENT_ID= (from Discord Developer Portal → General Information)
# SUPABASE_URL=      (same as website)
# SUPABASE_SERVICE_ROLE_KEY= (same as website)
# APP_URL=           (your website URL)

node bot.js
```

**Discord Setup:**
1. Go to [discord.dev](https://discord.com/developers/applications)
2. Create New Application → Add Bot
3. Enable **Server Members Intent** and **Message Content Intent**
4. Invite bot to your server with `applications.commands` and `bot` scopes
5. Create Discord roles named exactly: `IndiGo Admin`, `IndiGo Staff`, `IndiGo Host`
6. Assign appropriate roles to your staff members

---

## 🔐 Role Hierarchy

| Role       | Create Flights | Edit Flights       | Delete Flights | Manage Users |
|------------|---------------|---------------------|----------------|-------------|
| **Admin**  | ✅             | ✅ Any flight        | ✅              | ✅            |
| **Staff**  | ✅             | ✅ Any flight        | ❌              | ❌            |
| **Host**   | ✅             | ✅ Own flights only  | ❌              | ❌            |
| **User**   | ❌             | ❌                   | ❌              | ❌            |

---

## 🤖 Discord Bot Commands

| Command | Description | Permission |
|---------|-------------|-----------|
| `/flights` | List all flights with optional filters | Everyone |
| `/flightstatus <number>` | Get real-time status of a flight | Everyone |
| `/indigostats` | View live system statistics | Everyone |
| `/createflight` | Create a new flight | IndiGo Staff/Host/Admin role |
| `/editflight` | Edit flight details/status | IndiGo Staff/Host/Admin role |
| `/deleteflight` | Permanently delete a flight | IndiGo Admin role only |

---

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, search, destinations, fleet preview |
| `/flights` | Search & browse all flights |
| `/flights?from=DEL&to=DXB&date=2025-01-15` | Pre-filtered flight search |
| `/booking/[flightId]` | Multi-step booking flow |
| `/fleet` | Aircraft fleet showcase |
| `/routes-network` | Route map and table |
| `/meals` | Dining menus and services |
| `/status` | Real-time flight tracker |
| `/manage` | User booking management (auth required) |
| `/staff` | Staff portal (role required) |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account |

---

## 🛡️ Security Features

- **Row Level Security (RLS)** enforced at Supabase DB level
- **Role-based access control** on both frontend and API routes  
- **Server-side auth validation** on all API endpoints
- **Middleware auth guards** for protected pages
- **Input validation** on all forms
- **Anti-DevTools detection** (console spam + overlay)

---

## 🧰 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Bot:** Node.js + discord.js v14
- **Fonts:** Cormorant Garamond (display) + DM Sans (body)
- **Icons:** Lucide React

---

## 🔧 Environment Variables

### Website (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Discord Bot (`.env`)
```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
APP_URL=
```
