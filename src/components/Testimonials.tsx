import { Star } from "lucide-react";
import { CLINIC } from "../config/clinic";
import { useSandboxText } from "../config/sandbox";
import { REVIEWS, type Review } from "../config/reviews";
import { fmt, useI18n } from "../i18n";
import { Arrow, Reveal, SectionHeader } from "./ui";

function relative(daysAgo: number, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (daysAgo < 7) return rtf.format(-daysAgo, "day");
  if (daysAgo < 30) return rtf.format(-Math.round(daysAgo / 7), "week");
  return rtf.format(-Math.round(daysAgo / 30), "month");
}

export default function Testimonials() {
  const { t } = useI18n();
  const sbx = useSandboxText();

  return (
    <section id="reviews" className="relative overflow-hidden py-16 sm:py-32">
      <div className="container-luxe">
        <SectionHeader index="07" eyebrow={t.reviews.eyebrow} title={t.reviews.title} />
        <Reveal delay={0.1} className="mt-10">
          <a
            href={CLINIC.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-tile border border-hairline bg-white px-5 py-4 shadow-card transition hover:shadow-luxe"
          >
            <span className="display text-[44px] leading-none">{CLINIC.rating}</span>
            <span>
              <span className="flex" dir="ltr">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </span>
              <span className="mt-1 block text-[12.5px] text-ink-muted">
                {t.reviews.average} · {fmt(t.reviews.count, { n: CLINIC.reviewCount })} · {sbx.sample}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald">
              {t.reviews.cta} <Arrow className="h-3.5 w-3.5" />
            </span>
          </a>
        </Reveal>
      </div>

      <div className="mask-fade-x pause-on-hover mt-12 overflow-hidden" dir="ltr">
        <div className="flex w-max animate-[marquee_60s_linear_infinite] gap-5">
          {[...REVIEWS, ...REVIEWS].map((rv, i) => (
            <ReviewCard key={i} r={rv} hidden={i >= REVIEWS.length} />
          ))}
        </div>
      </div>
      <p className="container-luxe mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{sbx.label} · {sbx.sample}</p>
    </section>
  );
}

function ReviewCard({ r, hidden }: { r: Review; hidden: boolean }) {
  const { locale, dir } = useI18n();
  return (
    <figure
      lang={r.lang}
      dir={r.lang === "ar" ? "rtl" : "ltr"}
      aria-hidden={hidden}
      className="flex w-[300px] shrink-0 flex-col justify-between rounded-card border border-hairline bg-white p-6 shadow-card sm:w-[340px]"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex" dir="ltr">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
            ))}
          </span>
          <span className="chip border-hairline bg-alabaster text-ink-muted">{r.treatment}</span>
        </div>
        <blockquote className="display mt-4 text-[22px] leading-[1.3] text-ink">“{r.text}”</blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-serif text-[16px] text-alabaster">{r.name.charAt(0)}</span>
        <span>
          <span className="block text-[13.5px] font-semibold">{r.name}</span>
          <span className="block text-[12px] text-ink-muted">
            {r.city} · <span lang={locale} dir={dir}>{relative(r.daysAgo, locale)}</span>
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
