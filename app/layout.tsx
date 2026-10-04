import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { getSiteUrl } from "@/lib/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ÖTZI — Social Media Management & Creative Production",
    template: "%s | ÖTZI",
  },
  description:
    "ÖTZI is a social media management and creative production agency. We provide strategic direction, content creation, and multi-format campaign execution for brands.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ÖTZI — Social Media Management & Creative Production",
    description:
      "ÖTZI is a social media management and creative production agency. We provide strategic direction, content creation, and multi-format campaign execution for brands.",
    siteName: "ÖTZI",
    locale: "en_US",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "ÖTZI — Social Media Management & Creative Production",
    description:
      "ÖTZI is a social media management and creative production agency. We provide strategic direction, content creation, and multi-format campaign execution for brands.",
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
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-primary selection:text-white font-body-md text-body-md">
        <Header />
        <main className="w-full pt-[72px] flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
