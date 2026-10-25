import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle, Map, Calendar, Users, DollarSign,
  Trash2, Eye, Sparkles, TrendingUp, Clock, Globe
} from 'lucide-react';
import { tripsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

const VIBE_EMOJI = { adventure: '🧗', luxury: '✨', budget: '💰', romantic: '💑', family: '👨‍👩‍👧', culture: '🏛️' };
const STATUS_BADGE = { draft: 'badge-warning', active: 'badge-success', completed: 'badge-primary', archived: 'badge-danger' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await tripsAPI.getAll();
      setTrips(res.data);
    } catch (err) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this trip?')) return;
    try {
      await tripsAPI.delete(id);
      setTrips(prev => prev.filter(t => t.id !== id));
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

  const stats = [
    { icon: Globe, label: 'Total Trips', value: trips.length, color: '#6366f1' },
    { icon: TrendingUp, label: 'Active Trips', value: trips.filter(t => t.status === 'active').length, color: '#10b981' },
    { icon: Clock, label: 'Drafts', value: trips.filter(t => t.status === 'draft').length, color: '#f59e0b' },
    { icon: Map, label: 'Destinations', value: new Set(trips.map(t => t.destination)).size, color: '#8b5cf6' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="page-title">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Traveler'} 👋
          </h1>
          <p className="page-subtitle">Your AI-powered travel dashboard</p>
        </div>
        <Link to="/trip/new" className="btn btn-primary">
          <PlusCircle size={16} />
          New Trip
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trips Grid */}
      <div className="section-title-row">
        <h2 className="heading-sm">Your Trips</h2>
        <span className="text-muted" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{trips.length} total</span>
      </div>

      {loading ? (
        <div className="trips-loading">
          {[1,2,3].map(i => <div key={i} className="trip-skeleton" />)}
        </div>
      ) : trips.length === 0 ? (
        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="empty-icon"><Globe size={36} /></div>
          <h3 className="heading-sm">No trips yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Create your first AI-powered travel itinerary
          </p>
          <Link to="/trip/new" className="btn btn-primary">
            <PlusCircle size={16} /> Plan Your First Trip
          </Link>
        </motion.div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip, i) => (
            <motion.div
              key={trip.id}
              className="trip-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(`/trip/${trip.id}`)}
            >
              <div className="trip-card-header">
                <div className="trip-vibe-badge">
                  {VIBE_EMOJI[trip.vibe] || '🌍'} {trip.vibe}
                </div>
                <span className={`badge ${STATUS_BADGE[trip.status] || 'badge-primary'}`}>
                  {trip.status}
                </span>
              </div>

              <h3 className="trip-title">{trip.title}</h3>

              <div className="trip-destination">
                <Map size={14} />
                {trip.destination}
              </div>

              <div className="trip-meta">
                <div className="trip-meta-item">
                  <Calendar size={13} />
                  {new Date(trip.start_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  {' – '}
                  {new Date(trip.end_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="trip-meta-item">
                  <Users size={13} />
                  {trip.group_size} {trip.group_size === 1 ? 'person' : 'people'}
                </div>
                {trip.budget && (
                  <div className="trip-meta-item">
                    <DollarSign size={13} />
                    {trip.currency} {Number(trip.budget).toLocaleString()}
                  </div>
                )}
              </div>

              {trip.interests?.length > 0 && (
                <div className="trip-interests">
                  {trip.interests.slice(0, 3).map(int => (
                    <span key={int} className="interest-tag">{int}</span>
                  ))}
                  {trip.interests.length > 3 && (
                    <span className="interest-tag">+{trip.interests.length - 3}</span>
                  )}
                </div>
              )}

              <div className="trip-card-actions">
                <button className="btn btn-secondary btn-sm trip-action-btn">
                  <Eye size={13} /> View
                </button>
                <button
                  className="btn btn-danger btn-sm trip-action-btn"
                  onClick={(e) => handleDelete(trip.id, e)}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
