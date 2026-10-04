import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "START A PROJECT — Direct Brand Inquiries",
  description:
    "Engage ÖTZI for selective brand commissions, ongoing social ecosystem management, dynamic motion infrastructure, and creative production.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "START A PROJECT — Direct Brand Inquiries | ÖTZI",
    description:
      "Engage ÖTZI for selective brand commissions, ongoing social ecosystem management, dynamic motion infrastructure, and creative production.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
