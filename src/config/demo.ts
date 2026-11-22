/**
 * Demo personalisation, read from the link you send a clinic:
 *
 *   /?for=Lava%20Dental&city=Riga&lang=en&theme=forest&wa=41790000000
 *
 *   for    clinic name — shown in the welcome bar and in every WhatsApp message
 *   city   optional, shown next to the name
 *   theme  gold (default) | forest | ocean
 *   wa     optional, digits only — the clinic's own WhatsApp, so they receive the test messages
 *   lang   en | fr | ar (handled by the i18n provider)
 *
 * Open /?maker to build these links without typing them.
 * The params stay in the address bar (the language switch keeps them), so reloads keep the demo.
 */
export type ThemeId = "gold" | "forest" | "ocean";
export const THEMES: { id: ThemeId; label: string; swatch: [string, string] }[] = [
  { id: "gold", label: "Gold", swatch: ["#0B0F17", "#C5A059"] },
  { id: "forest", label: "Forest", swatch: ["#04201A", "#C2A878"] },
  { id: "ocean", label: "Ocean", swatch: ["#071427", "#1D6FB8"] },
];

export type Demo = { clinic: string; city: string; theme: ThemeId; whatsapp: string };

function readDemo(): Demo {
  const params = new URLSearchParams(window.location.search);
  const pick = (k: string) => (params.get(k) ?? "").trim().slice(0, 60);
  const theme = pick("theme");
  return {
    clinic: pick("for"),
    city: pick("city"),
    theme: THEMES.some((t) => t.id === theme) ? (theme as ThemeId) : "gold",
    whatsapp: pick("wa").replace(/\D/g, ""),
  };
}

export const DEMO = readDemo();
export const MAKER_OPEN = new URLSearchParams(window.location.search).has("maker");

if (DEMO.theme !== "gold") document.documentElement.dataset.theme = DEMO.theme;
