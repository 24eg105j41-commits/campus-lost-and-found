import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  PlusCircle,
  HelpCircle,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 group">
            <div className="w-10 h-10 rounded-xl bg-campus-600 text-white flex items-center justify-center shadow-md shadow-campus-200 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-campus-700 tracking-tight">Campus</span>{' '}
              <span className="text-slate-800">Lost & Found</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/lost-items"
              className="text-sm font-medium text-slate-600 hover:text-campus-600 transition-colors"
            >
              Browse Lost
            </Link>
            <Link
              to="/found-items"
              className="text-sm font-medium text-slate-600 hover:text-campus-600 transition-colors"
            >
              Browse Found
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/my-reports"
                  className="text-sm font-medium text-slate-600 hover:text-campus-600 transition-colors flex items-center gap-1"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  My Reports
                </Link>
                <Link
                  to="/matches"
                  className="text-sm font-medium text-slate-600 hover:text-campus-600 transition-colors flex items-center gap-1"
                >
                  Matches
                </Link>
              </>
            )}

            <div className="flex items-center gap-2 pl-2">
              <Link
                to="/report-lost"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Report Lost
              </Link>
              <Link
                to="/report-found"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report Found
              </Link>
            </div>
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-campus-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-campus-300 transition-all"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>{user?.name || 'Dashboard'}</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-campus-600 px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link
            to="/lost-items"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-campus-600"
          >
            Browse Lost Items
          </Link>
          <Link
            to="/found-items"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-campus-600"
          >
            Browse Found Items
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-campus-600"
              >
                My Reports
              </Link>
              <Link
                to="/matches"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-campus-600"
              >
                Matches
              </Link>
            </>
          )}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Link
              to="/report-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 px-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200"
            >
              Report Lost
            </Link>
            <Link
              to="/report-found"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 px-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200"
            >
              Report Found
            </Link>
          </div>
          <hr className="border-slate-100" />
          {isAuthenticated ? (
            <div className="space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700"
              >
                Dashboard ({user?.name})
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-amber-700"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left py-2 text-base font-medium text-rose-600"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 px-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 px-3 bg-campus-600 text-white rounded-lg text-sm font-medium hover:bg-campus-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
