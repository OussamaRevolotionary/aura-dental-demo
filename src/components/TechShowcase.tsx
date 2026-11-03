import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { Cpu, Crosshair, Droplets, ScanLine } from "lucide-react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { AIRFLOW_RENDER, IMPLANT_ASSEMBLED_RENDER, IMPLANT_EXPLODED_RENDER, OSSEOINTEGRATION_RENDER, SMILE_CASES } from "../config/mediaAssets";
import { scrollToSection, useUI } from "../context/UIContext";
import { fmt, useI18n } from "../i18n";
import { CountUp, EASE, LinkButton, Reveal, SectionHeader } from "./ui";

type Part = "all" | "crown" | "abutment" | "root";
type PartId = Exclude<Part, "all">;

const PARTS: { id: PartId; y: number; band: [number, number] }[] = [
  { id: "crown", y: 22, band: [6, 37] },
  { id: "abutment", y: 43, band: [37, 54] },
  { id: "root", y: 74, band: [54, 98] },
];

const TECH: { part: Part; icon: ComponentType<{ className?: string }>; image: string }[] = [
  { part: "all", icon: ScanLine, image: IMPLANT_ASSEMBLED_RENDER },
  { part: "crown", icon: Cpu, image: SMILE_CASES.veneers.after },
  { part: "root", icon: Crosshair, image: OSSEOINTEGRATION_RENDER },
  { part: "abutment", icon: Droplets, image: AIRFLOW_RENDER },
];

const STATS = [
  { value: 12, decimals: 0 },
  { value: 60, decimals: 0 },
  { value: 0, decimals: 0 },
  { value: 0.1, decimals: 1 },
];

const CYCLE_MS = 8000;

export default function TechShowcase() {
  const { t } = useI18n();
  const { showCase, openQuiz } = useUI();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-30% 0px -30% 0px" });
  const tech = TECH[active];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });
  const radius = useTransform(scrollYProgress, [0, 1], [72, 0]);
  const inset = useTransform(scrollYProgress, [0, 1], ["2.5%", "0%"]);

  useEffect(() => {
    if (!auto || !inView) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % TECH.length), CYCLE_MS);
    return () => clearTimeout(id);
  }, [active, auto, inView]);

  const select = (i: number) => {
    setAuto(false);
    setActive(i);
  };
  const selectPart = (p: Part) => {
    const i = TECH.findIndex((x) => x.part === p);
    if (i >= 0) select(i);
  };
  const links = [() => scrollToSection("journey"), () => showCase("veneers"), () => showCase("implants"), () => openQuiz("whiter")];

  return (
    <motion.section
      id="technology"
      data-nav-dark
      ref={sectionRef}
      style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius, marginLeft: inset, marginRight: inset }}
      className="relative overflow-hidden bg-obsidian py-24 text-alabaster sm:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-glow/10 blur-[140px]" />
        <div className="absolute bottom-0 end-0 h-[400px] w-[500px] rounded-full bg-emerald/20 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(var(--cyan)/0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--cyan)/0.07) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)",
          }}
        />
      </div>

      <div className="container-luxe relative">
        <SectionHeader index="03" eyebrow={t.tech.eyebrow} title={t.tech.title} tone="cyan" center dark />

        <Reveal delay={0.1} className="mt-10 sm:mt-14">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={i} className="bg-obsidian/80 px-5 py-6 sm:px-8 sm:py-8">
                <div dir="ltr" className="font-mono text-[34px] font-medium leading-none tracking-tight sm:text-[48px] rtl:text-right">
                  <CountUp value={s.value} decimals={s.decimals} />
                  <span className="ms-1 text-[14px] text-cyan-glow sm:text-[16px]">{t.tech.statUnits[i]}</span>
                </div>
                <div className="mt-3 text-[12.5px] text-white/50">{t.tech.stats[i]}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 sm:mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <ImplantDiagram part={tech.part} onSelect={selectPart} />

          <div className="flex flex-col" role="tablist" aria-label={t.tech.tabsAria}>
            {TECH.map((x, i) => {
              const on = i === active;
              const Icon = x.icon;
              const copy = t.tech.items[i];
              return (
                <div key={i} className={`relative border-t border-white/10 ${i === TECH.length - 1 ? "border-b" : ""}`}>
                  {on && (
                    <motion.div
                      key={`bar-${active}-${auto}`}
                      className="absolute start-0 top-[-1px] h-px bg-cyan-glow shadow-glow"
                      initial={{ width: auto ? "0%" : "100%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: auto && inView ? CYCLE_MS / 1000 : 0.4, ease: "linear" }}
                    />
                  )}
                  <button role="tab" aria-selected={on} onClick={() => select(i)} className="group flex w-full items-start gap-4 py-6 text-start sm:gap-6">
                    <span className={`font-mono text-[12px] transition-colors ${on ? "text-cyan-glow" : "text-white/35"}`}>0{i + 1}.</span>
                    <span className="flex-1">
                      <span className={`block text-[18px] font-semibold tracking-tight transition-colors sm:text-[21px] ${on ? "text-white" : "text-white/55 group-hover:text-white/85"}`}>
                        {copy.title}
                      </span>
                      <span className={`mt-1 block text-[14px] transition-colors ${on ? "text-white/70" : "text-white/35"}`}>{copy.lede}</span>
                    </span>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all ${
                        on ? "border-cyan-glow/50 bg-cyan-glow/10 text-cyan-glow shadow-glow" : "border-white/10 text-white/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-5 pb-7 ps-8 sm:grid-cols-[1fr_150px] sm:ps-11">
                          <div>
                            <div className="grid grid-cols-3 gap-3">
                              {copy.stats.map(([v, l]) => (
                                <div key={l} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                                  <div className="font-mono text-[15px] text-white">{v}</div>
                                  <div className="mt-0.5 text-[10.5px] leading-tight text-white/45">{l}</div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-5">
                              <LinkButton dark onClick={links[i]}>
                                {copy.link}
                              </LinkButton>
                            </div>
                          </div>
                          <div className="relative hidden aspect-square overflow-hidden rounded-tile border border-white/10 sm:block">
                            <img src={x.image} alt="" className="h-full w-full object-cover object-[70%_50%]" loading="lazy" />
                            <div className="absolute inset-0 ring-1 ring-inset ring-cyan-glow/20" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ImplantDiagram({ part, onSelect }: { part: Part; onSelect: (p: Part) => void }) {
  const { t } = useI18n();
  const activeBand = PARTS.find((p) => p.id === part)?.band;
  const mask = activeBand
    ? `linear-gradient(to bottom, #000 0%, #000 ${activeBand[0] - 3}%, transparent ${activeBand[0]}%, transparent ${activeBand[1]}%, #000 ${activeBand[1] + 3}%, #000 100%)`
    : "linear-gradient(transparent, transparent)";

  return (
    <Reveal className="relative">
      <div dir="ltr" className="relative mx-auto aspect-[4/5] max-w-[560px] overflow-hidden rounded-media border border-white/10 bg-[#0d131d] shadow-[0_40px_120px_-40px_rgb(var(--cyan)/0.35)]">
        <img src={IMPLANT_EXPLODED_RENDER} alt={t.tech.diagramAlt} className="absolute inset-0 h-full w-full object-cover object-[83%_50%]" />

        <motion.div
          className="absolute inset-0 bg-obsidian/70"
          animate={{ opacity: activeBand ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
        />

        <div className="absolute inset-y-[4%] left-[calc(50%-92px)] w-px bg-gradient-to-b from-transparent via-cyan-glow/60 to-transparent sm:left-[calc(50%-120px)]" />
        <div className="absolute inset-y-[4%] right-[calc(50%-92px)] w-px bg-gradient-to-b from-transparent via-cyan-glow/60 to-transparent sm:right-[calc(50%-120px)]" />
        <motion.div
          className="absolute inset-y-[4%] left-1/2 w-px -translate-x-1/2"
          style={{ background: "repeating-linear-gradient(to bottom, rgb(var(--cyan)/0.8) 0 6px, transparent 6px 12px)" }}
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />

        {part === "all" && (
          <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
            <div className="h-full w-full animate-scan">
              <div className="h-16 w-full bg-gradient-to-b from-transparent to-cyan-glow/25" />
              <div className="h-px w-full bg-cyan-glow shadow-[0_0_24px_4px_rgb(var(--cyan)/0.7)]" />
            </div>
          </div>
        )}

        <AnimatePresence>
          {activeBand && (
            <motion.div
              key={part}
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute left-[12%] right-[12%] rounded-tile border border-cyan-glow/40 shadow-[inset_0_0_40px_rgb(var(--cyan)/0.15)]"
              style={{ top: `${activeBand[0]}%`, height: `${activeBand[1] - activeBand[0]}%` }}
            >
              {["-left-px -top-px border-l-2 border-t-2", "-right-px -top-px border-r-2 border-t-2", "-left-px -bottom-px border-l-2 border-b-2", "-right-px -bottom-px border-r-2 border-b-2"].map((c) => (
                <span key={c} className={`absolute h-4 w-4 rounded-[3px] border-cyan-glow ${c}`} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {PARTS.map((p, i) => {
          const on = part === p.id || part === "all";
          const copy = t.tech.parts[p.id];
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="group absolute left-[6%] flex -translate-y-1/2 items-center gap-2 text-left"
              style={{ top: `${p.y}%` }}
              aria-label={fmt(t.tech.highlight, { name: copy.name })}
            >
              <span
                className={`rounded-xl border px-2.5 py-2 backdrop-blur-md transition-all duration-500 sm:px-3 ${
                  on ? "border-cyan-glow/40 bg-obsidian/70" : "border-white/10 bg-obsidian/40 opacity-60 group-hover:opacity-100"
                }`}
              >
                <span className="block font-mono text-[9px] tracking-[0.14em] text-cyan-glow">
                  0{i + 1} · {t.tech.layer}
                </span>
                <span className="mt-0.5 block max-w-[150px] text-[11.5px] font-semibold text-white sm:max-w-none sm:text-[12.5px]">{copy.name}</span>
                <span className="mt-0.5 hidden font-mono text-[9.5px] text-white/50 sm:block">{copy.spec}</span>
              </span>
              <span className={`hidden h-px bg-cyan-glow/60 transition-all duration-500 sm:block ${on ? "w-10" : "w-5"}`} />
              <span className="relative grid h-4 w-4 place-items-center">
                <span className={`absolute inset-0 rounded-full bg-cyan-glow/40 ${on ? "animate-ping2" : ""}`} />
                <span className={`relative h-2 w-2 rounded-full ${on ? "bg-cyan-glow shadow-glow" : "bg-white/60"}`} />
              </span>
            </button>
          );
        })}

        <div className="absolute bottom-4 right-4 font-mono text-[9.5px] tracking-[0.14em] text-white/40">{t.tech.fig}</div>
      </div>
    </Reveal>
  );
}
