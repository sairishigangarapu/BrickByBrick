'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  
  if (!userId) redirect('/sign-in');

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}