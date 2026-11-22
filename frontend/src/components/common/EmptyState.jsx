import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  title = 'No data available',
  description = 'No records match the selected filter criteria or timeframe.',
  onAction = null,
  actionLabel = 'Reset Filters',
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm my-6">
      <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium text-xs rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
