require('dotenv').config()
const {
  Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder,
  EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  AttachmentBuilder,
} = require('discord.js')
const { createClient } = require('@supabase/supabase-js')
const sharp = require('sharp')

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Discord client ───────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_ROLE_ID = '1418993707926945864'

const STAFF_ROLES = ['IndiGo Admin', 'IndiGo Staff', 'IndiGo Host']
const HOST_ROLES  = ['IndiGo Admin', 'IndiGo Staff', 'IndiGo Host']
const ADMIN_ROLES = ['IndiGo Admin']

const STATUS_EMOJI = {
  scheduled: '🕐',
  boarding:  '🟡',
  departed:  '🟢',
  arrived:   '✅',
  delayed:   '🟠',
  cancelled: '🔴',
}

const STATUS_COLOR = {
  scheduled: 0x6272f5,
  boarding:  0xf59e0b,
  departed:  0x22c55e,
  arrived:   0x10b981,
  delayed:   0xf97316,
  cancelled: 0xef4444,
}

const AIRPORTS = {
  DEL: 'New Delhi',    BOM: 'Mumbai',        BLR: 'Bangalore',
  MAA: 'Chennai',      HYD: 'Hyderabad',     CCU: 'Kolkata',
  DXB: 'Dubai',        SIN: 'Singapore',     LHR: 'London',
  JFK: 'New York',     BKK: 'Bangkok',       NRT: 'Tokyo',
  CDG: 'Paris',        SYD: 'Sydney',        KUL: 'Kuala Lumpur',
  HKG: 'Hong Kong',    COK: 'Kochi',         GOI: 'Goa',
  JAI: 'Jaipur',       AMD: 'Ahmedabad',
}

const TRIVIA_QUESTIONS = [
  { q: 'What does IATA stand for?',                                           a: 'international air transport association', hint: 'An airline trade association founded in 1945.'   },
  { q: 'What is the busiest airport in the world by passenger traffic?',      a: 'hartsfield jackson',                      hint: 'Located in Atlanta, USA.'                       },
  { q: 'What is the typical cruising altitude of commercial aircraft (feet)?',a: '35000',                                   hint: 'Between 30,000 and 40,000 feet.'                 },
  { q: 'What colour is the flight data recorder ("Black Box")?',              a: 'orange',                                  hint: 'Brightly coloured for easy location after crash.' },
  { q: 'What is the fear of flying called?',                                  a: 'aviophobia',                              hint: 'Also called aerophobia.'                         },
  { q: 'Which aircraft is nicknamed the "Jumbo Jet"?',                        a: '747',                                     hint: 'Boeing, first flew 1969.'                        },
  { q: 'What does MAYDAY mean in aviation?',                                  a: 'help me',                                 hint: 'From the French "m\'aidez".'                     },
  { q: 'How many runways does London Heathrow Airport have?',                 a: '2',                                       hint: 'One of the busiest airports despite having few.'  },
  { q: 'What does "ETA" stand for in aviation?',                              a: 'estimated time of arrival',               hint: 'The predicted landing time.'                     },
  { q: 'Which country invented the jet engine?',                              a: 'united kingdom',                          hint: 'Frank Whittle patented it in 1930.'              },
]

const pendingTrivia = new Map()

// ─── Format helpers ───────────────────────────────────────────────────────────
function formatDuration(min) {
  return `${Math.floor(min / 60)}h ${min % 60}m`
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatPrice(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`
}
function getTier(balance) {
  if (balance >= 50000) return '👑 Platinum'
  if (balance >= 10000) return '🥇 Gold'
  if (balance >=  2000) return '🥈 Silver'
  return '🥉 Bronze'
}

// ─── Role check — supports both name and ID ───────────────────────────────────
function hasAnyRole(member, roleNames) {
  return member.roles.cache.some(r =>
    roleNames.includes(r.name) || r.id === ADMIN_ROLE_ID
  )
}
function isAdmin(member) {
  return member.roles.cache.some(r =>
    ADMIN_ROLES.includes(r.name) || r.id === ADMIN_ROLE_ID
  )
}

// ─── Wallet helpers ───────────────────────────────────────────────────────────
async function getWalletByDiscord(discordId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('discord_id', discordId)
    .maybeSingle()

  if (!profile) return null

  let { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle()

  if (!wallet) {
    const { data: newWallet } = await supabase
      .from('wallets')
      .insert({ user_id: profile.id, balance: 0 })
      .select()
      .single()
    wallet = newWallet
  }

  return { profile, wallet }
}

async function addCoins(userId, amount, type, description) {
  const { data: current } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()

  const newBalance = (current?.balance || 0) + amount

  await supabase
    .from('wallets')
    .upsert({ user_id: userId, balance: newBalance }, { onConflict: 'user_id' })

  await supabase.from('wallet_transactions').insert({
    user_id: userId,
    amount,
    type,
    description,
  })

  return newBalance
}

async function hasClaimedToday(userId) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('wallet_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'earn')
    .ilike('description', '%Daily reward%')
    .gte('created_at', startOfDay.toISOString())
    .limit(1)

  return data && data.length > 0
}

// ─── Boarding Pass Image Generator ───────────────────────────────────────────
async function generateBoardingPass(booking, flight, passenger) {
  const dep    = flight.departure_code  || '---'
  const arr    = flight.arrival_code    || '---'
  const depCity= flight.departure_city  || dep
  const arrCity= flight.arrival_city    || arr
  const depTime= formatTime(flight.departure_time)
  const arrTime= formatTime(flight.arrival_time)
  const depDate= formatDate(flight.departure_time)
  const flightNum   = flight.flight_number  || 'IGO000'
  const aircraft    = flight.aircraft_type  || 'N/A'
  const gate        = flight.gate           || 'TBA'
  const terminal    = flight.terminal       || 'TBA'
  const duration    = formatDuration(flight.duration_minutes || 0)
  const passengerName = `${passenger?.first_name || ''} ${passenger?.last_name || ''}`.trim() || 'Passenger'
  const seatClass   = (booking.seat_class || 'economy').toUpperCase()
  const bookingRef  = booking.booking_ref  || 'IND-XXXXXX'
  const totalPrice  = formatPrice(booking.total_price || 0)

  const classColors = {
    ECONOMY:  { bg: '#6366f1', light: '#818cf8' },
    BUSINESS: { bg: '#f59e0b', light: '#fbbf24' },
    FIRST:    { bg: '#10b981', light: '#34d399' },
  }
  const cc = classColors[seatClass] || classColors.ECONOMY

  // SVG boarding pass — 900×380px
  const svg = `
<svg width="900" height="380" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:#0a0a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f0f2e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   style="stop-color:${cc.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${cc.light};stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="900" height="380" fill="url(#bgGrad)" rx="20"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="6" height="380" fill="url(#accentGrad)" rx="3"/>

  <!-- Top stripe -->
  <rect x="0" y="0" width="900" height="70" fill="rgba(255,255,255,0.03)" rx="20"/>

  <!-- Airline name & logo area -->
  <text x="36" y="30" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="4" font-weight="600">INDIGO AIRLINES</text>
  <text x="36" y="55" font-size="22" fill="white" font-weight="700" letter-spacing="1">BOARDING PASS</text>

  <!-- Class badge -->
  <rect x="760" y="18" width="115" height="34" fill="url(#accentGrad)" rx="8"/>
  <text x="817" y="40" font-size="13" fill="white" font-weight="700" text-anchor="middle" letter-spacing="2">${seatClass}</text>

  <!-- Divider -->
  <line x1="36" y1="82" x2="864" y2="82" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- ROUTE SECTION -->
  <!-- Departure code -->
  <text x="80" y="145" font-size="62" fill="white" font-weight="800" text-anchor="middle" filter="url(#glow)">${dep}</text>
  <text x="80" y="168" font-size="12" fill="rgba(255,255,255,0.5)" text-anchor="middle">${depCity}</text>

  <!-- Arrow / plane icon -->
  <text x="450" y="148" font-size="28" text-anchor="middle" fill="${cc.bg}">✈</text>
  <line x1="140" y1="135" x2="400" y2="135" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="6,4"/>
  <line x1="500" y1="135" x2="760" y2="135" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="450" y="172" font-size="11" fill="rgba(255,255,255,0.35)" text-anchor="middle">${duration} · DIRECT</text>

  <!-- Arrival code -->
  <text x="820" y="145" font-size="62" fill="white" font-weight="800" text-anchor="middle" filter="url(#glow)">${arr}</text>
  <text x="820" y="168" font-size="12" fill="rgba(255,255,255,0.5)" text-anchor="middle">${arrCity}</text>

  <!-- Horizontal dashed separator -->
  <line x1="36" y1="195" x2="864" y2="195" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="8,6"/>

  <!-- Detail fields row 1 -->
  <!-- Passenger -->
  <text x="50" y="228" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">PASSENGER</text>
  <text x="50" y="250" font-size="15" fill="white" font-weight="600">${passengerName}</text>

  <!-- Flight -->
  <text x="230" y="228" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">FLIGHT</text>
  <text x="230" y="250" font-size="15" fill="white" font-weight="600">${flightNum}</text>

  <!-- Date -->
  <text x="380" y="228" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">DATE</text>
  <text x="380" y="250" font-size="15" fill="white" font-weight="600">${depDate}</text>

  <!-- Departs -->
  <text x="530" y="228" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">DEPARTS</text>
  <text x="530" y="250" font-size="15" fill="${cc.light}" font-weight="700">${depTime}</text>

  <!-- Arrives -->
  <text x="670" y="228" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">ARRIVES</text>
  <text x="670" y="250" font-size="15" fill="${cc.light}" font-weight="700">${arrTime}</text>

  <!-- Detail fields row 2 -->
  <!-- Gate -->
  <text x="50" y="292" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">GATE</text>
  <text x="50" y="314" font-size="15" fill="white" font-weight="600">${gate}</text>

  <!-- Terminal -->
  <text x="230" y="292" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">TERMINAL</text>
  <text x="230" y="314" font-size="15" fill="white" font-weight="600">${terminal}</text>

  <!-- Aircraft -->
  <text x="380" y="292" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">AIRCRAFT</text>
  <text x="380" y="314" font-size="13" fill="white" font-weight="600">${aircraft}</text>

  <!-- Amount -->
  <text x="530" y="292" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">AMOUNT PAID</text>
  <text x="530" y="314" font-size="15" fill="${cc.light}" font-weight="700">${totalPrice}</text>

  <!-- Booking Ref -->
  <text x="670" y="292" font-size="10" fill="rgba(255,255,255,0.35)" letter-spacing="2">BOOKING REF</text>
  <text x="670" y="314" font-size="14" fill="white" font-weight="700" letter-spacing="1">${bookingRef}</text>

  <!-- Bottom bar -->
  <rect x="0" y="345" width="900" height="35" fill="rgba(255,255,255,0.025)" rx="0"/>
  <text x="450" y="367" font-size="10" fill="rgba(255,255,255,0.25)" text-anchor="middle" letter-spacing="3">
    INDIGO AIRLINES · HAVE A PLEASANT JOURNEY · THANK YOU FOR FLYING WITH US
  </text>

  <!-- Bottom accent line -->
  <rect x="0" y="374" width="900" height="6" fill="url(#accentGrad)" rx="3"/>
</svg>`

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
  return pngBuffer
}

// ─── Send Booking DM ──────────────────────────────────────────────────────────
async function sendBookingDM(booking) {
  try {
    // Fetch full booking with flight + passenger
    const { data: fullBooking } = await supabase
      .from('bookings')
      .select(`
        *,
        flight:flights (
          flight_number, departure_city, departure_code,
          arrival_city, arrival_code, departure_time, arrival_time,
          aircraft_type, gate, terminal, duration_minutes, status
        ),
        profile:profiles ( discord_id, full_name, email )
      `)
      .eq('id', booking.id)
      .single()

    if (!fullBooking) return
    const flight    = fullBooking.flight   || {}
    const profile   = fullBooking.profile  || {}
    const passenger = fullBooking.passengers?.[0] || {}

    if (!profile.discord_id) return // User hasn't linked Discord

    // Generate boarding pass image
    const imageBuffer = await generateBoardingPass(fullBooking, flight, passenger)
    const attachment  = new AttachmentBuilder(imageBuffer, { name: 'boarding-pass.png' })

    // Fetch the Discord user and DM them
    const discordUser = await client.users.fetch(profile.discord_id).catch(() => null)
    if (!discordUser) return

    const classLabel = { economy: 'Economy', business: 'Business', first: 'First Class' }

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle('✅  Booking Confirmed — IndiGo Airlines')
      .setDescription(
        `Your flight from **${flight.departure_city || flight.departure_code}** to **${flight.arrival_city || flight.arrival_code}** has been booked successfully!\n\nYour boarding pass is attached below.`
      )
      .addFields(
        { name: '🔖 Booking Ref',   value: `\`${fullBooking.booking_ref}\``,                         inline: true  },
        { name: '✈️ Flight',         value: flight.flight_number || 'N/A',                            inline: true  },
        { name: '💺 Class',          value: classLabel[fullBooking.seat_class] || fullBooking.seat_class, inline: true },
        { name: '🛫 Departure',      value: `**${formatTime(flight.departure_time)}** · ${formatDate(flight.departure_time)}`, inline: true },
        { name: '🛬 Arrival',        value: `**${formatTime(flight.arrival_time)}** · ${formatDate(flight.arrival_time)}`,    inline: true },
        { name: '💰 Amount Paid',    value: formatPrice(fullBooking.total_price),                     inline: true  },
        { name: '🚪 Gate',           value: flight.gate     || 'TBA',                                 inline: true  },
        { name: '🏢 Terminal',       value: flight.terminal || 'TBA',                                 inline: true  },
        { name: '🌐 View Booking',   value: `[Open on website](${process.env.APP_URL || 'http://localhost:3000'}/bookings/${fullBooking.id})`, inline: true },
      )
      .setImage('attachment://boarding-pass.png')
      .setFooter({ text: 'IndiGo Airlines · Safe travels!' })
      .setTimestamp()

    await discordUser.send({ embeds: [embed], files: [attachment] })
    console.log(`📨  Boarding pass DM sent to Discord user ${profile.discord_id} for booking ${fullBooking.booking_ref}`)

  } catch (err) {
    console.error('❌  Failed to send booking DM:', err)
  }
}

// ─── Supabase Realtime — listen for new bookings ──────────────────────────────
let lastCheck = new Date().toISOString()

function startBookingListener() {
  console.log('🎫 Polling for new bookings every 5s...')

  setInterval(async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'confirmed')
        .gt('created_at', lastCheck)
        .order('created_at', { ascending: true })

      if (error) return console.error('Polling error:', error)

      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          console.log('🎫 New booking detected:', booking.booking_ref)
          await sendBookingDM(booking)
        }

        lastCheck = new Date().toISOString()
      }
    } catch (err) {
      console.error('Polling failed:', err)
    }
  }, 5000)
}

// ─── Flight embed builder ─────────────────────────────────────────────────────
function buildFlightEmbed(flight) {
  const status = flight.status || 'scheduled'
  const embed = new EmbedBuilder()
    .setColor(STATUS_COLOR[status] || 0x6272f5)
    .setTitle(`✈️  ${flight.flight_number}  ${STATUS_EMOJI[status] || ''}  ${status.toUpperCase()}`)
    .setDescription(
      `**${flight.departure_city || flight.departure_code} (${flight.departure_code})** → **${flight.arrival_city || flight.arrival_code} (${flight.arrival_code})**`
    )
    .addFields(
      { name: '🛫 Departure', value: `${formatDate(flight.departure_time)}\n**${formatTime(flight.departure_time)}**`, inline: true },
      { name: '🛬 Arrival',   value: `${formatDate(flight.arrival_time)}\n**${formatTime(flight.arrival_time)}**`,     inline: true },
      { name: '⏱️ Duration',  value: formatDuration(flight.duration_minutes || 0),                                      inline: true },
      { name: '✈️ Aircraft',  value: flight.aircraft_type || 'N/A',                                                    inline: true },
      { name: '🚪 Gate',      value: flight.gate     || 'TBA',                                                          inline: true },
      { name: '🏢 Terminal',  value: flight.terminal || 'TBA',                                                          inline: true },
      { name: '💺 Economy',   value: `${formatPrice(flight.price_economy || 0)}`,   inline: true },
      { name: '💼 Business',  value: `${formatPrice(flight.price_business || 0)}`,  inline: true },
      { name: '👑 First',     value: `${formatPrice(flight.price_first || 0)}`,     inline: true },
    )
    .setFooter({ text: `Host: ${flight.host?.full_name || 'IndiGo Airlines'} • ID: ${(flight.id || '').slice(0, 8)}` })
    .setTimestamp()

  if (flight.notes) {
    embed.addFields({ name: '📢 Passenger Notice', value: flight.notes })
  }
  return embed
}

// ─── Slash command definitions ────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('flights')
    .setDescription('View IndiGo Airlines flights')
    .addStringOption(o => o.setName('status').setDescription('Filter by status').setRequired(false)
      .addChoices(
        { name: '🕐 Scheduled', value: 'scheduled' },
        { name: '🟡 Boarding',  value: 'boarding'  },
        { name: '🟢 Departed',  value: 'departed'  },
        { name: '✅ Arrived',   value: 'arrived'   },
        { name: '🟠 Delayed',   value: 'delayed'   },
        { name: '🔴 Cancelled', value: 'cancelled' },
      ))
    .addStringOption(o => o.setName('from').setDescription('Filter by departure code (e.g. DEL)').setRequired(false))
    .addStringOption(o => o.setName('to').setDescription('Filter by arrival code (e.g. DXB)').setRequired(false)),

  new SlashCommandBuilder()
    .setName('flightstatus')
    .setDescription('Get real-time status of a specific flight')
    .addStringOption(o => o.setName('flight_number').setDescription('Flight number e.g. IGO101').setRequired(true)),

  new SlashCommandBuilder()
    .setName('createflight')
    .setDescription('[STAFF] Create a new flight')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('flight_number').setDescription('Flight number e.g. IGO101').setRequired(true))
    .addStringOption(o => o.setName('from').setDescription('Departure airport code').setRequired(true))
    .addStringOption(o => o.setName('to').setDescription('Arrival airport code').setRequired(true))
    .addStringOption(o => o.setName('departure_time').setDescription('Departure datetime YYYY-MM-DD HH:MM').setRequired(true))
    .addStringOption(o => o.setName('arrival_time').setDescription('Arrival datetime YYYY-MM-DD HH:MM').setRequired(true))
    .addStringOption(o => o.setName('aircraft').setDescription('Aircraft type').setRequired(true)
      .addChoices(
        { name: 'Boeing 787-9',       value: 'Boeing 787-9'       },
        { name: 'Airbus A350-900',    value: 'Airbus A350-900'    },
        { name: 'Airbus A320neo',     value: 'Airbus A320neo'     },
        { name: 'Boeing 737 MAX 8',   value: 'Boeing 737 MAX 8'   },
        { name: 'Airbus A380-800',    value: 'Airbus A380-800'    },
      ))
    .addIntegerOption(o => o.setName('price_economy').setDescription('Economy price INR').setRequired(true))
    .addIntegerOption(o => o.setName('price_business').setDescription('Business price INR').setRequired(false))
    .addIntegerOption(o => o.setName('price_first').setDescription('First class price INR').setRequired(false))
    .addStringOption(o => o.setName('gate').setDescription('Gate number').setRequired(false))
    .addStringOption(o => o.setName('terminal').setDescription('Terminal').setRequired(false)),

  new SlashCommandBuilder()
    .setName('editflight')
    .setDescription('[STAFF] Edit an existing flight')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('flight_number').setDescription('Flight number to edit').setRequired(true))
    .addStringOption(o => o.setName('status').setDescription('New status').setRequired(false)
      .addChoices(
        { name: '🕐 Scheduled', value: 'scheduled' },
        { name: '🟡 Boarding',  value: 'boarding'  },
        { name: '🟢 Departed',  value: 'departed'  },
        { name: '✅ Arrived',   value: 'arrived'   },
        { name: '🟠 Delayed',   value: 'delayed'   },
        { name: '🔴 Cancelled', value: 'cancelled' },
      ))
    .addStringOption(o => o.setName('gate').setDescription('New gate').setRequired(false))
    .addStringOption(o => o.setName('terminal').setDescription('New terminal').setRequired(false))
    .addStringOption(o => o.setName('notes').setDescription('Passenger announcement').setRequired(false))
    .addStringOption(o => o.setName('departure_time').setDescription('New departure YYYY-MM-DD HH:MM').setRequired(false))
    .addStringOption(o => o.setName('arrival_time').setDescription('New arrival YYYY-MM-DD HH:MM').setRequired(false)),

  new SlashCommandBuilder()
    .setName('deleteflight')
    .setDescription('[ADMIN] Permanently delete a flight')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName('flight_number').setDescription('Flight number to delete').setRequired(true)),

  new SlashCommandBuilder()
    .setName('indigostats')
    .setDescription('View IndiGo Airlines live statistics'),

  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your IndiGo Coins wallet balance'),

  new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily 100 IndiGo Coins reward'),

  new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Answer a trivia question to earn 50 IndiGo Coins'),

  new SlashCommandBuilder()
    .setName('givecoin')
    .setDescription('[ADMIN] Grant IndiGo Coins to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('user').setDescription('Discord user to grant coins to').setRequired(true))
    .addIntegerOption(o => o.setName('amount').setDescription('Amount of coins').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for grant').setRequired(false)),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View top IndiGo Coins earners in the server'),

  // ── NEW: manual boarding pass resend ──
  new SlashCommandBuilder()
    .setName('resendboardingpass')
    .setDescription('[ADMIN] Resend boarding pass DM for a booking')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName('booking_ref').setDescription('Booking reference e.g. IND-ABC123').setRequired(true)),
]

// ─── Register commands ────────────────────────────────────────────────────────
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)
  try {
    console.log('🔄  Registering slash commands...')
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands.map(c => c.toJSON()) }
    )
    console.log('✅  Slash commands registered!')
  } catch (err) {
    console.error('❌  Failed to register commands:', err)
  }
}

// ─── Trivia answer listener ───────────────────────────────────────────────────
client.on('messageCreate', async message => {
  if (message.author.bot) return

  const pending = pendingTrivia.get(message.author.id)
  if (!pending) return
  if (Date.now() > pending.expiresAt) {
    pendingTrivia.delete(message.author.id)
    return
  }

  pendingTrivia.delete(message.author.id)
  const userAnswer = message.content.toLowerCase().trim()
  const correct    = pending.answer.toLowerCase()

  if (userAnswer.includes(correct) || correct.split(' ').some(w => w.length > 3 && userAnswer.includes(w))) {
    const newBalance = await addCoins(pending.profileId, 50, 'earn', '🏆 Trivia correct answer via Discord')
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x22c55e)
          .setTitle('✅  Correct Answer!')
          .setDescription(`You earned **+₹50** IndiGo Coins!`)
          .addFields(
            { name: '💰 Coins Earned', value: '+₹50',                                    inline: true },
            { name: '📊 New Balance',  value: `₹${newBalance.toLocaleString('en-IN')}`,  inline: true },
          )
          .setFooter({ text: 'Use /daily for another 100 coins tomorrow!' })
      ]
    })
  } else {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xef4444)
          .setTitle('❌  Wrong Answer')
          .setDescription(`The correct answer was: **${pending.answer}**`)
          .setFooter({ text: 'Try /trivia again!' })
      ]
    })
  }
})

// ─── Main interaction handler ─────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  const { commandName } = interaction

  // ── /flights ──────────────────────────────────────────────────────────────
  if (commandName === 'flights') {
    await interaction.deferReply()

    const statusFilter = interaction.options.getString('status')
    const fromFilter   = interaction.options.getString('from')?.toUpperCase()
    const toFilter     = interaction.options.getString('to')?.toUpperCase()

    let q = supabase
      .from('flights')
      .select('*, host:profiles(full_name)')
      .order('departure_time', { ascending: true })

    if (statusFilter) q = q.eq('status', statusFilter)
    if (fromFilter)   q = q.eq('departure_code', fromFilter)
    if (toFilter)     q = q.eq('arrival_code', toFilter)

    const { data: flights, error } = await q.limit(8)

    if (error || !flights?.length) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xef4444)
            .setTitle('No Flights Found')
            .setDescription('No flights match your search. Try different filters.')
        ]
      })
    }

    const embeds = flights.map(f => buildFlightEmbed(f))
    await interaction.editReply({
      content: `**✈️ Found ${flights.length} flight${flights.length !== 1 ? 's' : ''}:**`,
      embeds: embeds.slice(0, 10),
    })
  }

  // ── /flightstatus ─────────────────────────────────────────────────────────
  else if (commandName === 'flightstatus') {
    await interaction.deferReply()

    const fn = interaction.options.getString('flight_number').toUpperCase()
    const { data: flight } = await supabase
      .from('flights')
      .select('*, host:profiles(full_name)')
      .ilike('flight_number', fn)
      .single()

    if (!flight) {
      return interaction.editReply({ content: `❌  Flight **${fn}** not found.` })
    }

    await interaction.editReply({ embeds: [buildFlightEmbed(flight)] })
  }

  // ── /createflight ─────────────────────────────────────────────────────────
  else if (commandName === 'createflight') {
    if (!hasAnyRole(interaction.member, HOST_ROLES)) {
      return interaction.reply({ content: '🚫  You need a staff role to create flights.', ephemeral: true })
    }
    await interaction.deferReply({ ephemeral: true })

    const fn      = interaction.options.getString('flight_number').toUpperCase()
    const from    = interaction.options.getString('from').toUpperCase()
    const to      = interaction.options.getString('to').toUpperCase()
    const depRaw  = interaction.options.getString('departure_time')
    const arrRaw  = interaction.options.getString('arrival_time')
    const aircraft= interaction.options.getString('aircraft')
    const priceEco= interaction.options.getInteger('price_economy')
    const priceBiz= interaction.options.getInteger('price_business') || Math.round(priceEco * 2.5)
    const priceFirst= interaction.options.getInteger('price_first')  || Math.round(priceEco * 4)
    const gate    = interaction.options.getString('gate')    || null
    const terminal= interaction.options.getString('terminal')|| null

    const dep = new Date(depRaw)
    const arr = new Date(arrRaw)

    if (isNaN(dep.getTime()) || isNaN(arr.getTime())) {
      return interaction.editReply({ content: '❌  Invalid date format. Use YYYY-MM-DD HH:MM' })
    }

    const durationMinutes = Math.round((arr - dep) / 60000)

    const { data: flight, error } = await supabase
      .from('flights')
      .insert({
        flight_number:    fn,
        departure_code:   from,
        departure_city:   AIRPORTS[from] || from,
        arrival_code:     to,
        arrival_city:     AIRPORTS[to]   || to,
        departure_time:   dep.toISOString(),
        arrival_time:     arr.toISOString(),
        duration_minutes: durationMinutes,
        aircraft_type:    aircraft,
        price_economy:    priceEco,
        price_business:   priceBiz,
        price_first:      priceFirst,
        gate,
        terminal,
        status:           'scheduled',
        seats_economy:    150,
        seats_business:   30,
        seats_first:      10,
        seats_economy_booked:  0,
        seats_business_booked: 0,
        seats_first_booked:    0,
      })
      .select('*, host:profiles(full_name)')
      .single()

    if (error) {
      return interaction.editReply({ content: `❌  Failed to create flight: \`${error.message}\`` })
    }

    await interaction.editReply({
      content: `✅  **Flight ${fn} created!**`,
      embeds: [buildFlightEmbed(flight)],
    })

    if (interaction.channel) {
      interaction.channel.send({
        content: '📢  **New flight added to the IndiGo network!**',
        embeds: [buildFlightEmbed(flight)],
      }).catch(() => {})
    }
  }

  // ── /editflight ───────────────────────────────────────────────────────────
  else if (commandName === 'editflight') {
    if (!hasAnyRole(interaction.member, HOST_ROLES)) {
      return interaction.reply({ content: '🚫  You need a staff role to edit flights.', ephemeral: true })
    }
    await interaction.deferReply({ ephemeral: true })

    const fn       = interaction.options.getString('flight_number').toUpperCase()
    const status   = interaction.options.getString('status')
    const gate     = interaction.options.getString('gate')
    const terminal = interaction.options.getString('terminal')
    const notes    = interaction.options.getString('notes')
    const depRaw   = interaction.options.getString('departure_time')
    const arrRaw   = interaction.options.getString('arrival_time')

    const { data: existing } = await supabase
      .from('flights').select('*').ilike('flight_number', fn).single()

    if (!existing) {
      return interaction.editReply({ content: `❌  Flight **${fn}** not found.` })
    }

    const updates = {}
    if (status)   updates.status   = status
    if (gate)     updates.gate     = gate
    if (terminal) updates.terminal = terminal
    if (notes)    updates.notes    = notes

    if (depRaw) {
      const d = new Date(depRaw)
      if (!isNaN(d.getTime())) updates.departure_time = d.toISOString()
    }
    if (arrRaw) {
      const a = new Date(arrRaw)
      if (!isNaN(a.getTime())) updates.arrival_time = a.toISOString()
    }
    if (updates.departure_time && updates.arrival_time) {
      updates.duration_minutes = Math.round(
        (new Date(updates.arrival_time) - new Date(updates.departure_time)) / 60000
      )
    }

    if (Object.keys(updates).length === 0) {
      return interaction.editReply({ content: '⚠️  No changes provided.' })
    }

    const { data: updated, error } = await supabase
      .from('flights')
      .update(updates)
      .eq('id', existing.id)
      .select('*, host:profiles(full_name)')
      .single()

    if (error) {
      return interaction.editReply({ content: `❌  Failed to update: \`${error.message}\`` })
    }

    await interaction.editReply({
      content: `✅  **Flight ${fn} updated!**`,
      embeds: [buildFlightEmbed(updated)],
    })
  }

  // ── /deleteflight ─────────────────────────────────────────────────────────
  else if (commandName === 'deleteflight') {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ content: '🚫  Only **IndiGo Admin** members can delete flights.', ephemeral: true })
    }
    await interaction.deferReply({ ephemeral: true })

    const fn = interaction.options.getString('flight_number').toUpperCase()
    const { data: existing } = await supabase
      .from('flights').select('*').ilike('flight_number', fn).single()

    if (!existing) {
      return interaction.editReply({ content: `❌  Flight **${fn}** not found.` })
    }

    const { error } = await supabase.from('flights').delete().eq('id', existing.id)

    if (error) {
      return interaction.editReply({ content: `❌  Failed to delete: \`${error.message}\`` })
    }

    await interaction.editReply({
      content: `🗑️  Flight **${fn}** (${existing.departure_code} → ${existing.arrival_code}) has been permanently deleted.`,
    })
  }

  // ── /indigostats ──────────────────────────────────────────────────────────
  else if (commandName === 'indigostats') {
    await interaction.deferReply()

    const [
      { count: totalFlights  },
      { count: activeFlights },
      { count: totalBookings },
      { count: totalUsers    },
      { data:  revenue       },
    ] = await Promise.all([
      supabase.from('flights').select('*', { count: 'exact', head: true }),
      supabase.from('flights').select('*', { count: 'exact', head: true }).in('status', ['scheduled', 'boarding', 'departed']),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_price').eq('status', 'confirmed'),
    ])

    const totalRev = (revenue || []).reduce((s, b) => s + (b.total_price || 0), 0)

    const embed = new EmbedBuilder()
      .setColor(0x6272f5)
      .setTitle('✈️  IndiGo Airlines — Live Statistics')
      .setDescription('Real-time operational data')
      .addFields(
        { name: '✈️ Total Flights',      value: String(totalFlights  || 0), inline: true },
        { name: '🟢 Active Flights',     value: String(activeFlights || 0), inline: true },
        { name: '🎫 Confirmed Bookings', value: String(totalBookings || 0), inline: true },
        { name: '👥 Registered Users',   value: String(totalUsers    || 0), inline: true },
        { name: '💰 Total Revenue',      value: `₹${(totalRev / 100000).toFixed(1)}L`, inline: true },
        { name: '🌐 Airport Network',    value: `${Object.keys(AIRPORTS).length} airports`, inline: true },
      )
      .setFooter({ text: 'IndiGo Airlines Operations Centre' })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  }

  // ── /balance ──────────────────────────────────────────────────────────────
  else if (commandName === 'balance') {
    await interaction.deferReply({ ephemeral: true })

    const result = await getWalletByDiscord(interaction.user.id)

    if (!result) {
      return interaction.editReply({
        content: [
          '❌  **No linked account found.**',
          '',
          'Your Discord is not linked to an IndiGo Airlines account.',
          `Visit **${process.env.APP_URL || 'http://localhost:3000'}/profile** to link your Discord account.`,
        ].join('\n'),
      })
    }

    const { profile, wallet } = result
    const bal = wallet.balance || 0

    const embed = new EmbedBuilder()
      .setColor(0x6366f1)
      .setTitle(`💰  IndiGo Wallet — ${profile.full_name || profile.email}`)
      .addFields(
        { name: '💰 Balance',     value: `**₹${bal.toLocaleString('en-IN')}**`,                                              inline: true },
        { name: '🏆 Tier',        value: getTier(bal),                                                                        inline: true },
        { name: '🌐 View Online', value: `[Open Wallet](${process.env.APP_URL || 'http://localhost:3000'}/wallet)`,           inline: true },
      )
      .setFooter({ text: 'Earn more via /daily and /trivia • Spend at checkout on the website' })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  }

  // ── /daily ────────────────────────────────────────────────────────────────
  else if (commandName === 'daily') {
    await interaction.deferReply({ ephemeral: true })

    const result = await getWalletByDiscord(interaction.user.id)

    if (!result) {
      return interaction.editReply({
        content: `❌  No linked IndiGo account found. Link your account at ${process.env.APP_URL || 'http://localhost:3000'}/profile first.`,
      })
    }

    const { profile, wallet } = result
    const alreadyClaimed = await hasClaimedToday(profile.id)

    if (alreadyClaimed) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const hoursLeft = Math.ceil((tomorrow - Date.now()) / 3600000)

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xf97316)
            .setTitle('⏰  Already Claimed Today')
            .setDescription(`Come back in **${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}** for your next reward!`)
            .addFields({ name: '💰 Current Balance', value: `₹${(wallet.balance || 0).toLocaleString('en-IN')}` })
        ]
      })
    }

    const DAILY_AMOUNT = 100
    const newBalance = await addCoins(profile.id, DAILY_AMOUNT, 'earn', '🎮 Daily reward claim via Discord')

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x22c55e)
          .setTitle('🎁  Daily Reward Claimed!')
          .setDescription(`You earned **+₹${DAILY_AMOUNT}** IndiGo Coins!`)
          .addFields(
            { name: '⚡ Coins Earned', value: `+₹${DAILY_AMOUNT}`,                          inline: true },
            { name: '📊 New Balance',  value: `₹${newBalance.toLocaleString('en-IN')}`,     inline: true },
            { name: '🏆 Tier',         value: getTier(newBalance),                           inline: true },
            { name: '⏰ Next Claim',   value: 'Tomorrow at midnight',                        inline: false },
          )
          .setFooter({ text: 'Tip: Use /trivia to earn an extra 50 coins!' })
          .setTimestamp()
      ]
    })
  }

  // ── /trivia ───────────────────────────────────────────────────────────────
  else if (commandName === 'trivia') {
    const result = await getWalletByDiscord(interaction.user.id)

    if (!result) {
      return interaction.reply({
        content: `❌  No linked IndiGo account found. Link at ${process.env.APP_URL || 'http://localhost:3000'}/profile`,
        ephemeral: true,
      })
    }

    if (pendingTrivia.has(interaction.user.id)) {
      return interaction.reply({ content: '⚠️  You already have a trivia question pending! Answer it first.', ephemeral: true })
    }

    const q = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)]

    pendingTrivia.set(interaction.user.id, {
      profileId: result.profile.id,
      answer:    q.a,
      hint:      q.hint,
      expiresAt: Date.now() + 30000,
    })

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf59e0b)
          .setTitle('✈️  Flight Trivia — Earn 50 Coins!')
          .setDescription(`**${q.q}**`)
          .addFields({ name: '💡 Hint', value: q.hint })
          .setFooter({ text: 'Type your answer in this channel within 30 seconds!' })
      ]
    })

    setTimeout(async () => {
      if (pendingTrivia.has(interaction.user.id)) {
        pendingTrivia.delete(interaction.user.id)
        await interaction.followUp({
          content: `⏰  Time's up! The answer was: **${q.a}**. Try **/trivia** again!`,
          ephemeral: true,
        }).catch(() => {})
      }
    }, 30000)
  }

  // ── /givecoin ─────────────────────────────────────────────────────────────
  else if (commandName === 'givecoin') {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ content: '🚫  Only **IndiGo Admin** can grant coins.', ephemeral: true })
    }
    await interaction.deferReply({ ephemeral: true })

    const targetUser = interaction.options.getUser('user')
    const amount     = interaction.options.getInteger('amount')
    const reason     = interaction.options.getString('reason') || 'Admin grant'

    if (amount <= 0) {
      return interaction.editReply({ content: '❌  Amount must be greater than 0.' })
    }

    const result = await getWalletByDiscord(targetUser.id)
    if (!result) {
      return interaction.editReply({ content: `❌  <@${targetUser.id}> has no linked IndiGo account.` })
    }

    const newBalance = await addCoins(result.profile.id, amount, 'admin_grant', `🛡️ ${reason}`)

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xa78bfa)
          .setTitle('🛡️  Coins Granted')
          .addFields(
            { name: 'Recipient',   value: `<@${targetUser.id}>`,                    inline: true },
            { name: 'Amount',      value: `+₹${amount.toLocaleString('en-IN')}`,    inline: true },
            { name: 'New Balance', value: `₹${newBalance.toLocaleString('en-IN')}`, inline: true },
            { name: 'Reason',      value: reason,                                    inline: false },
          )
          .setFooter({ text: `Granted by ${interaction.user.username}` })
          .setTimestamp()
      ]
    })

    targetUser.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xa78bfa)
          .setTitle('🎁  You received IndiGo Coins!')
          .setDescription(`An admin granted you **+₹${amount.toLocaleString('en-IN')}** IndiGo Coins.`)
          .addFields(
            { name: 'Reason',      value: reason,                                    inline: true },
            { name: 'New Balance', value: `₹${newBalance.toLocaleString('en-IN')}`, inline: true },
          )
          .setFooter({ text: 'Visit the website to use your coins on flights!' })
      ]
    }).catch(() => {})
  }

  // ── /leaderboard ──────────────────────────────────────────────────────────
  else if (commandName === 'leaderboard') {
    await interaction.deferReply()

    const { data: top } = await supabase
      .from('wallets')
      .select('balance, user_id, profiles(full_name, discord_id)')
      .order('balance', { ascending: false })
      .limit(10)

    if (!top || top.length === 0) {
      return interaction.editReply({ content: '📭  No wallet data yet. Be the first to earn coins with **/daily**!' })
    }

    const medals = ['🥇', '🥈', '🥉']
    const rows = top.map((w, i) => {
      const name  = w.profiles?.full_name || 'Unknown Passenger'
      const medal = medals[i] || `**${i + 1}.**`
      const tier  = getTier(w.balance || 0)
      return `${medal}  ${name} — ₹${(w.balance || 0).toLocaleString('en-IN')}  ${tier}`
    }).join('\n')

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf59e0b)
          .setTitle('🏆  IndiGo Coins Leaderboard')
          .setDescription(rows)
          .setFooter({ text: 'Earn coins via /daily, /trivia, and booking flights!' })
          .setTimestamp()
      ]
    })
  }

  // ── /resendboardingpass ───────────────────────────────────────────────────
  else if (commandName === 'resendboardingpass') {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ content: '🚫  Only **IndiGo Admin** can resend boarding passes.', ephemeral: true })
    }
    await interaction.deferReply({ ephemeral: true })

    const ref = interaction.options.getString('booking_ref').toUpperCase()

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .ilike('booking_ref', ref)
      .single()

    if (!booking) {
      return interaction.editReply({ content: `❌  Booking **${ref}** not found.` })
    }

    await sendBookingDM(booking)
    await interaction.editReply({ content: `✅  Boarding pass DM resent for booking **${ref}**.` })
  }
})

// ─── Bot ready ────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`\n✅  IndiGo Airlines Bot online as ${client.user.tag}`)
  console.log(`📡  Supabase: ${process.env.SUPABASE_URL}`)
  console.log(`🌐  Website:  ${process.env.APP_URL || 'http://localhost:3000'}\n`)

  client.user.setPresence({
    activities: [{ name: '✈️ IndiGo Airlines | /flights', type: 3 }],
    status: 'online',
  })

  // Start listening for new bookings
  startBookingListener()
  console.log('🎫  Booking listener active — will DM boarding passes on new bookings')
})

// ─── Error handling ───────────────────────────────────────────────────────────
client.on('error', err => console.error('Discord client error:', err))
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err))

// ─── Start ────────────────────────────────────────────────────────────────────
registerCommands().then(() => client.login(process.env.DISCORD_TOKEN))