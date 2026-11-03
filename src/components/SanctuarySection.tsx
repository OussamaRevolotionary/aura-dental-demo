import { motion, useScroll, useTransform } from "framer-motion";
import { Flower2, Headphones, Layers, MessageCircle, MonitorPlay, Play, Syringe } from "lucide-react";
import { useRef, useState } from "react";
import { whatsappLink } from "../config/clinic";
import { CLINIC_CORRIDOR_VIDEO, CLINIC_LOUNGE_IMAGE, DIRECTOR_PORTRAIT_URL } from "../config/mediaAssets";
import { plain, Rich, useI18n } from "../i18n";
import { EASE, Eyebrow, Reveal, SectionHeader } from "./ui";

const AMENITY_ICONS = [Headphones, MonitorPlay, Flower2, Layers, Syringe];

export default function SanctuarySection() {
  const { t } = useI18n();
  const s = t.sanctuary;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const [playing, setPlaying] = useState(false);

  return (
    <section id="sanctuary" className="relative overflow-hidden bg-[#F2EEE6] py-16 sm:py-32">
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply" />
      <div className="container-luxe relative">
        <SectionHeader index="05" eyebrow={s.eyebrow} title={s.title} tone="gold" />

        <Reveal className="mt-10 sm:mt-14">
          <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-media shadow-luxe sm:aspect-[16/9]">
            {playing ? (
              <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster={CLINIC_LOUNGE_IMAGE}>
                <source src={CLINIC_CORRIDOR_VIDEO} type="video/mp4" />
              </video>
            ) : (
              <motion.img
                style={{ y, scale: 1.14 }}
                src={CLINIC_LOUNGE_IMAGE}
                alt={s.loungeAlt}
                className="absolute inset-0 h-full w-full object-cover object-[40%_50%]"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

            <button
              onClick={() => setPlaying((p) => !p)}
              className="group absolute start-5 top-5 flex items-center gap-3 rounded-full bg-white/85 py-2 pe-4 ps-2 text-[12.5px] font-semibold text-ink shadow-card backdrop-blur-xl transition hover:bg-white sm:start-8 sm:top-8"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white transition-transform group-hover:scale-110">
                <Play className="ms-0.5 h-3 w-3 fill-current rtl:-scale-x-100" />
              </span>
              {playing ? s.showLounge : s.playCorridor}
            </button>

            <ul className="absolute inset-x-5 bottom-5 flex flex-wrap gap-2 sm:inset-x-8 sm:bottom-8">
              {s.amenities.map((a, i) => {
                const Icon = AMENITY_ICONS[i];
                return (
                  <motion.li
                    key={a}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.07 }}
                    className="flex items-center gap-2 rounded-full border border-white/25 bg-white/15 py-2 pe-4 ps-2.5 text-[12.5px] font-medium text-white backdrop-blur-xl"
                  >
                    <Icon className="h-4 w-4 text-gold-soft" />
                    {a}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-5">
          <div className="flex flex-col items-start justify-between gap-4 rounded-card bg-ink px-6 py-5 text-alabaster sm:flex-row sm:items-center sm:px-8">
            <p className="display text-[24px] leading-tight sm:text-[28px]">
              <Rich text={s.nervous.title} accent="text-gold" />
            </p>
            <a href={whatsappLink(s.nervous.wa)} target="_blank" rel="noopener noreferrer" className="btn-light btn-sm shrink-0">
              <MessageCircle className="h-4 w-4" /> {s.nervous.cta}
            </a>
          </div>
        </Reveal>

        <DirectorFeature />
      </div>
    </section>
  );
}

function DirectorFeature() {
  const { t } = useI18n();
  const d = t.sanctuary.director;
  return (
    <div className="mt-24 grid items-center gap-12 sm:mt-32 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
      <Reveal>
        <div className="relative mx-auto max-w-[420px]">
          <div className="absolute -inset-3 rounded-[36px] border border-gold/40" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-media bg-obsidian">
            {DIRECTOR_PORTRAIT_URL ? <img src={DIRECTOR_PORTRAIT_URL} alt={d.portraitAlt} className="h-full w-full object-cover" /> : <PortraitMonogram caption={d.portraitCaption} />}
          </div>
          <div className="absolute -bottom-5 -end-3 rounded-tile border border-hairline bg-white px-4 py-3 shadow-luxe sm:-end-8">
            <div className="eyebrow text-[9.5px] text-ink-muted">{d.badgeLabel}</div>
            <div className="display text-[34px] leading-none">{d.badgeValue}</div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Eyebrow tone="gold">{d.eyebrow}</Eyebrow>
        <blockquote className="display mt-8 text-balance text-[34px] leading-[1.15] text-ink sm:text-[46px]">
          <Rich text={d.quote} />
        </blockquote>
        <div className="mt-10 flex items-center gap-4 border-t border-ink/10 pt-6">
          <span className="h-px w-10 bg-gold" />
          <div>
            <div className="text-[17px] font-semibold">{plain(d.name)}</div>
            <div className="mt-0.5 text-[13px] text-ink-muted">{d.creds}</div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/** Editorial monogram shown until a real portrait is set in mediaAssets.ts. */
function PortraitMonogram({ caption }: { caption: string }) {
  return (
    <div className="relative h-full w-full" dir="ltr">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(var(--obsidian-600))_0%,rgb(var(--obsidian))_70%)]" />
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="pm-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "rgb(var(--gold-soft))" }} />
            <stop offset="100%" style={{ stopColor: "rgb(var(--gold-deep))" }} />
          </linearGradient>
        </defs>
        <path
          d="M200 92c-44 0-72 34-72 82 0 30 10 54 24 72 8 10 10 22 6 34-6 18-30 28-62 38-36 12-56 36-62 82h332c-6-46-26-70-62-82-32-10-56-20-62-38-4-12-2-24 6-34 14-18 24-42 24-72 0-48-28-82-72-82z"
          fill="none"
          stroke="url(#pm-gold)"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse key={i} cx="200" cy="175" rx={40 + i * 18} ry={52 + i * 18} fill="none" className="stroke-cyan-glow" strokeOpacity={0.05 + (8 - i) * 0.006} />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 p-7">
        <div className="font-serif text-[88px] leading-none text-white/90">
          É<em className="italic text-gold">M</em>
        </div>
        <div className="eyebrow mt-2 text-[10px] text-white/45">{caption}</div>
      </div>
    </div>
  );
}
