'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import StudentLayoutClient from './StudentLayoutClient';

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}