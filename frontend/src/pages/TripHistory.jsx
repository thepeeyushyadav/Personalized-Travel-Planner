import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Calendar, Eye, Sparkles } from 'lucide-react';
import { historyAPI } from '../api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { draft: 'badge-warning', active: 'badge-success', completed: 'badge-primary', archived: 'badge-danger' };

export default function TripHistory() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await historyAPI.getTrips();
      setTrips(res.data.trips || []);
    } catch { toast.error('Failed to load trip history'); }
    finally { setLoading(false); }
  };

  const getDuration = (start, end) => {
    if (!start || !end) return '';
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return `${diff} day${diff !== 1 ? 's' : ''}`;
  };

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">Trip History 🕐</h1>
          <p className="page-subtitle">All your planned and completed adventures</p>
        </div>
        <Link to="/trip/new" className="btn btn-primary">
          <Sparkles size={16} /> Plan New Trip
        </Link>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Clock size={32} /></div>
          <h3 className="heading-sm">No trips yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your trip history will appear here</p>
          <Link to="/trip/new" className="btn btn-primary"><Sparkles size={16} /> Plan Your First Trip</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {trips.map((trip, i) => (
            <motion.div
              key={trip.id}
              className="card"
              style={{ cursor: 'default' }}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 className="heading-sm">{trip.title}</h3>
                    <span className={`badge ${STATUS_BADGE[trip.status] || 'badge-primary'}`}>{trip.status}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--primary-light)' }}>
                      <MapPin size={13} /> {trip.destination}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
                      <Calendar size={13} />
                      {new Date(trip.start_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
                      <Clock size={13} /> {getDuration(trip.start_date, trip.end_date)}
                    </span>
                    {trip.budget && (
                      <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                        {trip.currency} {trip.budget}
                      </span>
                    )}
                  </div>
                  {trip.itineraries?.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                      {trip.itineraries.length} days planned ·
                      Total est. ${trip.itineraries.reduce((s, d) => s + (d.estimated_cost || 0), 0).toLocaleString()}
                    </div>
                  )}
                </div>
                <Link to={`/trip/${trip.id}`} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                  <Eye size={13} /> View
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
