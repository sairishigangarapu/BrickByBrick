'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: '/student-portal/dashboard', label: 'Home', icon: '🏠' },
  { href: '/courses', label: 'Catalog', icon: '📚' },
  { href: '/student-portal/announcements', label: 'News', icon: '📢' },
  { href: '/student-portal/profile', label: 'Profile', icon: '👤' },
];

export default function StudentLayoutClient({ children }: { children: React.ReactNode }) {
  // No sidebar at all - just render children directly
  return <>{children}</>;
}