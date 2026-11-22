import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Award, BadgeCheck, FlaskConical, Gem, Play, ShieldCheck, Star, X } from "lucide-react";
import { Fragment, useEffect, useState, type MouseEvent } from "react";
import { CLINIC } from "../config/clinic";
import { useSandboxText } from "../config/sandbox";
import { CLINIC_CORRIDOR_VIDEO, CLINIC_LOUNGE_IMAGE, HERO_POSTER_URL, HERO_VIDEO_URL } from "../config/mediaAssets";
import { useUI } from "../context/UIContext";
import { useOverlay } from "../hooks/useLockBody";
import { fmt, plain, Rich, useI18n } from "../i18n";
import { Arrow, EASE } from "./ui";

const TELEMETRY = [
  { value: 98.4, unit: "%", decimals: 1, jitter: 0.3 },
  { value: 12, unit: "μm", decimals: 0, jitter: 1 },
  { value: 5, unit: "Ti", decimals: 0, jitter: 0 },
];

function useTelemetry() {
  const [values, setValues] = useState(TELEMETRY.map((t) => t.value));
  useEffect(() => {
    const id = setInterval(() => setValues(TELEMETRY.map((t) => t.value + (Math.random() - 0.5) * 2 * t.jitter)), 1400);
    return () => clearInterval(id);
  }, []);
  return values;
}

/** Headline that rises in word by word. Keeps *accent* / **bold** markup from the dictionaries. */
function WordReveal({ lines }: { lines: string[] }) {
  let n = 0;
  return (
    <span aria-hidden>
      {lines.map((text, li) => (
        <span key={li} className="block">
          {text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).flatMap((part, pi) => {
            const em = part.startsWith("*") && !part.startsWith("**");
            const strong = part.startsWith("**");
            const body = strong ? part.slice(2, -2) : em ? part.slice(1, -1) : part;
            return body.split(/(\s+)/).filter(Boolean).map((word, wi) => {
              if (/^\s+$/.test(word)) return <Fragment key={`${pi}-${wi}`}> </Fragment>;
              const i = n++;
              return (
                <span key={`${pi}-${wi}`} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <motion.span
                    className={`inline-block ${em ? "italic text-emerald" : ""} ${strong ? "font-semibold" : ""}`}
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.07 }}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            });
          })}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const { openQuiz } = useUI();
  const { t, lang, locale } = useI18n();
  const sbx = useSandboxText();
  const [tourOpen, setTourOpen] = useState(false);
  const values = useTelemetry();
  const month = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date());

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 20 });
  const hudX = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });
  const hudY = useSpring(useTransform(my, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section id="top" className="relative overflow-hidden pb-14 pt-[calc(100px+var(--banner-h,0px))] sm:pt-[calc(116px+var(--banner-h,0px))] lg:pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -start-40 top-10 h-[520px] w-[520px] rounded-full bg-gold-soft/60 blur-[120px]" />
        <div className="absolute -end-[10%] -top-[10%] h-[620px] w-[620px] rounded-full bg-emerald-soft/70 blur-[140px]" />
        <div className="grain absolute inset-0 opacity-[0.05] mix-blend-multiply" />
      </div>

      <div className="container-luxe relative grid items-center gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold-soft/40 px-3.5 py-1.5"
          >
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="eyebrow text-[10px] tracking-[0.16em] text-gold-deep sm:text-[10.5px]">{t.hero.badge}</span>
          </motion.div>

          <h1 key={lang} aria-label={plain(t.hero.title.join(" "))} className="display mt-6 text-[40px] text-ink sm:mt-7 sm:text-[62px] lg:text-[74px] xl:text-[84px]">
            <WordReveal lines={t.hero.title} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
            className="mt-7 max-w-[540px] text-pretty text-[16px] leading-[1.75] text-ink-muted sm:text-[17px]"
          >
            <Rich text={t.hero.sub} />
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <button onClick={() => openQuiz()} className="btn-primary shimmer group">
              {t.hero.ctaPrimary}
              <Arrow />
            </button>
            <button onClick={() => setTourOpen(true)} className="btn-glass group">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-alabaster transition-transform group-hover:scale-110">
                <Play className="ms-0.5 h-3 w-3 fill-current rtl:-scale-x-100" />
              </span>
              {t.hero.ctaSecondary}
            </button>
          </motion.div>

          {/* one quiet proof row: rating · comfort · availability */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
            className="mt-9 flex max-w-[560px] flex-wrap items-center gap-x-6 gap-y-3 border-t sm:mt-12 border-ink/10 pt-6 text-[13px] text-ink-muted"
          >
            <a href={CLINIC.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-ink">
              <span className="flex" dir="ltr">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </span>
              <span className="font-semibold text-ink">{CLINIC.rating}</span>
              {fmt(t.hero.reviews, { n: CLINIC.reviewCount })} <span className="text-[11px] opacity-70">({sbx.sample})</span>
            </a>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald" /> {t.hero.painFree}
            </span>
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-emerald" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </span>
              {t.nav.accepting} · <span className="capitalize text-ink">{month}</span>
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
          className="relative [perspective:1400px]"
          onMouseMove={onMove}
          onMouseLeave={() => {
            mx.set(0);
            my.set(0);
          }}
        >
          <motion.div
            dir="ltr"
            style={{ rotateX: rx, rotateY: ry }}
            className="relative aspect-[4/3.8] overflow-hidden rounded-media bg-obsidian shadow-2xl ring-1 ring-black/10 sm:aspect-[5/5.4] lg:aspect-[4/5]"
          >
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={HERO_POSTER_URL}
              aria-label={t.hero.videoLabel}
            >
              <source src={HERO_VIDEO_URL} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-obsidian/40" />
            <ScanHud values={values} x={hudX} y={hudY} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.3 }}
            className="absolute -start-4 top-[40%] hidden rounded-tile border border-hairline bg-white/85 p-4 shadow-luxe backdrop-blur-xl sm:block lg:-start-10"
          >
            <div className="eyebrow text-[9.5px] text-ink-muted">{t.hero.accolade.label}</div>
            <div className="display mt-1 text-[34px] leading-none">
              {t.hero.accolade.value} <span className="text-[18px] italic text-emerald">{t.hero.accolade.unit}</span>
            </div>
            <div className="mt-1 text-[11px] text-ink-muted">{t.hero.accolade.note}</div>
          </motion.div>
        </motion.div>
      </div>

      <TrustStrip items={t.hero.trust} />
      <VirtualTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </section>
  );
}

function ScanHud({ values, x, y }: { values: number[]; x: MotionValue<number>; y: MotionValue<number> }) {
  const { t } = useI18n();
  return (
    <motion.div style={{ x, y }} className="pointer-events-none absolute inset-0 text-white">
      {["left-5 top-5 border-l border-t", "right-5 top-5 border-r border-t", "left-5 bottom-5 border-l border-b", "right-5 bottom-5 border-r border-b"].map((c) => (
        <span key={c} className={`absolute h-6 w-6 border-cyan-glow/70 ${c}`} />
      ))}

      <div className="absolute left-9 right-9 top-8 flex items-center justify-between font-mono text-[10px] tracking-[0.14em]">
        <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-glow" /> {t.hero.hud.live}
        </span>
        <span className="hidden text-white/60 sm:inline">{t.hero.hud.scan}</span>
      </div>

      <svg className="absolute left-1/2 top-[42%] h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 200 200" aria-hidden>
        <motion.circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="#38BDF8"
          strokeOpacity="0.35"
          strokeWidth="0.6"
          strokeDasharray="2 5"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
        />
        <motion.path
          d="M100 14 A86 86 0 0 1 186 100"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
        />
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1="100" y1="2" x2="100" y2="12" className="stroke-cyan-glow" strokeOpacity="0.8" strokeWidth="0.8" transform={`rotate(${a} 100 100)`} />
        ))}
      </svg>

      <div className="absolute inset-x-6 top-0 h-[85%] overflow-hidden">
        <div className="h-full w-full animate-scan">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-glow to-transparent shadow-[0_0_18px_2px_rgb(var(--cyan)/0.6)]" />
        </div>
      </div>

      <div className="absolute right-8 top-[30%] hidden text-right font-mono text-[9.5px] leading-[1.7] text-white/70 sm:block rtl:left-8 rtl:right-auto rtl:text-left">
        <div className="text-cyan-glow">{t.hero.hud.abutment}</div>
        <div>{t.hero.hud.torque}</div>
        <div>{t.hero.hud.angle}</div>
      </div>

      <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-px overflow-hidden rounded-tile border border-white/10 bg-white/10 backdrop-blur-xl sm:inset-x-6 sm:bottom-6">
        {TELEMETRY.map((m, i) => (
          <div key={i} className="bg-obsidian/55 px-3 py-3 sm:px-4 sm:py-3.5">
            <div className="truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/55 sm:text-[9.5px]">
              {t.hero.telemetry[i]}
            </div>
            <div className="mt-1.5 whitespace-nowrap font-mono text-[14px] font-medium tabular-nums text-white sm:text-[19px]">
              {values[i].toFixed(m.decimals)}
              <span className="ms-0.5 text-[11px] text-cyan-glow">{m.unit}</span>
            </div>
            <div className="mt-2 h-[2px] overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-cyan-glow"
                animate={{ width: `${[values[0], 100 - values[1] * 2, 100][i]}%` }}
                transition={{ duration: 1.2, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** Credentials as a quiet row of seals, scrollable on phones. */
function TrustStrip({ items }: { items: string[][] }) {
  const icons = [BadgeCheck, Award, Gem, ShieldCheck, FlaskConical];
  return (
    <div className="container-luxe relative mt-14 lg:mt-20">
      <ul className="no-scrollbar -mx-5 flex snap-x overflow-x-auto border-y border-hairline px-5 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5">
        {items.map(([title, sub], i) => {
          const Icon = icons[i % icons.length];
          return (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 1.2 + i * 0.08 }}
              className="flex min-w-[200px] snap-start items-center gap-3 border-hairline py-5 pe-6 lg:min-w-0 lg:border-s lg:ps-6 lg:first:border-s-0 lg:first:ps-0"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 text-gold-deep">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="leading-tight">
                <span className="block text-[13.5px] font-semibold">{title}</span>
                <span className="block text-[12px] text-ink-muted">{sub}</span>
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function VirtualTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  useOverlay(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-obsidian/80 p-4 backdrop-blur-xl sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t.hero.ctaSecondary}
        >
          <motion.div
            initial={{ scale: 0.92, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative w-full max-w-5xl overflow-hidden rounded-media bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video className="aspect-video w-full object-cover" autoPlay muted loop playsInline controls poster={CLINIC_LOUNGE_IMAGE}>
              <source src={CLINIC_CORRIDOR_VIDEO} type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-5 sm:p-7">
              <div className="eyebrow text-gold">{t.hero.tour.eyebrow}</div>
              <div className="display mt-1 text-[26px] text-white sm:text-[34px]">
                <Rich text={t.hero.tour.title} accent="text-white" />
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
              aria-label={t.hero.tour.close}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
