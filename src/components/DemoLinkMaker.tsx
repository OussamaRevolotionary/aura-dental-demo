import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { MAKER_OPEN, THEMES, type ThemeId } from "../config/demo";
import { useOverlay } from "../hooks/useLockBody";
import type { Lang } from "../i18n";
import { EASE } from "./ui";

/** Outreach message per language; {clinic} and {link} are filled in. */
const PITCH: Record<Lang, string> = {
  en: "Hello {clinic} team 👋 I designed a preview of what your website could look like, with online booking and WhatsApp built in: {link}",
  fr: "Bonjour l'équipe {clinic} 👋 J'ai préparé un aperçu de ce que pourrait être votre site, avec prise de rendez-vous et WhatsApp intégrés : {link}",
  ar: "مرحبًا فريق {clinic} 👋 صمّمت لكم معاينة لما يمكن أن يكون عليه موقعكم، مع الحجز عبر الإنترنت وواتساب: {link}",
};

/**
 * Internal tool, opened with /?maker. Fill in a clinic, get a personalised demo link
 * and a ready-to-send WhatsApp message. Not translated: it's for you, not for patients.
 */
export default function DemoLinkMaker() {
  const [open, setOpen] = useState(MAKER_OPEN);
  const close = () => {
    setOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("maker");
    window.history.replaceState(null, "", url);
  };
  useOverlay(open, close);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-obsidian/50 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Demo link maker"
            dir="ltr"
            lang="en"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[94vh] w-full max-w-[520px] overflow-y-auto rounded-t-card bg-alabaster text-left shadow-2xl sm:rounded-card"
          >
            <Maker onClose={close} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Maker({ onClose }: { onClose: () => void }) {
  const [clinic, setClinic] = useState("");
  const [city, setCity] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<ThemeId>("gold");
  const [phone, setPhone] = useState("");
  const [routeToThem, setRouteToThem] = useState(true);
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | "msg" | null>(null);

  const digits = phone.replace(/\D/g, "");
  const link = useMemo(() => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (clinic.trim()) url.searchParams.set("for", clinic.trim());
    if (city.trim()) url.searchParams.set("city", city.trim());
    if (lang !== "en") url.searchParams.set("lang", lang);
    if (theme !== "gold") url.searchParams.set("theme", theme);
    if (routeToThem && digits.length >= 7) url.searchParams.set("wa", digits);
    return url.toString();
  }, [clinic, city, lang, theme, digits, routeToThem]);

  const generated = PITCH[lang].replace("{clinic}", clinic.trim() || "…").replace("{link}", link);
  const message = draft ?? generated;
  const isLocal = /^(localhost|127\.|\[::1\])/.test(window.location.hostname);

  const copy = async (text: string, what: "link" | "msg") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked: the text stays selectable */
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow text-gold-deep">Demo link</div>
          <h2 className="display mt-1 text-[32px] leading-tight">Make a demo for a clinic</h2>
        </div>
        <button onClick={onClose} className="icon-btn h-10 w-10" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <input value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Clinic name" aria-label="Clinic name" className="field" autoFocus />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (optional)" aria-label="City" className="field" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-2 text-[12.5px] font-semibold">Language</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["en", "fr", "ar"] as Lang[]).map((l) => (
                <button key={l} type="button" onClick={() => setLang(l)} className={`choice ${lang === l ? "choice-on" : ""}`}>
                  {l === "ar" ? "ع" : l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[12.5px] font-semibold">Colours</div>
            <div className="grid grid-cols-3 gap-1.5">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  aria-pressed={theme === t.id}
                  title={t.label}
                  className={`flex h-[42px] items-center justify-center rounded-xl border bg-white transition ${theme === t.id ? "border-ink ring-2 ring-ink/10" : "border-ink/10 hover:border-ink/30"}`}
                >
                  <span className="flex">
                    <span className="h-5 w-5 rounded-full border-2 border-white" style={{ background: t.swatch[0] }} />
                    <span className="-ms-2 h-5 w-5 rounded-full border-2 border-white" style={{ background: t.swatch[1] }} />
                  </span>
                  <span className="sr-only">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Their WhatsApp number, e.g. +41 79 000 00 00"
            aria-label="Clinic WhatsApp number"
            type="tel"
            className="field"
          />
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-muted">
            <input type="checkbox" checked={routeToThem} onChange={(e) => setRouteToThem(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--emerald))]" />
            Send the demo's booking messages to this number, so they see it work
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-tile border border-hairline bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="eyebrow text-[10px] text-ink-muted">Link</div>
          <div className="flex gap-1.5">
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-sm border border-ink/10 py-2 hover:border-ink/30">
              <ExternalLink className="h-3.5 w-3.5" /> Preview
            </a>
            <button type="button" onClick={() => copy(link, "link")} className="btn btn-sm bg-ink py-2 text-alabaster hover:bg-emerald-deep">
              {copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <p className="mt-2 break-all font-mono text-[11.5px] text-ink/80">{link}</p>
        {isLocal && <p className="mt-2 text-[11.5px] text-gold-deep">This is a local address. Publish the site first so the link works on their phone.</p>}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline pt-3 text-[12px]">
          <span className="text-ink-muted">Front-desk view of their bookings</span>
          <a href={`${link}${link.includes("?") ? "&" : "?"}clinic`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-emerald hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> Clinic view
          </a>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12.5px] font-semibold">Message</span>
          {draft !== null && (
            <button type="button" onClick={() => setDraft(null)} className="text-[12px] text-emerald hover:underline">
              Reset
            </button>
          )}
        </div>
        <textarea
          value={message}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          dir={lang === "ar" ? "rtl" : "ltr"}
          className="field resize-none text-[14px] leading-relaxed"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => copy(message, "msg")} className="btn-glass">
            {copied === "msg" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === "msg" ? "Copied" : "Copy message"}
          </button>
          <a
            href={`https://wa.me/${digits}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={digits.length < 7}
            className={`btn-whatsapp ${digits.length < 7 ? "pointer-events-none opacity-40" : ""}`}
          >
            <MessageCircle className="h-4 w-4" /> Open in WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
