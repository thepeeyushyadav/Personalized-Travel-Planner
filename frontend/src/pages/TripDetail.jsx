import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Users, DollarSign, Clock, Sparkles,
  Download, Share2, RefreshCw, ArrowLeft, Sun, Coffee, Moon,
  UtensilsCrossed, BedDouble, Car, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { tripsAPI, itinerariesAPI } from '../api';
import toast from 'react-hot-toast';
import './TripDetail.css';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tripRes, itinRes] = await Promise.all([
        tripsAPI.getById(id),
        itinerariesAPI.getByTrip(id)
      ]);
      setTrip(tripRes.data);
      setItinerary(itinRes.data.days || []);
      // Expand first day by default
      if (itinRes.data.days?.length > 0) {
        setExpandedDays({ [itinRes.data.days[0].id]: true });
      }
    } catch (err) {
      toast.error('Failed to load trip details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate the full itinerary? This will replace the current plan.')) return;
    setGenerating(true);
    try {
      await tripsAPI.generate(id);
      toast.success('Itinerary regenerated! 🔄');
      fetchData();
    } catch (err) {
      toast.error('Regeneration failed. Check your AI API key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      const res = await tripsAPI.share(id);
      const url = `${window.location.origin}/shared/${res.data.share_token}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard! 📋');
    } catch {
      toast.error('Failed to generate share link');
    }
  };

  const handleDownload = () => {
    if (!trip || !itinerary.length) return;
    let text = `=== ${trip.title} ===\n`;
    text += `Destination: ${trip.destination}\n`;
    text += `Dates: ${trip.start_date} to ${trip.end_date}\n`;
    text += `Group: ${trip.group_size} person(s)\n\n`;

    itinerary.forEach(day => {
      text += `\n--- Day ${day.day_number} (${day.date || ''}) ---\n`;
      if (day.morning_activities?.length > 0) {
        text += '\nMORNING:\n';
        day.morning_activities.forEach(a => {
          text += `  ${a.time || ''} - ${a.activity || a.name || ''}\n`;
        });
      }
      if (day.afternoon_activities?.length > 0) {
        text += '\nAFTERNOON:\n';
        day.afternoon_activities.forEach(a => {
          text += `  ${a.time || ''} - ${a.activity || a.name || ''}\n`;
        });
      }
      if (day.evening_activities?.length > 0) {
        text += '\nEVENING:\n';
        day.evening_activities.forEach(a => {
          text += `  ${a.time || ''} - ${a.activity || a.name || ''}\n`;
        });
      }
      if (day.meals?.lunch) text += `\nLunch: ${day.meals.lunch.name}\n`;
      if (day.meals?.dinner) text += `Dinner: ${day.meals.dinner.name}\n`;
      if (day.estimated_cost) text += `Estimated Cost: $${day.estimated_cost}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.title.replace(/\s+/g, '_')}_itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Itinerary downloaded! 📥');
  };

  const toggleDay = (dayId) => {
    setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  if (loading) return (
    <div className="page-container">
      <div className="loading-screen" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    </div>
  );

  const totalCost = itinerary.reduce((sum, d) => sum + (d.estimated_cost || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="trip-detail-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className="trip-detail-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleShare}>
            <Share2 size={14} /> Share
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
            <Download size={14} /> Download
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleRegenerate} disabled={generating}>
            {generating ? <div className="spinner" /> : <RefreshCw size={14} />}
            {generating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Trip Info */}
      <motion.div
        className="trip-info-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="trip-info-main">
          <div className="trip-info-badge">
            <Sparkles size={14} /> AI Generated Itinerary
          </div>
          <h1 className="trip-detail-title">{trip.title}</h1>
          <div className="trip-info-meta">
            <span><MapPin size={14} /> {trip.destination}</span>
            <span><Calendar size={14} /> {trip.start_date} → {trip.end_date}</span>
            <span><Users size={14} /> {trip.group_size} {trip.group_size === 1 ? 'person' : 'people'}</span>
            {trip.budget && <span><DollarSign size={14} /> {trip.currency} {trip.budget}</span>}
          </div>
        </div>
        <div className="trip-info-stats">
          <div className="trip-stat">
            <div className="trip-stat-value">{itinerary.length}</div>
            <div className="trip-stat-label">Days</div>
          </div>
          <div className="trip-stat">
            <div className="trip-stat-value">${totalCost.toLocaleString()}</div>
            <div className="trip-stat-label">Est. Cost</div>
          </div>
          <div className="trip-stat">
            <div className="trip-stat-value">{trip.vibe}</div>
            <div className="trip-stat-label">Vibe</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="detail-tabs">
        {['itinerary', 'overview'].map(tab => (
          <button
            key={tab}
            className={`detail-tab ${activeTab === tab ? 'detail-tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'itinerary' && (
        itinerary.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Sparkles size={32} /></div>
            <h3 className="heading-sm">No Itinerary Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Click "Regenerate" to generate your AI itinerary</p>
            <button className="btn btn-primary" onClick={handleRegenerate}>
              <Sparkles size={16} /> Generate Now
            </button>
          </div>
        ) : (
          <div className="itinerary-timeline">
            {itinerary.map((day, i) => (
              <motion.div
                key={day.id}
                className="day-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="day-header" onClick={() => toggleDay(day.id)}>
                  <div className="day-number">Day {day.day_number}</div>
                  <div className="day-date">{day.date}</div>
                  {day.notes && <div className="day-highlight">{day.notes}</div>}
                  <div className="day-meta-row">
                    {day.estimated_cost && (
                      <span className="day-cost"><DollarSign size={12} />${day.estimated_cost}</span>
                    )}
                    {expandedDays[day.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {expandedDays[day.id] && (
                  <motion.div
                    className="day-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    {/* Morning */}
                    {day.morning_activities?.length > 0 && (
                      <div className="time-block">
                        <div className="time-block-header morning-color">
                          <Sun size={14} /> Morning
                        </div>
                        {day.morning_activities.map((act, ai) => (
                          <ActivityItem key={ai} activity={act} />
                        ))}
                      </div>
                    )}

                    {/* Afternoon */}
                    {day.afternoon_activities?.length > 0 && (
                      <div className="time-block">
                        <div className="time-block-header afternoon-color">
                          <Coffee size={14} /> Afternoon
                        </div>
                        {day.afternoon_activities.map((act, ai) => (
                          <ActivityItem key={ai} activity={act} />
                        ))}
                      </div>
                    )}

                    {/* Evening */}
                    {day.evening_activities?.length > 0 && (
                      <div className="time-block">
                        <div className="time-block-header evening-color">
                          <Moon size={14} /> Evening
                        </div>
                        {day.evening_activities.map((act, ai) => (
                          <ActivityItem key={ai} activity={act} />
                        ))}
                      </div>
                    )}

                    {/* Meals & Stay Row */}
                    <div className="day-extras-row">
                      {day.meals?.lunch && (
                        <div className="extra-card">
                          <div className="extra-label"><UtensilsCrossed size={12} /> Lunch</div>
                          <div className="extra-name">{day.meals.lunch.name}</div>
                          <div className="extra-sub">{day.meals.lunch.cuisine} · {day.meals.lunch.price_range}</div>
                        </div>
                      )}
                      {day.meals?.dinner && (
                        <div className="extra-card">
                          <div className="extra-label"><UtensilsCrossed size={12} /> Dinner</div>
                          <div className="extra-name">{day.meals.dinner.name}</div>
                          <div className="extra-sub">{day.meals.dinner.cuisine} · {day.meals.dinner.price_range}</div>
                        </div>
                      )}
                      {day.accommodation?.name && (
                        <div className="extra-card">
                          <div className="extra-label"><BedDouble size={12} /> Stay</div>
                          <div className="extra-name">{day.accommodation.name}</div>
                          <div className="extra-sub">{day.accommodation.type} · ${day.accommodation.price_per_night}/night</div>
                        </div>
                      )}
                      {day.transportation?.tips && (
                        <div className="extra-card">
                          <div className="extra-label"><Car size={12} /> Transport</div>
                          <div className="extra-name" style={{ fontSize: 12 }}>{day.transportation.tips}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )
      )}

      {activeTab === 'overview' && (
        <div className="overview-grid">
          <div className="card">
            <h3 className="heading-sm" style={{ marginBottom: 16 }}>Trip Details</h3>
            <div className="overview-rows">
              {[
                ['Destination', trip.destination],
                ['Start Date', trip.start_date],
                ['End Date', trip.end_date],
                ['Group Size', `${trip.group_size} person(s)`],
                ['Travel Style', trip.travel_style],
                ['Vibe', trip.vibe],
                ['Budget', trip.budget ? `${trip.currency} ${trip.budget}` : 'Flexible'],
                ['Status', trip.status],
              ].map(([k, v]) => (
                <div key={k} className="overview-row">
                  <span className="overview-key">{k}</span>
                  <span className="overview-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
          {trip.interests?.length > 0 && (
            <div className="card">
              <h3 className="heading-sm" style={{ marginBottom: 16 }}>Interests</h3>
              <div className="trip-interests">
                {trip.interests.map(int => (
                  <span key={int} className="interest-tag">{int}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }) {
  return (
    <div className="activity-item">
      <div className="activity-time">{activity.time || ''}</div>
      <div className="activity-info">
        <div className="activity-name">{activity.activity || activity.name || ''}</div>
        {activity.location && (
          <div className="activity-location"><MapPin size={11} /> {activity.location}</div>
        )}
        {activity.description && (
          <div className="activity-desc">{activity.description}</div>
        )}
        {activity.cost > 0 && (
          <div className="activity-cost">${activity.cost}</div>
        )}
      </div>
    </div>
  );
}
