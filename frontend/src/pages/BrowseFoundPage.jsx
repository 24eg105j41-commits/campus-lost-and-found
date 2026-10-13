import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ItemCard from '../components/ItemCard';
import {
  Search,
  Filter,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  RotateCcw,
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

const EXAMPLE_AI_QUERIES = [
  "Show found wallets reported this week",
  "Silver MacBook or laptop turned in",
  "Blue student ID card near canteen",
  "Car keys or fobs found in parking lot",
];

export default function BrowseFoundPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('standard'); // 'standard' | 'ai'
  const [parsedQuery, setParsedQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFoundItems = async () => {
    setLoading(true);
    setError(null);
    setParsedQuery(null);
    try {
      if (searchMode === 'ai' && searchTerm.trim()) {
        const res = await API.post('/ai/search', {
          query: searchTerm.trim(),
        });
        if (res.data.success) {
          const filtered = res.data.items.filter((i) => i.type === 'found');
          setItems(filtered);
          setParsedQuery(res.data.parsedQuery);
        }
      } else {
        const params = {};
        if (category !== 'All') params.category = category;
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const res = await API.get('/items/found', { params });
        if (res.data.success) {
          setItems(res.data.items);
        }
      }
    } catch (err) {
      console.error('Failed to fetch found items:', err);
      setError('Could not load found items. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchMode === 'standard') {
      fetchFoundItems();
    }
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFoundItems();
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setCategory('All');
    setSearchMode('standard');
    setParsedQuery(null);
    fetchFoundItems();
  };

  const handleApplyAiExample = (queryText) => {
    setSearchMode('ai');
    setSearchTerm(queryText);
    setLoading(true);
    setError(null);
    API.post('/ai/search', { query: queryText })
      .then((res) => {
        if (res.data.success) {
          const filtered = res.data.items.filter((i) => i.type === 'found');
          setItems(filtered);
          setParsedQuery(res.data.parsedQuery);
        }
      })
      .catch((err) => {
        setError('Smart search failed. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            Campus Found Directory
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Browse Found Items</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse belongings found and turned in across lecture halls, labs, and campus centers.
          </p>
        </div>

        <div>
          <Link
            to="/report-found"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Report Found Item
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Search Mode Toggle */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchMode('standard');
                setParsedQuery(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                searchMode === 'standard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Standard Filter
            </button>
            <button
              onClick={() => setSearchMode('ai')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                searchMode === 'ai'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Smart AI Search
            </button>
          </div>

          {(searchTerm || category !== 'All' || parsedQuery) && (
            <button
              onClick={handleResetSearch}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            {searchMode === 'ai' ? (
              <Sparkles className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            )}
            <input
              type="text"
              placeholder={
                searchMode === 'ai'
                  ? "Describe in natural language (e.g. 'Show found wallets reported this week near library')..."
                  : "Search by keyword, item name, color, or location..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all ${
                searchMode === 'ai'
                  ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30'
                  : 'border-slate-200 focus:ring-2 focus:ring-campus-500'
              }`}
            />
          </div>

          {searchMode === 'standard' && (
            <div className="w-full sm:w-56">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-campus-500 font-medium text-slate-700"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className={`px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all shrink-0 shadow-sm ${
              searchMode === 'ai'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {searchMode === 'ai' ? 'AI Search' : 'Search'}
          </button>
        </form>

        {/* AI Sample Prompts */}
        {searchMode === 'ai' && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400 shrink-0">Try asking:</span>
            {EXAMPLE_AI_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyAiExample(q)}
                className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg transition-colors text-[11px]"
              >
                "{q}"
              </button>
            ))}
          </div>
        )}

        {/* Category Pills (standard mode) */}
        {searchMode === 'standard' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  category === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* AI Query Interpretation Banner */}
        {parsedQuery && (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold flex items-center gap-1 text-emerald-700">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI Query Analysis:
              </span>
              {parsedQuery.category && (
                <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 font-semibold">
                  Category: {parsedQuery.category}
                </span>
              )}
              {parsedQuery.color && (
                <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 font-semibold">
                  Color: {parsedQuery.color}
                </span>
              )}
              {parsedQuery.location && (
                <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 font-semibold">
                  Location: {parsedQuery.location}
                </span>
              )}
              {parsedQuery.dateRange && (
                <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 font-semibold capitalize">
                  Window: {parsedQuery.dateRange.replace('_', ' ')}
                </span>
              )}
            </div>
            <span className="text-slate-500 font-medium">
              Found {items.length} relevant report(s)
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
          <p className="text-sm">
            {searchMode === 'ai'
              ? 'Analyzing natural language criteria & searching database...'
              : 'Loading found items directory...'}
          </p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
            <PlusCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No Found Items Listed</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchMode === 'ai'
                ? "No found items match your natural language description. Try adjusting details or reset filters."
                : "There are currently no found item reports matching your filters."}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleResetSearch}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Reset Search
            </button>
            <Link
              to="/report-found"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              Report a Found Item
            </Link>
          </div>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
