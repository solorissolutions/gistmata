import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { cookies } from "next/headers";

import { ServiceWorkerRegistration } from "@/components/app-shell/service-worker-registration";
import { ThemeProvider } from "@/components/app-shell/theme-provider";
import { normalizeTheme, THEME_COOKIE_NAME } from "@/lib/theme";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  display: "swap",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "GistMata",
  description: "Anonymous, hyperlocal Mata for text-first gist across Nigeria.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "GistMata",
    description: "Anonymous, hyperlocal Mata for text-first gist across Nigeria.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "GistMata",
    description: "Anonymous, hyperlocal Mata for text-first gist across Nigeria.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const dataTheme = normalizeTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}
      data-theme={dataTheme}
      style={{ colorScheme: dataTheme }}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider initialTheme={dataTheme}>
          <ServiceWorkerRegistration />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
