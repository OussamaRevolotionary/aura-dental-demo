import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ar from "./ar";
import en, { type Dict } from "./en";
import fr from "./fr";

export type Lang = "en" | "fr" | "ar";
export const LANGS: { id: Lang; short: string }[] = [
  { id: "en", short: "EN" },
  { id: "fr", short: "FR" },
  { id: "ar", short: "ع" },
];

const DICTS: Record<Lang, Dict> = { en, fr, ar };
/** Intl locales — Arabic keeps Latin digits so prices, phones and metrics stay consistent. */
const LOCALES: Record<Lang, string> = { en: "en-GB", fr: "fr-CH", ar: "ar-u-nu-latn" };
const STORAGE_KEY = "aura-lang";

function detectLang(): Lang {
  const isLang = (v: string | null): v is Lang => v === "en" || v === "fr" || v === "ar";
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (isLang(fromUrl)) return fromUrl;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  const nav = navigator.language.slice(0, 2);
  return isLang(nav) ? nav : "en";
}

type I18nState = { lang: Lang; t: Dict; dir: "ltr" | "rtl"; locale: string; setLang: (l: Lang) => void };
const I18nContext = createContext<I18nState | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const t = DICTS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
    const url = new URL(window.location.href);
    if (lang === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang);
    window.history.replaceState(null, "", url);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir, t]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const value = useMemo(() => ({ lang, t, dir, locale: LOCALES[lang], setLang }) as I18nState, [lang, t, dir, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Replace {key} placeholders. */
export function fmt(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

/** Strip *, ** markup for plain-text contexts (aria labels, WhatsApp). */
export function plain(s: string) {
  return s.replace(/\*\*?/g, "").replace(/\n/g, " ");
}

/**
 * Render inline markup: *accent* → <em>, **bold** → <strong>, \n → <br>.
 * `accent` sets the class of emphasised words (colour); italics are disabled for Arabic via CSS.
 */
export function Rich({ text, accent = "text-emerald", strong = "font-semibold text-ink" }: { text: string; accent?: string; strong?: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
            if (part.startsWith("**")) return <strong key={i} className={strong}>{part.slice(2, -2)}</strong>;
            if (part.startsWith("*")) return <em key={i} className={`italic ${accent}`}>{part.slice(1, -1)}</em>;
            return <Fragment key={i}>{part}</Fragment>;
          })}
        </Fragment>
      ))}
    </>
  );
}
