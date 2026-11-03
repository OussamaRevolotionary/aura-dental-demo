import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { CalendarCheck, ChevronsLeftRight, Palette, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { GoalId } from "../config/clinic";
import { SMILE_CASES } from "../config/mediaAssets";
import { useUI, type CaseId } from "../context/UIContext";
import { fmt, useI18n } from "../i18n";
import SmileSimulation from "./SmileSimulation";
import { Arrow, EASE, Reveal, SectionHeader } from "./ui";

type CaseMeta = {
  id: CaseId;
  quizGoal: GoalId;
  /** Focal point (% of image) placed at frame centre, plus zoom, for photographic cases */
  focus?: { x: number; y: number; zoom: number };
  simulated?: { crowded?: boolean; gummy?: boolean };
};

const CASES: CaseMeta[] = [
  { id: "veneers", quizGoal: "makeover", focus: { x: 66, y: 52, zoom: 1.45 } },
  { id: "implants", quizGoal: "replace", focus: { x: 60, y: 46, zoom: 1.2 } },
  { id: "aligners", quizGoal: "straighter", simulated: { crowded: true } },
  { id: "gums", quizGoal: "makeover", simulated: { gummy: true } },
];

export default function BeforeAfterGallery() {
  const { openQuiz, galleryCase: active, setGalleryCase } = useUI();
  const { t } = useI18n();
  const c = CASES.find((x) => x.id === active)!;
  const copy = t.gallery.cases[active];
  const media = SMILE_CASES[active];

  const before =
    media.before !== null ? (
      <FocusImage src={media.before} alt={`${copy.tab} — ${t.common.before}`} focus={c.focus} />
    ) : (
      <SmileSimulation stage="before" labels={t.gallery.sim} {...c.simulated} />
    );
  const after =
    media.after !== null ? (
      <FocusImage src={media.after} alt={`${copy.tab} — ${t.common.after}`} focus={c.focus} />
    ) : (
      <SmileSimulation stage="after" labels={t.gallery.sim} />
    );

  return (
    <section id="gallery" className="relative py-16 sm:py-32">
      <div className="container-luxe">
        <SectionHeader index="01" eyebrow={t.gallery.eyebrow} title={t.gallery.title} />

        <Reveal delay={0.1} className="mt-12">
          <div className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0" role="tablist" aria-label={t.gallery.tabsAria}>
            <div className="inline-flex gap-1 rounded-full border border-hairline bg-white p-1.5 shadow-card">
              {CASES.map((x) => (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={active === x.id}
                  onClick={() => setGalleryCase(x.id)}
                  className={`relative whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors sm:px-5 ${
                    active === x.id ? "text-alabaster" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {active === x.id && (
                    <motion.span layoutId="gallery-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                  )}
                  <span className="relative">{t.gallery.cases[x.id].tab}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:gap-8">
          <Reveal>
            <div className="relative aspect-[16/11] overflow-hidden rounded-media bg-obsidian shadow-luxe sm:aspect-[16/10]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="absolute inset-0"
                >
                  <BeforeAfterSlider before={before} after={after} label={copy.tab} simulated={!!c.simulated} />
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.aside
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="card-luxe flex flex-col p-7 sm:p-9"
            >
              <div className="eyebrow text-gold-deep">{copy.tab}</div>
              <h3 className="display mt-4 text-[34px] leading-[1.05] sm:text-[42px]">{copy.title}</h3>

              <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
                <Meta icon={<Sparkles className="h-4 w-4" />} label={t.gallery.procedure} value={copy.procedure} />
                <Meta icon={<CalendarCheck className="h-4 w-4" />} label={t.gallery.duration} value={copy.duration} />
                <Meta icon={<Palette className="h-4 w-4" />} label={t.gallery.shade} value={copy.shade} />
              </dl>

              <button onClick={() => openQuiz(c.quizGoal)} className="btn-primary group mt-8 w-full lg:mt-auto">
                {t.gallery.cta}
                <Arrow />
              </button>
            </motion.aside>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function FocusImage({ src, alt, focus = { x: 50, y: 50, zoom: 1 } }: { src: string; alt: string; focus?: CaseMeta["focus"] }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading="lazy"
      className="absolute left-1/2 top-1/2 w-auto max-w-none"
      style={{ height: `${focus.zoom * 100}%`, transform: `translate(-${focus.x}%, -${focus.y}%)` }}
    />
  );
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <dt className="flex items-center gap-2.5 text-[13px] text-ink-muted">
        <span className="text-emerald">{icon}</span>
        {label}
      </dt>
      <dd className="text-end text-[15px] font-semibold">{value}</dd>
    </div>
  );
}

/** Draggable before/after comparison with pointer (mouse + touch) and keyboard support. */
export function BeforeAfterSlider({ before, after, label, simulated = false }: { before: ReactNode; after: ReactNode; label: string; simulated?: boolean }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const pos = useMotionValue(88);
  const [value, setValue] = useState(88);
  const [dragging, setDragging] = useState(false);
  const clip = useTransform(pos, (p) => `inset(0 ${100 - p}% 0 0)`);
  const left = useTransform(pos, (p) => `${p}%`);

  useMotionValueEvent(pos, "change", (v) => setValue(Math.round(v)));

  // Intro sweep so visitors immediately understand it is interactive
  useEffect(() => {
    const controls = animate(pos, 50, { duration: 1.6, ease: EASE, delay: 0.35 });
    return () => controls.stop();
  }, [pos]);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      pos.set(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
    },
    [pos],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    pos.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromClientX(e.clientX);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const map: Record<string, number> = { ArrowLeft: pos.get() - step, ArrowRight: pos.get() + step, Home: 0, End: 100 };
    if (e.key in map) {
      e.preventDefault();
      animate(pos, Math.min(100, Math.max(0, map[e.key])), { duration: 0.25 });
    }
  };

  return (
    <div
      ref={ref}
      dir="ltr"
      className={`relative h-full w-full touch-pan-y select-none ${dragging ? "cursor-grabbing" : "cursor-ew-resize"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="absolute inset-0 overflow-hidden">{after}</div>
      <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath: clip }}>
        {before}
      </motion.div>

      <span
        className="chip pointer-events-none absolute left-4 top-4 border-white/20 bg-black/35 text-white backdrop-blur-md transition-opacity duration-300 sm:left-6 sm:top-6"
        style={{ opacity: value < 14 ? 0 : 1 }}
      >
        {t.common.before}
      </span>
      <span
        className="chip pointer-events-none absolute right-4 top-4 border-white/30 bg-white/85 text-ink backdrop-blur-md transition-opacity duration-300 sm:right-6 sm:top-6"
        style={{ opacity: value > 86 ? 0 : 1 }}
      >
        {t.common.after}
      </span>
      {simulated && (
        <span className="chip pointer-events-none absolute bottom-4 left-4 max-w-[70%] overflow-hidden text-ellipsis border-cyan-glow/30 bg-black/40 text-cyan-glow backdrop-blur-md sm:bottom-6 sm:left-6">
          {t.gallery.simulated}
        </span>
      )}

      <motion.div className="pointer-events-none absolute inset-y-0 -translate-x-1/2" style={{ left }}>
        <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
        <div
          role="slider"
          tabIndex={0}
          aria-label={fmt(t.gallery.sliderAria, { name: label })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={fmt(t.gallery.sliderValue, { n: value })}
          onKeyDown={onKeyDown}
          className={`pointer-events-auto absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/25 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
            dragging ? "scale-90" : "hover:scale-110"
          }`}
        >
          <span className="absolute inset-1.5 rounded-full bg-white" />
          <ChevronsLeftRight className="relative h-5 w-5 text-ink" />
        </div>
      </motion.div>
    </div>
  );
}
