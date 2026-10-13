import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, claimsRes] = await Promise.allSettled([
          API.get('/admin/stats'),
          API.get('/admin/claims'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setStats(statsRes.value.data.stats);
        }
        if (claimsRes.status === 'fulfilled' && claimsRes.value.data.success) {
          setClaims(claimsRes.value.data.claims);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Admin Access Required</h2>
        <p className="text-sm text-slate-500">
          This portal is restricted to campus administration, security desk, and staff moderators.
        </p>
      </div>
    );
  }

  const handleUpdateClaim = async (claimId, status) => {
    try {
      const res = await API.put(`/claims/${claimId}/status`, { status });
      if (res.data.success) {
        setClaims(claims.map((c) => (c._id === claimId ? res.data.claim : c)));
      }
    } catch (err) {
      console.error('Failed to update claim:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold uppercase mb-2">
          <ShieldAlert className="w-3.5 h-3.5" /> Staff & Moderator Console
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Campus Oversight Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor lost and found activity, audit recovery claims, and manage system operations.
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Registered Items</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.totalItems || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Recovery Rate</span>
          <p className="text-3xl font-extrabold text-emerald-600">{stats?.recoveryRate || 0}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Pending Review Claims</span>
          <p className="text-3xl font-extrabold text-amber-600">{stats?.pendingClaims || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Campus Users</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</p>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Recent Verification Claims</h2>
        {claims.length === 0 ? (
          <p className="text-xs text-slate-400">No claims submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3">Item</th>
                  <th className="pb-3">Claimant</th>
                  <th className="pb-3">Proof Provided</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-900">{c.item?.title || c.item?.itemName}</td>
                    <td className="py-3">{c.claimant?.name} ({c.claimant?.email})</td>
                    <td className="py-3 max-w-xs truncate" title={c.proofDescription}>{c.proofDescription}</td>
                    <td className="py-3 capitalize">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 flex gap-2">
                      {c.status === 'submitted' || c.status === 'under_review' ? (
                        <>
                          <button
                            onClick={() => handleUpdateClaim(c._id, 'approved')}
                            className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold hover:bg-emerald-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateClaim(c._id, 'rejected')}
                            className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold hover:bg-rose-200"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
