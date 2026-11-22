import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading analytics data...', subtext = 'Fetching from backend API' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] w-full">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">{message}</p>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-5 mb-6`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-36 mt-4"></div>
          <div className="h-3 bg-slate-100 rounded w-20 mt-3"></div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton = ({ height = 'h-80' }) => {
  return (
    <div className={`bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm animate-pulse ${height} flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-slate-200 rounded w-48"></div>
        <div className="h-4 bg-slate-100 rounded w-24"></div>
      </div>
      <div className="w-full flex-1 bg-slate-50 rounded-lg flex items-end p-4 gap-4">
        <div className="h-1/3 w-full bg-slate-200/60 rounded"></div>
        <div className="h-2/3 w-full bg-slate-200/60 rounded"></div>
        <div className="h-1/2 w-full bg-slate-200/60 rounded"></div>
        <div className="h-4/5 w-full bg-slate-200/60 rounded"></div>
        <div className="h-3/5 w-full bg-slate-200/60 rounded"></div>
        <div className="h-5/6 w-full bg-slate-200/60 rounded"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
