import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, PlusCircle, Filter } from 'lucide-react';
import './ExplorePage.css';

const DESTINATIONS = [
  { id: 1, name: 'Tokyo', country: 'Japan', emoji: '🇯🇵', category: 'Culture', rating: 4.9, best: 'Mar-May', desc: 'Cherry blossoms, tech districts, ancient temples, and world-class cuisine.' },
  { id: 2, name: 'Paris', country: 'France', emoji: '🇫🇷', category: 'Romantic', rating: 4.8, best: 'Apr-Jun', desc: 'City of love with art museums, croissants, and the iconic Eiffel Tower.' },
  { id: 3, name: 'Bali', country: 'Indonesia', emoji: '🇮🇩', category: 'Adventure', rating: 4.7, best: 'May-Sep', desc: 'Tropical paradise with rice terraces, temples, surfing, and yoga retreats.' },
  { id: 4, name: 'New York', country: 'USA', emoji: '🇺🇸', category: 'City', rating: 4.8, best: 'Sep-Nov', desc: 'The city that never sleeps — Broadway, Central Park, museums, and iconic skyline.' },
  { id: 5, name: 'Santorini', country: 'Greece', emoji: '🇬🇷', category: 'Luxury', rating: 4.9, best: 'Jun-Sep', desc: 'Iconic blue-domed churches, volcanic cliffs, and breathtaking Aegean sunsets.' },
  { id: 6, name: 'Kyoto', country: 'Japan', emoji: '🇯🇵', category: 'Culture', rating: 4.8, best: 'Apr-Nov', desc: 'Ancient capital with geisha districts, bamboo forests, and countless temples.' },
  { id: 7, name: 'Barcelona', country: 'Spain', emoji: '🇪🇸', category: 'City', rating: 4.7, best: 'May-Oct', desc: 'Gaudí architecture, La Rambla, tapas, and vibrant beach culture.' },
  { id: 8, name: 'Dubai', country: 'UAE', emoji: '🇦🇪', category: 'Luxury', rating: 4.7, best: 'Oct-Apr', desc: 'Futuristic skyline, desert safaris, world\'s tallest buildings, and luxury malls.' },
  { id: 9, name: 'Machu Picchu', country: 'Peru', emoji: '🇵🇪', category: 'Adventure', rating: 4.9, best: 'Apr-Oct', desc: 'Ancient Incan citadel in the Andes mountains — a world wonder.' },
  { id: 10, name: 'Rome', country: 'Italy', emoji: '🇮🇹', category: 'Culture', rating: 4.8, best: 'Apr-Jun', desc: 'Eternal city with the Colosseum, Vatican, and incredible Italian cuisine.' },
  { id: 11, name: 'Maldives', country: 'Maldives', emoji: '🇲🇻', category: 'Luxury', rating: 4.9, best: 'Nov-Apr', desc: 'Overwater bungalows, crystal-clear lagoons, and pristine coral reefs.' },
  { id: 12, name: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱', category: 'City', rating: 4.6, best: 'Apr-Aug', desc: 'Canal houses, world-class museums, bike culture, and vibrant nightlife.' },
];

const CATEGORIES = ['All', 'Culture', 'Adventure', 'Luxury', 'Romantic', 'City'];

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = DESTINATIONS.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || d.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">Explore Destinations 🌍</h1>
          <p className="page-subtitle">Discover popular destinations and get inspired</p>
        </div>
        <Link to="/trip/new" className="btn btn-primary">
          <PlusCircle size={16} /> Plan a Trip
        </Link>
      </motion.div>

      {/* Search & Filter */}
      <div className="explore-controls">
        <div className="input-wrapper explore-search">
          <Search size={16} className="input-icon" />
          <input
            className="form-input input-with-icon"
            placeholder="Search destinations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-btn ${category === cat ? 'category-active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="destinations-grid">
        {filtered.map((dest, i) => (
          <motion.div
            key={dest.id}
            className="destination-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <div className="dest-emoji-header">
              <span className="dest-flag">{dest.emoji}</span>
              <span className={`badge badge-primary`}>{dest.category}</span>
            </div>
            <h3 className="dest-name">{dest.name}</h3>
            <div className="dest-country"><MapPin size={12} /> {dest.country}</div>
            <p className="dest-desc">{dest.desc}</p>
            <div className="dest-footer">
              <div className="dest-rating">
                <Star size={13} fill="currentColor" /> {dest.rating}
              </div>
              <div className="dest-best">Best: {dest.best}</div>
              <Link
                to={`/trip/new`}
                className="btn btn-primary btn-sm"
                state={{ destination: dest.name }}
              >
                Plan Trip
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Search size={32} /></div>
          <h3 className="heading-sm">No destinations found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
