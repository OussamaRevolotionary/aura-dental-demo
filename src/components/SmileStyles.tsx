import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { useUI, type StyleId } from "../context/UIContext";
import { plain, Rich, useI18n } from "../i18n";
import { Arrow, EASE, Reveal, SectionHeader } from "./ui";

/** Shape and shade of each named look. All four share one geometry so the teeth morph between them. */
type Look = { shade: [string, string]; corner: number; lateralShort: number; canineLift: number; canineTip: number; code: string };
const LOOKS: Record<StyleId, Look> = {
  natural: { shade: ["#F1E9D6", "#DCCDB0"], corner: 11, lateralShort: 16, canineLift: 8, canineTip: 7, code: "A1" },
  soft: { shade: ["#F7F2E7", "#E7DCC6"], corner: 16, lateralShort: 11, canineLift: 5, canineTip: 3, code: "BL3" },
  hollywood: { shade: ["#FFFFFF", "#F0EEEA"], corner: 5, lateralShort: 4, canineLift: 2, canineTip: 0, code: "BL1" },
  youthful: { shade: ["#FAF6EC", "#EADFCB"], corner: 13, lateralShort: 22, canineLift: 12, canineTip: 9, code: "BL2" },
};
const IDS = Object.keys(LOOKS) as StyleId[];

/* six front teeth, canine → canine, mirrored around x = 300 */
const WIDTHS = [56, 66, 86];
const GAP = 3;
const TOP = 70;
const BOTTOM = 252;

function teeth(look: Look) {
  const half: { x: number; w: number; b: number; tip: number }[] = [];
  let x = 300 - GAP / 2;
  for (let i = WIDTHS.length - 1; i >= 0; i--) {
    const w = WIDTHS[i];
    x -= w;
    const b = i === 2 ? BOTTOM : i === 1 ? BOTTOM - look.lateralShort : BOTTOM - look.canineLift;
    half.unshift({ x, w, b, tip: i === 0 ? look.canineTip : 0 });
    x -= GAP;
  }
  const mirrored = half.map((t) => ({ ...t, x: 600 - t.x - t.w })).reverse();
  return [...half, ...mirrored];
}

function toothPath({ x, w, b, tip }: { x: number; w: number; b: number; tip: number }, r: number) {
  return `M${x} ${TOP} L${x} ${b - r} Q${x} ${b} ${x + r} ${b} L${x + w / 2} ${b + tip} L${x + w - r} ${b} Q${x + w} ${b} ${x + w} ${b - r} L${x + w} ${TOP} Z`;
}

/** Gum line: high over each tooth centre, dipping between teeth (papillae). */
function gumPath(list: ReturnType<typeof teeth>) {
  let d = `M20 20 L20 104`;
  list.forEach((t, i) => {
    const zenith = i === 2 || i === 3 ? 96 : i === 1 || i === 4 ? 104 : 94;
    d += ` Q${t.x + t.w / 2} ${zenith - 26} ${t.x + t.w + GAP / 2} ${122}`;
  });
  return `${d} L580 104 L580 20 Z`;
}

export default function SmileStyles() {
  const { t } = useI18n();
  const s = t.styles;
  const { openQuiz } = useUI();
  const [active, setActive] = useState<StyleId>("natural");
  const look = LOOKS[active];
  const list = teeth(look);
  const arc = `M${list[0].x + 10} ${list[0].b - 2} Q300 ${BOTTOM + 34} ${list[5].x + list[5].w - 10} ${list[5].b - 2}`;
  const item = s.items[active];

  return (
    <section id="styles" className="relative py-24 sm:py-32">
      <div className="container-luxe">
        <SectionHeader index="02" eyebrow={s.eyebrow} title={s.title} lede={s.lede} tone="gold" />

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
          <Reveal className="flex flex-col">
            <div role="radiogroup" aria-label={s.eyebrow} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
              {IDS.map((id) => {
                const on = id === active;
                return (
                  <button
                    key={id}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setActive(id)}
                    className={`group flex shrink-0 items-center gap-4 rounded-full border px-4 py-2.5 text-start transition lg:rounded-none lg:border-0 lg:border-b lg:px-1 lg:py-5 ${
                      on ? "border-ink bg-ink text-alabaster lg:border-ink/10 lg:bg-transparent lg:text-ink" : "border-ink/10 bg-white/70 lg:border-ink/10 lg:bg-transparent"
                    }`}
                  >
                    <span
                      className="hidden h-11 w-11 shrink-0 rounded-full border border-ink/10 shadow-inner lg:block"
                      style={{ background: `linear-gradient(160deg, ${LOOKS[id].shade[0]}, ${LOOKS[id].shade[1]})` }}
                    />
                    <span className="flex-1">
                      <span className={`block whitespace-nowrap text-[14px] font-semibold lg:display lg:text-[30px] lg:font-normal ${on ? "" : "lg:text-ink/45 lg:group-hover:text-ink"}`}>
                        <Rich text={s.items[id].name} accent={on ? "text-gold-deep" : ""} />
                      </span>
                      <span className="hidden text-[13px] text-ink-muted lg:block">{s.items[id].desc}</span>
                    </span>
                    <span className={`hidden h-6 w-6 place-items-center rounded-full transition lg:grid ${on ? "bg-ink text-alabaster" : "border border-ink/15 text-transparent"}`}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => openQuiz("makeover", active)} className="btn-primary group mt-8 hidden self-start lg:inline-flex">
              {s.cta} <Arrow />
            </button>
          </Reveal>

          <Reveal delay={0.1}>
            <div dir="ltr" className="relative overflow-hidden rounded-media bg-obsidian text-white shadow-luxe">
              <div
                aria-hidden
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage: "linear-gradient(rgb(var(--cyan)/0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--cyan)/0.06) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <svg viewBox="0 0 600 340" className="relative w-full" role="img" aria-label={`${plain(item.name)} — ${item.desc}`}>
                <defs>
                  <linearGradient id="style-enamel" x1="0" y1="0" x2="0" y2="1">
                    <motion.stop offset="0%" animate={{ stopColor: look.shade[0] }} transition={{ duration: 0.8 }} />
                    <motion.stop offset="100%" animate={{ stopColor: look.shade[1] }} transition={{ duration: 0.8 }} />
                  </linearGradient>
                  <linearGradient id="style-gum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B85C66" stopOpacity="0" />
                    <stop offset="45%" stopColor="#B85C66" />
                    <stop offset="100%" stopColor="#E3979A" />
                  </linearGradient>
                  <linearGradient id="style-shine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="45%" stopColor="#fff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <line x1="300" y1="40" x2="300" y2="320" className="stroke-cyan-glow" strokeOpacity="0.45" strokeDasharray="3 6" />
                {list.map((tooth, i) => (
                  <g key={i}>
                    <motion.path
                      initial={false}
                      animate={{ d: toothPath(tooth, look.corner) }}
                      transition={{ duration: 0.8, ease: EASE }}
                      fill="url(#style-enamel)"
                      stroke="#000"
                      strokeOpacity="0.18"
                    />
                    <rect x={tooth.x + tooth.w * 0.28} y={TOP + 40} width={tooth.w * 0.22} height={110} rx={tooth.w * 0.11} fill="url(#style-shine)" opacity="0.55" />
                  </g>
                ))}
                <path d={gumPath(list)} fill="url(#style-gum)" />
                <motion.path
                  initial={false}
                  animate={{ d: arc }}
                  transition={{ duration: 0.8, ease: EASE }}
                  fill="none"
                  className="stroke-cyan-glow"
                  strokeWidth="1.4"
                  strokeDasharray="2 5"
                />
              </svg>

              <div className="absolute inset-x-5 top-5 flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-white/60 sm:inset-x-7 sm:top-7">
                <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow" /> {s.design}
                </span>
                <span>{s.shade} {look.code}</span>
              </div>

              <div className="relative flex flex-wrap items-end justify-between gap-4 border-t border-white/10 p-5 sm:p-7">
                <div>
                  <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="display text-[30px] leading-none sm:text-[36px]">
                    <Rich text={item.name} accent="text-gold" />
                  </motion.div>
                  <p className="mt-2 text-[13.5px] text-white/60">{item.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="chip border-white/15 bg-white/5 text-white/75">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-[12.5px] text-ink-muted">{s.note}</p>
            <button onClick={() => openQuiz("makeover", active)} className="btn-primary group mt-6 w-full lg:hidden">
              {s.cta} <Arrow />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
