'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const mainNavLinks = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/student-portal/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/courses', label: 'Catalog', icon: '📚' },
  { href: '/student-portal/announcements', label: 'News', icon: '📢' },
  { href: '/student-portal/profile', label: 'Profile', icon: '👤' },
];

const adminNavLinks = [
  { href: '/admin', label: 'Admin', icon: '⚙️' },
];

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded && userId) {
      const role = localStorage.getItem('userRole');
      setIsAdmin(role === 'admin');
    }
  }, [isLoaded, userId]);

  const visibleLinks = [...mainNavLinks];
  if (isAdmin) {
    visibleLinks.push(...adminNavLinks);
  }

  return (
    <div className="flex min-h-screen bg-brand-surface">
      <div className="w-full">
        {children}
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-2 z-30">
        {visibleLinks.map(link => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`text-xs text-center p-1 ${pathname === link.href || (link.href === '/' && pathname === '/') ? 'text-brand-primary' : 'text-gray-500'}`}
          >
            <div className="text-lg">{link.icon}</div>
            <div className="text-[10px] truncate">{link.label}</div>
          </Link>
        ))}
      </nav>
    </div>
  );
}