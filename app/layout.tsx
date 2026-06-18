import type { Metadata } from "next";
import { aachen, cinzel, libreFranklin, anton, fraunces, jetbrainsMono } from "./fonts";
import { GrainOverlay } from "@/components/grain-overlay";
import { ThemeProvider } from "@/components/theme-provider";
import { CheckoutProvider } from "@/components/checkout/checkout-context";
import { PersistentValance } from "@/components/persistent-valance";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CursorField } from "@/components/motion/cursor-field";
import "./globals.css";

// Absolute base for OG/Twitter image URLs so link scrapers (iMessage, etc.)
// resolve /opengraph-image.jpg. Prefers the same canonical URL the checkout
// flow uses, then Vercel's production domain at build time, then localhost.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3007");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Scope Screenings — Seattle's Underground Film Festival",
  description:
    "We put the fun back in film fests. A live, monthly short-film festival uplifting Black, brown, and tan creators in Seattle.",
};

// Runs before paint: sets html[data-theme] from localStorage (default Movie Mode)
// so there's no flash of the wrong mode. OS preference is intentionally ignored.
const themeScript = `(function(){try{var t=localStorage.getItem('scope-theme');if(t!=='house'&&t!=='movie')t='movie';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='movie';}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${aachen.variable} ${cinzel.variable} ${libreFranklin.variable} ${anton.variable} ${fraunces.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-bg text-fg">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <CursorField />
          <GrainOverlay />
          <PersistentValance />
          <SiteNav />
          <CheckoutProvider>{children}</CheckoutProvider>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
