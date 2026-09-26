---
name: Radical Monolithic Editorial
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#e2bdc7'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#a98892'
  outline-variant: '#5a3f48'
  surface-tint: '#ffb0ca'
  primary: '#ffb0ca'
  on-primary: '#640035'
  primary-container: '#ff479b'
  on-primary-container: '#58002e'
  inverse-primary: '#b90067'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c7c6c6'
  on-tertiary: '#2f3131'
  tertiary-container: '#909191'
  on-tertiary-container: '#292a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9e3'
  primary-fixed-dim: '#ffb0ca'
  on-primary-fixed: '#3e001f'
  on-primary-fixed-variant: '#8d004e'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 88px
    fontWeight: '800'
    lineHeight: 84px
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 58px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-mono:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.12em
  label-action:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
  space-3xl: 6rem
---

## Brand & Style

This design system embodies an unapologetic, high-contrast editorial brutalism tailored for culture-defining social media and creative production. The aesthetic prioritizes absolute precision, tension, and structural honesty over decorative softness. It rejects generic tech conventions—no ambient glows, no rounded corners, no frosted glass, and no gradient fills. 

The visual experience evokes the tactile authority of an oversized independent fashion monograph combined with the velocity of an avant-garde digital feed. Space is treated architecturally: structured purely by hairline boundaries, dense typography, and vast planes of pitch black.

Key stylistic imperatives:
- **Zero-Tolerance Rounding:** Every element resolves into sharp, 90-degree perimeters.
- **Controlled Friction:** Intentional mechanical precision that commands focused attention.
- **Measured Energy:** Sparing use of high-voltage color to direct gaze without visual pollution.

## Colors

The palette operates under strict hierarchical discipline to maintain an authoritative dark-first canvas. 

- **Canvas (`--ink`, `#000000`):** Pure pitch black. Used as the absolute background ground plane for all viewports.
- **High-Contrast Text (`--paper`, `#FFFFFF`):** Maximum contrast white for high-priority headlines, key statistics, and primary interactive states.
- **Secondary Text (`--paper-dim`, `#A3A3A3`):** Neutral gray for body narrative, metadata, descriptions, and supporting structures.
- **Hairlines (`--line-hairline`, `#262626`):** Structural grid rules, column separators, and card boundaries.
- **Control Boundaries (`--line-control`, `#6B6B6B`):** Interactive element perimeters, inactive input borders, and wayfinding arrows.
- **Neutral Surface (`--surface-dim`, `#141414`):** Raw, honest container fill for media placeholders, skeleton states, and component wells.
- **Accent Magenta (`--m1`, `#FF2D95`):** Hot, unyielding magenta. Strictly governed by an absolute visual surface budget under 5%. Reserved solely for active state indicators, critical CTAs, cursor states, and selected tags. It must never be applied to headlines, background washes, drop-shadows, or gradients.

## Typography

Typography establishes tension through contrast between wide, mechanical display cuts and dense, functional grotesque body weights.

- **Display & Headlines:** Set in Space Grotesk (utilized for its expanded, geometric impact) with weights calibrated to ExtraBold (800) and Bold (700). Letter-spacing is aggressively pulled tight to lock words into sculptural units. Headline uppercase is applied selectively for manifestos and categorization.
- **Body & Text Elements:** Set in Hanken Grotesk across regular and medium weights. Line heights remain generous to ensure effortless scanability across technical narratives and campaign briefs.
- **Technical Labels & Badges:** Rendered in small-scale, tracked-out Hanken Grotesk Bold (`label-mono`) with forced uppercase.

## Layout & Spacing

The system prioritizes a mobile-first 390px viewport baseline, expanding responsively into high-density desktop grid layouts. 

- **Grid Architecture:** 
  - Mobile (390px): 4 columns, 16px margins, 16px gutters.
  - Tablet (768px): 8 columns, 24px margins, 20px gutters.
  - Desktop (1440px+): 12 columns, 40px margins, 24px gutters, max structural container 1680px.
- **Structural Rhythm:** Spacing is defined strictly along clean 4px multiples. Component blocks snap edge-to-edge against 1px hairline dividers (`#262626`) rather than floating loosely with variable margins. Whitespace is architectural—used in large structural intervals (`space-2xl`, `space-3xl`) to create pacing between agency cases and editorial sections.

## Elevation & Depth

Elevation is achieved purely through structural layering, border density, and high-contrast plane shifts. Traditional drop shadows, multi-tier blur matrices, and ambient glows are strictly prohibited.

- **Planar Depth:** Depth is binary. Surfaces either share the canvas plane (`#000000`) or recess into structural wells (`#141414`).
- **Boundaries as Hierarchy:**
  - Standard structural partitions use 1px hairlines (`#262626`).
  - Active, focused, or hoverable structural segments elevate by stepping boundary weights from `#262626` to control white (`#FFFFFF`) or control gray (`#6B6B6B`).
- **Z-Index Layering (Modal/Flyout):** Floating elements (drawers, overlay navigation) inherit a solid `#000000` ground with a continuous 1px `#FFFFFF` outline, cutting directly through the underlying canvas without blurred backdrops.

## Shapes

The geometric signature is absolute square-cut construction:
- **Radius Value:** `0px` across every UI element, container, popover, button, media mask, and checkbox.
- **Graphic Elements:** Lines, arrows, and tags terminate with hard 90-degree corners.
- **Wayfinding:** Wayfinding relies exclusively on razor-thin monoline arrows (stroke: 1.5px, 90° or 45° angled arrowheads, unfilleted joinery).

## Components

### Buttons
- **Primary CTA:** Solid `#FFFFFF` fill with `#000000` text, 0px radius, 16px vertical by 24px horizontal padding, accompanied by a right-facing monoline arrow (`→`). Hover state: background transforms to hot magenta (`#FF2D95`) with `#FFFFFF` text.
- **Secondary CTA:** Pure `#000000` fill, 1px `#6B6B6B` border, `#FFFFFF` text. Hover state: border color switches to `#FFFFFF`.
- **Ghost Action:** Text only in `#FFFFFF` with monoline arrow trailing; borderless; underline appears on hover as a 1px solid rule.

### Chips & Badges
- **Status/Category Chip:** Rectangular container, 0px radius, 1px `#262626` outline, `#000000` background. Text is uppercase `label-mono` in `#A3A3A3`.
- **Selected Tag:** 1px `#FF2D95` border, `#000000` background, `#FF2D95` text. No rounded pill geometry.

### Cards
- Zero-radius panels bordered by a 1px `#262626` hairline. 
- Media wells within cards utilize `#141414` placeholder grounds with centered aspect-ratio labels or technical crosshair markings. 
- Imagery never bleeds with soft vignettes; cards snap cleanly into the column grid.

### Input Fields & Controls
- **Text Inputs:** Solid `#000000` background, 1px `#6B6B6B` bottom or full-box border, 0px radius. Placeholder copy in `#A3A3A3`. Active/Focus state: 1px `#FFFFFF` border with a stationary 2px `#FF2D95` indicator notch in the upper-right corner.
- **Checkboxes:** 18x18px square, 1px `#6B6B6B` border, `#000000` background. Checked state: solid `#FF2D95` fill with a sharp, inverted black checkmark.
- **Radio Buttons:** 18x18px square (no circles), 1px `#6B6B6B` border. Selected state: solid 8x8px `#FF2D95` square centered within.

### Lists & Tables
- Divided horizontally by 1px `#262626` rules.
- Row hover triggers an instantaneous change of the row's background to `#141414` alongside an active monoline arrow sliding in from the left margin.

### Media Placeholders
- Honest `#141414` fill with ultra-subtle corner crosshairs rendered in `#262626`.
- Strictly no stock photography, mock gradients, or shimmer waves; loading states utilize stepped, monospaced text indicators (e.g., `LOAD // 084%`).