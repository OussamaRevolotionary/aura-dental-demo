import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DEMO } from "../config/demo";
import { useUI } from "../context/UIContext";
import { LANGS, useI18n } from "../i18n";
import { Arrow, EASE } from "./ui";

export const NAV_IDS = ["gallery", "technology", "treatments", "sanctuary", "journey", "faq"] as const;

export default function Navbar() {
  const { openQuiz } = useUI();
  const { t, lang } = useI18n();
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [active, setActive] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    const sections = NAV_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const darkIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.target as HTMLElement).toggleAttribute("data-under-nav", e.isIntersecting));
      setOnDark(document.querySelectorAll("[data-nav-dark][data-under-nav]").length > 0);
    }, { rootMargin: "0px 0px -92% 0px" });
    document.querySelectorAll("[data-nav-dark]").forEach((el) => darkIo.observe(el));
    return () => {
      io.disconnect();
      darkIo.disconnect();
    };
  }, [lang]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const shell = onDark ? "bg-obsidian/75 border-white/10 text-alabaster" : "bg-[#F8F6F2]/80 border-black/5 text-ink";

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${shell} ${
          scrolled ? "shadow-[0_8px_30px_-20px_rgba(0,0,0,0.25)]" : ""
        }`}
      >
        <DemoBanner />
        <nav className="container-luxe flex h-[68px] items-center justify-between gap-4">
          <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label={t.nav.home}>
            <BrandMark dark={onDark} />
            <span dir="ltr" className="font-mono text-[11px] font-medium tracking-[0.18em]">
              AURA <span className={onDark ? "text-cyan-glow" : "text-gold"}>//</span>{" "}
              <span className="hidden sm:inline">DENTAL STUDIO</span>
            </span>
          </a>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {NAV_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`relative whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                    active === id ? "" : onDark ? "text-white/60 hover:text-white" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {active === id && (
                    <motion.span
                      layoutId="nav-pill"
                      className={`absolute inset-0 -z-10 rounded-full ${onDark ? "bg-white/10" : "bg-ink/[0.06]"}`}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {t.nav.links[id]}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher dark={onDark} id="nav" />
            <button
              onClick={() => openQuiz()}
              className={`group btn btn-sm shimmer hidden md:inline-flex ${
                onDark ? "bg-alabaster text-ink hover:bg-white" : "bg-ink text-alabaster hover:bg-emerald-deep"
              }`}
            >
              {t.nav.cta}
              <Arrow up className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className={`grid h-10 w-10 place-items-center rounded-full border xl:hidden ${onDark ? "border-white/15" : "border-ink/10 bg-white/70"}`}
              aria-label={t.nav.openMenu}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className={`absolute bottom-[-1px] start-0 h-px w-full origin-left rtl:origin-right ${onDark ? "bg-cyan-glow" : "bg-gold"}`}
        />
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-alabaster xl:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="container-luxe flex h-[68px] shrink-0 items-center justify-between">
              <LanguageSwitcher id="menu" />
              <button onClick={() => setMobileOpen(false)} className="icon-btn h-10 w-10" aria-label={t.nav.closeMenu}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="container-luxe mt-4 flex flex-1 flex-col">
              {NAV_IDS.map((id, i) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}
                >
                  <a href={`#${id}`} onClick={() => setMobileOpen(false)} className="flex items-baseline justify-between border-b border-hairline py-4">
                    <span className="display text-[34px]">{t.nav.links[id]}</span>
                    <span className="font-mono text-[11px] text-ink-muted">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="container-luxe py-8">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openQuiz();
                }}
                className="btn-primary group w-full"
              >
                {t.nav.cta} <Arrow up />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** "Prepared for {clinic}" bar, shown only when the page was opened from a personalised demo link. */
function DemoBanner() {
  const { t } = useI18n();
  const [open, setOpen] = useState(!!DEMO.clinic);
  useEffect(() => {
    document.documentElement.style.setProperty("--banner-h", open ? "36px" : "0px");
  }, [open]);
  if (!open) return null;
  return (
    <div className="relative flex h-9 items-center justify-center gap-2 bg-obsidian px-12 text-[12px] text-white/70">
      <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
      <span className="truncate">
        {t.demo.prepared}{" "}
        <strong className="font-semibold text-white">{DEMO.clinic}</strong>
        {DEMO.city && <span className="text-white/50"> · {DEMO.city}</span>}
        <span className="hidden text-white/50 sm:inline"> — {t.demo.preview}</span>
      </span>
      <button onClick={() => setOpen(false)} className="absolute end-3 grid h-7 w-7 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white" aria-label={t.demo.hide}>
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function LanguageSwitcher({ dark = false, id, className = "" }: { dark?: boolean; id: string; className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.nav.language}
      dir="ltr"
      className={`relative items-center rounded-full border p-0.5 ${className.includes("hidden") ? "" : "flex"} ${
        dark ? "border-white/15 bg-white/5" : "border-ink/10 bg-white/70"
      } ${className}`}
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          aria-label={l.id === "ar" ? "العربية" : l.id === "fr" ? "Français" : "English"}
          lang={l.id}
          className={`relative z-10 h-8 min-w-[34px] rounded-full px-2 text-[11px] font-medium transition-colors ${
            lang === l.id ? (dark ? "text-ink" : "text-alabaster") : dark ? "text-white/60 hover:text-white" : "text-ink-muted hover:text-ink"
          } ${l.id === "ar" ? "font-sans text-[14px] leading-none" : "font-mono"}`}
        >
          {lang === l.id && (
            <motion.span
              layoutId={`lang-pill-${id}`}
              className={`absolute inset-0 -z-10 rounded-full ${dark ? "bg-alabaster" : "bg-ink"}`}
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
            />
          )}
          {l.short}
        </button>
      ))}
    </div>
  );
}

export function BrandMark({ dark = false, className = "h-8 w-8" }: { dark?: boolean; className?: string }) {
  return (
    <span className={`grid place-items-center rounded-[10px] transition-colors duration-500 ${className} ${dark ? "bg-white/10" : "bg-ink"}`}>
      <svg viewBox="0 0 64 64" className="h-[62%] w-[62%]" aria-hidden>
        <path
          d="M14 22c0-7 7-11 18-11s18 4 18 11c0 11-4 15-5.5 25-.7 5-3 8-5 8s-2.8-4-5.5-12c-2.7 8-3.3 12-5.5 12s-4.3-3-5-8C18 37 14 33 14 22z"
          fill="none"
          className={dark ? "stroke-cyan-glow" : "stroke-gold"}
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
