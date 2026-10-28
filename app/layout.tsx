import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Cairo } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0E0A07",
};

export const metadata: Metadata = {
  title: "FLATEL HOSPITALITY — The comfort of a flat. The service of a hotel.",
  description:
    "Flatel Hospitality Private Limited — The comfort of a flat. The service of a hotel. Furnished apartments and residences in Hyderabad.",
};

import { AuthProvider } from "@/context/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { RtlSync } from "@/components/ui/rtl-sync";
import { FloatingContact } from "@/components/floating-contact";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${cormorantGaramond.variable} ${cairo.variable} overflow-x-clip dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-clip bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <AuthProvider>
          <RtlSync />
          {children}
          <FloatingContact />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
