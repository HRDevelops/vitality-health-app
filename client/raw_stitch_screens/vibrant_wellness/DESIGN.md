---
name: Vibrant Wellness
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd7ea'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f1ff'
  surface-container: '#f0ebfe'
  surface-container-high: '#ebe5f8'
  surface-container-highest: '#e5e0f3'
  on-surface: '#1c1a27'
  on-surface-variant: '#474554'
  inverse-surface: '#312f3d'
  inverse-on-surface: '#f3eeff'
  outline: '#787586'
  outline-variant: '#c8c4d6'
  surface-tint: '#5648d1'
  primary: '#5445cf'
  on-primary: '#ffffff'
  primary-container: '#6d60e9'
  on-primary-container: '#fffbff'
  inverse-primary: '#c5c0ff'
  secondary: '#006876'
  on-secondary: '#ffffff'
  secondary-container: '#3ee5fe'
  on-secondary-container: '#006370'
  tertiary: '#8b4c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#af6100'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c5c0ff'
  on-primary-fixed: '#140067'
  on-primary-fixed-variant: '#3d2bb9'
  secondary-fixed: '#9eefff'
  secondary-fixed-dim: '#28d9f3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004e59'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77a'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6d3a00'
  background: '#fcf8ff'
  on-background: '#1c1a27'
  surface-variant: '#e5e0f3'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  metric-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-margin: 24px
  gutter: 16px
  card-padding: 20px
  section-gap: 32px
  element-gap: 12px
---

## Brand & Style

The visual identity centers on a "Soft UI" aesthetic tailored for the health and fitness sector. It combines a high-energy, vibrant purple primary palette with a welcoming, approachable interface. The target audience is health-conscious individuals seeking a motivational yet stress-free tracking experience.

The design style is **Modern / Soft UI**, characterized by:
- **Warmth & Friendliness:** Deeply rounded corners and a soft color palette reduce visual tension.
- **Dynamic Energy:** High-saturation primary and accent colors suggest movement and vitality.
- **Layered Clarity:** Use of subtle shadows and tonal depth to organize complex health metrics into digestible "card" units.
- **Optimism:** Bright, electric accents and ample white space create an uplifting emotional response.

## Colors

The palette is dominated by a vibrant **Electric Purple** primary color, used for main actions, active states, and brand-heavy backgrounds. A bright **Electric Blue** serves as a secondary accent for highlighting specific metrics like water intake or progress completion.

- **Primary:** Used for the main CTA buttons, navigation headers, and progress rings.
- **Secondary/Accents:** Used for secondary data visualizations and categorical distinctions (e.g., specific workout types).
- **Backgrounds:** A very soft, slightly tinted off-white is used for the main application background to make white cards "pop" effectively.
- **Semantic Colors:** Success (Green), Warning (Orange), and Error (Red) are used sparingly for health goal status.

## Typography

This design system utilizes **Plus Jakarta Sans** across all levels to maintain a contemporary and welcoming feel. The typography relies on strong weight contrasts rather than multiple typefaces.

- **Headlines:** Use Bold (700) weights with tight letter spacing for a modern, impactful look.
- **Metrics:** Dedicated "metric-display" role for large numbers (steps, calories) to ensure high glanceability.
- **Body:** Uses Regular (400) for readability in descriptions and Semi-bold (600) for emphasis within data lists.
- **Hierarchy:** Titles are typically dark navy/neutral, while supporting text uses a medium-grey neutral to maintain a soft visual contrast.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous safe areas to accommodate the "Soft UI" aesthetic. 

- **Grid:** On mobile, a 4-column layout is used. On desktop, a 12-column grid manages complex dashboard views.
- **Margins:** A standard 24px side margin is maintained for mobile containers to ensure elements don't feel cramped against the screen edge.
- **Spacing Rhythm:** Based on an 8px scale. Metrics and related icons are spaced at 8px or 12px, while distinct card sections are separated by 24px or 32px.
- **Density:** The layout is intentionally airy. High whitespace around key health metrics prevents the interface from feeling clinical or overwhelming.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Ambient Shadows** rather than traditional hard-edged skeuomorphism.

- **Main Surface:** The base background is light grey (#F8F8FB).
- **Primary Level:** White cards (#FFFFFF) sit atop the background with a soft, diffused drop shadow (e.g., `0px 10px 30px rgba(115, 103, 240, 0.08)`).
- **Interactive Level:** Active primary buttons may have a slight colored glow/shadow of the primary color to indicate prominence.
- **Interactive Depth:** On press, cards or buttons should slightly scale down (0.98) or shadows should tighten to simulate physical interaction.

## Shapes

The shape language is the defining characteristic of this system. It uses an ultra-rounded approach to evoke a friendly, non-intimidating feel.

- **Cards & Containers:** Use a radius between 24px and 32px.
- **Buttons:** Primarily pill-shaped or very high-radius (16px minimum).
- **Small Elements:** Input fields and chips follow a 12px-16px radius.
- **Icons:** Enclosed in circles or high-radius rounded squares to match the container language.

## Components

### Buttons
- **Primary Actions:** Solid primary purple background, white text, pill-shaped.
- **Secondary Actions:** White background with primary purple border or ghost-style with primary colored text.
- **Floating Action Button (FAB):** Large circle with primary gradient or solid color, containing a white icon.

### Cards
- **Metric Cards:** White background, 24px rounded corners, subtle ambient shadow. Includes a title (Label-bold), the metric (Metric-display), and a trend indicator or icon.
- **List Items:** Soft-colored backgrounds (e.g., 10% opacity of primary) used to group list items within a card.

### Inputs & Selection
- **Text Fields:** Subtle light grey border or background, 16px radius. 
- **Chips:** Used for category selection (e.g., "Daily", "Weekly", "Monthly") with a solid active state and a light grey/transparent inactive state.

### Progress Elements
- **Rings & Bars:** Thick strokes with rounded caps. Use gradients or solid primary/secondary colors against a low-opacity track of the same hue.