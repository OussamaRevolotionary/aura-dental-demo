import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";
import { useState } from "react";
import { JOURNEY_IMAGES } from "../config/mediaAssets";
import { useUI } from "../context/UIContext";
import { useI18n } from "../i18n";
import { Arrow, EASE, Reveal, SectionHeader } from "./ui";

const IMAGES = [JOURNEY_IMAGES.discovery, JOURNEY_IMAGES.trial, JOURNEY_IMAGES.delivery];

export default function PatientJourney() {
  const { openQuiz } = useUI();
  const { t } = useI18n();
  const j = t.journey;
  const [active, setActive] = useState(0);
  const step = j.steps[active];
  const last = j.steps.length - 1;
  const progress = `${(active / last) * 100}%`;

  return (
    <section id="journey" className="relative py-24 sm:py-32">
      <div className="container-luxe">
        <SectionHeader index="06" eyebrow={j.eyebrow} title={j.title} />

        <Reveal delay={0.1} className="relative mt-14">
          <div className="absolute start-[22px] top-0 h-full w-px bg-ink/10 md:start-0 md:top-[22px] md:h-px md:w-full" />
          <motion.div className="absolute start-[22px] top-0 w-px bg-emerald md:hidden" animate={{ height: progress }} transition={{ duration: 0.8, ease: EASE }} />
          <motion.div className="absolute start-0 top-[22px] hidden h-px bg-emerald md:block" animate={{ width: progress }} transition={{ duration: 0.8, ease: EASE }} />
          <ol className="relative grid gap-6 md:grid-cols-3 md:gap-8">
            {j.steps.map((s, i) => {
              const done = i < active;
              const on = i === active;
              const align = i === last ? "md:items-end md:text-end" : i === 1 ? "md:items-center md:text-center" : "";
              return (
                <li key={s.title}>
                  <button onClick={() => setActive(i)} className={`group flex w-full items-start gap-4 text-start md:flex-col md:gap-5 ${align}`} aria-current={on ? "step" : undefined}>
                    <span
                      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full border font-mono text-[12px] transition-all duration-500 ${
                        on
                          ? "border-emerald bg-emerald text-white shadow-[0_0_0_6px_rgb(var(--emerald)/0.12)]"
                          : done
                            ? "border-emerald bg-white text-emerald"
                            : "border-ink/15 bg-alabaster text-ink-muted group-hover:border-ink/40"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : `0${i + 1}`}
                    </span>
                    <span>
                      <span className={`display block text-[30px] leading-none transition-colors ${on ? "text-ink" : "text-ink/45 group-hover:text-ink"}`}>{s.title}</span>
                      <span className="mt-2 block text-[12.5px] text-ink-muted">{s.duration}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <div className="card-luxe mt-12 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="grid lg:grid-cols-[1fr_1.1fr]">
              <div className="relative aspect-[16/10] overflow-hidden bg-obsidian lg:aspect-auto">
                <motion.img
                  src={IMAGES[active]}
                  alt=""
                  initial={{ scale: 1.12 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.4, ease: EASE }}
                  className="absolute inset-0 h-full w-full object-cover object-[70%_50%]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-obsidian/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 start-6 font-serif text-[110px] italic leading-none text-white/90 sm:text-[140px]">0{active + 1}</div>
              </div>
              <div className="p-6 sm:p-10">
                <span className="chip border-gold/40 bg-gold-soft/40 text-gold-deep">
                  <Clock className="h-3 w-3" /> {step.duration}
                </span>
                <h3 className="display mt-5 text-[36px] sm:text-[44px]">{step.title}</h3>
                <p className="mt-3 text-[17px] leading-[1.6] text-ink-muted">{step.short}</p>
                <ul className="mt-7 grid gap-3">
                  {step.includes.map((x, i) => (
                    <motion.li
                      key={x}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: EASE }}
                      className="flex items-center gap-2.5 text-[14px]"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-soft text-emerald">
                        <Check className="h-3 w-3" />
                      </span>
                      {x}
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
                  <div className="flex gap-2">
                    <button onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0} className="icon-btn" aria-label={j.prev}>
                      <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
                    </button>
                    <button onClick={() => setActive((a) => Math.min(last, a + 1))} disabled={active === last} className="icon-btn" aria-label={j.next}>
                      <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                    </button>
                  </div>
                  <button onClick={() => openQuiz()} className="btn-primary group">
                    {j.cta}
                    <Arrow />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
