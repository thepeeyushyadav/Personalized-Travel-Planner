import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Users, DollarSign, Heart, Utensils,
  Zap, ArrowRight, ArrowLeft, Check, Sparkles
} from 'lucide-react';
import { tripsAPI } from '../api';
import toast from 'react-hot-toast';
import './TripBuilder.css';

const STEPS = ['Destination', 'Dates & Group', 'Budget & Style', 'Interests', 'Review'];

const INTERESTS = [
  '🏛️ History', '🍜 Food & Dining', '🏖️ Beach', '🏔️ Mountains',
  '🎨 Art & Culture', '🛍️ Shopping', '🎭 Nightlife', '⛪ Architecture',
  '🌿 Nature', '⚽ Sports', '📸 Photography', '🎵 Music',
  '🧘 Wellness', '🎢 Adventure', '🦁 Wildlife', '🍷 Wine & Spirits'
];

const DIETARY = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Nut Allergy', 'Dairy-Free'];

const VIBES = [
  { value: 'adventure', emoji: '🧗', label: 'Adventure', desc: 'Outdoor & extreme' },
  { value: 'luxury', emoji: '✨', label: 'Luxury', desc: 'Premium experiences' },
  { value: 'budget', emoji: '💰', label: 'Budget', desc: 'Affordable & smart' },
  { value: 'romantic', emoji: '💑', label: 'Romantic', desc: 'Couples & intimate' },
  { value: 'family', emoji: '👨‍👩‍👧', label: 'Family', desc: 'Kid-friendly' },
  { value: 'culture', emoji: '🏛️', label: 'Culture', desc: 'History & arts' },
];

export default function TripBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: '', destination: '',
    start_date: '', end_date: '',
    group_size: 1, travel_style: 'moderate',
    budget: '', currency: 'USD',
    vibe: 'culture',
    interests: [], dietary_restrictions: [],
    mobility_concerns: '',
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleInterest = (item) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(item)
        ? f.interests.filter(i => i !== item)
        : [...f.interests, item]
    }));
  };

  const toggleDietary = (item) => {
    setForm(f => ({
      ...f,
      dietary_restrictions: f.dietary_restrictions.includes(item)
        ? f.dietary_restrictions.filter(i => i !== item)
        : [...f.dietary_restrictions, item]
    }));
  };

  const canNext = () => {
    if (step === 0) return form.title && form.destination;
    if (step === 1) return form.start_date && form.end_date && form.group_size >= 1;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : null,
        group_size: parseInt(form.group_size),
        interests: form.interests.map(i => i.replace(/^[^\w]+/, '').trim()),
      };
      const res = await tripsAPI.create(payload);
      const tripId = res.data.id;
      toast.success('Trip created! Generating AI itinerary... 🤖');

      setGenerating(true);
      try {
        await tripsAPI.generate(tripId);
        toast.success('Itinerary generated! 🗺️');
      } catch (genErr) {
        toast.error('AI generation failed. You can retry from the trip page.');
      } finally {
        setGenerating(false);
      }
      navigate(`/trip/${tripId}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goPrev = () => { setDirection(-1); setStep(s => s - 1); };

  return (
    <div className="page-container">
      <div className="builder-header">
        <h1 className="page-title">Plan a New Trip ✈️</h1>
        <p className="page-subtitle">AI will generate your personalized itinerary</p>
      </div>

      {/* Steps */}
      <div className="steps-bar">
        {STEPS.map((s, i) => (
          <div key={s} className={`step-item ${i === step ? 'step-active' : ''} ${i < step ? 'step-done' : ''}`}>
            <div className="step-circle">
              {i < step ? <Check size={14} /> : <span>{i + 1}</span>}
            </div>
            <span className="step-label">{s}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="builder-form-card">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* STEP 0: Destination */}
            {step === 0 && (
              <div className="form-step">
                <h2 className="step-title">Where are you going?</h2>
                <div className="form-group">
                  <label className="form-label">Trip Title</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Tokyo Adventure 2025"
                    value={form.title}
                    onChange={e => update('title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <div className="input-wrapper">
                    <MapPin size={16} className="input-icon" />
                    <input
                      className="form-input input-with-icon"
                      placeholder="e.g. Tokyo, Japan"
                      value={form.destination}
                      onChange={e => update('destination', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Dates & Group */}
            {step === 1 && (
              <div className="form-step">
                <h2 className="step-title">When & with whom?</h2>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.start_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => update('start_date', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.end_date}
                      min={form.start_date || new Date().toISOString().split('T')[0]}
                      onChange={e => update('end_date', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Group Size</label>
                  <div className="group-size-picker">
                    <button className="btn btn-secondary btn-sm" onClick={() => update('group_size', Math.max(1, form.group_size - 1))}>−</button>
                    <span className="group-size-display">
                      <Users size={16} /> {form.group_size} {form.group_size === 1 ? 'person' : 'people'}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => update('group_size', Math.min(50, form.group_size + 1))}>+</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Travel Pace</label>
                  <div className="pace-selector">
                    {['relaxed', 'moderate', 'fast'].map(p => (
                      <button
                        key={p}
                        className={`pace-btn ${form.travel_style === p ? 'pace-active' : ''}`}
                        onClick={() => update('travel_style', p)}
                      >
                        {p === 'relaxed' ? '😌' : p === 'moderate' ? '🚶' : '⚡'} {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Budget & Vibe */}
            {step === 2 && (
              <div className="form-step">
                <h2 className="step-title">Budget & Travel Style</h2>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Total Budget</label>
                    <div className="input-wrapper">
                      <DollarSign size={16} className="input-icon" />
                      <input
                        type="number"
                        className="form-input input-with-icon"
                        placeholder="e.g. 1500"
                        value={form.budget}
                        onChange={e => update('budget', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-select" value={form.currency} onChange={e => update('currency', e.target.value)}>
                      {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Trip Vibe</label>
                  <div className="vibe-grid">
                    {VIBES.map(v => (
                      <button
                        key={v.value}
                        className={`vibe-card ${form.vibe === v.value ? 'vibe-active' : ''}`}
                        onClick={() => update('vibe', v.value)}
                      >
                        <span className="vibe-emoji">{v.emoji}</span>
                        <span className="vibe-label">{v.label}</span>
                        <span className="vibe-desc">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Interests */}
            {step === 3 && (
              <div className="form-step">
                <h2 className="step-title">Your Interests</h2>
                <div className="form-group">
                  <label className="form-label">Select Your Interests</label>
                  <div className="interests-grid">
                    {INTERESTS.map(int => (
                      <button
                        key={int}
                        className={`interest-btn ${form.interests.includes(int) ? 'interest-selected' : ''}`}
                        onClick={() => toggleInterest(int)}
                      >
                        {int}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Dietary Restrictions</label>
                  <div className="dietary-grid">
                    {DIETARY.map(d => (
                      <button
                        key={d}
                        className={`dietary-btn ${form.dietary_restrictions.includes(d) ? 'dietary-selected' : ''}`}
                        onClick={() => toggleDietary(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mobility Concerns (optional)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. wheelchair accessible, avoiding steep stairs..."
                    value={form.mobility_concerns}
                    onChange={e => update('mobility_concerns', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <div className="form-step">
                <h2 className="step-title">Review Your Trip</h2>
                <div className="review-card">
                  <div className="review-row">
                    <span className="review-label">Trip Title</span>
                    <span className="review-value">{form.title}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Destination</span>
                    <span className="review-value">📍 {form.destination}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Dates</span>
                    <span className="review-value">{form.start_date} → {form.end_date}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Group</span>
                    <span className="review-value">{form.group_size} {form.group_size === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Budget</span>
                    <span className="review-value">{form.budget ? `${form.currency} ${form.budget}` : 'Flexible'}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Vibe</span>
                    <span className="review-value">{VIBES.find(v => v.value === form.vibe)?.emoji} {form.vibe}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Pace</span>
                    <span className="review-value">{form.travel_style}</span>
                  </div>
                  {form.interests.length > 0 && (
                    <div className="review-row">
                      <span className="review-label">Interests</span>
                      <span className="review-value">{form.interests.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="ai-notice">
                  <Sparkles size={16} />
                  AI will generate a personalized day-by-day itinerary based on your preferences
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="builder-nav">
          {step > 0 && (
            <button className="btn btn-secondary" onClick={goPrev}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={goNext} disabled={!canNext()}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || generating}
            >
              {loading || generating ? (
                <><div className="spinner" /> {generating ? 'Generating AI Plan...' : 'Creating Trip...'}</>
              ) : (
                <><Sparkles size={16} /> Generate Itinerary</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
