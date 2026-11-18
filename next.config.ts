import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["cloudinary"],
  async redirects() {
    return [
      {
        source: "/case-studies",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/case-studies/case-study-01",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/case-studies/case-study-02",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/case-studies/case-study-03",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/case-studies/case-study-04",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/case-studies/case-study-05",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/case-studies/case-study-06",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/case-studies/:slug",
        destination: "/work/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
