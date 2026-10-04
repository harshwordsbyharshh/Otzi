import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getPublishedProjects } from "@/lib/supabase/projects";
import { getAllProjects } from "@/lib/data/homepage";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const currentDate = new Date();

  // 1. Static Public Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // 2. Published Projects Dynamic Routes (from Supabase / fallback)
  let publishedProjectRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedProjects = await getPublishedProjects();
    publishedProjectRoutes = publishedProjects.map((p) => ({
      url: `${baseUrl}/work/${p.slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    publishedProjectRoutes = [];
  }

  // 3. Editorial Case Studies Dynamic Routes
  let caseStudyRoutes: MetadataRoute.Sitemap = [];
  try {
    const caseStudies = getAllProjects();
    caseStudyRoutes = caseStudies.map((cs) => ({
      url: `${baseUrl}/case-studies/${cs.slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    caseStudyRoutes = [];
  }

  return [...staticRoutes, ...publishedProjectRoutes, ...caseStudyRoutes];
}
