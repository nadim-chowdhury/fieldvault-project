'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [details, setDetails] = useState(false);

  useEffect(() => {
    console.error('[FieldVault] Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm mb-6">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        {error?.message && (
          <div className="mt-6">
            <button
              onClick={() => setDetails(!details)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {details ? 'Hide details' : 'Show error details'}
            </button>
            {details && (
              <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-left text-slate-600 overflow-auto max-h-40 border border-slate-100">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
