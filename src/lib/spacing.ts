/**
 * Site-wide spacing scale. Import these instead of inventing new mt/px stacks.
 * See `.cursor/skills/senior-ui-ux/SKILL.md`.
 */

/** Horizontal gutter — already applied by `Container`. Do not bleed past it. */
export const GUTTER_X = 'px-5 sm:px-6 lg:px-8'

/** First block after the header (PageIntro, hero, article header). */
export const PAGE_INTRO_Y = 'mt-16 sm:mt-24 lg:mt-32'

/** Space between major sections (ContactSection, Footer, Testimonial, bands). */
export const SECTION_Y = 'mt-16 sm:mt-24 lg:mt-32'

/** Space from PageIntro to the first content block. */
export const AFTER_INTRO_Y = 'mt-10 sm:mt-16 lg:mt-24'

/** Internal top padding of a tinted band (PageLinks, Values). Do not also add SECTION_Y. */
export const BAND_PT = 'pt-16 sm:pt-24 lg:pt-32'
