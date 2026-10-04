import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "START A PROJECT — Let's Work Together",
  description:
    "Tell us what you're looking to build, improve, or manage. We'll review your inquiry and get back to you directly.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "START A PROJECT — Let's Work Together | ÖTZI",
    description:
      "Tell us what you're looking to build, improve, or manage. We'll review your inquiry and get back to you directly.",
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
