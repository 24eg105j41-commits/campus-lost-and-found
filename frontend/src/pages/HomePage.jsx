import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  HelpCircle,
  Laptop,
  FileText,
  BookOpen,
  Shirt,
  Watch,
  Key,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics', icon: Laptop, count: 'Laptops, Phones, Chargers' },
  { name: 'Documents', icon: FileText, count: 'IDs, Licenses, Folders' },
  { name: 'Books', icon: BookOpen, count: 'Textbooks, Notebooks, Notes' },
  { name: 'Clothing', icon: Shirt, count: 'Jackets, Hoodies, Hats' },
  { name: 'Accessories', icon: Watch, count: 'Watches, Glasses, Jewelry' },
  { name: 'Keys', icon: Key, count: 'Dorm keys, Car fobs, Lanyards' },
  { name: 'Bags', icon: Briefcase, count: 'Backpacks, Wallets, Pouches' },
  { name: 'Other', icon: Layers, count: 'Bottles, Umbrellas, Misc' },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/lost-items?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/lost-items');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-campus-50 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Campus <span className="text-campus-600">Lost & Found</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The dedicated campus platform to report, search, and reclaim lost and found items across lecture halls, dorms, and campus facilities.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-campus-500 transition-all">
              <Search className="w-6 h-6 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search lost items by name, color, building, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none text-base"
              />
              <button
                type="submit"
                className="bg-campus-600 hover:bg-campus-700 text-white font-medium px-6 py-3 rounded-xl transition-colors shrink-0 shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/report-lost"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all shadow-sm"
            >
              <HelpCircle className="w-5 h-5 text-rose-600" />
              I Lost Something
            </Link>

            <Link
              to="/report-found"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-sm"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              I Found an Item
            </Link>

            <Link
              to="/lost-items"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              Browse Lost Items
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/found-items"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              Browse Found Items
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Official Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Official Categories</h2>
            <p className="text-sm text-slate-500">Filter lost belongings across campus</p>
          </div>
          <Link
            to="/lost-items"
            className="text-sm font-semibold text-campus-600 hover:text-campus-700 flex items-center gap-1"
          >
            View all lost items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/lost-items?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-slate-200 hover:border-campus-400 hover:shadow-md transition-all"
              >
                <div className="p-3.5 rounded-2xl bg-campus-50 text-campus-600 group-hover:bg-campus-600 group-hover:text-white transition-colors mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-campus-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
