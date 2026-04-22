'use client'
import { motion } from 'framer-motion'

const MEAL_CLASSES = [
  {
    class: 'First Class',
    icon: '👑',
    color: '#d97706',
    meals: [
      { name: 'Lobster Thermidor', desc: 'Fresh Atlantic lobster in rich cream sauce, served with asparagus and truffle risotto', course: 'Main' },
      { name: 'Seared Wagyu Tenderloin', desc: 'A5 grade Wagyu with roasted garlic jus, seasonal vegetables and pomme purée', course: 'Main' },
      { name: 'Dal Makhani Royale', desc: 'Traditional black lentils slow-cooked overnight with cream and spices, served with garlic naan', course: 'Main' },
      { name: 'Chocolate Fondant', desc: 'Warm dark chocolate fondant with vanilla bean ice cream and raspberry coulis', course: 'Dessert' },
    ]
  },
  {
    class: 'Business Class',
    icon: '💼',
    color: '#6366f1',
    meals: [
      { name: 'Grilled Sea Bass', desc: 'Mediterranean-style sea bass with lemon caper butter, roasted cherry tomatoes and quinoa', course: 'Main' },
      { name: 'Chicken Tikka Masala', desc: 'Classic Indian preparation with butter naan, saffron basmati rice and raita', course: 'Main' },
      { name: 'Mushroom Wellington', desc: 'Portobello mushroom and spinach in golden puff pastry with red wine reduction', course: 'Main' },
      { name: 'Mango Pannacotta', desc: 'Light Italian dessert with alphonso mango compote and shortbread', course: 'Dessert' },
    ]
  },
  {
    class: 'Economy Class',
    icon: '✈️',
    color: '#22c55e',
    meals: [
      { name: 'Butter Chicken with Rice', desc: 'Tender chicken in tomato-cream sauce with steamed basmati rice and pickle', course: 'Main' },
      { name: 'Pasta Arrabbiata', desc: 'Penne pasta in spicy tomato sauce with parmesan and garlic bread', course: 'Main' },
      { name: 'Paneer Makhani', desc: 'Cottage cheese cubes in rich makhani sauce, served with jeera rice and dal', course: 'Main' },
      { name: 'Fruit Tart', desc: 'Seasonal fresh fruits on vanilla custard in buttery pastry shell', course: 'Dessert' },
    ]
  }
]

const SERVICES = [
  { icon: '📶', title: 'In-Flight Wi-Fi', desc: 'High-speed Ku-band satellite connectivity on all long-haul flights. Stream, browse, and stay connected at 35,000 feet.', detail: 'From ₹499 per session' },
  { icon: '🎬', title: 'IndiGo Entertainment', desc: 'Over 5,000 hours of content including movies, TV shows, music, podcasts and games. 15" HD touchscreens in all classes.', detail: 'Complimentary on all flights' },
  { icon: '💺', title: 'Premium Seating', desc: 'Business class features lie-flat beds extending to 198cm. Economy features ergonomic seats with adjustable headrests and 32" pitch.', detail: 'Available on wide-body aircraft' },
  { icon: '🧳', title: 'Baggage Allowance', desc: 'Economy: 30kg checked + 7kg cabin. Business: 40kg checked + 10kg cabin. First: 50kg checked + 12kg cabin.', detail: 'Excess baggage available' },
  { icon: '🥂', title: 'Premium Bar', desc: 'Business and First class passengers enjoy a curated selection of champagnes, wines, spirits and cocktails, served on demand.', detail: 'First & Business Class' },
  { icon: '🛁', title: 'Onboard Spa', desc: 'Exclusive to A380 First Class — freshen up with our onboard shower spa, complete with premium Bulgari amenity kits.', detail: 'A380 First Class only' },
  { icon: '🍼', title: 'Family Services', desc: 'Dedicated children\'s menus, bassinets for infants, activity kits, and priority boarding for families with young children.', detail: 'All classes, all routes' },
  { icon: '♿', title: 'Accessibility', desc: 'Wheelchair assistance, special seating arrangements, and dedicated crew training to assist passengers with special needs.', detail: 'All airports and flights' },
]

export default function MealsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Dining & Services</p>
          <h1 className="font-display font-bold text-5xl md:text-6xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Taste the <span className="italic font-light">Skies</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            From Michelin-inspired menus to regional favorites — every meal is crafted with passion at 35,000 feet.
          </p>
        </motion.div>

        {/* Meal classes */}
        <div className="space-y-10 mb-20">
          {MEAL_CLASSES.map((cls, ci) => (
            <motion.div
              key={cls.class}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{cls.icon}</span>
                <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{cls.class}</h2>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cls.meals.map((meal, mi) => (
                  <motion.div
                    key={meal.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: mi * 0.06 }}
                    className="indigo-card p-5"
                  >
                    <div className="text-xs font-semibold tracking-widest uppercase mb-2 px-2 py-0.5 rounded-full w-fit"
                      style={{ background: `${cls.color}20`, color: cls.color }}>
                      {meal.course}
                    </div>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{meal.name}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{meal.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dietary section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="indigo-card p-8 mb-20 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(251,191,36,0.05))' }}
        >
          <h2 className="font-display font-bold text-3xl mb-4" style={{ color: 'var(--text-primary)' }}>Dietary Preferences</h2>
          <p className="text-sm mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            We cater to all dietary needs. Request your special meal at the time of booking or up to 24 hours before departure.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Vegetarian', 'Vegan', 'Jain', 'Gluten-Free', 'Halal', 'Kosher', 'Diabetic', 'Low-Calorie', 'Low-Fat', 'Low-Sodium', 'Hindu Meal', 'Child Meal'].map(diet => (
              <span key={diet} className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                {diet}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Services section */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Onboard</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
            Premium <span className="italic font-light">Services</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="indigo-card p-5"
            >
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{service.title}</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{service.desc}</p>
              <div className="text-xs font-medium" style={{ color: 'var(--indigo-accent)' }}>{service.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
