import { Discipline, SelectedProject } from "@/types/homepage";

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

export const selectedProjectsData: SelectedProject[] = [
  {
    id: "project-01",
    slug: "case-study-01",
    title: "SOCIAL FILM 01",
    client: "STUDIO PRODUCTION",
    year: "2026",
    assetType: "REEL",
    aspectRatio: "9:16",
    platform: "INSTAGRAM",
    discipline: "SOCIAL MEDIA MANAGEMENT",
    synopsis: "Vertical 9:16 video production and short-form motion.",
    summary:
      "A vertical video production crafted for 9:16 mobile feeds, featuring sharp cuts and focused visual direction.",
    context:
      "Designed as a vertical asset for social distribution, structured for clarity and engagement across mobile feeds.",
    execution:
      "Captured and graded specifically for mobile viewing with clear typographic framing and disciplined sound design.",
    deliverables: [
      "9:16 MASTER VIDEO CUT",
      "SOCIAL CUTDOWNS",
      "AUDIO DESIGN",
      "KEY VISUAL STILLS",
    ],
    mediaSequence: [
      {
        id: "media-01-a",
        caption: "Vertical Cut — 9:16 Full Screen",
        aspectRatio: "9:16",
        assetType: "REEL",
      },
      {
        id: "media-01-b",
        caption: "Detail Frame — 1:1 Still",
        aspectRatio: "1:1",
        assetType: "POST",
      },
      {
        id: "media-01-c",
        caption: "Composition — 4:5 Overview",
        aspectRatio: "4:5",
        assetType: "CAROUSEL",
      },
    ],
  },
  {
    id: "project-02",
    slug: "case-study-02",
    title: "EDITORIAL SERIES 02",
    client: "STUDIO PRODUCTION",
    year: "2026",
    assetType: "CAROUSEL",
    aspectRatio: "4:5",
    platform: "INSTAGRAM",
    slidesCount: 6,
    discipline: "CONTENT PLANNING",
    synopsis: "Multi-slide editorial carousel publication.",
    summary:
      "A 6-frame sequential editorial carousel designed for swipeable storytelling with consistent typography.",
    context:
      "Created to present brand narratives in an accessible, structured format across social feeds.",
    execution:
      "Designed with high-contrast compositions and disciplined typography across each frame.",
    deliverables: [
      "6-SLIDE 4:5 CAROUSEL SUITE",
      "COVER VARIANTS",
      "STORIES ADAPTATIONS",
      "EDITORIAL GUIDELINES",
    ],
    mediaSequence: [
      {
        id: "media-02-a",
        caption: "Carousel Cover Frame — 4:5 Editorial",
        aspectRatio: "4:5",
        assetType: "CAROUSEL",
      },
      {
        id: "media-02-b",
        caption: "Interior Spread — 4:5 Slide",
        aspectRatio: "4:5",
        assetType: "CAROUSEL",
      },
      {
        id: "media-02-c",
        caption: "Concluding Slide — 1:1 Static",
        aspectRatio: "1:1",
        assetType: "POST",
      },
    ],
  },
  {
    id: "project-03",
    slug: "case-study-03",
    title: "CAMPAIGN STUDY 03",
    client: "STUDIO PRODUCTION",
    year: "2026",
    assetType: "POST",
    aspectRatio: "1:1",
    platform: "INSTAGRAM",
    discipline: "CREATIVE PRODUCTION",
    synopsis: "Square format still asset and visual composition.",
    summary:
      "A high-precision 1:1 visual asset built on sharp geometry and disciplined typography.",
    context:
      "Constructed to anchor brand feed layouts with clear typographic hierarchy and balanced contrast.",
    execution:
      "Clean layout placement and sharp grid boundaries calibrated for social feeds.",
    deliverables: [
      "1:1 HIGH-RESOLUTION GRID STILLS",
      "TYPOGRAPHIC ASSET SUITE",
      "LAYOUT TEMPLATES",
      "OPTIMIZED EXPORTS",
    ],
    mediaSequence: [
      {
        id: "media-03-a",
        caption: "Primary Grid Anchor — 1:1 Still",
        aspectRatio: "1:1",
        assetType: "POST",
      },
      {
        id: "media-03-b",
        caption: "Vertical Adaptation — 9:16 Teaser",
        aspectRatio: "9:16",
        assetType: "REEL",
      },
    ],
  },
  {
    id: "project-04",
    slug: "case-study-04",
    title: "BRAND FILM 04",
    client: "STUDIO PRODUCTION",
    year: "2026",
    assetType: "SHORT FILM",
    aspectRatio: "16:9",
    platform: "DIGITAL",
    discipline: "CREATIVE PRODUCTION",
    synopsis: "Widescreen narrative video and brand film production.",
    summary:
      "A widescreen 16:9 cinematic piece emphasizing restrained pacing and purposeful sound design.",
    context:
      "Developed as a narrative piece communicating brand clarity and creative craft.",
    execution:
      "Shot in high resolution with disciplined grading, rhythmic editorial cuts, and minimal clean typography.",
    deliverables: [
      "16:9 CINEMATIC MASTER",
      "9:16 VERTICAL TEASERS",
      "WEB-OPTIMIZED ASSETS",
      "STILL PACK",
    ],
    mediaSequence: [
      {
        id: "media-04-a",
        caption: "Widescreen Master — 16:9 Cinematic",
        aspectRatio: "16:9",
        assetType: "SHORT FILM",
      },
      {
        id: "media-04-b",
        caption: "Social Teaser Frame — 9:16 Vertical",
        aspectRatio: "9:16",
        assetType: "REEL",
      },
      {
        id: "media-04-c",
        caption: "Print Still — 4:5 Composition",
        aspectRatio: "4:5",
        assetType: "POST",
      },
    ],
  },
  {
    id: "project-05",
    slug: "case-study-05",
    title: "MOTION SERIES 05",
    client: "STUDIO PRODUCTION",
    year: "2026",
    assetType: "REEL",
    aspectRatio: "9:16",
    platform: "INSTAGRAM",
    discipline: "CONTENT PUBLISHING",
    synopsis: "Vertical motion graphics and typography series.",
    summary:
      "A motion design series created for vertical social formats with clean typography and consistent pacing.",
    context:
      "Designed to support regular social publishing with clear brand consistency.",
    execution:
      "Clean motion components, refined type hierarchy, and precise pacing.",
    deliverables: [
      "VERTICAL MOTION TEMPLATES",
      "OVERLAY GUIDELINES",
      "AUDIO TIMING SPECS",
      "PRODUCTION ASSET KIT",
    ],
    mediaSequence: [
      {
        id: "media-05-a",
        caption: "Motion Reel — 9:16",
        aspectRatio: "9:16",
        assetType: "REEL",
      },
      {
        id: "media-05-b",
        caption: "Format Grid Still — 1:1",
        aspectRatio: "1:1",
        assetType: "POST",
      },
    ],
  },
  {
    id: "project-06",
    slug: "case-study-06",
    title: "CAMPAIGN 06",
    client: "STUDIO PRODUCTION",
    year: "2026",
    assetType: "SHORT FILM",
    aspectRatio: "16:9",
    platform: "YOUTUBE",
    discipline: "PAID AD MANAGEMENT",
    synopsis: "Multi-channel coordinated content rollout.",
    summary:
      "A coordinated content campaign with targeted creative cuts across platforms.",
    context:
      "Built for clear brand presence across video and social feeds.",
    execution:
      "Structured delivery schedule with teaser cuts, long-form assets, and supporting carousel pieces.",
    deliverables: [
      "CAMPAIGN MASTER CUTS",
      "SOCIAL CUTDOWN SUITE",
      "CAROUSEL RECAPS",
      "RELEASE SCHEDULE",
    ],
    mediaSequence: [
      {
        id: "media-06-a",
        caption: "Campaign Flagship — 16:9",
        aspectRatio: "16:9",
        assetType: "SHORT FILM",
      },
      {
        id: "media-06-b",
        caption: "Story Cutdown — 9:16",
        aspectRatio: "9:16",
        assetType: "REEL",
      },
      {
        id: "media-06-c",
        caption: "Carousel Recap — 4:5",
        aspectRatio: "4:5",
        assetType: "CAROUSEL",
      },
    ],
  },
];

export function getAllProjects(): SelectedProject[] {
  return selectedProjectsData;
}

export function getProjectBySlug(slug: string): SelectedProject | undefined {
  return selectedProjectsData.find((p) => p.slug === slug);
}

export function getAllDisciplines(): Discipline[] {
  return disciplinesData;
}

export function getDisciplineById(id: string): Discipline | undefined {
  return disciplinesData.find((d) => d.id === id);
}
