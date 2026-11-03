import { animate, motion, useInView, type HTMLMotionProps } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Rich, useI18n } from "../i18n";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade-and-rise on scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string } & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type Tone = "emerald" | "gold" | "cyan";
const TONE = {
  emerald: { text: "text-emerald", bar: "bg-emerald", accent: "text-emerald" },
  gold: { text: "text-gold-deep", bar: "bg-gold", accent: "text-gold-deep" },
  cyan: { text: "text-cyan-glow", bar: "bg-cyan-glow", accent: "text-cyan-glow" },
} as const;

export function Eyebrow({ children, index, tone = "emerald", className = "" }: { children: ReactNode; index?: string; tone?: Tone; className?: string }) {
  return (
    <div className={`eyebrow flex items-center gap-3 ${TONE[tone].text} ${className}`}>
      {index && <span className="opacity-60">{index}</span>}
      <span className={`h-px w-8 ${TONE[tone].bar}`} />
      {children}
    </div>
  );
}

/** The one section-header layout used by every section, so rhythm stays consistent. */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  tone = "emerald",
  center = false,
  dark = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  lede?: string;
  tone?: Tone;
  center?: boolean;
  dark?: boolean;
}) {
  const accent = TONE[tone].accent;
  if (center) {
    return (
      <Reveal className="mx-auto max-w-4xl text-center">
        <Eyebrow index={index} tone={tone} className="justify-center">
          {eyebrow}
        </Eyebrow>
        <h2 className={`display h-section mt-6 text-balance ${dark ? "text-alabaster" : ""}`}>
          <Rich text={title} accent={accent} />
        </h2>
        {lede && <p className={`mx-auto mt-6 max-w-2xl text-[16px] leading-[1.75] ${dark ? "text-white/60" : "text-ink-muted"}`}>{lede}</p>}
      </Reveal>
    );
  }
  return (
    <div className="grid items-end gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
      <Reveal>
        <Eyebrow index={index} tone={tone}>
          {eyebrow}
        </Eyebrow>
        <h2 className="display h-section mt-5 text-balance">
          <Rich text={title} accent={accent} />
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.1}>
          <p className="max-w-md text-[15.5px] leading-[1.75] text-ink-muted lg:ms-auto">{lede}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Direction-aware arrow: mirrors in RTL and nudges forward on group hover. */
export function Arrow({ className = "h-4 w-4", up = false }: { className?: string; up?: boolean }) {
  const Icon = up ? ArrowUpRight : ArrowRight;
  return (
    <Icon
      className={`${className} shrink-0 transition-transform duration-300 rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1`}
      aria-hidden
    />
  );
}

/** Counts up to a numeric value once it scrolls into view. */
export function CountUp({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.8, ease: EASE, onUpdate: setN });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {n.toFixed(decimals)}
    </span>
  );
}

/** Muted loop that only downloads and plays while on screen; falls back to its poster. */
export function LoopVideo({ src, poster, className = "", label }: { src: string; poster: string; className?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView) v.play().catch(() => undefined);
    else v.pause();
  }, [inView]);
  return (
    <video ref={ref} className={className} muted loop playsInline preload="none" poster={poster} aria-label={label}>
      <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
    </video>
  );
}

/** Text link with direction-aware arrow, for cross-linking between sections. */
export function LinkButton({ children, onClick, dark = false }: { children: ReactNode; onClick: () => void; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 text-[13px] font-semibold underline-offset-4 hover:underline ${
        dark ? "text-cyan-glow" : "text-emerald"
      }`}
    >
      {children}
      <Arrow className="h-3.5 w-3.5" />
    </button>
  );
}

export function useLocaleNumber() {
  const { locale } = useI18n();
  return (n: number) => new Intl.NumberFormat(locale).format(n);
}
