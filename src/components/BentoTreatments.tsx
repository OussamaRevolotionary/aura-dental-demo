import { motion } from "framer-motion";
import { CalendarDays, Check, Clock, Feather, Wallet } from "lucide-react";
import { useRef, type MouseEvent, type ReactNode } from "react";
import type { GoalId } from "../config/clinic";
import { ENAMEL_SHIELD_POSTER, ENAMEL_SHIELD_VIDEO, HYGIENE_CARD_IMAGE, IMPLANT_CARD_IMAGE } from "../config/mediaAssets";
import { useUI, type CaseId } from "../context/UIContext";
import { Rich, useI18n } from "../i18n";
import type { Dict } from "../i18n/en";
import { Arrow, EASE, LoopVideo, Reveal, SectionHeader } from "./ui";

type TreatmentId = keyof Dict["treatments"]["items"];
type Treatment = {
  id: TreatmentId;
  goal: GoalId;
  caseId?: CaseId;
  className: string;
  dark?: boolean;
  visual: ReactNode;
};

export default function BentoTreatments() {
  const { t } = useI18n();
  const items = t.treatments.items;

  const TREATMENTS: Treatment[] = [
    {
      id: "veneers",
      goal: "makeover",
      caseId: "veneers",
      className: "lg:col-span-2 min-h-[500px]",
      dark: true,
      visual: (
        <>
          <LoopVideo
            src={ENAMEL_SHIELD_VIDEO}
            poster={ENAMEL_SHIELD_POSTER}
            label={items.veneers.videoLabel}
            className="absolute inset-0 h-full w-full scale-[1.3] object-cover transition-transform duration-[1.6s] ease-out [translate:10%_0] group-hover:scale-[1.36] rtl:[translate:-10%_0]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/40 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
        </>
      ),
    },
    {
      id: "implants",
      goal: "replace",
      caseId: "implants",
      className: "lg:row-span-2 min-h-[500px]",
      dark: true,
      visual: (
        <>
          <img
            src={IMPLANT_CARD_IMAGE}
            alt={items.implants.alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[64%_50%] transition-transform duration-[1.6s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-obsidian/10" />
        </>
      ),
    },
    {
      id: "aligners",
      goal: "straighter",
      caseId: "aligners",
      className: "min-h-[400px]",
      visual: <AlignerVisual label={t.treatments.stages} />,
    },
    {
      id: "hygiene",
      goal: "whiter",
      className: "min-h-[400px]",
      visual: (
        <>
          <img
            src={HYGIENE_CARD_IMAGE}
            alt={items.hygiene.alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[75%_50%] opacity-90 transition-transform duration-[1.6s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/10" />
        </>
      ),
    },
  ];

  return (
    <section id="treatments" className="relative py-24 sm:py-32">
      <div className="container-luxe">
        <SectionHeader index="04" eyebrow={t.treatments.eyebrow} title={t.treatments.title} lede={t.treatments.lede} />
        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
          {TREATMENTS.map((x, i) => (
            <BentoCard key={x.id} t={x} index={i} />
          ))}
        </div>
        <ConsultationCard />
      </div>
    </section>
  );
}

function BentoCard({ t: card, index }: { t: Treatment; index: number }) {
  const { openQuiz, showCase } = useUI();
  const { t } = useI18n();
  const copy = t.treatments.items[card.id];
  const ref = useRef<HTMLDivElement>(null);
  const dark = card.dark;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: EASE, delay: index * 0.08 }}
      className={`group relative ${card.className}`}
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        className={`relative flex h-full flex-col justify-end overflow-hidden rounded-card border p-6 transition-shadow duration-500 hover:shadow-luxe sm:p-8 ${
          dark ? "border-white/10 bg-obsidian text-alabaster" : "border-hairline bg-white text-ink shadow-card"
        }`}
      >
        {card.visual}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${dark ? "rgb(var(--cyan)/0.14)" : "rgb(var(--gold)/0.14)"}, transparent 60%)`,
          }}
        />

        <div className="absolute inset-x-6 top-6 flex flex-wrap items-center gap-2 sm:inset-x-8 sm:top-8">
          <span className={`chip ${dark ? "border-white/15 bg-white/10 text-white/85 backdrop-blur-md" : "border-hairline bg-alabaster text-ink-muted"}`}>
            <Clock className="h-3 w-3" /> {copy.duration}
          </span>
          <span className={`chip ${dark ? "border-emerald/40 bg-emerald/20 text-emerald-soft" : "border-emerald/25 bg-emerald-soft text-emerald-deep"}`}>
            <Feather className="h-3 w-3" /> {copy.comfort}
          </span>
        </div>

        <div className="relative max-w-[520px]">
          <div className={`eyebrow ${dark ? "text-gold" : "text-gold-deep"}`}>{copy.kicker}</div>
          <h3 className="display mt-2 text-[36px] sm:text-[44px]">
            <Rich text={copy.name} accent={dark ? "text-white" : "text-emerald"} />
          </h3>
          <p className={`mt-3 text-[14.5px] leading-[1.7] ${dark ? "text-white/70" : "text-ink-muted"}`}>{copy.desc}</p>


          <div className={`mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t pt-5 ${dark ? "border-white/10" : "border-hairline"}`}>
            <span className="flex items-center gap-2 text-[13.5px] font-semibold">
              <Wallet className={`h-4 w-4 ${dark ? "text-gold" : "text-gold-deep"}`} />
              {copy.price}
            </span>
            <div className="flex items-center gap-2">
              {card.caseId && (
                <button
                  onClick={() => showCase(card.caseId!)}
                  className={`btn btn-sm ${dark ? "border border-white/15 text-white hover:bg-white/10" : "border border-ink/10 hover:border-ink/30"}`}
                >
                  {t.treatments.seeCase}
                </button>
              )}
              <button onClick={() => openQuiz(card.goal)} className={`btn btn-sm ${dark ? "bg-white text-ink hover:bg-alabaster" : "bg-ink text-alabaster hover:bg-emerald-deep"}`}>
                {t.treatments.simulate}
                <Arrow className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/** The one fixed-price entry point: answers "what will this cost me?" before anyone books. */
function ConsultationCard() {
  const { openBooking } = useUI();
  const { t } = useI18n();
  const c = t.treatments.consultation;
  return (
    <Reveal className="mt-5">
      <div className="relative grid items-center gap-8 overflow-hidden rounded-card border border-gold/30 bg-gold-soft/40 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr_auto] lg:gap-12">
        <div>
          <div className="eyebrow text-gold-deep">{c.kicker}</div>
          <h3 className="display mt-2 text-[36px] sm:text-[44px]">
            <Rich text={c.name} accent="text-gold-deep" />
          </h3>
          <p className="mt-2 flex items-center gap-2 text-[13.5px] text-ink-muted">
            <Clock className="h-3.5 w-3.5" /> {c.duration}
          </p>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {c.includes.map((x) => (
            <li key={x} className="flex items-center gap-2.5 text-[14px]">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-alabaster">
                <Check className="h-3 w-3" />
              </span>
              {x}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 border-t border-gold/30 pt-6 lg:items-end lg:border-s lg:border-t-0 lg:ps-10 lg:pt-0 lg:text-end">
          <div>
            <div className="display text-[40px] leading-none" dir="ltr">{c.price}</div>
            <div className="mt-1.5 text-[12.5px] text-gold-deep">{c.credit}</div>
          </div>
          <button onClick={openBooking} className="btn-primary group">
            <CalendarDays className="h-4 w-4" /> {c.cta}
          </button>
        </div>
      </div>
    </Reveal>
  );
}

/** Procedural aligner-progress visual for the Invisalign card. */
function AlignerVisual({ label }: { label: string }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgb(var(--emerald-soft))_0%,transparent_60%)] rtl:bg-[radial-gradient(ellipse_at_20%_0%,rgb(var(--emerald-soft))_0%,transparent_60%)]" />
      <div className="absolute end-6 top-[72px] flex flex-col items-end sm:end-8">
        <div className="font-mono text-[52px] font-medium leading-none tracking-tighter text-ink/[0.1] transition-colors duration-700 group-hover:text-emerald/25">22</div>
        <div className="eyebrow text-[10px] text-ink-muted">{label}</div>
        <div className="mt-4 grid grid-cols-11 gap-1" dir="ltr">
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-emerald"
              initial={{ opacity: 0.12 }}
              whileInView={{ opacity: [0.12, 1, 0.35] }}
              transition={{ delay: i * 0.06, duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
