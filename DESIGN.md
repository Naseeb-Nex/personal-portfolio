---
name: Black Spectrum
description: Dark-mode-first aesthetic with a flat pure black background, restrained surface lifts, Framer-derived typography, and spectrum glow accents.
mode: dark
colors:
  dark:
    canvas: "#000000"
    surface-1: "#141414"
    surface-2: "#1c1c1c"
    hairline: "#262626"
    hairline-soft: "#1a1a1a"
    ink: "#ffffff"
    ink-muted: "#bdb8c0"
    ink-faint: "#3f3849"
    primary: "#ffffff"
    on-primary: "#000000"
    inverse-canvas: "#ffffff"
    inverse-ink: "#000000"
  light:
    canvas: "#ffffff"
    surface-1: "#f5f5f5"
    surface-2: "#ebebeb"
    hairline: "#e5e5e5"
    hairline-soft: "#f0f0f0"
    ink: "#000000"
    ink-muted: "#666666"
    ink-faint: "#999999"
    primary: "#000000"
    on-primary: "#ffffff"
    inverse-canvas: "#000000"
    inverse-ink: "#ffffff"
  spectrum:
    red: "#ff0a3c"
    coral: "#ff5577"
    magenta: "#d44df0"
    violet: "#6a4cf5"
    blue: "#0099ff"
    teal: "#1ee0c8"
    pink: "#fa7faa"
    lime: "#c2ef4e"
    violet-deep: "#422082"
  semantic:
    success: "#22c55e"
typography:
  fontFamily:
    display: "'Stack Sans Notch', 'Inter', sans-serif"
    body: "'Inter', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif"
    mono: "monospace"
  scale:
    display-xxl:
      fontSize: "110px"
      fontWeight: 500
      lineHeight: 0.85
      letterSpacing: "-5.5px"
    display-xl:
      fontSize: "85px"
      fontWeight: 500
      lineHeight: 0.95
      letterSpacing: "-4.25px"
    display-lg:
      fontSize: "62px"
      fontWeight: 500
      lineHeight: 1.0
      letterSpacing: "-3.1px"
    display-md:
      fontSize: "32px"
      fontWeight: 500
      lineHeight: 1.13
      letterSpacing: "-1.0px"
    headline:
      fontSize: "22px"
      fontWeight: 700
      lineHeight: 1.2
      letterSpacing: "-0.8px"
    subhead:
      fontSize: "24px"
      fontWeight: 400
      lineHeight: 1.3
      letterSpacing: "normal"
    body-lg:
      fontSize: "18px"
      fontWeight: 400
      lineHeight: 1.3
      letterSpacing: "-0.18px"
    body:
      fontSize: "15px"
      fontWeight: 400
      lineHeight: 1.3
      letterSpacing: "-0.15px"
    body-sm:
      fontSize: "14px"
      fontWeight: 500
      lineHeight: 1.4
      letterSpacing: "normal"
    caption:
      fontSize: "13px"
      fontWeight: 500
      lineHeight: 1.2
      letterSpacing: "normal"
    micro:
      fontSize: "12px"
      fontWeight: 400
      lineHeight: 1.2
      letterSpacing: "normal"
    button:
      fontSize: "14px"
      fontWeight: 500
      lineHeight: 1.0
      letterSpacing: "-0.14px"
rounded:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "15px"
  xl: "20px"
  xxl: "30px"
  pill: "100px"
  full: "9999px"
spacing:
  hair: "1px"
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "15px"
  lg: "20px"
  xl: "30px"
  xxl: "40px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.dark.primary}"
    textColor: "{colors.dark.on-primary}"
    borderRadius: "{rounded.pill}"
    padding: "10px 15px"
    activeScale: "shrink"
  button-secondary:
    backgroundColor: "{colors.dark.surface-1}"
    textColor: "{colors.dark.ink}"
    borderRadius: "{rounded.pill}"
  button-translucent:
    backgroundColor: "{colors.dark.surface-2}"
    borderRadius: "{rounded.xxl}"
    padding: "8px 14px"
  button-icon:
    borderRadius: "{rounded.full}"
    size: "40px"
    touchSize: "44px"
  card-standard:
    backgroundColor: "{colors.dark.surface-1}"
    borderRadius: "{rounded.xl}"
    padding: "{spacing.xxl}"
  card-small:
    borderRadius: "{rounded.lg}"
    padding: "{spacing.sm}"
  card-spotlight:
    borderRadius: "{rounded.xxl}"
    padding: "32px"
  input:
    borderRadius: "{rounded.md}"
    padding: "10px 14px"
  navbar:
    height: "56px"
---

# Black Spectrum Design System

## Overview
Black Spectrum is a dark-mode-first design system built on pure flat black canvas (`#000000`). Elevation and depth rely on subtle hairline borders and surface lifts (`#141414`, `#1c1c1c`) rather than drop shadows. Vibrant spectrum hues provide accent energy through hero capsules, spotlight cards, and a singular 15% opacity spectrum glow ring on hover.

## Colors

### Dark Mode (Primary)
- `canvas`: `#000000` (flat pure black background)
- `surface-1`: `#141414` (lifted panel and standard card surface)
- `surface-2`: `#1c1c1c` (elevated control and secondary surface)
- `hairline`: `#262626` (structural border)
- `hairline-soft`: `#1a1a1a` (subtle divider)
- `ink`: `#ffffff` (primary text and high-contrast foreground)
- `ink-muted`: `#bdb8c0` (secondary body and supporting text)
- `ink-faint`: `#3f3849` (tertiary text and disabled indicators)
- `primary`: `#ffffff` (primary action foreground / high-contrast fill)
- `on-primary`: `#000000` (text on primary fill)
- `inverse-canvas`: `#ffffff`
- `inverse-ink`: `#000000`

### Light Mode
- `canvas`: `#ffffff`
- `ink`: `#000000`
- Spectrum accents and semantic colors remain identical.

### Spectrum Accents
Derived from hero capsules:
- `red`: `#ff0a3c`
- `coral`: `#ff5577`
- `magenta`: `#d44df0`
- `violet`: `#6a4cf5`
- `blue`: `#0099ff`
- `teal`: `#1ee0c8`
- `pink`: `#fa7faa`
- `lime`: `#c2ef4e` — Highlight chip only. Never use as button fill or body text.
- `violet-deep`: `#422082` — Spotlight card fill.

### Semantic
- `semantic-success`: `#22c55e`

### Hover & Gradient Rules
- **Hover rule**: On hover, interactive elements take ONE spectrum hue as a glow ring (`box-shadow: 0 0 0 1px rgba(<hue>, 0.15)` e.g. `rgba(0,153,255,0.15)` for blue); cycle through spectrum hues across items.
- **Gradient rule**: Gradients are strictly reserved for hero capsules and spotlight cards (fills using `#d44df0`, `#6a4cf5`, `#ff5577`). Never apply gradients to standard body surfaces or flat cards.

## Typography
Framer-derived typographic scale with high display impact and tight tracking:
- Existing project fonts: `'Stack Sans Notch'` for brand titles / hero headings, `'Inter'` for UI/body, and `'Geist'` for career/supporting copy. Fallback: sans-serif.

### Scale Table
- `display-xxl`: 110px / Weight: 500 / Line-height: 0.85 / Letter-spacing: -5.5px
- `display-xl`: 85px / Weight: 500 / Line-height: 0.95 / Letter-spacing: -4.25px
- `display-lg`: 62px / Weight: 500 / Line-height: 1.0 / Letter-spacing: -3.1px
- `display-md`: 32px / Weight: 500 / Line-height: 1.13 / Letter-spacing: -1.0px
- `headline`: 22px / Weight: 700 / Line-height: 1.2 / Letter-spacing: -0.8px
- `subhead`: 24px / Weight: 400 / Line-height: 1.3 / Letter-spacing: normal
- `body-lg`: 18px / Weight: 400 / Line-height: 1.3 / Letter-spacing: -0.18px
- `body`: 15px / Weight: 400 / Line-height: 1.3 / Letter-spacing: -0.15px
- `body-sm`: 14px / Weight: 500 / Line-height: 1.4 / Letter-spacing: normal
- `caption`: 13px / Weight: 500 / Line-height: 1.2 / Letter-spacing: normal
- `micro`: 12px / Weight: 400 / Line-height: 1.2 / Letter-spacing: normal
- `button`: 14px / Weight: 500 / Line-height: 1.0 / Letter-spacing: -0.14px

## Layout
- Base spacing unit: 5px grid.
- Scale:
  - `hair`: 1px
  - `xxs`: 4px
  - `xs`: 8px
  - `sm`: 12px
  - `md`: 15px
  - `lg`: 20px
  - `xl`: 30px
  - `xxl`: 40px
  - `section`: 96px
- Nav height: 56px fixed header height.

## Elevation & Depth
- **Level 0 (Flat)**: Pure `#000000` canvas.
- **Level 1 (Surface Lift)**: Background `#141414` on canvas.
- **Level 2 (Border Lift)**: Top edge highlight `rgba(255, 255, 255, 0.10) 0.5px` with shadow `0 10px 30px rgba(0, 0, 0, 0.25)`.
- **Level 3 (Interactive Active / Focus)**: Active spectrum hue glow ring (`0 0 0 1px` at 15% opacity, e.g. `rgba(0,153,255,0.15)`).
- **Rule**: On dark canvas, do NOT use drop shadows on cards. Use surface color contrast and hairline borders (`#262626` / `#1a1a1a`) to establish boundaries.

## Shapes
- `xs`: 4px
- `sm`: 6px
- `md`: 10px (inputs)
- `lg`: 15px (small cards)
- `xl`: 20px (standard cards)
- `xxl`: 30px (spotlight cards, translucent buttons)
- `pill`: 100px (primary and secondary buttons)
- `full`: 9999px (circular icon buttons, avatars)

## Components

### Buttons
- **Primary**: Background `#ffffff`, text `#000000`, pill radius (100px), padding `10px 15px`. Pressed state: scale shrink (`transform: scale(0.97)`).
- **Secondary**: Background `#141414`, text `#ffffff`, hairline border `#262626`, pill radius (100px).
- **Translucent**: Background `#1c1c1c`, radius 30px, padding `8px 14px`.
- **Icon**: Circular diameter 40px (min 44px on touch viewports), centered content.

### Cards
- **Standard Card**: Surface `#141414`, radius 20px, padding 24px.
- **Small Card**: Surface `#141414` or `#1c1c1c`, radius 15px, padding 12px.
- **Gradient Spotlight Card**: Radius 30px, padding 32px; gradient fills with `#d44df0` (magenta), `#6a4cf5` (violet), `#ff5577` (coral), or `#422082` (deep violet).

### Inputs
- Radius 10px, padding `10px 14px`, border `1px solid #262626`, background `#141414`.

### Navigation
- Height 56px, blur/translucent surface or pure black with hairline separator.

## Do's and Don'ts

### Do
- Keep dark mode primary with pure `#000000` canvas.
- Follow the hover glow ring pattern using 15% opacity spectrum hues.
- Maintain exact spacing scale multiples based on 5px grid.
- Keep touch targets at minimum 44px on mobile and tablet.
- Use `#c2ef4e` (lime) strictly for small highlight chips and badges.

### Don't
- Do not use drop shadows on cards against the dark canvas.
- Do not apply gradients to body surfaces, standard cards, or general backgrounds.
- Do not use `#c2ef4e` (lime) as a button fill or body text color.
- Do not invent arbitrary hex colors, corner radii, or spacing outside this token sheet.

## Responsive Behavior
- **Desktop (1199px+)**: Full multi-column layout, 4-up cards grid, full display-xxl typography (110px).
- **Tablet (810px - 1198px)**: Cards step down from 4-up to 2-up; desktop nav converts to hamburger menu; display type steps down from 110px to 62px.
- **Mobile (≤480px)**: 1-column layouts; display type steps to 32px; touch target minimum 44px enforced across all interactives.

## Iteration Guide
1. Inspect `DESIGN.md` for tokens before writing any UI style rule.
2. In React/CSS, bind properties to tokens or CSS variables corresponding to this spec.
3. If new component states or tokens are introduced, update `DESIGN.md` simultaneously.
