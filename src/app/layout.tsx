import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";

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
    default: "Crawlers - Find AI Tools By Use Case",
    template: "%s | Crawlers"
  },
  description: "Curated directory indexing 150+ categories of AI tools. Search by use case and find exact solutions for writing, design, audio, and developer workflows.",
  keywords: ["AI tools", "AI directory", "artificial intelligence bots", "use case search", "find AI platforms", "curated bots list"],
  openGraph: {
    title: "Crawlers - Find AI Tools By Use Case",
    description: "Curated directory indexing 150+ categories of AI tools. Search by use case and find exact solutions for writing, design, audio, and developer workflows.",
    url: "https://crawlers.dpdns.org",
    siteName: "Crawlers",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crawlers - Find AI Tools By Use Case",
    description: "Curated directory indexing 150+ categories of AI tools. Search by use case and find exact solutions for writing, design, audio, and developer workflows.",
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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0D0F0E] text-[#EDEEEA] font-sans">
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <CommandPalette />
      </body>
    </html>
  );
}
