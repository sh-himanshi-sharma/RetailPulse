import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({
  title = 'Failed to load data',
  message = 'An error occurred while communicating with the analytics server.',
  error = null,
  onRetry = null,
}) => {
  const errorDetails = error?.response?.data?.detail || error?.message;

  return (
    <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-6 my-6 max-w-2xl mx-auto shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-rose-100 text-rose-600 rounded-lg flex-shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-rose-900">{title}</h3>
          <p className="mt-1 text-sm text-rose-700 leading-relaxed">{message}</p>

          {errorDetails && (
            <div className="mt-3 p-2.5 bg-white/80 rounded border border-rose-200/60 font-mono text-xs text-rose-800 break-all">
              {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Request
              </button>
            )}
            <span className="text-xs text-rose-600">
              Ensure backend server is running at <code className="bg-rose-100 px-1 py-0.5 rounded">http://127.0.0.1:8001</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
