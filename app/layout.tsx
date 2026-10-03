import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";

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

export const metadata: Metadata = {
  title: "ÖTZI — Social Media Management & Creative Production",
  description:
    "ÖTZI is a premium social media management and creative agency engineered for cultural velocity and cross-platform narrative coherence.",
  metadataBase: new URL("https://otzi.studio"),
  openGraph: {
    title: "ÖTZI — Social Media Management & Creative Production",
    description:
      "ÖTZI is a premium social media management and creative agency engineered for cultural velocity and cross-platform narrative coherence.",
    siteName: "ÖTZI",
    locale: "en_US",
    type: "website",
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
