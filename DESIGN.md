# Worm Breeding Game — Design Brief

## Tone & Differentiation
Playful, maximalist elemental breeding game. 4 distinct worm types with visible mutation patterns. High visual energy, game-focused UI with Vietnamese labels. Mutation visible through color/pattern combinations on 3 interchangeable body parts.

## Color Palette — Elemental Worm Types
| Element | Primary | Light | Use |
|---------|---------|-------|-----|
| Electric | 82 0.28 100 | 50 0.32 265 | Yellow-blue lightning patterns |
| Earth | 52 0.22 50 | 72 0.14 50 | Brown-tan rocky appearance |
| Grass | 72 0.28 130 | 85 0.12 130 | Green leaf/stripe patterns |
| Water | 60 0.26 265 | 78 0.18 265 | Cyan-blue wave patterns |
| Primary | 72 0.24 130 | - | Breeding button, selection state |
| Destructive | 55 0.26 25 | - | Max collection warning |
| Background | 98 0.01 80 | - | Neutral game surface |
| Card | 99 0.005 80 | - | Worm display cards |

## Typography
| Role | Family | Weight | Use |
|------|--------|--------|-----|
| Display | Figtree | 700 | Headers, type badges, Vietnamese labels |
| Body | DMSans | 400 | UI text, instructions, counters |
| Mono | GeistMono | 400 | Admin/debug text |

## Structural Zones
| Zone | Treatment |
|------|----------|
| Header | Solid bg-card, title "Tổ Sâu" (Worm Nest), counter "N/20 sâu" |
| Worm Grid | bg-background, 4-column responsive grid, worm cards |
| Worm Card | bg-card, 2px border-border, rounded-2xl, selected state scale-105 ring-primary |
| Body Parts | 3 display zones (Head/Body/Tail), mutation variants per part |
| Breeding Panel | 2 selected worms + Breed button (bg-primary, rounded-full, pulse-glow animation) |
| Collection Full | Counter shows destructive red when max 20 reached |

## Spacing & Rhythm
Gap: 1.5rem between worm cards (responsive). Padding: 1.5rem container, 1rem cards. Rounded: 1rem default, 2xl cards, full badges.

## Motion & Interactions
| Animation | Duration | Trigger |
|-----------|----------|----------|
| pulse-glow | 2s infinite | Selected breed button |
| flip | 600ms | Worm spawning/mutation reveal |
| scale-bounce | 300ms | Card selection, part highlight |
| fade-in-up | 400ms | Grid load, new worms |
| scale-105 | 200ms | Selected worm card state |

## Component Patterns
Worm type badges: `.badge-{electric|earth|grass|water}` with semantic foreground/background. Selection state: `.worm-card.selected` with ring-primary, scale-105. Breeding button: `.breed-button` with pulse-glow when active.

## Signature Detail
4 elemental type palettes with distinct color identities. Visible 3-part mutation system (head, body, tail) per worm. Vietnamese game UI labels (Tổ Sâu, Nhân Giống, Xóa) with playful, high-saturation colors.
