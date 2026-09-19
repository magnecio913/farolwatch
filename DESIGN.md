# Design Brief

## Direction

Civic Field Console — a bright, trustworthy municipal operations console for monitoring street lamps (faroles), their sensors, and alert states.

## Tone

Editorial-industrial: warm paper surfaces and hairline rules like a field manual, executed with control-room precision — deliberately light and calm, never a dark blue "tech dashboard".

## Differentiation

Status is the interface: a green / amber / red signal system drives card stripes, badge pills, and KPI dots, so a glance down the farol list answers "what needs attention" before any text is read.

## Color Palette

| Token      | OKLCH        | Role                                          |
| ---------- | ------------ | --------------------------------------------- |
| background | 0.975 0.006 95 | Warm paper canvas (light mode primary)      |
| foreground | 0.19 0.012 200 | Near-black slate text, AA+ on background    |
| card       | 0.995 0.003 95 | Raised white surfaces, hairline bordered    |
| primary    | 0.44 0.085 195 | Deep signal teal — CTAs, active nav, focus  |
| accent     | 0.5 0.09 195   | Teal emphasis for links and selected states |
| muted      | 0.945 0.008 95 | Recessed panels, table stripes, inputs      |
| success    | 0.52 0.13 152  | "Normal" status — green                     |
| warning    | 0.7 0.15 78    | "Advertencia" / out-of-range — amber        |
| destructive| 0.53 0.2 27    | "Crítico" alerts — red                      |

Dark mode ("night watch"): background 0.165 0.014 210, card 0.205 0.016 210, primary 0.72 0.1 190.

## Typography

- Display: Space Grotesk — page titles, card IDs, KPI numbers, section headings
- Body: DM Sans — paragraphs, labels, buttons, nav, form text
- Mono: JetBrains Mono — coordinates, sensor readings, pairing codes (`.text-data`)
- Scale: hero `text-3xl md:text-5xl font-bold tracking-tight`, h2 `text-xl md:text-2xl font-semibold`, label `label-caps`, body `text-sm md:text-base`

## Elevation & Depth

Flat paper base with two shadow tiers only — `shadow-subtle` for resting cards, `shadow-elevated` for modals, dropdowns, and the QR scanner overlay; depth comes from warm surface steps and hairline borders, not blur.

## Structural Zones

| Zone    | Background            | Border          | Notes                                              |
| ------- | --------------------- | --------------- | -------------------------------------------------- |
| Header  | `bg-card`             | `border-b`      | Sticky; logo, search, Escanear QR, bell badge, user |
| Sidebar | `bg-sidebar`          | `border-r`      | Faroles / Sensores / Alertas / Dispositivos; teal active pill |
| Content | `bg-background`       | —               | Alternating `bg-muted/40` bands between sections   |
| Footer  | `bg-muted/40`         | `border-t`      | Session state + last sync timestamp, muted text     |

## Spacing & Rhythm

Sections separated by `space-y-8` with `p-4 md:p-6` page padding; card internals use a 4/8/12px micro-scale (`gap-2`, `p-4`, `p-5`); KPI row and sensor rows are tight, list cards are generous.

## Component Patterns

- Buttons: `rounded-lg` solid teal primary, outline secondary, `rounded-full` for icon actions; hover shifts to `bg-gradient-primary` with `transition-smooth`
- Cards: `rounded-xl` `bg-card` `border` `shadow-subtle`, critical/warning cards gain a 3px left status stripe and a tinted background
- Badges: small `rounded-full` pills — green Normal, amber Advertencia, red Crítico, all with a leading status dot

## Motion

- Entrance: content fades and lifts 8px over 300ms, staggered 40ms per card on list load
- Hover: cards lift to `shadow-elevated` and border tints teal over 200ms
- Decorative: a slow 2s pulse on critical status dots only; no ambient motion elsewhere

## Constraints

- Spanish-only UI copy; no English strings in the interface
- Status colors are semantic tokens only — never raw hex or arbitrary Tailwind colors
- Minimum AA+ contrast in both modes; body text never below `text-muted-foreground`
- No charts, no exports — out of scope for this build

## Signature Detail

The monospace coordinate line (`19.4326° N, 99.1332° W`) paired with a colored left status stripe on every farol card — location and health read as one instrument panel, category: data-typography.
