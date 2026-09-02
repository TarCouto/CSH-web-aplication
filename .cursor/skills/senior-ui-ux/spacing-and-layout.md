# Spacing and layout reference

## Source of truth

`src/lib/spacing.ts` + `src/components/Container.tsx`.

```ts
import { AFTER_INTRO_Y, PAGE_INTRO_Y, SECTION_Y } from '@/lib/spacing'
```

```tsx
<PageIntro eyebrow="…" title="…">…</PageIntro>
<Container className={AFTER_INTRO_Y}>{/* first content */}</Container>
<ContactSection /> {/* already uses SECTION_Y */}
```

## Container

```tsx
<Component className={clsx('mx-auto max-w-7xl px-5 sm:px-6 lg:px-8', className)}>
  <div className={clsx('mx-auto', wide ? 'max-w-none' : 'max-w-2xl lg:max-w-none')}>
    {children}
  </div>
</Component>
```

Do not wrap a second `Container` inside another unless the outer one is only a full-bleed background (no horizontal padding). Prefer one Container.

## Patterns

### Marketing page

`RootLayout` → `PageIntro` → `Container` + `AFTER_INTRO_Y` → optional sections with `SECTION_Y` → `ContactSection` → `Footer`.

### Dark card (ContactSection, home stats)

Card stays **inside** Container. Internal padding `px-6 py-16 sm:px-10 sm:py-24`. No `-mx-5`.

### Tinted band (PageLinks, process Values)

Outer: `relative` + `BAND_PT` only. Absolute background `inset-x-0`. Children: `SectionIntro` + `Container`. Callers do **not** pass an extra `mt-*`.

### Full-bleed photo (case study hero)

Background can be `w-full`. Caption / meta stay in Container.

## Forbidden leftovers

| Anti-pattern | Why |
|--------------|-----|
| `mt-24 sm:mt-32 lg:mt-40` | Too tall on mobile; replaced by the tokens above |
| `lg:mt-56` / `lg:mt-40` on dashboard | Hero leftover; dashboard uses `mt-4 sm:mt-8 lg:mt-16` |
| `-mx-5` / `-mx-6` on cards, MDX images, stats | Cancels the gutter |
| `mt-*` + `pt-*` on PageLinks | Doubles the band gap |
| Extra `mt-*` wrapper around `PageIntro` | Doubles the header offset |
