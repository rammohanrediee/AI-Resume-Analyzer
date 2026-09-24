# Design — Resume Lens

<!-- Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 · implemented and browser-verified 2026-09-23 -->

This is the locked visual and interaction system for the React application. The runtime
tokens live in `web/src/tokens.css`; the portable mirror is `tokens.css`.

## System

- Audience: applicants reviewing a resume before applying to a specific role.
- Product position: evidence-first review, not a hiring prediction and not an automatic
  resume writer.
- Genre: modern-minimal.
- Tone: technical, calm, practical.
- Macrostructure: Hallmark Workbench, designed as an application rather than a marketing
  landing page.
- Theme: studied DNA from the user-supplied desktop and mobile references: cool light
  paper, indigo action colour, upright sans typography, restrained panels, compact
  metrics, and a visible document/results relationship.
- Navigation: N1b application variant—brand and two real destinations on desktop; compact
  disclosure menu on mobile. No fictional product routes.
- Footer: Ft2 inline note—product name, decision-support disclaimer, and source link.
- Enrichment: E5 Tier-B hand-built resume-document SVG. It communicates the uploaded
  artifact and introduces no fake browser or phone chrome.

## Provenance

User-attached ResumeAI desktop and mobile screenshots supplied on 2026-09-23. They are
used as structural inspiration only. No source logo, portrait, proprietary illustration,
mock resume, or exact pixel arrangement is copied. Resume Lens uses an original mark,
original document motif, project-specific copy, and live backend data.

## Product truth

The current application supports:

- PDF upload, drag-and-drop, replacement, a 5 MiB limit, and a 20-page limit;
- optional job-description context and optional analysis label;
- backend extraction and resume analysis;
- Overview, ATS Check, Suggestions, and Keywords result sections;
- desktop PDF preview with a mobile open-document fallback;
- analysis report download through the existing PDF report endpoint.

The reference screens also show capabilities that this project does not currently
provide. Do not imply support for DOC/DOCX, Google Drive or Dropbox import, accounts,
profiles, templates, pricing, resources, dark mode, or downloading an automatically
rewritten resume.

## Information architecture

### Upload

1. Product header and four-step progress cue.
2. Short upload proposition and optional context label.
3. The PDF input is the dominant interaction.
4. Benefits follow the uploader on mobile and sit alongside it on desktop.
5. A small process explanation uses the original document motif.
6. Status and the primary action sit last in reading order.

At 74 rem and wider, the composition is a three-column workbench: proposition and
coverage, uploader, then explanation. At 48–73.99 rem it becomes a two-column
composition. Below 48 rem it is one column with the uploader before supporting benefits.

### Results

1. Selected-file identity and contextual actions.
2. Desktop: sticky document preview beside the results workspace.
3. Mobile: an explicit Open PDF action instead of an embedded document.
4. Four keyboard-operable result tabs.
5. Overview prioritizes structure score, real quick facts, section breakdown, and one
   evidence-backed next action.
6. Strengths, improvement areas, and suggested edits are disclosures on mobile and
   expanded compact groups on desktop.

## Typography

- Display and wordmark: Space Grotesk 500/700.
- Body and controls: IBM Plex Sans 400/600.
- Headings remain roman; no italic display emphasis.
- Body text is at least 1 rem.
- Display text uses tight tracking and `overflow-wrap: anywhere`.
- Interactive labels remain on one line.

## Colour and contrast

- Paper: cool near-white indigo tint.
- Ink: deep blue-black.
- Accent: contrast-safe indigo used for actions, active navigation, and concise emphasis.
- Success, warning, error, and information colours are semantic, not decorative.
- Verified WCAG contrast ratios include ink/paper 16.91:1, muted/paper 5.37:1,
  accent-ink/accent 4.75:1, focus/paper 5.50:1, warning-ink/warning-surface 9.10:1,
  and error/error-surface 5.61:1.

## Interaction and states

- Controls cover default, pointer hover, instant focus-visible, active, disabled, loading,
  error, and success/selected states where applicable.
- Touch targets are at least 44 CSS pixels; coarse pointers receive 48-pixel controls.
- Form border width never changes across states. Focus uses a separate 2-pixel outline.
- The optional job description validates only on submit and explains the recovery path.
- Loading uses explicit phase text (Reading PDF / Analyzing evidence), never simulated
  percentages.
- Menu dismissal supports outside pointer input and Escape.
- Result tabs support click plus Left, Right, Home, and End keys.
- Successful visible actions stay silent. Errors retain input and explain recovery.

## Motion

Motion is functional and limited to button press/lift and disclosure-chevron rotation.
Only transform and opacity transition. There are no decorative page entrances, counters,
parallax, animated gradients, or card hover effects. Reduced motion collapses durations
to effectively instant state changes.

## Responsive contract

Verify at 320, 375, 414, 768, 1024, 1280, and 1440 CSS pixels:

- no page-level horizontal scroll;
- `overflow-x: clip` on both `html` and `body`;
- no wrapped button, tab, navigation, or footer-link labels;
- image-bearing grid tracks use `minmax(0, 1fr)`;
- document preview becomes an explicit link below 68 rem;
- mobile results retain a two-item bottom application nav;
- filenames wrap without expanding their tracks;
- the top header and document panel use separate sticky offsets.

## Exports

### 1. Canonical CSS

```css
:root {
  --color-paper: oklch(97.5% 0.009 277);
  --color-paper-deep: oklch(94.5% 0.018 277);
  --color-surface: oklch(99.2% 0.004 277);
  --color-surface-strong: oklch(96.4% 0.014 277);
  --color-ink: oklch(20% 0.045 274);
  --color-ink-soft: oklch(36% 0.04 274);
  --color-muted: oklch(51% 0.035 274);
  --color-rule: oklch(88% 0.021 277);
  --color-rule-strong: oklch(80% 0.035 277);
  --color-accent: oklch(56% 0.22 278);
  --color-accent-strong: oklch(47% 0.23 278);
  --color-accent-soft: oklch(93.5% 0.04 278);
  --color-accent-ink: oklch(98% 0.008 277);
  --color-focus: oklch(52% 0.2 278);
  --color-success: oklch(54% 0.145 153);
  --color-success-surface: oklch(95% 0.035 153);
  --color-warning: oklch(70% 0.17 75);
  --color-warning-ink: oklch(38% 0.095 65);
  --color-warning-surface: oklch(96% 0.04 82);
  --color-error: oklch(50% 0.18 28);
  --color-error-surface: oklch(95% 0.028 28);
  --color-info: oklch(56% 0.17 244);
  --color-info-surface: oklch(95% 0.03 244);
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;
  --font-wordmark: 'Space Grotesk', sans-serif;
  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.125rem;
  --text-lg: 1.375rem;
  --text-xl: 1.75rem;
  --text-2xl: 2.25rem;
  --text-display: clamp(2.5rem, 5vw, 4rem);
  --radius-control: 0.5rem;
  --radius-card: 0.75rem;
  --radius-panel: 1rem;
  --radius-pill: 999px;
  --rule-thin: 1px;
  --rule-strong: 2px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
}
```

### 2. Tailwind v4

```css
@theme {
  --color-paper: oklch(97.5% 0.009 277);
  --color-paper-deep: oklch(94.5% 0.018 277);
  --color-surface: oklch(99.2% 0.004 277);
  --color-surface-strong: oklch(96.4% 0.014 277);
  --color-ink: oklch(20% 0.045 274);
  --color-ink-soft: oklch(36% 0.04 274);
  --color-muted: oklch(51% 0.035 274);
  --color-rule: oklch(88% 0.021 277);
  --color-rule-strong: oklch(80% 0.035 277);
  --color-accent: oklch(56% 0.22 278);
  --color-accent-strong: oklch(47% 0.23 278);
  --color-accent-soft: oklch(93.5% 0.04 278);
  --color-focus: oklch(52% 0.2 278);
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;
  --spacing-3xs: 0.25rem;
  --spacing-2xs: 0.5rem;
  --spacing-xs: 0.75rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4rem;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.125rem;
  --text-lg: 1.375rem;
  --text-xl: 1.75rem;
  --text-2xl: 2.25rem;
  --radius-control: 0.5rem;
  --radius-card: 0.75rem;
  --radius-panel: 1rem;
  --radius-pill: 999px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### 3. DTCG tokens

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(97.5% 0.009 277)", "$type": "color" },
    "paper-deep": { "$value": "oklch(94.5% 0.018 277)", "$type": "color" },
    "surface": { "$value": "oklch(99.2% 0.004 277)", "$type": "color" },
    "ink": { "$value": "oklch(20% 0.045 274)", "$type": "color" },
    "ink-soft": { "$value": "oklch(36% 0.04 274)", "$type": "color" },
    "muted": { "$value": "oklch(51% 0.035 274)", "$type": "color" },
    "rule": { "$value": "oklch(88% 0.021 277)", "$type": "color" },
    "accent": { "$value": "oklch(56% 0.22 278)", "$type": "color" },
    "accent-ink": { "$value": "oklch(98% 0.008 277)", "$type": "color" },
    "focus": { "$value": "oklch(52% 0.2 278)", "$type": "color" },
    "success": { "$value": "oklch(54% 0.145 153)", "$type": "color" },
    "warning": { "$value": "oklch(70% 0.17 75)", "$type": "color" },
    "error": { "$value": "oklch(50% 0.18 28)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Space Grotesk, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "IBM Plex Sans, sans-serif", "$type": "fontFamily" }
  },
  "space": {
    "3xs": { "$value": "0.25rem", "$type": "dimension" },
    "2xs": { "$value": "0.5rem", "$type": "dimension" },
    "xs": { "$value": "0.75rem", "$type": "dimension" },
    "sm": { "$value": "1rem", "$type": "dimension" },
    "md": { "$value": "1.5rem", "$type": "dimension" },
    "lg": { "$value": "2rem", "$type": "dimension" },
    "xl": { "$value": "3rem", "$type": "dimension" },
    "2xl": { "$value": "4rem", "$type": "dimension" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "220ms", "$type": "duration" },
    "long": { "$value": "420ms", "$type": "duration" }
  },
  "radius": {
    "control": { "$value": "0.5rem", "$type": "dimension" },
    "card": { "$value": "0.75rem", "$type": "dimension" },
    "panel": { "$value": "1rem", "$type": "dimension" }
  }
}
```

### 4. shadcn/ui

```css
:root {
  --background: 97.5% 0.009 277;
  --foreground: 20% 0.045 274;
  --card: 99.2% 0.004 277;
  --card-foreground: 20% 0.045 274;
  --popover: 99.2% 0.004 277;
  --popover-foreground: 20% 0.045 274;
  --primary: 56% 0.22 278;
  --primary-foreground: 98% 0.008 277;
  --secondary: 94.5% 0.018 277;
  --secondary-foreground: 36% 0.04 274;
  --muted: 94.5% 0.018 277;
  --muted-foreground: 51% 0.035 274;
  --accent: 93.5% 0.04 278;
  --accent-foreground: 47% 0.23 278;
  --destructive: 50% 0.18 28;
  --destructive-foreground: 98% 0.008 277;
  --border: 88% 0.021 277;
  --input: 80% 0.035 277;
  --ring: 52% 0.2 278;
  --radius: 0.75rem;
}
```
