import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Gistmata — Knowledge Through Exploration",
    template: "%s — Gistmata",
  },
  description:
    "A knowledge publication exploring AI-assisted hacking, personal transformation, and emerging intelligence systems.",
  openGraph: {
    title: "Gistmata",
    description:
      "A knowledge publication exploring AI-assisted hacking, personal transformation, and emerging intelligence systems.",
    siteName: "Gistmata",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gistmata",
    description:
      "A knowledge publication exploring AI-assisted hacking, personal transformation, and emerging intelligence systems.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://gistmata.com"),
  alternates: {
    types: {
      "application/rss+xml": "https://gistmata.com/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Gistmata RSS Feed"
          href="/feed.xml"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <OrganizationSchema />
        <WebSiteSchema />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
