import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { ourFileRouter } from "./api/uploadthing/core";
import "@uploadthing/react/styles.css";
import "./globals.css";
import MainLayoutClient from "@/components/MainLayoutClient";

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
  
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${jost.variable} antialiased text-black bg-white font-sans`} suppressHydrationWarning>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <MainLayoutClient userId={userId} isAdmin={isAdmin}>
            {children}
          </MainLayoutClient>
        </body>
      </html>
    </ClerkProvider>
  );
}
