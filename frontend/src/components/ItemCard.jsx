import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../services/api';

export default function ItemCard({ item }) {
  const isLost = item.type === 'lost';

  const statusColors = {
    Lost: 'bg-rose-50 text-rose-700 border-rose-200',
    Found: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Matched: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Claimed: 'bg-amber-50 text-amber-700 border-amber-200',
    Recovered: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <Link
      to={`/items/${item._id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-campus-300 transition-all flex flex-col"
    >
      {/* Image container */}
      <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img
            src={getImageUrl(item.image)}
            alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-400">
            <ImageIcon className="w-8 h-8 text-slate-300" />
            <span className="text-xs font-medium">No photo provided</span>
          </div>
        )}

        {/* Type badge */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
            isLost ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {isLost ? 'Lost' : 'Found'}
        </span>

        {/* Status badge */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-md text-xs font-semibold border backdrop-blur-sm shadow-sm ${
            statusColors[item.status] || 'bg-white/90 text-slate-700 border-slate-200'
          }`}
        >
          {item.status}
        </span>
      </div>

      {/* Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-campus-700 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {item.category}
            </span>
            {item.color && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                Color: {item.color}
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-campus-600 transition-colors">
            {item.itemName}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>

          <span className="flex items-center gap-1 shrink-0 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </Link>
  );
}
