import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

import { ourFileRouter } from "./api/uploadthing/core";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DisclaimerPopup } from "@/components/ui/DisclaimerPopup";
import { CookieConsent } from "@/components/ui/CookieConsent";

const jost = Jost({ 
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "WelNex - Alternative Investment Marketplace",
  description: "India's Marketplace for Alternative Investments",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userId: string | null = null;
  let isAdmin = false;
  let isProvider = false;
  let userRole: string = 'user';
  let userMetadata: any = null;
  let user: any = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    user = await currentUser();
    if (user?.publicMetadata?.role) {
      userRole = user.publicMetadata.role;
      isAdmin = userRole === 'admin';
      isProvider = userRole === 'investment_provider';
    }
  } catch {
    // Not signed in - safe defaults
  }

  // Detect lesson player route server-side — no client flash
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
  const isLessonPage = /\/student-portal\/learn\/[^/]+\/[^/]+/.test(pathname);

  // Navigation: signed-in users always get the public app routes; admins and
  // providers additionally get their role-specific routes on top.
  const navItems: { href: string; label: string }[] = [];
  if (userId) {
    navItems.push(
      { href: '/marketplace', label: 'Marketplace' },
      { href: '/discover', label: 'Discover' },
      { href: '/learning-hub', label: 'Learning Hub' },
      { href: '/calculators', label: 'Calculators' },
    );
    if (isAdmin) navItems.push({ href: '/admin', label: 'Admin' });
    if (isProvider) navItems.push({ href: '/investment-provider', label: 'My Listings' });
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${jost.variable} antialiased text-black bg-white font-sans`} suppressHydrationWarning>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <DisclaimerPopup />
          <CookieConsent />
          {!isLessonPage && (
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-50">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                  <img src="/icon.png" alt="WelNex Logo" width={32} height={32} className="w-8 h-8" />
                  <span className="font-bold text-lg">WelNex</span>
                </Link>
                <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
                  {navItems.map((item, index) => (
                    <Link key={index} href={item.href} className="hover:text-orange-600">
                      {item.label}
                    </Link>
                  ))}
                  {userId && (
                    <>
                      <Link href="/student-portal/dashboard" className="hover:text-orange-600">Dashboard</Link>
                      <Link href="/student-portal/announcements" className="hover:text-orange-600">Announcements</Link>
                      <Link href="/student-portal/profile" className="hover:text-orange-600">Profile</Link>
                    </>
                  )}
                </nav>
              </div>
              <div className="flex gap-2 items-center">
                <Show when="signed-out">
                  <Link href="/sign-in" className="px-3 py-1.5 text-xs font-bold uppercase border border-gray-200 hover:bg-gray-100">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="px-3 py-1.5 text-xs font-bold uppercase bg-black text-white hover:bg-gray-800">
                    Sign Up
                  </Link>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
          )}
          <main>
            {children}
          </main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}