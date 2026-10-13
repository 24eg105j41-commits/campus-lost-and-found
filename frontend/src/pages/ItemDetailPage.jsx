import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  Tag,
  Palette,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Building,
  Image as ImageIcon,
  Clock,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Books',
  'Clothing',
  'Accessories',
  'Keys',
  'Bags',
  'Other',
];

const STATUS_OPTIONS = ['Lost', 'Found', 'Potential Match', 'Claimed', 'Recovered', 'Closed'];

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    itemName: '',
    category: 'Electronics',
    description: '',
    location: '',
    date: '',
    color: '',
    status: 'Lost',
  });
  const [editFile, setEditFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/items/${id}`);
      if (res.data.success) {
        setItem(res.data.item);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Item report not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const isAuthor =
    user &&
    item &&
    item.user &&
    (user._id === item.user._id ||
      user.id === item.user._id ||
      user._id === item.user ||
      user.id === item.user ||
      user.role === 'admin');

  // Handle Edit form submission
  const handleOpenEdit = () => {
    setEditFormData({
      itemName: item.itemName,
      category: item.category,
      description: item.description,
      location: item.location,
      date: item.date ? new Date(item.date).toISOString().substring(0, 10) : '',
      color: item.color,
      status: item.status,
    });
    setEditFile(null);
    setEditPreviewUrl(item.image ? getImageUrl(item.image) : null);
    setShowEditModal(true);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append('itemName', editFormData.itemName);
      formData.append('category', editFormData.category);
      formData.append('description', editFormData.description);
      formData.append('location', editFormData.location);
      formData.append('date', editFormData.date);
      formData.append('color', editFormData.color);
      formData.append('status', editFormData.status);

      if (editFile) {
        formData.append('image', editFile);
      }

      const res = await API.put(`/items/${item._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setItem(res.data.item);
        setShowEditModal(false);
        setActionSuccess('Item report updated successfully!');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await API.delete(`/items/${item._id}`);
      if (res.data.success) {
        navigate(item.type === 'lost' ? '/lost-items' : '/found-items');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-3 border-campus-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">
          {error || 'Item Not Found'}
        </h2>
        <Link
          to="/lost-items"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-campus-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>
      </div>
    );
  }

  const isLost = item.type === 'lost';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={isLost ? '/lost-items' : '/found-items'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {isLost ? 'Lost Items' : 'Found Items'}
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left column: Image & Description */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Image display */}
            <div className="h-80 sm:h-96 bg-slate-100 relative flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img
                  src={getImageUrl(item.image)}
                  alt={item.itemName}
                  className="w-full h-full object-contain bg-slate-900/5"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                  <span className="text-sm font-medium">No photo uploaded</span>
                </div>
              )}

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md ${
                    isLost ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isLost ? 'Lost Item' : 'Found Item'}
                </span>
              </div>

              <span className="absolute top-4 right-4 px-3 py-1 rounded-xl text-xs font-semibold bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-200 shadow-md">
                Status: {item.status}
              </span>
            </div>

            {/* Details content */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-campus-600 flex items-center gap-1.5 mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  {item.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {item.itemName}
                </h1>
              </div>

              {/* Attributes badges */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                  <Palette className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">Color:</span> {item.color}
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">
                    {isLost ? 'Lost at:' : 'Found at:'}
                  </span>{' '}
                  {item.location}
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">Date:</span>{' '}
                  {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Item Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Timestamps */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Reported on {new Date(item.createdAt).toLocaleDateString()} at{' '}
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Author actions & Reporter info */}
        <div className="md:col-span-4 space-y-6">
          {/* Author actions (Security verified) */}
          {isAuthor && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Manage Your Report</h3>
              <p className="text-xs text-slate-500">
                As the reporter of this item, you have authorization to modify or remove this listing.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleOpenEdit}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-campus-50 hover:bg-campus-100 text-campus-700 text-xs font-semibold border border-campus-200 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Report
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Report
                </button>
              </div>
            </div>
          )}

          {/* Reporter details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reported By
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-campus-50 text-campus-600 flex items-center justify-center font-bold text-base">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">
                  {item.user?.name || 'Campus Member'}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {item.user?.role || 'Student'} • {item.user?.department || 'Campus Department'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              {item.user?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`mailto:${item.user.email}`}
                    className="text-campus-600 hover:underline font-medium"
                  >
                    {item.user.email}
                  </a>
                </div>
              )}
              {item.user?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">Edit Item Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.itemName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, itemName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-campus-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-campus-500"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.color}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Replace Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleEditFileChange}
                  className="text-xs"
                />
                {editPreviewUrl && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={editPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-campus-600 hover:bg-campus-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">Delete This Report?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete "{item.itemName}"? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
