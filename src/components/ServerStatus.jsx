import React from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { useApiHealth } from '../hooks/useApiHealth';

export default function ServerStatus() {
  const { isHealthy, isChecking, isServerDown } = useApiHealth();

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
        <Activity size={14} className="animate-pulse" />
        <span>Server tekshirilmoqda...</span>
      </div>
    );
  }

  if (isServerDown) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
        <AlertCircle size={14} />
        <span>Server ishlamayapti</span>
      </div>
    );
  }

  if (isHealthy) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
        <CheckCircle size={14} />
        <span>Server faol</span>
      </div>
    );
  }

  return null;
}

// Smaller version for headers
export function SmallServerStatus() {
  const { isHealthy, isChecking, isServerDown } = useApiHealth();

  if (isChecking) {
    return <Activity size={16} className="text-slate-400 animate-pulse" />;
  }

  if (isServerDown) {
    return <AlertCircle size={16} className="text-red-500" />;
  }

  if (isHealthy) {
    return <CheckCircle size={16} className="text-green-500" />;
  }

  return null;
}
