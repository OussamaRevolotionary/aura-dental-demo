import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CLINIC, telLink } from "../config/clinic";
import { useUI } from "../context/UIContext";
import { useSandboxText } from "../config/sandbox";
import { Rich, useI18n } from "../i18n";
import { LanguageSwitcher, NAV_IDS } from "./Navbar";
import { Arrow, Reveal } from "./ui";

export default function Footer() {
  const { openQuiz, openBooking } = useUI();
  const { t } = useI18n();
  const f = t.footer;
  const sbx = useSandboxText();
  return (
    <footer data-nav-dark className="relative overflow-hidden bg-obsidian text-alabaster">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-emerald/20 blur-[140px]" />

      <div className="container-luxe relative border-b border-white/10 py-24 text-center sm:py-32">
        <Reveal>
          <h2 className="display mx-auto max-w-4xl text-balance text-[46px] sm:text-[78px] lg:text-[96px]">
            <Rich text={f.title} accent="text-cyan-glow" />
          </h2>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => openQuiz()} className="btn-light shimmer group px-7 py-4 text-[14px]">
              {f.start} <Arrow up />
            </button>
            <button onClick={openBooking} className="btn-outline-light px-7 py-4 text-[14px]">
              {f.book}
            </button>
          </div>
        </Reveal>
      </div>

      <div className="container-luxe relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div dir="ltr" className="font-mono text-[12px] tracking-[0.18em] rtl:text-right">
            AURA <span className="text-cyan-glow">//</span> DENTAL STUDIO
          </div>
          <p className="mt-4 max-w-xs text-[14px] leading-[1.7] text-white/50">{f.tagline}</p>
          <LanguageSwitcher id="footer" dark className="mt-6 inline-flex" />
        </div>
        <div>
          <div className="eyebrow text-[10px] text-white/40">{f.explore}</div>
          <ul className="mt-4 space-y-2.5">
            {NAV_IDS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="text-[14px] text-white/70 transition hover:text-white">
                  {t.nav.links[id]}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow text-[10px] text-white/40">{f.visit}</div>
          <ul className="mt-4 space-y-3 text-[14px] text-white/70">
            <li>
              <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 hover:text-white">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span dir="ltr">
                  {CLINIC.address[0]}
                  <br />
                  {CLINIC.address[1]}
                </span>
              </a>
            </li>
            <li>
              <a href={telLink()} className="flex gap-2.5 hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <span dir="ltr">{CLINIC.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CLINIC.email}`} className="flex gap-2.5 break-all hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {CLINIC.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-[10px] text-white/40">{f.hours}</div>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {t.faq.visit.rows.map(([d, h]) => (
              <li key={d} className="flex gap-2.5 text-white/70">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="block text-white/90">{d}</span>
                  <span dir="ltr">{h}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-luxe relative overflow-hidden" aria-hidden>
        <div className="select-none whitespace-nowrap text-center font-serif text-[26vw] leading-[0.8] text-white/[0.04] lg:text-[22vw]">AURA</div>
      </div>

      <div className="container-luxe relative border-t border-white/10 py-6 text-center text-[12px] text-white/40">
        <span>
          © {new Date().getFullYear()} AURA Dental Studio AG. {f.rights}
        </span>
        <span className="mt-2 block font-semibold uppercase tracking-[0.14em] text-white/60">{sbx.label}</span>
      </div>
    </footer>
  );
}
