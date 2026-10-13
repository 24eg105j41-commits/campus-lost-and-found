import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function BackendStatusBadge() {
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    dbConnected: false,
    details: null,
  });

  const checkHealth = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await API.get('/health');
      setStatus({
        loading: false,
        connected: true,
        dbConnected: res.data.database?.connected || false,
        details: res.data,
      });
    } catch (err) {
      setStatus({
        loading: false,
        connected: false,
        dbConnected: false,
        details: null,
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-white shadow-sm">
      <span className="text-slate-500 font-semibold">Backend API:</span>
      {status.loading ? (
        <span className="flex items-center gap-1 text-slate-500">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
          Checking...
        </span>
      ) : status.connected ? (
        <span className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Online
          <span className="text-slate-300">|</span>
          <span className={status.dbConnected ? "text-emerald-700" : "text-amber-600"}>
            MongoDB: {status.dbConnected ? "Connected" : "Waiting for connection"}
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-rose-600">
          <AlertCircle className="w-3.5 h-3.5" />
          Offline (Port 5000)
        </span>
      )}
      <button
        onClick={checkHealth}
        title="Refresh connection status"
        className="text-slate-400 hover:text-slate-600 transition-colors ml-1"
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
}
