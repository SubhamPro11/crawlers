import type { Metadata, Viewport } from "next";
import { Newsreader, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import ToastNotification from "@/components/ToastNotification";
import BottomNav from "@/components/BottomNav";
import AssistantWidget from "@/components/AssistantWidget";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0F0E",
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crawlers.dpdns.org"),
  title: {
    default: "Crawlers — Find the Exact AI Tool for the Job by Use Case",
    template: "%s | Crawlers"
  },
  description: "Curated AI tools directory indexing 170+ categories and 1,400+ AI tools by use case. Search and find the exact AI tool for writing, design, audio, and developer workflows.",
  keywords: ["AI tools", "AI directory", "artificial intelligence bots", "use case search", "find AI platforms", "curated bots list", "AI tools directory"],
  alternates: {
    canonical: "https://crawlers.dpdns.org/",
  },
  openGraph: {
    title: "Crawlers — Find the Exact AI Tool for the Job by Use Case",
    description: "Curated AI tools directory indexing 170+ categories and 1,400+ AI tools by use case. Search and find the exact AI tool for writing, design, audio, and developer workflows.",
    url: "https://crawlers.dpdns.org",
    siteName: "Crawlers",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crawlers — Find the Exact AI Tool for the Job by Use Case",
    description: "Curated AI tools directory indexing 170+ categories and 1,400+ AI tools by use case. Search and find the exact AI tool for writing, design, audio, and developer workflows.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Crawlers",
    "url": "https://crawlers.dpdns.org",
    "logo": "https://crawlers.dpdns.org/globe.svg",
    "description": "Curated AI tools directory indexing 170+ categories and 1,400+ AI tools by use case."
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full bg-[#0D0F0E] antialiased dark overflow-x-hidden`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN}"}`}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#0D0F0E] text-[#EDEEEA] font-sans overflow-x-hidden pb-16 md:pb-0">
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <CommandPalette />
        <ToastNotification />
        <BottomNav />
        <AssistantWidget />
      </body>
    </html>
  );
}
