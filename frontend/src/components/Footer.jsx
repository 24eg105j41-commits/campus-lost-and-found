import React from 'react';
import { Compass, Heart, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Compass className="w-5 h-5 text-campus-600" />
            <span>Campus Lost & Found System</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Campus Recovery Network
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Built with care for students, faculty & staff</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
