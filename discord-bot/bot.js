require('dotenv').config()
const {
  Client, GatewayIntentBits, REST, Routes,
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, AttachmentBuilder
} = require('discord.js')
const { createClient } = require('@supabase/supabase-js')
const { createCanvas } = require('canvas')

// ─── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Discord client ────────────────────────────────────────────────────────────
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] })

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_EMOJI = {
  scheduled: '🕐', boarding: '🟡', departed: '🟢',
  arrived: '✅', delayed: '🟠', cancelled: '🔴',
}
const STATUS_COLOR = {
  scheduled: 0x6272f5, boarding: 0xf59e0b, departed: 0x22c55e,
  arrived: 0x10b981, delayed: 0xf97316, cancelled: 0xef4444,
}

function formatDuration(min) { return `${Math.floor(min / 60)}h ${min % 60}m` }
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatPrice(n) { return `₹${Number(n).toLocaleString('en-IN')}` }

// ─── Draw boarding pass image ──────────────────────────────────────────────────
function generateBoardingPass(booking, flight, passenger) {
  const W = 900, H = 340
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0a0d24'
  ctx.beginPath()
  ctx.moveTo(18, 0); ctx.lineTo(W - 18, 0)
  ctx.quadraticCurveTo(W, 0, W, 18)
  ctx.lineTo(W, H - 18)
  ctx.quadraticCurveTo(W, H, W - 18, H)
  ctx.lineTo(18, H)
  ctx.quadraticCurveTo(0, H, 0, H - 18)
  ctx.lineTo(0, 18)
  ctx.quadraticCurveTo(0, 0, 18, 0)
  ctx.closePath()
  ctx.fill()

  // Left accent strip
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#6366f1')
  grad.addColorStop(1, '#1d2fb5')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 8, H)

  // Dashed tear line
  ctx.setLineDash([6, 5])
  ctx.strokeStyle = '#1e2245'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(620, 20)
  ctx.lineTo(620, H - 20)
  ctx.stroke()
  ctx.setLineDash([])

  // Airline name
  ctx.fillStyle = '#818cf8'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('INDIGO AIRLINES', 30, 38)

  // Boarding pass label
  ctx.fillStyle = '#3a3d5c'
  ctx.font = '11px sans-serif'
  ctx.fillText('BOARDING PASS', 30, 56)

  // Big airport codes
  ctx.fillStyle = '#f0f1ff'
  ctx.font = 'bold 64px sans-serif'
  ctx.fillText(flight.departure_code, 30, 145)
  ctx.fillStyle = '#818cf8'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText('→', 162, 135)
  ctx.fillStyle = '#f0f1ff'
  ctx.font = 'bold 64px sans-serif'
  ctx.fillText(flight.arrival_code, 210, 145)

  // City names
  ctx.fillStyle = '#5a5d7a'
  ctx.font = '12px sans-serif'
  ctx.fillText(flight.departure_city.toUpperCase(), 30, 162)
  ctx.fillText(flight.arrival_city.toUpperCase(), 210, 162)

  // Detail grid
  const fields = [
    { label: 'PASSENGER',  value: `${passenger.first_name} ${passenger.last_name}`.toUpperCase(), x: 30,  y: 210 },
    { label: 'FLIGHT',     value: flight.flight_number,                                            x: 200, y: 210 },
    { label: 'CLASS',      value: booking.seat_class.toUpperCase(),                                x: 370, y: 210 },
    { label: 'DATE',       value: formatDate(flight.departure_time),                               x: 30,  y: 250 },
    { label: 'DEPARTS',    value: formatTime(flight.departure_time),                               x: 200, y: 250 },
    { label: 'ARRIVES',    value: formatTime(flight.arrival_time),                                 x: 370, y: 250 },
    { label: 'GATE',       value: flight.gate     || 'TBA',                                        x: 30,  y: 290 },
    { label: 'TERMINAL',   value: flight.terminal || 'TBA',                                        x: 200, y: 290 },
    { label: 'DURATION',   value: formatDuration(flight.duration_minutes),                         x: 370, y: 290 },
  ]
  fields.forEach(({ label, value, x, y }) => {
    ctx.fillStyle = '#5a5d7a'
    ctx.font = '10px sans-serif'
    ctx.fillText(label, x, y - 14)
    ctx.fillStyle = '#f0f1ff'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText(value, x, y)
  })

  // Right panel
  ctx.fillStyle = '#5a5d7a'
  ctx.font = '10px sans-serif'
  ctx.fillText('BOOKING REF', 645, 60)
  ctx.fillStyle = '#818cf8'
  ctx.font = 'bold 22px monospace'
  ctx.fillText(booking.booking_ref, 645, 88)

  ctx.fillStyle = '#5a5d7a'
  ctx.font = '10px sans-serif'
  ctx.fillText('AIRCRAFT', 645, 120)
  ctx.fillStyle = '#f0f1ff'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText(flight.aircraft_type, 645, 138)

  ctx.fillStyle = '#5a5d7a'
  ctx.font = '10px sans-serif'
  ctx.fillText('TOTAL PAID', 645, 168)
  ctx.fillStyle = '#f0f1ff'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText(formatPrice(booking.total_price), 645, 186)

  // Barcode area
  ctx.fillStyle = '#1e2245'
  ctx.fillRect(635, 220, 240, 90)
  const seed = booking.booking_ref.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  for (let i = 0; i < 60; i++) {
    const w = ((seed * (i + 7) * 13) % 3) + 1
    ctx.fillStyle = i % 4 === 0 ? '#818cf8' : '#f0f1ff'
    ctx.fillRect(645 + i * 3.8, 228, w, 74)
  }
  ctx.fillStyle = '#3a3d5c'
  ctx.font = '9px monospace'
  ctx.fillText(booking.booking_ref + ' • INDIGO AIRLINES', 645, 328)

  // Status badge
  const badgeColors = { scheduled: '#6366f1', boarding: '#f59e0b', departed: '#22c55e', delayed: '#f97316', arrived: '#10b981', cancelled: '#ef4444' }
  ctx.fillStyle = badgeColors[flight.status] || '#6366f1'
  ctx.beginPath()
  ctx.rect(30, H - 45, 130, 28)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(`${STATUS_EMOJI[flight.status]} ${flight.status.toUpperCase()}`, 42, H - 26)

  return canvas.toBuffer('image/png')
}

// ─── Send boarding pass DM ─────────────────────────────────────────────────────
async function sendBoardingPassDM(discordUserId, booking, flight, passenger) {
  const imageBuffer = generateBoardingPass(booking, flight, passenger)
  const attachment  = new AttachmentBuilder(imageBuffer, { name: `boarding-pass-${booking.booking_ref}.png` })

  const embed = new EmbedBuilder()
    .setColor(0x6272f5)
    .setTitle(`🎫  Your Boarding Pass — ${booking.booking_ref}`)
    .setDescription(
      `Your booking for **${flight.departure_city} → ${flight.arrival_city}** is confirmed!\n` +
      `Here is your boarding pass. Save it for the gate.`
    )
    .addFields(
      { name: '✈️ Flight',     value: flight.flight_number,                                              inline: true },
      { name: '📅 Date',       value: formatDate(flight.departure_time),                                  inline: true },
      { name: '🕐 Departs',    value: formatTime(flight.departure_time),                                  inline: true },
      { name: '💺 Class',      value: booking.seat_class.charAt(0).toUpperCase() + booking.seat_class.slice(1), inline: true },
      { name: '🚪 Gate',       value: flight.gate     || 'TBA',                                           inline: true },
      { name: '🏢 Terminal',   value: flight.terminal || 'TBA',                                           inline: true },
      { name: '💰 Total Paid', value: formatPrice(booking.total_price),                                   inline: true },
    )
    .setImage(`attachment://boarding-pass-${booking.booking_ref}.png`)
    .setFooter({ text: 'IndiGo Airlines — Have a great flight! ✈️' })
    .setTimestamp()

  const user = await client.users.fetch(discordUserId)
  await user.send({ embeds: [embed], files: [attachment] })
}

// ─── Notify host with updated passenger list ───────────────────────────────────
async function notifyHost(flight) {
  if (!flight.host_id) return

  const { data: hostProfile } = await supabase
    .from('profiles')
    .select('discord_id, full_name')
    .eq('id', flight.host_id)
    .single()

  if (!hostProfile?.discord_id) return

  // Get all confirmed bookings for this flight
  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_ref, seat_class, total_price, passengers, created_at, user:profiles!user_id(full_name, email)')
    .eq('flight_id', flight.id)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: true })

  if (!bookings?.length) return

  const revenue = bookings.reduce((s, b) => s + b.total_price, 0)

  const embed = new EmbedBuilder()
    .setColor(0x6272f5)
    .setTitle(`📋  Passenger Update — ${flight.flight_number}`)
    .setDescription(
      `**${flight.departure_city} (${flight.departure_code}) → ${flight.arrival_city} (${flight.arrival_code})**\n` +
      `${formatDate(flight.departure_time)} · Departs ${formatTime(flight.departure_time)}\n\n` +
      `A new booking just came in. Here's your full passenger list:`
    )
    .addFields(
      { name: '🎫 Total Booked',  value: String(bookings.length), inline: true },
      { name: '💰 Total Revenue', value: formatPrice(revenue),    inline: true },
      { name: '✈️ Aircraft',      value: flight.aircraft_type,    inline: true },
    )
    .setFooter({ text: `IndiGo Airlines — Flight ${flight.flight_number}` })
    .setTimestamp()

  // Add passenger rows (max 20 to stay under Discord's 25-field limit)
  const passengerFields = bookings.slice(0, 20).map((b, i) => {
    const p    = b.passengers?.[0] || {}
    const name = (p.first_name && p.last_name)
      ? `${p.first_name} ${p.last_name}`
      : b.user?.full_name || 'Unknown'
    const cls  = b.seat_class === 'first' ? '👑 First' : b.seat_class === 'business' ? '💼 Business' : '💺 Economy'
    return {
      name:   `${i + 1}. ${name}`,
      value:  `${cls} · \`${b.booking_ref}\`\n${b.user?.email || p.email || '—'} · ${formatPrice(b.total_price)}`,
      inline: false,
    }
  })

  embed.addFields(passengerFields)
  if (bookings.length > 20) {
    embed.addFields({ name: `…and ${bookings.length - 20} more`, value: 'Check the staff portal for the full list.', inline: false })
  }

  try {
    const hostUser = await client.users.fetch(hostProfile.discord_id)
    await hostUser.send({ embeds: [embed] })
    console.log(`✅ Host ${hostProfile.discord_id} notified for flight ${flight.flight_number}`)
  } catch (err) {
    console.error(`Could not DM host ${hostProfile.discord_id}:`, err.message)
  }
}

// ─── Slash commands ────────────────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('flights')
    .setDescription('View all available IndiGo Airlines flights')
    .addStringOption(o => o.setName('from').setDescription('Filter by departure code (e.g. DEL)').setRequired(false))
    .addStringOption(o => o.setName('to').setDescription('Filter by arrival code (e.g. DXB)').setRequired(false)),

  new SlashCommandBuilder()
    .setName('flightstatus')
    .setDescription('Get real-time status of a specific flight')
    .addStringOption(o => o.setName('flight_number').setDescription('Flight number (e.g. IGO101)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('linkaccount')
    .setDescription('Link your Discord to your IndiGo Airlines website account')
    .addStringOption(o => o.setName('email').setDescription('Email you signed up with on the website').setRequired(true)),

  new SlashCommandBuilder()
    .setName('myboardingpass')
    .setDescription('Retrieve a boarding pass for one of your bookings')
    .addStringOption(o => o.setName('booking_ref').setDescription('Your booking reference (e.g. IGO3F9A2B)').setRequired(true)),
]

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)
  try {
    console.log('🔄 Registering slash commands...')
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands.map(c => c.toJSON()) })
    console.log('✅ Slash commands registered!')
  } catch (err) {
    console.error('❌ Failed to register commands:', err)
  }
}

// ─── Flight embed ──────────────────────────────────────────────────────────────
function buildFlightEmbed(flight) {
  return new EmbedBuilder()
    .setColor(STATUS_COLOR[flight.status] || 0x6272f5)
    .setTitle(`✈️  ${flight.flight_number}  ${STATUS_EMOJI[flight.status] || ''}  ${flight.status.toUpperCase()}`)
    .setDescription(`**${flight.departure_city} (${flight.departure_code})** → **${flight.arrival_city} (${flight.arrival_code})**`)
    .addFields(
      { name: '🛫 Departure', value: `${formatDate(flight.departure_time)}\n${formatTime(flight.departure_time)}`,  inline: true },
      { name: '🛬 Arrival',   value: `${formatDate(flight.arrival_time)}\n${formatTime(flight.arrival_time)}`,      inline: true },
      { name: '⏱️ Duration',  value: formatDuration(flight.duration_minutes),                                       inline: true },
      { name: '✈️ Aircraft',  value: flight.aircraft_type,                                                          inline: true },
      { name: '🚪 Gate',      value: flight.gate     || 'TBA',                                                      inline: true },
      { name: '🏢 Terminal',  value: flight.terminal || 'TBA',                                                      inline: true },
      { name: '💺 Economy',   value: `${formatPrice(flight.price_economy)}\n${flight.seats_economy  - flight.seats_economy_booked} left`,  inline: true },
      { name: '💼 Business',  value: `${formatPrice(flight.price_business)}\n${flight.seats_business - flight.seats_business_booked} left`, inline: true },
      { name: '👑 First',     value: `${formatPrice(flight.price_first)}\n${flight.seats_first    - flight.seats_first_booked} left`,       inline: true },
    )
    .setFooter({ text: `Host: ${flight.host?.full_name || 'IndiGo Airlines'}` })
    .setTimestamp()
}

// ─── Interaction handler ───────────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  const { commandName } = interaction

  // /flights
  if (commandName === 'flights') {
    await interaction.deferReply()
    const fromFilter = interaction.options.getString('from')?.toUpperCase().trim()
    const toFilter   = interaction.options.getString('to')?.toUpperCase().trim()

    let query = supabase
      .from('flights')
      .select('*, host:profiles!host_id(full_name)')
      .not('status', 'in', '("cancelled","arrived")')
      .order('departure_time', { ascending: true })

    if (fromFilter) query = query.eq('departure_code', fromFilter)
    if (toFilter)   query = query.eq('arrival_code',   toFilter)

    const { data: flights, error } = await query
    if (error) return interaction.editReply({ content: `❌ Database error: ${error.message}` })

    if (!flights?.length) {
      const note = (fromFilter || toFilter)
        ? ` matching **${[fromFilter, toFilter].filter(Boolean).join(' → ')}**`
        : ''
      return interaction.editReply({ content: `✈️ No available flights found${note}.` })
    }

    const bookBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Book at IndiGo Airlines')
        .setURL(process.env.APP_URL || 'https://your-site.com/flights')
        .setStyle(ButtonStyle.Link)
    )
    const embeds = flights.map(buildFlightEmbed)
    await interaction.editReply({
      content: `**✈️ IndiGo Airlines — ${flights.length} flight(s) available**`,
      embeds: embeds.slice(0, 5),
      components: [bookBtn],
    })
    for (let i = 5; i < embeds.length; i += 5) {
      await interaction.followUp({ embeds: embeds.slice(i, i + 5) })
    }
  }

  // /flightstatus
  else if (commandName === 'flightstatus') {
    await interaction.deferReply()
    const fn = interaction.options.getString('flight_number').toUpperCase().trim()
    const { data: flight, error } = await supabase
      .from('flights')
      .select('*, host:profiles!host_id(full_name)')
      .ilike('flight_number', `%${fn}%`)
      .order('departure_time', { ascending: false })
      .limit(1)
      .single()

    if (error || !flight) return interaction.editReply({ content: `❌ Flight **${fn}** not found.` })
    await interaction.editReply({ embeds: [buildFlightEmbed(flight)] })
  }

  // /linkaccount
  else if (commandName === 'linkaccount') {
    await interaction.deferReply({ ephemeral: true })
    const email     = interaction.options.getString('email').toLowerCase().trim()
    const discordId = interaction.user.id

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, discord_id')
      .eq('email', email)
      .single()

    if (error || !profile) {
      return interaction.editReply({
        content: `❌ No account found with **${email}**. Sign up on the website first.`
      })
    }
    if (profile.discord_id && profile.discord_id !== discordId) {
      return interaction.editReply({ content: `⚠️ That email is already linked to a different Discord account.` })
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ discord_id: discordId })
      .eq('id', profile.id)

    if (updateErr) return interaction.editReply({ content: `❌ Failed: ${updateErr.message}` })

    await interaction.editReply({
      content:
        `✅ **Account linked!** Welcome, **${profile.full_name || email}**!\n\n` +
        `From now on:\n` +
        `• Booking confirmations → boarding pass sent here as a DM\n` +
        `• Use **/myboardingpass** to retrieve any past boarding pass`
    })
  }

  // /myboardingpass
  else if (commandName === 'myboardingpass') {
    await interaction.deferReply({ ephemeral: true })
    const ref       = interaction.options.getString('booking_ref').toUpperCase().trim()
    const discordId = interaction.user.id

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('discord_id', discordId)
      .single()

    if (!profile) {
      return interaction.editReply({
        content: `❌ Your Discord isn't linked yet. Use **/linkaccount** first.`
      })
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, flight:flights!flight_id(*)')
      .eq('booking_ref', ref)
      .eq('user_id', profile.id)
      .single()

    if (error || !booking) {
      return interaction.editReply({ content: `❌ Booking **${ref}** not found or doesn't belong to your account.` })
    }
    if (booking.status === 'cancelled') {
      return interaction.editReply({ content: `❌ Booking **${ref}** was cancelled.` })
    }

    const flight    = booking.flight
    const passenger = booking.passengers?.[0] || {
      first_name: profile.full_name?.split(' ')[0] || 'Passenger',
      last_name:  profile.full_name?.split(' ').slice(1).join(' ') || '',
    }

    try {
      await sendBoardingPassDM(discordId, booking, flight, passenger)
      await interaction.editReply({ content: `✅ Boarding pass for **${ref}** sent to your DMs!` })
    } catch (err) {
      console.error('Boarding pass error:', err)
      await interaction.editReply({ content: `❌ Could not generate boarding pass: ${err.message}` })
    }
  }
})

// ─── Realtime: fire on every new confirmed booking ─────────────────────────────
async function startRealtimeListener() {
  supabase
    .channel('new-bookings')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, async payload => {
      const raw = payload.new
      if (raw.status !== 'confirmed') return

      // Fetch full data
      const { data: booking } = await supabase
        .from('bookings')
        .select('*, flight:flights!flight_id(*), user:profiles!user_id(discord_id, full_name, email)')
        .eq('id', raw.id)
        .single()

      if (!booking) return

      const flight    = booking.flight
      const passenger = booking.passengers?.[0] || {
        first_name: booking.user?.full_name?.split(' ')[0] || 'Passenger',
        last_name:  booking.user?.full_name?.split(' ').slice(1).join(' ') || '',
      }

      // 1. Boarding pass DM → the person who booked
      if (booking.user?.discord_id) {
        try {
          await sendBoardingPassDM(booking.user.discord_id, booking, flight, passenger)
          console.log(`✅ Boarding pass sent → ${booking.user.discord_id} (${booking.booking_ref})`)
        } catch (err) {
          console.error(`Could not DM boarding pass:`, err.message)
        }
      } else {
        console.log(`ℹ️  Booking ${booking.booking_ref}: user has no linked Discord, skipping boarding pass DM`)
      }

      // 2. Passenger list DM → flight host
      await notifyHost(flight)
    })
    .subscribe()

  console.log('📡 Realtime listener active — watching for new bookings...')
}

// ─── Ready ─────────────────────────────────────────────────────────────────────
client.once('ready', async () => {
  console.log(`\n✅ IndiGo Airlines Bot online as ${client.user.tag}`)
  console.log(`📡 Supabase: ${process.env.SUPABASE_URL}`)
  client.user.setPresence({
    activities: [{ name: '✈️ /flights to see all flights', type: 3 }],
    status: 'online',
  })
  await startRealtimeListener()
})

// ─── Start ─────────────────────────────────────────────────────────────────────
registerCommands().then(() => client.login(process.env.DISCORD_TOKEN))
