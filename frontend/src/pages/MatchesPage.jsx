import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API, { getImageUrl } from '../services/api';
import { CheckCircle2, XCircle, AlertCircle, MapPin, Calendar, Check, X } from 'lucide-react';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await API.get('/matches');
      if (res.data.success) {
        setMatches(res.data.matches);
      }
    } catch (error) {
      console.error('Error fetching matches', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId, status) => {
    try {
      const res = await API.put(`/matches/${matchId}`, { status });
      if (res.data.success) {
        setMatches(matches.map(m => m._id === matchId ? { ...m, status: res.data.match.status } : m));
      }
    } catch (error) {
      console.error('Error updating match status', error);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading matches...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Potential Matches</h1>
      
      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-campus-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Matches Found Yet</h3>
          <p className="text-slate-500">We will notify you if an item similar to yours is found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <div key={match._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    Match Confidence: {match.confidenceScore}%
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {match.matchingFactors.map((factor, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ {factor}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    Status: <strong className={match.status === 'Confirmed' ? 'text-green-600' : match.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'}>{match.status}</strong>
                  </p>
                </div>
                
                {match.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateMatchStatus(match._id, 'Confirmed')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> I Think This Is My Item
                    </button>
                    <button 
                      onClick={() => updateMatchStatus(match._id, 'Rejected')}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Not a Match
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Lost Item Details */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <h4 className="font-bold text-rose-600 mb-3 flex items-center gap-2">
                    Lost Item
                  </h4>
                  <div className="flex gap-4">
                    {match.lostItemId?.image ? (
                      <img src={getImageUrl(match.lostItemId.image)} alt="Lost" className="w-24 h-24 rounded-lg object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                    )}
                    <div>
                      <h5 className="font-bold text-slate-800">{match.lostItemId?.itemName}</h5>
                      <p className="text-sm text-slate-600 mb-1">{match.lostItemId?.description?.substring(0, 50)}...</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.lostItemId?.location}</p>
                      <Link to={`/items/${match.lostItemId?._id}`} className="text-xs text-campus-600 font-bold mt-2 inline-block">View Item →</Link>
                    </div>
                  </div>
                </div>

                {/* Found Item Details */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <h4 className="font-bold text-teal-600 mb-3 flex items-center gap-2">
                    Found Item
                  </h4>
                  <div className="flex gap-4">
                    {match.foundItemId?.image ? (
                      <img src={getImageUrl(match.foundItemId.image)} alt="Found" className="w-24 h-24 rounded-lg object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                    )}
                    <div>
                      <h5 className="font-bold text-slate-800">{match.foundItemId?.itemName}</h5>
                      <p className="text-sm text-slate-600 mb-1">{match.foundItemId?.description?.substring(0, 50)}...</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.foundItemId?.location}</p>
                      <Link to={`/items/${match.foundItemId?._id}`} className="text-xs text-campus-600 font-bold mt-2 inline-block">View Item →</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
