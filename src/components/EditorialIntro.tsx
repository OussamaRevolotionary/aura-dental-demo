import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { EDITORIAL_IMAGES } from "../config/mediaAssets";
import { Rich, useI18n } from "../i18n";
import { Reveal } from "./ui";

/** Editorial statement with three staggered portrait images that drift at different speeds. */
export default function EditorialIntro() {
  const { t } = useI18n();
  const e = t.intro;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = [useTransform(scrollYProgress, [0, 1], [40, -40]), useTransform(scrollYProgress, [0, 1], [90, -90]), useTransform(scrollYProgress, [0, 1], [10, -10])];
  const offsets = ["mt-16", "mt-0", "-mt-10"];

  return (
    <section ref={ref} className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-luxe grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <Reveal>
          <div className="border-y border-ink/15 py-8">
            <h2 className="display text-balance text-[48px] uppercase leading-[0.95] tracking-[0.02em] sm:text-[68px] lg:text-[76px]">
              <Rich text={e.title} accent="text-gold-deep" />
            </h2>
            <p className="mt-5 text-[19px] font-medium tracking-tight sm:text-[22px]">{e.sub}</p>
          </div>
          <p className="mt-7 max-w-md text-[15.5px] leading-[1.75] text-ink-muted">{e.body}</p>
        </Reveal>

        <div className="grid grid-cols-3 gap-3 sm:gap-4" dir="ltr">
          {EDITORIAL_IMAGES.map((img, i) => (
            <motion.figure key={img.src} style={{ y: drift[i] }} className={`${offsets[i]} relative aspect-[9/16] overflow-hidden rounded-[6px] bg-stone-200 shadow-card`}>
              <img src={img.src} alt={e.alts[i]} loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: img.focus }} />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
