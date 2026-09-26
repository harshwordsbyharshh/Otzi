<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# ÖTZI Production Project Rules

## Design Source of Truth

The approved ÖTZI visual system is documented in:

- `design/DESIGN.md`
- `design/screen.png`

Treat these files as the primary visual reference for the project.

`design/code.html` is reference material only. Do not use it as the production application code.

Do not invent a new visual direction when implementing the website.

## Brand

ÖTZI is a premium social media management and creative agency.

The visual language is:
- cinematic
- editorial
- minimal
- bold
- highly typographic
- asymmetric where appropriate
- black / white / hot-magenta
- strong hairlines and sharp geometry
- oversized typography
- recurring magenta arrow motif

## Strict Visual Constraints

Do NOT introduce:

- gradients
- gradient text
- glassmorphism
- excessive blur
- glow effects
- generic SaaS UI
- rounded-card-heavy layouts
- pill-shaped UI
- unnecessary shadows
- icon-in-circle grids
- stock-photo-style generic hero sections
- excessive decorative animation
- fake statistics
- fake client names
- fake performance results
- placeholder system/debug/hacker language in the final production UI

Use zero-radius or sharp geometry where specified by the design system.

## Typography

Typography must follow `design/DESIGN.md`.

Do not substitute arbitrary fonts or introduce a different typographic direction without explicit approval.

## Layout

Follow the spacing, grid, typography scale, breakpoints, media ratios, and component guidance defined in `design/DESIGN.md`.

The implementation must preserve the approved Stitch composition across desktop, tablet, and mobile.

Do not simply stack desktop sections vertically on mobile. Implement the intentional responsive layouts.

## Content

Stitch placeholder content is NOT production content.

Where Stitch contains placeholder project names, clients, metrics, dates, descriptions, or case-study results, structure the UI so these values can later come from Supabase.

Never invent real client information, statistics, results, or claims.

## Architecture

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Server Components by default
- Client Components only when interaction requires them
- Supabase for authentication, PostgreSQL, storage, and RLS

Keep the architecture production-ready and maintainable.

## Components

Prefer reusable components for repeated patterns such as:

- Header / navigation
- Buttons
- Arrow links
- Section headers
- Project tiles
- Content tiles
- Metadata rows
- Service rows
- Media blocks
- Forms
- Next-project navigation
- Footer

Do not create duplicated implementations of the same visual pattern unnecessarily.

## Motion

Motion should be restrained and purposeful.

Follow the motion guidance in `design/DESIGN.md`.

Respect `prefers-reduced-motion`.

Do not add unnecessary page transitions, parallax, bouncing, spring effects, or decorative animation.

## Media

Use the media ratios defined by the design system, including:

- 9:16
- 4:5
- 1:1
- 16:9

Optimize images and video for performance.

Do not use large unoptimized media as page-loading assets.

## Accessibility

Maintain:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- sufficient color contrast
- appropriate heading hierarchy
- accessible dialogs/forms
- reduced-motion support
- minimum 44px interactive targets

## Production Rule

Before making substantial architectural or visual changes, inspect the existing implementation and relevant design references first.

Do not replace working architecture merely for stylistic preference.

When uncertain about visual implementation, consult `design/DESIGN.md` and the approved Stitch references before inventing a solution.