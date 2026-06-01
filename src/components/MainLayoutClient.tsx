'use client';

// Kept minimal — header is now rendered server-side in layout.tsx
// This component is no longer needed but kept for any future client-side layout needs
export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
