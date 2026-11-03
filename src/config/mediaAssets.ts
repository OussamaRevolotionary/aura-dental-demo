/**
 * AURA Dental Studio — media manifest.
 *
 * Every visual on the site is read from this file. To swap in a new Nano Banana
 * render or Veo loop, drop the file into /public/media and change the path here
 * (or paste a full CDN URL). Videos accept .mp4 or .webm; posters should be .webp.
 *
 * Current files were generated from the /Material folder:
 *   clip-a.mp4  — tooth suspended in water, cyan enamel shield sweep
 *   clip-b.mp4  — sunlit clinic corridor with olive tree (hospitality)
 *   clip-c.mp4  — implant + crown assembling on a cyan scan grid
 */

const MEDIA = `${import.meta.env.BASE_URL}media`;

/* ── Hero ─────────────────────────────────────────────────────────── */
export const HERO_VIDEO_URL = `${MEDIA}/clip-c.mp4`;
export const HERO_POSTER_URL = `${MEDIA}/implant-assembled.webp`;

/* ── Tech showcase (dark section) ─────────────────────────────────── */
export const IMPLANT_EXPLODED_RENDER = `${MEDIA}/implant-exploded.webp`;
export const IMPLANT_ASSEMBLED_RENDER = `${MEDIA}/implant-assembled.webp`;
export const OSSEOINTEGRATION_RENDER = `${MEDIA}/osseointegration-scan.webp`;
export const AIRFLOW_RENDER = `${MEDIA}/airflow-halo.webp`;

/* ── Bento treatments ─────────────────────────────────────────────── */
export const ENAMEL_SHIELD_VIDEO = `${MEDIA}/clip-a.mp4`;
export const ENAMEL_SHIELD_POSTER = `${MEDIA}/shade-after.webp`;
export const IMPLANT_CARD_IMAGE = `${MEDIA}/crown-in-bone.webp`;
export const HYGIENE_CARD_IMAGE = `${MEDIA}/enamel-shield.webp`;

/* ── Hospitality / Sanctuary ──────────────────────────────────────── */
export const CLINIC_LOUNGE_IMAGE = `${MEDIA}/clinic-lounge.webp`;
export const CLINIC_CORRIDOR_VIDEO = `${MEDIA}/clip-b.mp4`;

/**
 * Lead Clinical Director portrait. Leave as null to render the procedural
 * editorial monogram card; set to an image path (portrait ratio ~4:5) to use a photo.
 */
export const DIRECTOR_PORTRAIT_URL: string | null = null;

/* ── Before / After smile gallery ─────────────────────────────────── */
export const SMILE_CASES = {
  veneers: {
    before: `${MEDIA}/shade-before.webp`,
    after: `${MEDIA}/shade-after.webp`,
  },
  implants: {
    before: `${MEDIA}/full-arch-before.webp`,
    after: `${MEDIA}/full-arch-after.webp`,
  },
  /* null → rendered as a procedural Digital Smile Design simulation */
  aligners: { before: null, after: null },
  gums: { before: null, after: null },
} as const;

/* ── Patient journey ──────────────────────────────────────────────── */
export const JOURNEY_IMAGES = {
  discovery: `${MEDIA}/osseointegration-scan.webp`,
  trial: `${MEDIA}/full-arch-after.webp`,
  delivery: `${MEDIA}/implant-assembled.webp`,
} as const;

/* ── Editorial intro (three staggered portrait crops) ─────────────── */
export const EDITORIAL_IMAGES = [
  { src: `${MEDIA}/editorial-smile.webp`, focus: "50% 50%" },
  { src: `${MEDIA}/editorial-lounge.webp`, focus: "50% 50%" },
  { src: `${MEDIA}/editorial-tooth.webp`, focus: "50% 50%" },
] as const;
