import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function requireAdmin(): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized. Please sign in again.');
  }

  const user = await currentUser();
  if (user?.publicMetadata?.role !== 'admin') {
    throw new Error('Forbidden. Admin access required.');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.');
  }
}
