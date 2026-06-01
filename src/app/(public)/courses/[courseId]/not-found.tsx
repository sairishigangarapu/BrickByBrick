import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Course Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8">
          This course may not exist or hasn't been published yet.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/courses">
            <Button variant="outline">Browse Courses</Button>
          </Link>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}