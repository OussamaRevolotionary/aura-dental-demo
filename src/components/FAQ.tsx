import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Mail, MapPin, MessageCircle, Phone, Plane, Plus } from "lucide-react";
import { useState } from "react";
import { CLINIC, clinicStatus, telLink, whatsappLink } from "../config/clinic";
import { Rich, useI18n } from "../i18n";
import { EASE, Reveal, SectionHeader } from "./ui";

export default function FAQ() {
  const { t } = useI18n();
  const f = t.faq;
  const [open, setOpen] = useState<number | null>(0);
  const today = new Date().getDay();
  const todayRow = today === 0 ? 3 : today === 6 ? 2 : today === 5 ? 1 : 0;
  const isOpen = clinicStatus().open;

  return (
    <section id="faq" className="relative bg-[#F2EEE6] py-16 sm:py-32">
      <div className="container-luxe">
        <SectionHeader index="08" eyebrow={f.eyebrow} title={f.title} />

        <div className="mt-10 sm:mt-14 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <Reveal>
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {f.items.map((item, i) => {
                const on = open === i;
                return (
                  <li key={item.q}>
                    <button
                      onClick={() => setOpen(on ? null : i)}
                      aria-expanded={on}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-start"
                    >
                      <span className={`text-[17px] font-semibold tracking-tight transition-colors sm:text-[19px] ${on ? "text-ink" : "text-ink/75 group-hover:text-ink"}`}>
                        {item.q}
                      </span>
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                          on ? "rotate-45 border-ink bg-ink text-alabaster" : "border-ink/15 text-ink group-hover:border-ink/40"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pb-7 text-[15px] leading-[1.8] text-ink-muted">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-card bg-ink p-6 text-alabaster sm:flex-row sm:items-center sm:p-7">
              <div>
                <div className="display text-[28px] leading-tight">{f.more.title}</div>
              </div>
              <a href={whatsappLink(t.concierge.hello)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp shrink-0">
                <MessageCircle className="h-4 w-4" /> {f.more.cta}
              </a>
            </div>
          </Reveal>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Reveal className="rounded-card border border-hairline bg-white p-6 shadow-card sm:p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-soft/60 text-gold-deep">
                <Plane className="h-5 w-5 rtl:-scale-x-100" />
              </span>
              <h3 className="display mt-5 text-[30px] leading-tight">{f.international.title}</h3>
              <ul className="mt-5 space-y-2.5">
                {f.international.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-[14px]">
                    <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1} className="overflow-hidden rounded-card border border-hairline bg-white shadow-card">
              <MiniMap />
              <div className="p-6 sm:p-7">
                <h3 className="display text-[30px] leading-tight">
                  <Rich text={f.visit.title} />
                </h3>
                <p className="mt-2 flex gap-2 text-[14px] text-ink/85">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                  <span dir="ltr" className="rtl:text-right">
                    {CLINIC.address[0]}, {CLINIC.address[1]}
                  </span>
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {f.visit.perks.map((p) => (
                    <li key={p} className="flex items-center gap-1.5 rounded-full bg-emerald-soft px-2.5 py-1 text-[12px] font-medium text-emerald-deep">
                      <Check className="h-3 w-3" /> {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center justify-between">
                  <div className="eyebrow text-[10px] text-ink-muted">{f.visit.hours}</div>
                  <span className={`chip ${isOpen ? "border-emerald/30 bg-emerald-soft text-emerald-deep" : "border-hairline bg-alabaster text-ink-muted"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-emerald" : "bg-ink/30"}`} />
                    <Clock className="h-3 w-3" />
                  </span>
                </div>
                <dl className="mt-3 space-y-1.5 text-[13.5px]">
                  {f.visit.rows.map(([d, h], i) => (
                    <div key={d} className={`flex justify-between gap-4 ${i === todayRow ? "font-semibold text-ink" : "text-ink-muted"}`}>
                      <dt>{d}</dt>
                      <dd dir="ltr">{h}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm col-span-3 bg-ink text-alabaster hover:bg-emerald-deep sm:col-span-1">
                    <MapPin className="h-3.5 w-3.5" /> {f.visit.directions}
                  </a>
                  <a href={telLink()} className="btn btn-sm border border-ink/10 hover:border-ink/30">
                    <Phone className="h-3.5 w-3.5" /> {f.visit.call}
                  </a>
                  <a href={`mailto:${CLINIC.email}`} className="btn btn-sm col-span-2 border border-ink/10 hover:border-ink/30 sm:col-span-1">
                    <Mail className="h-3.5 w-3.5" /> {f.visit.email}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Stylised map tile — avoids a heavy third-party map embed and its cookie banner. */
function MiniMap() {
  return (
    <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer" className="relative block h-40 overflow-hidden bg-[#EAE5DB]" aria-label="Google Maps" dir="ltr">
      <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <path d="M-10 120 C 80 100, 140 140, 230 110 S 360 60, 420 80" stroke="#BFD8E3" strokeWidth="18" fill="none" />
        <g stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round">
          <path d="M40 -10 L 120 170" />
          <path d="M-10 40 L 420 70" />
          <path d="M260 -10 L 210 170" />
          <path d="M330 -10 L 380 170" />
        </g>
        <g stroke="#fff" strokeWidth="3" fill="none" opacity="0.8">
          <path d="M-10 95 L 420 120" />
          <path d="M160 -10 L 150 170" />
          <path d="M80 -10 L 60 170" />
        </g>
        <rect x="270" y="20" width="60" height="34" rx="6" fill="#D5DECB" />
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <span className="absolute left-1/2 top-full h-3 w-8 -translate-x-1/2 rounded-[50%] bg-ink/20 blur-[2px]" />
        <span className="relative grid h-11 w-11 place-items-center rounded-full rounded-br-none bg-ink shadow-luxe [transform:rotate(45deg)]">
          <span className="h-3 w-3 rounded-full bg-gold" />
        </span>
      </span>
    </a>
  );
}
