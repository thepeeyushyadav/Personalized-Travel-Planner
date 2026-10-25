import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Map, Sparkles, Clock, Shield, Star, ArrowRight,
  Globe, Zap, Users, ChevronDown
} from 'lucide-react';
import './LandingPage.css';

const features = [
  { icon: Sparkles, title: 'AI-Powered Planning', desc: 'Groq-powered AI generates personalized day-by-day itineraries tailored to your style and budget.' },
  { icon: Clock, title: 'Save Hours of Research', desc: 'What takes days of research happens in seconds. Get optimized travel plans instantly.' },
  { icon: Map, title: 'Smart Route Optimization', desc: 'Activities are ordered to minimize travel time and maximize your experience.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your travel plans are protected with enterprise-grade security via Supabase.' },
  { icon: Users, title: 'Group Trip Support', desc: 'Plan for solo travelers, couples, or large groups with shared preferences.' },
  { icon: Zap, title: 'Regenerate Anytime', desc: 'Not happy with the plan? Regenerate specific days or the full itinerary instantly.' },
];

const scenarios = [
  {
    emoji: '🎒',
    title: 'Solo Traveler',
    desc: 'Quick weekend getaway with optimized routes and budget-friendly spots.',
  },
  {
    emoji: '💑',
    title: 'Couples',
    desc: 'Romantic itineraries with scenic spots, intimate restaurants, and curated experiences.',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: 'Group Trips',
    desc: 'Multi-day group trips with coordinated schedules and shared preferences.',
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon"><Map size={20} /></div>
            <span>TripAI</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#scenarios">Use Cases</a>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={14} />
            AI-Powered Travel Planning
          </motion.div>

          <h1 className="hero-title">
            Plan Your Perfect Trip
            <br />
            <span className="text-gradient">in Seconds with AI</span>
          </h1>

          <p className="hero-subtitle">
            The Personalized Travel Itinerary Planner uses Generative AI to create
            customized day-by-day travel plans based on your preferences, budget,
            and travel style — saving you hours of research.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Planning Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">10x</span>
              <span className="hero-stat-label">Faster Planning</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">AI</span>
              <span className="hero-stat-label">Powered Engine</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">∞</span>
              <span className="hero-stat-label">Destinations</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Card Preview */}
        <motion.div
          className="hero-preview"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="preview-card">
            <div className="preview-header">
              <div className="preview-dot red" /><div className="preview-dot yellow" /><div className="preview-dot green" />
            </div>
            <div className="preview-trip-title">🗺️ Tokyo Adventure — 5 Days</div>
            <div className="preview-days">
              {['Day 1', 'Day 2', 'Day 3'].map((d, i) => (
                <motion.div
                  key={d}
                  className="preview-day"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                >
                  <div className="preview-day-label">{d}</div>
                  <div className="preview-day-content">
                    {i === 0 && '🏯 Senso-ji Temple → 🍜 Ramen Lunch → 🌃 Shibuya'}
                    {i === 1 && '🗼 Tokyo Tower → 🍱 Tsukiji Market → 🎌 Akihabara'}
                    {i === 2 && '🌸 Ueno Park → 🎨 Mori Art Museum → 🍣 Sushi Bar'}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="preview-footer">
              <span className="badge badge-success">✓ Generated by AI</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Budget: $1,200</span>
            </div>
          </div>
        </motion.div>

        <a href="#features" className="scroll-hint">
          <ChevronDown size={20} className="animate-float" />
        </a>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-lg">Everything You Need to Plan<br /><span className="text-gradient">The Perfect Trip</span></h2>
          <p className="section-subtitle">Powerful features designed to simplify travel planning</p>
        </motion.div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="feature-icon">
                <f.icon size={22} />
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scenarios */}
      <section id="scenarios" className="scenarios-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-lg">Built for Every<br /><span className="text-gradient">Type of Traveler</span></h2>
        </motion.div>

        <div className="scenarios-grid">
          {scenarios.map((s, i) => (
            <motion.div
              key={s.title}
              className="scenario-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
            >
              <div className="scenario-emoji">{s.emoji}</div>
              <h3 className="scenario-title">{s.title}</h3>
              <p className="scenario-desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Globe size={48} className="cta-icon animate-float" />
          <h2 className="heading-lg">Ready to Plan Your Next Adventure?</h2>
          <p>Join thousands of travelers using AI to plan smarter trips.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <div className="landing-logo-icon"><Map size={16} /></div>
          <span>TripAI — Personalized Travel Itinerary Planner</span>
        </div>
        <p>Built with React, FastAPI, Supabase & Groq AI</p>
      </footer>
    </div>
  );
}
