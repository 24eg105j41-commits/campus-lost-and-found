import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API, { getImageUrl } from '../services/api';
import {
  FileText,
  MapPin,
  Calendar,
  Tag,
  Trash2,
  Edit3,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
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

export default function MyReportsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
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

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/items/my-reports');
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load my reports:', err);
      setError('Could not load your reports. Please check that you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
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
    setError(null);

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

      const res = await API.put(`/items/${editingItem._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setActionSuccess('Report updated successfully!');
        setEditingItem(null);
        fetchMyReports();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item report.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await API.delete(`/items/${id}`);
      if (res.data.success) {
        setActionSuccess('Report deleted successfully.');
        setDeletingId(null);
        fetchMyReports();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all lost and found items you have reported across campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/report-lost"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" /> Report Lost
          </Link>
          <Link
            to="/report-found"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Report Found
          </Link>
        </div>
      </div>

      {/* Success banner */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-campus-600" />
          <p className="text-sm">Loading your reported items...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">You haven't reported any items yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Have you misplaced something or found a student's belonging? File a report now.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/report-lost"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Report Found Item
            </Link>
          </div>
        </div>
      ) : (
        /* Table of Reports */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Image</th>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Image */}
                    <td className="py-3.5 px-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.itemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                    </td>

                    {/* Item Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                      <Link
                        to={`/items/${item._id}`}
                        className="hover:text-campus-600 transition-colors line-clamp-1"
                      >
                        {item.itemName}
                      </Link>
                      <div className="text-xs font-normal text-slate-400 mt-0.5">
                        Color: {item.color}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          item.type === 'lost'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.category}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/items/${item._id}`}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Report"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-campus-600 hover:bg-campus-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingId(item._id)}
                          title="Delete Report"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">
                Edit {editingItem.type === 'lost' ? 'Lost' : 'Found'} Report
              </h3>
              <button
                onClick={() => setEditingItem(null)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-campus-500"
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
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-campus-500"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.color}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, color: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
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
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
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
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
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
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500"
                />
              </div>

              {/* Photo change */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Update Photo (Optional)
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
                  {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">Delete Report?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this report? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
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
