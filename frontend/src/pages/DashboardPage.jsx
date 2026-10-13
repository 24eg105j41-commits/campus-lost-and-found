import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  Bell,
  PlusCircle,
  HelpCircle,
  MapPin,
  Calendar,
  AlertCircle,
  Tag,
  User,
  Shield,
  Phone,
  Building,
  CreditCard,
  Mail,
  Edit3,
  Save,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'claims' | 'notifications' | 'profile'
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    campusId: user?.campusId || '',
    department: user?.department || '',
    phone: user?.phone || '',
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(null);
  const [profileSaveError, setProfileSaveError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        campusId: user.campusId || '',
        department: user.department || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [itemsRes, claimsRes, notifRes] = await Promise.allSettled([
          API.get('/items/my-items'),
          API.get('/claims/my-claims'),
          API.get('/notifications'),
        ]);

        if (itemsRes.status === 'fulfilled' && itemsRes.value.data.success) {
          setMyItems(itemsRes.value.data.items);
        }
        if (claimsRes.status === 'fulfilled' && claimsRes.value.data.success) {
          setMyClaims(claimsRes.value.data.claims);
        }
        if (notifRes.status === 'fulfilled' && notifRes.value.data.success) {
          setNotifications(notifRes.value.data.notifications);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaveError(null);
    setProfileSaveSuccess(null);

    try {
      await updateProfile(profileData);
      setProfileSaveSuccess('Profile updated successfully!');
      setEditingProfile(false);
      setTimeout(() => setProfileSaveSuccess(null), 3000);
    } catch (err) {
      setProfileSaveError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Greeting Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-50 text-campus-700 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-campus-600" />
            Campus {user?.role || 'Member'} Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {user?.email} • {user?.department || 'General Campus'} {user?.campusId ? `(${user?.campusId})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/report-lost"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" /> Report Lost
          </Link>
          <Link
            to="/report-found"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Report Found
          </Link>
          <Link
            to="/my-reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" /> My Reports
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            My Reported Items
          </span>
          <p className="text-3xl font-extrabold text-slate-900">{myItems.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Submitted Claims
          </span>
          <p className="text-3xl font-extrabold text-campus-600">{myClaims.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recovered / Resolved
          </span>
          <p className="text-3xl font-extrabold text-emerald-600">
            {myItems.filter((i) => i.status === 'recovered').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Notifications
          </span>
          <p className="text-3xl font-extrabold text-slate-800">{notifications.length}</p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="border-b border-slate-200 flex flex-wrap gap-4 sm:gap-8">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'items'
              ? 'border-campus-600 text-campus-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Reported Items ({myItems.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'claims'
              ? 'border-campus-600 text-campus-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Ownership Claims ({myClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-campus-600 text-campus-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-campus-600 text-campus-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Profile & Settings
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'items' && (
          <div>
            {myItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-3">
                <p className="text-sm">You haven't reported any lost or found items yet.</p>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-campus-600 hover:underline"
                >
                  Create your first report →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          item.type === 'lost'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="font-semibold text-slate-600 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>{item.category}</span>
                      <span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div>
            {myClaims.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
                <p className="text-sm">You haven't submitted any ownership claims.</p>
                <p className="text-xs text-slate-400">
                  When you find a listed item that belongs to you, you can claim it by providing ownership proof.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myClaims.map((claim) => (
                  <div
                    key={claim._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Claim for: {claim.item?.title || 'Campus Item'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Proof submitted: {claim.proofDescription}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                      {claim.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
                No notifications right now.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3 shadow-sm"
                  >
                    <Bell className="w-5 h-5 text-campus-600 mt-0.5 shrink-0" />
                    <div>
                      <h5 className="font-semibold text-slate-900 text-sm">{n.title}</h5>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Details & Edit Panel */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">User Profile Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your personal and campus directory details.
                </p>
              </div>
              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-campus-300 text-xs font-semibold text-slate-700 hover:text-campus-600 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setEditingProfile(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>

            {profileSaveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSaveSuccess}</span>
              </div>
            )}

            {profileSaveError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileSaveError}</span>
              </div>
            )}

            {!editingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </span>
                  <p className="font-bold text-slate-900">{user?.name || 'Not provided'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Campus Email
                  </span>
                  <p className="font-bold text-slate-900">{user?.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Role on Campus
                  </span>
                  <p className="font-bold text-slate-900 capitalize">
                    {user?.role} {user?.role === 'admin' && '👑 (Full Admin Privileges)'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Campus ID / Roll Number
                  </span>
                  <p className="font-bold text-slate-900">{user?.campusId || 'Not provided'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Department / Program
                  </span>
                  <p className="font-bold text-slate-900">{user?.department || 'Not provided'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Contact Phone
                  </span>
                  <p className="font-bold text-slate-900">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Campus ID / Roll Number
                    </label>
                    <input
                      type="text"
                      value={profileData.campusId}
                      onChange={(e) => setProfileData({ ...profileData, campusId: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Department / Program
                    </label>
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-campus-600 hover:bg-campus-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
