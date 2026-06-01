import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Show, UserButton } from "@clerk/nextjs";

import { ourFileRouter } from "./api/uploadthing/core";
import "@uploadthing/react/styles.css";
import "./globals.css";

const jost = Jost({ 
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "BrickByBrick - LMS",
  description: "A functional, minimalist educational platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Detect lesson player route server-side — no client flash
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
  const isLessonPage = /\/student-portal\/learn\/[^/]+\/[^/]+/.test(pathname);

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${jost.variable} antialiased text-black bg-white font-sans`} suppressHydrationWarning>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          {!isLessonPage && (
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-50">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="/icon.png" alt="BrickByBrick Logo" width={32} height={32} className="w-8 h-8" />
                  <span className="font-bold text-lg">BrickByBrick</span>
                </Link>
                <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
                  <Link href="/courses" className="hover:text-orange-600">Catalog</Link>
                  <Link href="/contact" className="hover:text-orange-600">Contact</Link>
                  {userId && (
                    <>
                      <Link href="/student-portal/dashboard" className="hover:text-orange-600">Dashboard</Link>
                      <Link href="/student-portal/announcements" className="hover:text-orange-600">Announcements</Link>
                      <Link href="/student-portal/profile" className="hover:text-orange-600">Profile</Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="font-bold hover:text-orange-600">Admin</Link>
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
          <main className={isLessonPage ? 'h-screen overflow-hidden' : ''}>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
