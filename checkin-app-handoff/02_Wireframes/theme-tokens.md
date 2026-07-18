# Theme Tokens — Landscape / Hostel

Derived from the reference screenshot. All colors in sRGB hex; use OKLCH equivalents in `tailwind.config` if desired.

## Palette
| Token | Hex | Use |
|---|---|---|
| `--sky-1` | `#B8C6D6` | Top sky band, hero |
| `--sky-2` | `#8FA3B8` | Mid sky |
| `--sky-3` | `#6B7F94` | Deep sky |
| `--dune` | `#D6C2A8` | Sand / warm neutral |
| `--cream` | `#F0E6D2` | Page background, cards |
| `--terracotta` | `#8B4A3E` | Primary accent, CTA |
| `--navy` | `#2A3444` | Text high-emphasis, dorm silhouette |
| `--ink` | `#1E2430` | Body text |
| `--muted` | `#78829180` | Secondary text |
| `--line` | `#C8CDD780` | Hairlines |

## Type
- Family: **Inter** primary, **Sora** display fallback. Weights 400/500/700.
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 44.
- Tracking: `-0.01em` on display, `0` on body, `+0.08em` uppercase small-caps for meta.

## Radii
`sm: 10px · md: 16px · lg: 22px · xl: 28px`.

## Spacing
4-based scale: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64`.

## Motif
Every hero surface renders the flat landscape SVG: 5 sky bands → dune → foreground → sun (cream) → dorm silhouette (navy) + terracotta roof + small hut + telephone pole. Recolor by swapping the `--sky-*` and `--terracotta` tokens per section.

## Dark mode
Invert cream→navy, keep terracotta accent, use `#EDE3CE` for text. Sky bands dim by 25% luminance.

## Responsive
- Mobile-first (390 baseline). Hero height = 55% of viewport width.
- Tablet ≥ 768: two-column detail views.
- Desktop ≥ 1200: dashboards adopt sidebar + 12-col grid.
