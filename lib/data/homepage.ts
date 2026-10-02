import { Discipline, SelectedProject } from "@/types/homepage";

export const disciplinesData: Discipline[] = [
  {
    id: "discipline-01",
    number: "01",
    title: "SOCIAL MEDIA STRATEGY",
    description:
      "Strategic direction, platform positioning, and publishing cadence across social channels.",
    scope:
      "Formulating foundational social channel architecture, editorial calendars, community interaction rules, and high-velocity distribution strategies.",
    deliverables: ["PLATFORM STRATEGY", "PUBLISHING CADENCE", "CONTENT PLANNING"],
    platforms: ["INSTAGRAM", "TIKTOK", "YOUTUBE", "X / TWITTER"],
    methodology: [
      "Audience topography and platform positioning analysis",
      "Editorial pillar definition and content cadence scheduling",
      "Brand voice parameterization for real-time engagement",
      "Continuous performance audit against verified conversion telemetry",
    ],
  },
  {
    id: "discipline-02",
    number: "02",
    title: "CONTENT",
    description:
      "Editorial asset production, multi-slide carousels, and visual suites tailored for digital platforms.",
    scope:
      "High-craft asset creation designed specifically for modern feeds—from multi-frame editorial carousels to textured still suites.",
    deliverables: ["EDITORIAL CAROUSELS", "STILL ASSETS", "SERIES PRODUCTION"],
    platforms: ["INSTAGRAM", "TIKTOK", "ARE.NA", "DIGITAL"],
    methodology: [
      "Frame-by-frame narrative sequencing for swipe engagement",
      "High-contrast color calibration for OLED mobile displays",
      "Sharp typographic hierarchy adapted to native UI overlays",
      "Modular design systems for scalable recurring episodic series",
    ],
  },
  {
    id: "discipline-03",
    number: "03",
    title: "CREATIVE",
    description:
      "Art direction, visual identity development, and campaign concepts tailored for brand presence.",
    scope:
      "Distinctive conceptual frameworks and bold aesthetic direction that establish cultural authority in saturated digital feeds.",
    deliverables: ["ART DIRECTION", "VISUAL IDENTITY", "CAMPAIGN CONCEPTS"],
    platforms: ["MULTI-PLATFORM", "DIGITAL", "PRINT / EDITORIAL"],
    methodology: [
      "Zero-fluff brutalist visual development and graphic styling",
      "Monolithic typography design and spatial grid calibration",
      "Audio-visual mood curation and aesthetic guidelines",
      "Campaign concepting for targeted culture-defining launches",
    ],
  },
  {
    id: "discipline-04",
    number: "04",
    title: "DIGITAL",
    description:
      "Platform-specific activations, digital asset rollouts, and cross-channel brand consistency.",
    scope:
      "End-to-end asset preparation and digital infrastructure ensuring flawless presentation across every screen resolution and aspect ratio.",
    deliverables: ["PLATFORM ACTIVATIONS", "DIGITAL ASSETS", "CHANNEL INTEGRATION"],
    platforms: ["WEB", "INSTAGRAM", "TIKTOK", "YOUTUBE"],
    methodology: [
      "Native format optimization across 9:16, 4:5, 1:1, and 16:9 ratios",
      "Responsive typography and interactive digital touchpoints",
      "Asset bundling and compression without visual fidelity loss",
      "Cross-channel coherence mapping across all brand surfaces",
    ],
  },
  {
    id: "discipline-05",
    number: "05",
    title: "DISTRIBUTION",
    description:
      "Content rollout scheduling, format-specific sequencing, and multi-channel deployment.",
    scope:
      "Systematic release architecture ensuring assets reach target communities at the optimal moment of cultural attention.",
    deliverables: ["DEPLOYMENT PLANNING", "FORMAT SEQUENCING", "CHANNEL ROLLOUT"],
    platforms: ["MULTI-CHANNEL", "PAID SOCIAL", "EARNED EDITORIAL"],
    methodology: [
      "Algorithmic rhythm modeling and peak attention scheduling",
      "Multi-stage asset release sequencing (teaser, drop, sustained suite)",
      "Coordinated cross-platform simultaneous broadcast execution",
      "Post-launch qualitative feedback synthesis",
    ],
  },
];

export const selectedProjectsData: SelectedProject[] = [
  {
    id: "project-01",
    slug: "case-study-01",
    title: "VERTICAL REEL PRODUCTION 01",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "REEL",
    aspectRatio: "9:16",
    platform: "INSTAGRAM",
    discipline: "SOCIAL MEDIA STRATEGY",
    synopsis: "Vertical 9:16 video production and dynamic motion.",
    summary:
      "[PROJECT SUMMARY] A high-impact vertical video production engineered for 9:16 mobile feeds. Features sharp cutting, rapid kinetic typography, and calibrated contrast to command immediate screen authority.",
    context:
      "Designed as a hero vertical asset for social distribution. Built to solve initial hook retention within the first 1.5 seconds through asymmetric motion and immediate visual friction.",
    execution:
      "Captured and graded specifically for edge-to-edge mobile viewing. Integrated typographic framing, zero-radius graphic lower-thirds, and synchronized micro-audio cues.",
    deliverables: [
      "9:16 MASTER VIDEO CUT",
      "VARIABLE LENGTH SOCIAL CUTDOWNS",
      "SOUND DESIGN SUITE",
      "KEY VISUAL FRAME STILLS",
    ],
    mediaSequence: [
      {
        id: "media-01-a",
        caption: "Hero Vertical Cut — 9:16 Full Screen",
        aspectRatio: "9:16",
        assetType: "REEL",
      },
      {
        id: "media-01-b",
        caption: "Motion Detail Frame — 1:1 Still",
        aspectRatio: "1:1",
        assetType: "POST",
      },
      {
        id: "media-01-c",
        caption: "Narrative Breakdown — 4:5 Overview",
        aspectRatio: "4:5",
        assetType: "CAROUSEL",
      },
    ],
  },
  {
    id: "project-02",
    slug: "case-study-02",
    title: "EDITORIAL CAROUSEL SUITE 02",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "CAROUSEL",
    aspectRatio: "4:5",
    platform: "INSTAGRAM",
    slidesCount: 6,
    discipline: "CONTENT",
    synopsis: "Multi-slide editorial carousel publication.",
    summary:
      "[PROJECT SUMMARY] A 6-frame sequential editorial carousel structured like a mini-monograph. Leverages continuous horizontal layout transitions to maximize swipe-through completion.",
    context:
      "Created to present complex brand narratives in an accessible, highly tactile swipeable format that feels like flipping through an independent editorial art book.",
    execution:
      "Engineered continuous bleed graphics across cards 1 through 6, using high-contrast black backgrounds and white typographic hierarchy with subtle crimson interaction hints.",
    deliverables: [
      "6-SLIDE 4:5 CAROUSEL SUITE",
      "COVER VARIANT TESTING MATRICES",
      "STORIES ADAPTATION FRAMES",
      "EDITORIAL COPY SPECIFICATION",
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
        caption: "Interior Spread 02-03 — 4:5 Dual Slide",
        aspectRatio: "4:5",
        assetType: "CAROUSEL",
      },
      {
        id: "media-02-c",
        caption: "Concluding Manifesto Slide — 1:1 Static",
        aspectRatio: "1:1",
        assetType: "POST",
      },
    ],
  },
  {
    id: "project-03",
    slug: "case-study-03",
    title: "SQUARE VISUAL COMPOSITION 03",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "POST",
    aspectRatio: "1:1",
    platform: "TIKTOK",
    discipline: "CREATIVE",
    synopsis: "Square format still asset and visual composition.",
    summary:
      "[PROJECT SUMMARY] A high-precision 1:1 visual asset built on sharp architectural geometry and dense typographic framing, serving as a pillar anchor post across grid layouts.",
    context:
      "Constructed to anchor brand grid layouts with undeniable typographic gravity, balancing negative pitch-black space against dense technical metadata.",
    execution:
      "Monolithic headline placement, razor-thin hairline grid dividers, and zero-radius boundaries calibrated for clean compression across platform CDN delivery pipelines.",
    deliverables: [
      "1:1 HIGH-RESOLUTION GRID STILLS",
      "TYPOGRAPHIC POSTER SUITE",
      "METADATA OVERLAY TEMPLATES",
      "EXPORT OPTIMIZATIONS",
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
    title: "NARRATIVE FILM CUT 04",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "SHORT FILM",
    aspectRatio: "16:9",
    platform: "DIGITAL",
    discipline: "DIGITAL",
    synopsis: "Widescreen narrative video and campaign film production.",
    summary:
      "[PROJECT SUMMARY] A widescreen 16:9 cinematic piece emphasizing restrained pacing, dramatic lighting, and deep structural sound design for high-conviction digital brand presence.",
    context:
      "Developed as the flagship narrative centerpiece for digital and web deployment, communicating agency conviction and premium brand craftsmanship.",
    execution:
      "Shot in ultra-high resolution with hard contrast monochrome grading, rhythmic editorial cuts, and minimal clean typography.",
    deliverables: [
      "16:9 4K CINEMATIC MASTER",
      "9:16 VERTICAL SOCIAL TRAILERS",
      "WEB OPTIMIZED STREAMING ASSETS",
      "PRESS FRAME PACK",
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
        caption: "Editorial Print Still — 4:5 Monograph",
        aspectRatio: "4:5",
        assetType: "POST",
      },
    ],
  },
  {
    id: "project-05",
    slug: "case-study-05",
    title: "DYNAMIC MOTION INFRASTRUCTURE 05",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "REEL",
    aspectRatio: "9:16",
    platform: "TIKTOK",
    discipline: "DISTRIBUTION",
    synopsis: "High-cadence vertical motion graphics and typography system.",
    summary:
      "[PROJECT SUMMARY] A modular motion identity system designed for rapid-turnaround vertical social assets without sacrifice of editorial standards or craft precision.",
    context:
      "Engineered to facilitate daily high-frequency publishing while strictly maintaining premium brutalist brand guidelines across multi-creator workflows.",
    execution:
      "Pre-rendered motion design components, locked typeface scales, and automated layout guidelines ensuring zero-radius brand fidelity.",
    deliverables: [
      "MODULAR MOTION GRAPHICS TEMPLATES",
      "NATIVE OVERLAY GUIDELINES",
      "AUDIO SYNC CADENCE SPECIFICATION",
      "RAPID PRODUCTION ASSET KIT",
    ],
    mediaSequence: [
      {
        id: "media-05-a",
        caption: "Dynamic Motion Reel — 9:16",
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
    title: "CROSS-PLATFORM CAMPAIGN 06",
    client: "CLIENT NAME",
    year: "2026",
    assetType: "SHORT FILM",
    aspectRatio: "16:9",
    platform: "YOUTUBE",
    discipline: "SOCIAL MEDIA STRATEGY",
    synopsis: "Multi-channel coordinated broadcast and platform rollout.",
    summary:
      "[PROJECT SUMMARY] A synchronized multi-channel content campaign deploying targeted creative cuts across YouTube, Instagram, and digital surfaces simultaneously.",
    context:
      "Built for full-funnel cultural impact, combining long-form documentary storytelling with aggressive short-form vertical cutdowns.",
    execution:
      "Hierarchical deployment schedule with teaser trailers, full cinematic premiere, and sustained carousel breakdowns.",
    deliverables: [
      "MULTI-CHANNEL BROADCAST MASTER",
      "EPISODIC CONTENT SUITE",
      "PLATFORM METRIC TRACKING MATRIX",
      "CAMPAIGN ROLLOUT SPECIFICATION",
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
