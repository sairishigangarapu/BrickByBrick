import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-600 mb-3">404</p>
        <h1 className="text-4xl md:text-5xl font-black mb-3 text-zinc-900">Page not found</h1>
        <p className="text-zinc-600 mb-8 max-w-md mx-auto">
          The page you were looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-black text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Home className="w-4 h-4" /> Back to home
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 border border-zinc-300 text-zinc-800 font-bold rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <Search className="w-4 h-4" /> Browse marketplace
          </Link>
        </div>

        <p className="text-xs text-zinc-500 mt-8">
          Need help?{' '}
          <Link href="/contact" className="text-orange-600 font-bold hover:underline inline-flex items-center gap-1">
            Contact us <ArrowLeft className="w-3 h-3 rotate-180" />
          </Link>
        </p>
      </div>
    </div>
  );
}
