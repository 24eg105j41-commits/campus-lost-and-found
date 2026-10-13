import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API, { getImageUrl } from '../services/api';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Tag,
  PlusCircle,
  HelpCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Documents',
  'Books',
  'Clothing',
  'Accessories',
  'Keys',
  'Bags',
  'Other',
];

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [building, setBuilding] = useState('');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (type) params.type = type;
      if (category && category !== 'All') params.category = category;
      if (searchTerm) params.search = searchTerm;
      if (building) params.building = building;

      const res = await API.get('/items', { params });
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.warn('Could not fetch items from backend:', err.message);
      setError('Could not connect to backend items API. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {type === 'lost'
              ? 'Lost Items Directory'
              : type === 'found'
              ? 'Found Items Directory'
              : 'All Campus Listings'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search reports filed across student halls, academic complexes, and campus facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/report?type=lost"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
          >
            <HelpCircle className="w-4 h-4" /> Report Lost
          </Link>
          <Link
            to="/report?type=found"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
          >
            <PlusCircle className="w-4 h-4" /> Report Found
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Listing Type:
          </span>
          <button
            onClick={() => setType('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setType('lost')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'lost'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => setType('found')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'found'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Found
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword (e.g. blue Hydro Flask, HP laptop)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-campus-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-campus-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="Building / Hall..."
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-campus-500"
            />
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full py-2 bg-campus-600 hover:bg-campus-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Content Section */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Local Environment Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-campus-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Loading campus listings...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">No Items Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              There are currently no listings matching your filter criteria. Be the first to report an item!
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/report"
              className="px-4 py-2 bg-campus-600 hover:bg-campus-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Report an Item Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image banner or fallback */}
              <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {item.image || (item.images && item.images.length > 0) ? (
                  <img
                    src={getImageUrl(item.image || item.images[0]?.url)}
                    alt={item.itemName || item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 text-xs font-medium flex flex-col items-center gap-1">
                    <Tag className="w-8 h-8 text-slate-300" />
                    <span>No image provided</span>
                  </div>
                )}
                {/* Type Tag */}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    item.type === 'lost'
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {item.type}
                </span>

                {/* Status Tag */}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-semibold bg-white/90 backdrop-blur text-slate-700 capitalize border border-slate-200">
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              {/* Item Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-medium text-campus-700">{item.category}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {item.location?.building}
                      {item.location?.roomOrArea ? ` (${item.location.roomOrArea})` : ''}
                    </span>
                  </div>

                  <Link
                    to={`/items/${item._id}`}
                    className="block text-center py-2 bg-slate-50 hover:bg-campus-50 text-slate-700 hover:text-campus-700 font-semibold rounded-lg border border-slate-200 hover:border-campus-300 transition-colors"
                  >
                    View Details & Match
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
