/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      /* Accent colours are CSS variables so a demo link can switch palette (see index.css). */
      colors: {
        alabaster: "#F8F6F2",
        stone: { 100: "#F1EEE8", 200: "#E7E2D9", 300: "#D8D1C4" },
        obsidian: { DEFAULT: "rgb(var(--obsidian) / <alpha-value>)", 800: "rgb(var(--obsidian-800) / <alpha-value>)", 700: "rgb(var(--obsidian-700) / <alpha-value>)", 600: "rgb(var(--obsidian-600) / <alpha-value>)" },
        ink: { DEFAULT: "#12161F", muted: "#5E6773" },
        emerald: { DEFAULT: "rgb(var(--emerald) / <alpha-value>)", deep: "rgb(var(--emerald-deep) / <alpha-value>)", soft: "rgb(var(--emerald-soft) / <alpha-value>)" },
        cyan: { glow: "rgb(var(--cyan) / <alpha-value>)" },
        gold: { DEFAULT: "rgb(var(--gold) / <alpha-value>)", soft: "rgb(var(--gold-soft) / <alpha-value>)", deep: "rgb(var(--gold-deep) / <alpha-value>)" },
        hairline: "rgba(20, 24, 29, 0.07)",
      },
      fontFamily: {
        serif: ['"Instrument Serif"', '"Noto Naskh Arabic"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', '"IBM Plex Sans Arabic"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"IBM Plex Sans Arabic"', "ui-monospace", "monospace"],
      },
      letterSpacing: { eyebrow: "0.22em" },
      borderRadius: { tile: "20px", card: "28px", media: "32px" },
      boxShadow: {
        luxe: "0 30px 80px -30px rgba(18, 22, 31, 0.35), 0 10px 30px -15px rgba(18, 22, 31, 0.15)",
        card: "0 1px 0 rgba(20,24,29,0.04), 0 12px 40px -20px rgba(18,22,31,0.18)",
        glow: "0 0 40px -6px rgb(var(--cyan) / 0.55)",
      },
      keyframes: {
        scan: { "0%": { transform: "translateY(-10%)" }, "100%": { transform: "translateY(110%)" } },
        ping2: { "0%": { transform: "scale(1)", opacity: "0.7" }, "100%": { transform: "scale(2.6)", opacity: "0" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        dash: { to: { strokeDashoffset: "0" } },
      },
      animation: {
        scan: "scan 3.6s cubic-bezier(.45,0,.55,1) infinite alternate",
        ping2: "ping2 2s cubic-bezier(0,0,.2,1) infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
