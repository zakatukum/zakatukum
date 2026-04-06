# Design System: Zakatukum

## 1. Visual Theme & Atmosphere

Zakatukum is an Islamic financial tool that balances spiritual reverence with modern fintech precision. The page opens on a clean white canvas (`#ffffff`) with deep forest green headings (`#0d3f14`) and a rich emerald accent (`#1B5E20`) that anchors the entire system. This isn't the flat green of a utility app; it's a deep, botanical green that evokes Islamic geometric art, trust, and growth — the color of the Prophet's banner translated into digital craft.

The typography is built on `Inter` — a geometric sans-serif designed for screens, with variable weight support and excellent multilingual coverage including Arabic, Urdu, and Bengali scripts. `Noto Naskh Arabic` serves as the Arabic companion, maintaining calligraphic authenticity. At display sizes (48px-64px), Inter runs at weight 800 with tight negative letter-spacing (-0.02em), creating dense, authoritative headlines that command respect. At body sizes, weight 400 provides comfortable readability.

What distinguishes Zakatukum is its green-tinted shadow system, inspired by Stripe's chromatic depth approach. The signature shadow `rgba(27,94,32,0.15)` paired with `rgba(0,0,0,0.06)` creates shadows with an organic, botanical depth — as if elements are floating above a garden. This green-tinted elevation ties every shadow to the brand identity.

**Key Characteristics:**
- Inter variable font with tight tracking at display sizes (-0.02em at 64px)
- Weight 800 for headlines, 600 for subheadings, 400 for body — clear weight hierarchy
- Green-tinted multi-layer shadows using `rgba(27,94,32,0.15)` — botanical elevation
- Deep forest green (`#0d3f14`) for headings instead of black — warm, Islamic, premium
- Conservative border-radius (8px-16px) — modern but not playful
- Noto Naskh Arabic for Arabic/RTL text — calligraphic authenticity
- Gold (`#D4A843`) as accent — referencing Islamic art and gold/silver nisab

## 2. Color Palette & Roles

### Primary
- **Forest Green** (`#0d3f14`): Primary heading color. Ultra-dark green that replaces black throughout.
- **Islamic Green** (`#1B5E20`): Primary brand color, CTA backgrounds, active states, nav accents. The anchor of the entire system.
- **Medium Green** (`#2E7D32`): Secondary brand, gradients, hover states.
- **Light Green** (`#388E3C`): Tertiary brand, gradient endpoints.
- **Pure White** (`#ffffff`): Page background, card surfaces, button text on green backgrounds.

### Accent
- **Gold** (`#D4A843`): Star ratings, premium indicators, gold nisab references. Used sparingly as a luxury signal.
- **Gold Dark** (`#B8860B`): Gold accent hover, text on light gold surfaces.
- **Gold Light** (`#FFF8E1`): Gold-tinted surface for rating cards, nisab indicators.

### Semantic
- **Error Red** (`#C62828`): Error states, bug badges, destructive actions.
- **Error Light** (`#FFEBEE`): Error surface background.
- **Warning Orange** (`#E65100`): Warnings, fee notices, attention items.
- **Warning Light** (`#FFF3E0`): Warning surface background.
- **Info Blue** (`#1565C0`): Info badges, feature request tags, links to external content.
- **Info Light** (`#E3F2FD`): Info surface background.
- **Purple** (`#7B1FA2`): Investment/finance category accents.

### Neutral Scale
- **Heading** (`#0d3f14`): All headings — deep forest green, never black.
- **Body** (`#333333`): Primary body text.
- **Secondary** (`#555555`): Secondary text, descriptions.
- **Muted** (`#888888`): Captions, timestamps, metadata.
- **Placeholder** (`#999999`): Input placeholders, disabled text.
- **Border** (`#e0e0e0`): Standard borders for cards, dividers.
- **Border Light** (`#e8efe8`): Green-tinted light border for cards in green-themed sections.
- **Surface** (`#f8faf8`): Alternating section background — slightly green-tinted off-white.
- **Surface Dark** (`#f0f4f0`): Deeper alternating section background.

### Green Tints (for surfaces and highlights)
- **Green 50** (`#e8f5e9`): Lightest green surface — selected states, success hints.
- **Green 100** (`#c8e6c9`): Light green for borders, tag backgrounds.
- **Green 200** (`#a5d6a7`): Chart accents, progress bars.
- **Green 300** (`#81c784`): Secondary chart colors.
- **Green 800** (`#2E7D32`): Dark green for gradient mid-points.
- **Green 900** (`#1B5E20`): Primary brand green.
- **Green 950** (`#0d3f14`): Ultra-dark heading green.

### Shadow Colors
- **Shadow Green** (`rgba(27,94,32,0.15)`): Signature — green-tinted primary shadow.
- **Shadow Black** (`rgba(0,0,0,0.06)`): Secondary shadow layer for depth reinforcement.
- **Shadow Deep** (`rgba(13,63,20,0.20)`): Elevated elements, modals.
- **Shadow Ambient** (`rgba(27,94,32,0.08)`): Subtle ambient shadow for light lift.

## 3. Typography Rules

### Font Families
- **Primary**: `Inter`, with fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Arabic**: `"Noto Naskh Arabic"`, with fallback: `"Traditional Arabic", serif`
- **Monospace**: `"JetBrains Mono", "Source Code Pro", monospace`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Inter | 64px (4.00rem) | 800 | 1.1 | -0.02em | Maximum impact, tight leading |
| Display Secondary | Inter | 48px (3.00rem) | 800 | 1.15 | -0.015em | Secondary hero text, accent color |
| Section Heading | Inter | 36px (2.25rem) | 800 | 1.2 | -0.01em | Section titles |
| Card Heading | Inter | 32px (2.00rem) | 800 | 1.2 | -0.01em | CTA section titles |
| Sub-heading | Inter | 20px (1.25rem) | 700 | 1.3 | normal | Feature titles, step labels |
| Card Title | Inter | 18px (1.13rem) | 700 | 1.3 | normal | Feature card titles, nav headings |
| Body Large | Inter | 17px (1.06rem) | 400 | 1.6 | normal | Section descriptions, intro text |
| Body | Inter | 15px (0.94rem) | 400 | 1.6 | normal | Standard body text |
| Body Small | Inter | 14px (0.88rem) | 400-500 | 1.5 | normal | Form labels, nav links |
| Caption | Inter | 13px (0.81rem) | 500-600 | 1.4 | normal | Metadata, badges, timestamps |
| Micro | Inter | 12px (0.75rem) | 500 | 1.3 | 0.02em | Fine print, footer links |
| Arabic Display | Noto Naskh Arabic | 36px | 400 | 1.4 | normal | Arabic headlines |
| Arabic Body | Noto Naskh Arabic | 16px | 400 | 1.6 | normal | Arabic text |

### Principles
- **Weight as hierarchy**: 800 for display/headings, 700 for sub-headings, 600 for labels, 500 for buttons, 400 for body. Clear weight progression creates visual order.
- **Tight display tracking**: -0.02em at 64px, progressively relaxing to normal at 16px and below.
- **clamp() for fluid scaling**: Hero uses `clamp(36px, 6vw, 64px)` for smooth responsive behavior.
- **Arabic respect**: Noto Naskh Arabic is never mixed inline with Inter — Arabic text gets its own blocks with appropriate `dir="rtl"` and increased line-height (1.4-1.6).
- **No decorative fonts**: Every typeface serves function. No script fonts, no novelty faces.

## 4. Component Stylings

### Buttons

**Primary Green**
- Background: `linear-gradient(135deg, #1B5E20, #2E7D32)`
- Text: `#ffffff`
- Padding: 14px 36px
- Radius: 12px
- Font: 16px Inter weight 700
- Shadow: `0 4px 24px rgba(27,94,32,0.3)`
- Hover: shadow intensifies to `0 6px 28px rgba(27,94,32,0.4)`, slight translateY(-1px)
- Use: Primary CTA ("Start Calculating", "Create Free Account")

**Primary White**
- Background: `#ffffff`
- Text: `#1B5E20`
- Padding: 14px 36px
- Radius: 12px
- Font: 16px Inter weight 700
- Shadow: `0 4px 24px rgba(0,0,0,0.15)`
- Hover: translateY(-1px), shadow deepens
- Use: Primary CTA on dark/green backgrounds

**Secondary / Ghost**
- Background: `rgba(255,255,255,0.1)` or transparent
- Text: `#ffffff` or `#1B5E20`
- Padding: 14px 36px
- Radius: 12px
- Border: `1px solid rgba(255,255,255,0.25)` or `1px solid #1B5E20`
- Backdrop-filter: `blur(8px)` (on dark backgrounds)
- Use: Secondary CTA next to primary

**Tag / Chip**
- Background: `#e8f5e9` or `#f0f7f0`
- Text: `#1B5E20` or `#2E7D32`
- Padding: 8px 16px
- Radius: 8px
- Border: `1px solid #c8e6c9`
- Font: 14px Inter weight 500
- Use: Language tags, madhab pills, category filters

### Cards & Containers
- Background: `#ffffff`
- Border: `1px solid #e8efe8` (green-tinted) or `1px solid #e0e0e0` (neutral)
- Radius: 16px
- Shadow: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Hover: shadow upgrades to `0 4px 16px rgba(27,94,32,0.12), 0 2px 4px rgba(0,0,0,0.06)`
- Padding: 24px-28px
- Transition: `transform 0.2s ease, box-shadow 0.2s ease`

### Badges / Status Pills
**Category Badge**
- Background: varies by category (see Semantic colors)
- Text: corresponding dark semantic color
- Padding: 3px 8px
- Radius: 6px
- Font: 11px Inter weight 700, text-transform: uppercase

**Star Rating**
- Active: `#FFB300` border, `#FFF8E1` background, "⭐" emoji
- Inactive: `#e0e0e0` border, `#ffffff` background, "☆" text
- Size: 44px square, 10px radius

### Inputs & Forms
- Border: `1px solid #e0e0e0`
- Radius: 10px
- Padding: 12px 16px
- Focus: `2px solid #1B5E20`
- Background: `#ffffff`
- Label: `#888888`, 12px Inter weight 600, text-transform: uppercase
- Text: `#333333`
- Placeholder: `#999999`

### Navigation (Sticky Header)
- Background: `rgba(255,255,255,0.97)` with `backdrop-filter: blur(12px)` (scrolled)
- Background: `transparent` (at top on hero)
- Border-bottom: `1px solid #e0e0e0` (scrolled) or transparent
- Height: 64px
- Logo: Green gradient icon + "Zakatukum زكاتكم" text
- Links: 14px Inter weight 500, transition on color
- CTA: Primary Green button (small variant)
- Transition: `all 0.3s ease` on background/border

### Trust Badge (Hero)
- Background: `rgba(255,255,255,0.12)` with `backdrop-filter: blur(8px)`
- Border: `1px solid rgba(255,255,255,0.15)`
- Radius: 100px (pill)
- Padding: 6px 18px
- Font: 13px Inter weight 600
- Color: `rgba(255,255,255,0.9)`

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 6px, 8px, 10px, 12px, 16px, 20px, 24px, 28px, 32px, 40px, 48px, 56px, 72px, 80px, 100px

### Grid & Container
- Max content width: 1200px (landing), 1100px (feature sections)
- Hero: centered single-column, max-width 800px for text
- Feature sections: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` with 24px gap
- How-it-works: vertical timeline with 52px step indicators
- Footer: single centered column, max-width 600px

### Section Rhythm
- Hero: `padding: 140px 24px 100px` (generous top for sticky nav)
- Content sections: `padding: 72px-80px 24px`
- CTA section: `padding: 80px 24px`
- Footer: `padding: 40px 24px`
- Alternating backgrounds: `#ffffff` and `#f8faf8` (subtle green-tinted off-white)

### Whitespace Philosophy
- **Generous section spacing**: 72px-100px between major sections creates breathing room.
- **Tight component spacing**: Within cards and features, 8px-16px gaps keep content cohesive.
- **Text max-widths**: Description text never exceeds 550-600px for optimal line length.
- **Center alignment**: Section headers and CTAs centered; feature grids left-aligned within centered container.

### Border Radius Scale
- Micro (6px): Badges, status pills, small indicators
- Standard (8px): Tags, language pills, tab indicators
- Comfortable (10px): Inputs, form elements
- Large (12px): Buttons, step indicators
- XL (16px): Cards, feature containers
- Pill (100px): Trust badges, nav pills

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, optional `1px solid #e8efe8` border | Page background, inline elements |
| Ambient (Level 1) | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Cards at rest, containers |
| Hover (Level 2) | `0 4px 16px rgba(27,94,32,0.12), 0 2px 4px rgba(0,0,0,0.06)` | Card hover, interactive elements |
| Elevated (Level 3) | `0 4px 24px rgba(27,94,32,0.3)` | Primary buttons, floating actions |
| Deep (Level 4) | `0 8px 32px rgba(13,63,20,0.25), 0 4px 12px rgba(0,0,0,0.1)` | Modals, dropdowns, pay dialogs |
| Focus Ring | `2px solid #1B5E20` | Keyboard focus states |

**Shadow Philosophy**: Zakatukum's shadow system uses green-tinted shadows that echo the Islamic green brand palette. Like Stripe's blue-tinted approach, this creates shadows that add brand atmosphere, not just depth. The primary shadow color `rgba(27,94,32,0.15)` is derived from `#1B5E20` at 15% opacity, creating a botanical, organic depth. The multi-layer approach pairs this green shadow with a neutral `rgba(0,0,0,0.06)` at a closer offset for grounding.

## 7. Do's and Don'ts

### Do
- Use Inter at weight 800 for all headlines — authority through weight, not size
- Apply green-tinted shadows (`rgba(27,94,32,0.15)`) for elevated elements
- Use `#0d3f14` (deep forest) for headings instead of `#000000` — the green warmth matters
- Keep border-radius between 8px-16px for cards and containers
- Use `linear-gradient(135deg, #1B5E20, #2E7D32)` for primary buttons and hero sections
- Alternate white and `#f8faf8` sections for visual rhythm
- Use gold (`#D4A843`) sparingly — for star ratings and nisab indicators only
- Apply `clamp()` for responsive typography scaling
- Include Arabic text in `Noto Naskh Arabic` with `dir="rtl"` when shown

### Don't
- Don't use pure black (`#000000`) for any text — always `#0d3f14` or `#333333`
- Don't use large border-radius (20px+) on buttons or cards — stay conservative
- Don't apply green to every element — it's the brand anchor, not decoration
- Don't use decorative or script fonts — Inter and Noto Naskh only
- Don't use flat backgrounds on buttons — always gradient or subtle shadow
- Don't skip the green tint on alternate sections — `#f8faf8` not `#f5f5f5`
- Don't use emoji excessively — one per feature card maximum
- Don't mix Inter and Noto Naskh Arabic inline — separate blocks only

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, hero text clamps to 36px, stacked buttons |
| Tablet | 640-1024px | 2-column feature grids, moderate section padding |
| Desktop | 1024-1200px | Full 3-column grids, 72-80px section spacing |
| Large | >1200px | Centered content with generous margins |

### Collapsing Strategy
- Hero: `clamp(36px, 6vw, 64px)` — fluid scaling, no breakpoint jumps
- Feature grids: 3-column → 2-column → single column via `auto-fit, minmax(300px, 1fr)`
- Navigation: horizontal links + CTAs → hamburger (not yet implemented)
- Trust indicators: 4-across → 2x2 grid on mobile
- Section padding: 80px → 56px → 40px on smaller screens
- Buttons: side-by-side → full-width stacked on mobile via `flex-wrap: wrap`

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: Islamic Green (`#1B5E20` → `#2E7D32` gradient)
- Background: White (`#ffffff`), Alt: Green-tinted (`#f8faf8`)
- Hero bg: Dark green gradient (`#0d3f14` → `#1B5E20` → `#2E7D32` → `#388E3C`)
- Heading text: Forest Green (`#0d3f14`)
- Body text: Dark (`#333333`), Secondary: `#555555`, Muted: `#888888`
- Border: Standard (`#e0e0e0`), Green-tinted (`#e8efe8`)
- Gold accent: `#D4A843`
- Shadow: Green-tinted (`rgba(27,94,32,0.15)`)

### Example Component Prompts
- "Create a hero section with gradient background (135deg, #0d3f14 0%, #1B5E20 30%, #2E7D32 70%, #388E3C 100%). Headline at clamp(36px, 6vw, 64px) Inter weight 800, line-height 1.1, letter-spacing -0.02em, #ffffff text. Accent line in #a5d6a7. Subtitle at clamp(16px, 2.5vw, 20px) weight 400, rgba(255,255,255,0.8). White CTA button (#fff bg, #1B5E20 text, 12px radius, 14px 36px padding, shadow 0 4px 24px rgba(0,0,0,0.15)). Ghost secondary (rgba(255,255,255,0.1), blur backdrop, 1px solid rgba(255,255,255,0.25))."
- "Design a feature card: #fff background, 1px solid #e8efe8, 16px radius. Shadow: 0 1px 3px rgba(0,0,0,0.06). Hover: 0 4px 16px rgba(27,94,32,0.12). Padding 28px 24px. Emoji icon 32px. Title at 18px Inter weight 700, #1B5E20. Body at 14px weight 400, #555555, line-height 1.6."
- "Build a sticky nav: 64px height. Transparent at top, rgba(255,255,255,0.97) + blur(12px) on scroll. Green gradient logo icon (36px, 10px radius). Brand name 20px Inter weight 800, green on scroll, white at top. Links 14px weight 500. Green CTA button right-aligned."
