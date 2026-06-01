'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/courses', label: 'Courses', icon: '📚' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { href: '/admin/contact', label: 'Contact', icon: '✉️' },
  { href: '/admin/certificates', label: 'Certificates', icon: '📜' },
  // Student portal links
  { href: '/student-portal/dashboard', label: 'My Learning', icon: '🎓' },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-surface">
      <aside className="w-64 border-r border-gray-200 bg-white p-6 flex flex-col gap-4 hidden lg:flex fixed h-full z-10">
        <Link href="/admin" className="flex items-center gap-3 mb-6">
          <Image src="/icon.png" alt="BrickByBrick Logo" width={40} height={40} className="w-10 h-10" />
        </Link>
        {navLinks.map(link => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`font-medium hover:text-brand-primary transition-colors ${pathname === link.href ? 'text-brand-primary' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </aside>

      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200 flex items-center gap-2"
        aria-label="Toggle menu"
      >
        <Image src="/icon.png" alt="Logo" width={20} height={20} className="w-5 h-5" />
        <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
      </button>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-14 overflow-auto">
          <div className="p-4 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 py-3" onClick={() => setMenuOpen(false)}>
              <Image src="/icon.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
              <span className="font-bold">BrickByBrick</span>
            </Link>
            <div className="border-t my-2"></div>
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  pathname === link.href ? 'bg-brand-primary text-white' : 'hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <main className="lg:pl-64 flex-1 p-4 md:p-8 overflow-auto pb-24 lg:pb-8">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-2 z-30">
        {navLinks.slice(0, 4).map(link => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`text-xs text-center p-1 ${pathname === link.href ? 'text-brand-primary' : 'text-gray-500'}`}
          >
            <div className="text-lg">{link.icon}</div>
            <div className="text-[10px] truncate">{link.label}</div>
          </Link>
        ))}
      </nav>
    </div>
  );
}