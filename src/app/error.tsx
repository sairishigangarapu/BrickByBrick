'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600 mb-3">
          Something went wrong
        </p>
        <h1 className="text-3xl md:text-4xl font-black mb-3 text-zinc-900">
          An unexpected error occurred
        </h1>
        <p className="text-zinc-600 mb-8 max-w-md mx-auto text-sm">
          We have been notified. You can try again, or head back to the home page.
        </p>

        {error.digest && (
          <p className="text-xs text-zinc-400 mb-6 font-mono">Reference: {error.digest}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center h-12 px-6 bg-black text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 border border-zinc-300 text-zinc-800 font-bold rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
