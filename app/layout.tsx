import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/layout/Providers";
import UserProvider from "@/components/layout/UserProvider";
import ThemeScript from "@/components/layout/ThemeScript";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WorldWildlifeWatch - Live Wildlife Streaming Platform",
  description: "Experience wildlife around the world through live camera streams. Subscribe to support wildlife conservation and lodge owners.",
  keywords: ["wildlife", "live streaming", "nature", "safari", "wildlife cameras", "conservation"],
  authors: [{ name: "WorldWildlifeWatch" }],
  openGraph: {
    title: "WorldWildlifeWatch - Live Wildlife Streaming Platform",
    description: "Experience wildlife around the world through live camera streams",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // User will be fetched client-side via Firebase auth listener
  const user = null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          <UserProvider initialUser={user}>
            <HeaderWrapper initialUser={user} />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
