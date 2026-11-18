import { Discipline } from "@/types/homepage";

export const disciplinesData: Discipline[] = [
  {
    id: "discipline-01",
    number: "01",
    title: "SOCIAL MEDIA MANAGEMENT & MARKETING",
    description:
      "We manage your social presence with consistent content, publishing, and day-to-day platform management.",
    scope:
      "Developing social media strategy, planning editorial calendars, publishing content, and managing day-to-day platform activity.",
    deliverables: ["SOCIAL MEDIA MANAGEMENT", "CONTENT PLANNING", "CONTENT PUBLISHING"],
    platforms: ["INSTAGRAM", "YOUTUBE", "X"],
    methodology: [
      "Audience and platform positioning review",
      "Content pillar definition and publishing scheduling",
      "Brand voice guidelines for community engagement",
      "Ongoing performance monitoring and reporting",
    ],
  },
  {
    id: "discipline-02",
    number: "02",
    title: "AI AGENTS",
    subServices: ["AI ASSISTANTS", "AI RECEPTIONISTS", "WORKFLOW AUTOMATION"],
    description:
      "We build AI-powered agents that help businesses automate communication and repetitive workflows.",
    scope:
      "Building and deploying AI assistants and conversational receptionists to handle customer communication and workflows.",
    deliverables: ["AI ASSISTANTS", "AI RECEPTIONISTS", "WORKFLOW AUTOMATION"],
    platforms: ["WEB", "AUTOMATION", "WORKFLOWS"],
    methodology: [
      "Knowledge base structuring and prompt design",
      "Workflow routing and task automation setup",
      "Testing, verification, and fallback protocols",
      "Ongoing accuracy monitoring and refinement",
    ],
  },
  {
    id: "discipline-03",
    number: "03",
    title: "PAID AD MANAGEMENT",
    description:
      "We manage paid advertising campaigns across the platforms that matter to your business — from campaign setup to ongoing optimisation.",
    scope:
      "Structuring paid advertising campaigns, testing creative assets, defining target audiences, and managing ad spend.",
    deliverables: ["CAMPAIGN SETUP", "AD MANAGEMENT", "CREATIVE TESTING", "PERFORMANCE REPORTING"],
    platforms: ["META ADS", "GOOGLE ADS", "X ADS"],
    methodology: [
      "Campaign setup and audience segmentation",
      "Creative asset testing and iteration",
      "Bid management and budget monitoring",
      "Performance reporting and ongoing optimisation",
    ],
  },
  {
    id: "discipline-04",
    number: "04",
    title: "GOOGLE BUSINESS PROFILE MANAGEMENT",
    description:
      "We keep your Google Business Profile accurate, active, and easier for local customers to discover.",
    scope:
      "Profile setup, regular updates, photo management, and local search discoverability.",
    deliverables: ["PROFILE OPTIMISATION", "PROFILE MANAGEMENT", "LOCAL VISIBILITY"],
    platforms: ["GOOGLE MAPS", "GOOGLE SEARCH"],
    methodology: [
      "Complete profile verification and category alignment",
      "Regular business updates, photos, and post scheduling",
      "Review response workflows and reputation monitoring",
      "Local search visibility review",
    ],
  },
  {
    id: "discipline-05",
    number: "05",
    title: "SEO MANAGEMENT",
    subDescription: "SEARCH ENGINE OPTIMISATION",
    description:
      "We improve your website's visibility in search through ongoing SEO management and optimisation.",
    scope:
      "Technical site audits, on-page optimization, search intent research, and search visibility improvements.",
    deliverables: ["SEO MANAGEMENT", "TECHNICAL SEO", "ON-PAGE OPTIMISATION", "SEARCH OPTIMISATION"],
    platforms: ["GOOGLE SEARCH", "ORGANIC SEARCH"],
    methodology: [
      "Technical site health and Core Web Vitals review",
      "Keyword research and search intent mapping",
      "On-page structure, content, and metadata optimisation",
      "Search visibility tracking and reporting",
    ],
  },
];

export function getAllDisciplines(): Discipline[] {
  return disciplinesData;
}

export function getDisciplineById(id: string): Discipline | undefined {
  return disciplinesData.find((d) => d.id === id);
}
