---
name: senior-ui-ux
description: Senior UI/UX design system for CSH. Use when building, restyling, or reviewing any page, layout, spacing, mobile padding, typography, or visual component. Triggers on UI, UX, spacing, padding, mobile, layout, Tailwind, Container, PageIntro, or design work.
---

# Senior UI/UX — CSH

Read this before changing any visual. The site already has a system. Do not invent a parallel one.

Reference tokens and examples: [spacing-and-layout.md](spacing-and-layout.md).

## Before you write a class

1. Reuse `Container`, `PageIntro`, `SectionIntro`, `Button`, `FadeIn`.
2. Import spacing from `@/lib/spacing` — never invent a new `mt-24 sm:mt-32 lg:mt-40` stack.
3. Check mobile **and** desktop. A class that looks fine at `lg` often breaks at 375px.
4. Follow the existing Studio look (neutral, Mona Sans, rounded-4xl) — do not add accent colors or new typefaces.

## Non-negotiables (learned the hard way)

### Horizontal gutter is mandatory

`Container` is `px-5 sm:px-6 lg:px-8` (`GUTTER_X`). Every section’s **content** stays inside that gutter on mobile.

- **Never** cancel the gutter with `-mx-5` / `-mx-6` so a card or text hugs the viewport edge.
- Full-bleed is allowed only for a **background** (tint, photo). The text, buttons, and cards inside still sit in a `Container`.
- If you need a dark card, keep it **inside** the Container. Do not bleed it to the screen edge on mobile.

### Vertical rhythm is modest on mobile

The old Studio scale (`mt-24 sm:mt-32 lg:mt-40` = 96 / 128 / 160px) is too large on phones, especially when stacked (PageIntro + Container + PageLinks `mt` **and** `pt`).

Use only:

| Token | Classes | When |
|-------|---------|------|
| `PAGE_INTRO_Y` | `mt-16 sm:mt-24 lg:mt-32` | First block after the header |
| `SECTION_Y` | `mt-16 sm:mt-24 lg:mt-32` | Gap between major sections |
| `AFTER_INTRO_Y` | `mt-10 sm:mt-16 lg:mt-24` | PageIntro → first content |
| `BAND_PT` | `pt-16 sm:pt-24 lg:pt-32` | Internal padding of a tinted band |

Never apply `SECTION_Y` **and** `BAND_PT` on the same element (that doubles the gap).

### Do not double the first offset

`PageIntro` already includes `PAGE_INTRO_Y`. A parent `article` / `Container` must **not** add another large `mt-*` above it.

## Review checklist

- [ ] Mobile 375px: no text or cards flush to the left/right edge
- [ ] No `-mx-*` that cancels `Container` padding
- [ ] Section gaps use `@/lib/spacing` — no one-off `lg:mt-40` / `lg:mt-56`
- [ ] Bands use only `BAND_PT`, not `mt` + `pt` together
- [ ] Touch targets ≥ 44px; forms readable without pinch-zoom
- [ ] Contrast holds on `neutral-950` / `neutral-600` over white and inverted sections
