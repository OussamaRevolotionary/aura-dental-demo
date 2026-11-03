/**
 * Patient reviews shown in the "Patient Voices" section.
 *
 * ⚠ DEMO CONTENT — replace with genuine Google reviews (with the patients' consent) before launch.
 * Publishing invented testimonials is misleading advertising and is prohibited for medical providers
 * in Switzerland and most other markets.
 *
 * Reviews are deliberately kept in the patient's own language; `lang` sets direction and font.
 */
export type Review = {
  name: string;
  city: string;
  lang: "en" | "fr" | "ar";
  treatment: string;
  text: string;
  /** Rendered as localised relative time ("3 weeks ago", « il y a 3 semaines »…) */
  daysAgo: number;
};

export const REVIEWS: Review[] = [
  {
    name: "Charlotte W.",
    city: "Zürich",
    lang: "en",
    treatment: "Veneers",
    text: "Twenty years of fear — and I felt nothing.",
    daysAgo: 14,
  },
  {
    name: "Karim B.",
    city: "Casablanca",
    lang: "fr",
    treatment: "Implants",
    text: "Deux séjours, des dents fixes. Un accueil de grand hôtel.",
    daysAgo: 30,
  },
  {
    name: "نورة الف.",
    city: "دبي",
    lang: "ar",
    treatment: "Veneers",
    text: "رأيت ابتسامتي الجديدة قبل أي علاج.",
    daysAgo: 21,
  },
  {
    name: "Julien M.",
    city: "Genève",
    lang: "fr",
    treatment: "Invisalign®",
    text: "Exactement le résultat de la simulation.",
    daysAgo: 60,
  },
  {
    name: "Daniel K.",
    city: "London",
    lang: "en",
    treatment: "Implants",
    text: "No stitches. Back at work the next morning.",
    daysAgo: 30,
  },
  {
    name: "Yasmine H.",
    city: "Paris",
    lang: "fr",
    treatment: "AirFlow®",
    text: "Mon premier détartrage sans douleur.",
    daysAgo: 5,
  },
  {
    name: "عبدالله ر.",
    city: "الرياض",
    lang: "ar",
    treatment: "Implants",
    text: "تجربة راقية، والنتيجة طبيعية جدًا.",
    daysAgo: 60,
  },
  {
    name: "Sophie L.",
    city: "Basel",
    lang: "en",
    treatment: "Gum contouring",
    text: "45 minutes. I wish I'd done it years ago.",
    daysAgo: 21,
  },
];
