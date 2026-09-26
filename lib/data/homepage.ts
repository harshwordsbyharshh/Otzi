import { Discipline, SelectedProject } from "@/types/homepage";

export const disciplinesData: Discipline[] = [
  {
    id: "discipline-01",
    number: "01",
    title: "SOCIAL MEDIA STRATEGY",
    description:
      "Strategic direction, platform positioning, and publishing cadence across social channels.",
    deliverables: ["PLATFORM STRATEGY", "PUBLISHING CADENCE", "CONTENT PLANNING"],
  },
  {
    id: "discipline-02",
    number: "02",
    title: "CONTENT",
    description:
      "Editorial asset production, multi-slide carousels, and visual suites tailored for digital platforms.",
    deliverables: ["EDITORIAL CAROUSELS", "STILL ASSETS", "SERIES PRODUCTION"],
  },
  {
    id: "discipline-03",
    number: "03",
    title: "CREATIVE",
    description:
      "Art direction, visual identity development, and campaign concepts tailored for brand presence.",
    deliverables: ["ART DIRECTION", "VISUAL IDENTITY", "CAMPAIGN CONCEPTS"],
  },
  {
    id: "discipline-04",
    number: "04",
    title: "DIGITAL",
    description:
      "Platform-specific activations, digital asset rollouts, and cross-channel brand consistency.",
    deliverables: ["PLATFORM ACTIVATIONS", "DIGITAL ASSETS", "CHANNEL INTEGRATION"],
  },
  {
    id: "discipline-05",
    number: "05",
    title: "DISTRIBUTION",
    description:
      "Content rollout scheduling, format-specific sequencing, and multi-channel deployment.",
    deliverables: ["DEPLOYMENT PLANNING", "FORMAT SEQUENCING", "CHANNEL ROLLOUT"],
  },
];

export const selectedProjectsData: SelectedProject[] = [
  {
    id: "project-01",
    slug: "case-study-01",
    title: "PROJECT TITLE",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "REEL",
    aspectRatio: "9:16",
    platform: "INSTAGRAM",
    synopsis: "Vertical 9:16 video production and dynamic motion.",
  },
  {
    id: "project-02",
    slug: "case-study-02",
    title: "PROJECT TITLE",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "CAROUSEL",
    aspectRatio: "4:5",
    platform: "INSTAGRAM",
    slidesCount: 6,
    synopsis: "Multi-slide editorial carousel publication.",
  },
  {
    id: "project-03",
    slug: "case-study-03",
    title: "PROJECT TITLE",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "POST",
    aspectRatio: "1:1",
    platform: "TIKTOK",
    synopsis: "Square format still asset and visual composition.",
  },
  {
    id: "project-04",
    slug: "case-study-04",
    title: "PROJECT TITLE",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "SHORT FILM",
    aspectRatio: "16:9",
    platform: "DIGITAL",
    synopsis: "Widescreen narrative video and campaign film production.",
  },
];
