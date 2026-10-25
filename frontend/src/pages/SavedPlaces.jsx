import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, MapPin, Star, Trash2, Plus, X } from 'lucide-react';
import { placesAPI } from '../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['attraction', 'restaurant', 'hotel', 'activity', 'other'];
const CAT_EMOJI = { attraction: '🏛️', restaurant: '🍽️', hotel: '🏨', activity: '🎯', other: '📌' };

export default function SavedPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', category: 'attraction', description: '', rating: '' });

  useEffect(() => { fetchPlaces(); }, []);

  const fetchPlaces = async () => {
    try {
      const res = await placesAPI.getAll();
      setPlaces(res.data);
    } catch { toast.error('Failed to load saved places'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location) { toast.error('Name and location required'); return; }
    try {
      const payload = { ...form, rating: form.rating ? parseFloat(form.rating) : null };
      await placesAPI.save(payload);
      toast.success('Place saved! 📌');
      setShowForm(false);
      setForm({ name: '', location: '', category: 'attraction', description: '', rating: '' });
      fetchPlaces();
    } catch { toast.error('Failed to save place'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this saved place?')) return;
    try {
      await placesAPI.delete(id);
      setPlaces(prev => prev.filter(p => p.id !== id));
      toast.success('Place removed');
    } catch { toast.error('Failed to remove place'); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Places 📌</h1>
          <p className="page-subtitle">Your bookmarked destinations and spots</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Save a Place
        </button>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="heading-sm">Save a New Place</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label className="form-label">Place Name</label>
                <input className="form-input" placeholder="e.g. Eiffel Tower" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <div className="input-wrapper">
                  <MapPin size={15} className="input-icon" />
                  <input className="form-input input-with-icon" placeholder="e.g. Paris, France" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (1-5)</label>
                  <input className="form-input" type="number" min="1" max="5" step="0.1" placeholder="e.g. 4.5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="Add notes about this place..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Place</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>
      ) : places.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Bookmark size={32} /></div>
          <h3 className="heading-sm">No saved places yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Save your favorite destinations and spots</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Save Your First Place
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {places.map((place, i) => (
            <motion.div
              key={place.id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{CAT_EMOJI[place.category] || '📌'}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(place.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
              <h3 className="heading-sm" style={{ marginBottom: 6 }}>{place.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--primary-light)', marginBottom: 8 }}>
                <MapPin size={11} /> {place.location}
              </div>
              {place.description && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{place.description}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-primary`} style={{ textTransform: 'capitalize' }}>{place.category}</span>
                {place.rating && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                    <Star size={13} fill="currentColor" /> {place.rating}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
