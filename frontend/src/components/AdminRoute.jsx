import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * AdminRoute component: Ensures only users with role === 'admin' can access the route.
 * Redirects unauthenticated visitors to /login, and displays a 403 screen for non-admin members.
 */
export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-campus-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Verifying administrative permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Access Denied (403)</h2>
        <p className="text-sm text-slate-600">
          This section is restricted to campus administrators. Your account (<span className="font-semibold text-slate-800">{user.email}</span>) is registered as a <span className="font-semibold capitalize text-campus-700">{user.role}</span>.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
