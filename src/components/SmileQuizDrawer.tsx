import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Check, CheckCircle2, Eye, Gem, MessageCircle, Phone, Puzzle, Rocket, Ruler, Search, ShieldCheck, Siren, Sparkles, Wallet, X, Zap } from "lucide-react";
import { useState, type ComponentType, type FormEvent } from "react";
import { CLINIC, sendLead, telLink, whatsappLink, type GoalId } from "../config/clinic";
import { useUI, type StyleId } from "../context/UIContext";
import { useOverlay } from "../hooks/useLockBody";
import { fmt, plain, Rich, useI18n } from "../i18n";
import { BrandMark } from "./Navbar";
import { Arrow, EASE } from "./ui";

type Icon = ComponentType<{ className?: string }>;
type Priority = "painfree" | "fast" | "natural" | "flexible";
type Timeline = "asap" | "30days" | "research";
type ContactTime = "morning" | "afternoon" | "evening" | "anytime";

const GOALS: [GoalId, Icon][] = [
  ["whiter", Sparkles],
  ["straighter", Ruler],
  ["replace", Puzzle],
  ["makeover", Gem],
  ["emergency", Siren],
];
const PRIORITIES: [Priority, Icon][] = [
  ["painfree", ShieldCheck],
  ["fast", Zap],
  ["natural", Eye],
  ["flexible", Wallet],
];
const TIMELINES: [Timeline, Icon][] = [
  ["asap", Rocket],
  ["30days", CalendarDays],
  ["research", Search],
];
const CONTACT_TIMES: ContactTime[] = ["morning", "afternoon", "evening", "anytime"];

export default function SmileQuizDrawer() {
  const { quizOpen, quizPreset, quizStyle, closeQuiz } = useUI();
  const { t, dir } = useI18n();
  useOverlay(quizOpen, closeQuiz);
  const off = dir === "rtl" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {quizOpen && (
        <>
          <motion.div className="fixed inset-0 z-[90] bg-obsidian/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeQuiz} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t.quiz.aria}
            className="fixed end-0 top-0 z-[95] flex h-[100dvh] w-full max-w-[540px] flex-col bg-alabaster shadow-2xl sm:rounded-s-media"
            initial={{ x: off }}
            animate={{ x: 0 }}
            exit={{ x: off }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <QuizFlow preset={quizPreset} style={quizStyle} onClose={closeQuiz} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QuizFlow({ preset, style, onClose }: { preset: GoalId | null; style: StyleId | null; onClose: () => void }) {
  const { t, dir } = useI18n();
  const q = t.quiz;
  const [step, setStep] = useState(0);
  const [forward, setForward] = useState(true);
  const [goal, setGoal] = useState<GoalId | null>(preset);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactTime, setContactTime] = useState<ContactTime>("anytime");
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);

  const go = (n: number) => {
    setForward(n > step);
    setStep(n);
  };
  const pickAndAdvance = <T,>(setter: (v: T) => void, v: T) => {
    setter(v);
    window.setTimeout(() => go(step + 1), 280);
  };

  const nameOk = name.trim().length >= 2;
  const phoneOk = phone.replace(/\D/g, "").length >= 7;
  const canNext = [goal !== null, priority !== null, timeline !== null, nameOk && phoneOk][step];
  const shift = (forward ? 1 : -1) * (dir === "rtl" ? -40 : 40);

  const message = [
    q.wa.intro,
    "",
    `• ${q.wa.name}: ${name.trim()}`,
    `• ${q.wa.goal}: ${goal ? q.goals[goal].label : "—"}`,
    ...(style ? [`• ${q.wa.style}: ${plain(t.styles.items[style].name)}`] : []),
    `• ${q.wa.priority}: ${priority ? q.priorities[priority].label : "—"}`,
    `• ${q.wa.timeline}: ${timeline ? q.timelines[timeline].label : "—"}`,
    `• ${q.wa.contact}: ${q.times[contactTime]}`,
    `• ${q.wa.phone}: ${phone.trim()}`,
    `• ${q.wa.language}: ${t.langName}`,
    "",
    q.wa.outro,
  ].join("\n");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!nameOk || !phoneOk) return;
    sendLead({
      type: "smile-assessment",
      name: name.trim(),
      phone: phone.trim(),
      goal: goal ?? "",
      priority: priority ?? "",
      timeline: timeline ?? "",
      style: style ?? "",
      contactTime,
      language: t.langName,
    });
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
    setDone(true);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-hairline px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <BrandMark className="h-8 w-8" />
          <div>
            <div className="text-[13.5px] font-semibold">{q.title}</div>
            <div className="eyebrow text-[10px] text-ink-muted">{done ? q.complete : fmt(q.stepOf, { n: step + 1 })}</div>
          </div>
        </div>
        <button onClick={onClose} className="icon-btn h-10 w-10 hover:rotate-90" aria-label={q.close}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-1.5 px-6 pt-5 sm:px-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
            <motion.div
              className="h-full bg-emerald"
              initial={false}
              animate={{ width: done || i < step ? "100%" : i === step ? "50%" : "0%" }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
        ))}
      </div>

      <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-7 sm:px-8">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <Confirmation key="done" name={name} goal={goal} message={message} onClose={onClose} />
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: shift }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -shift }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <h2 className="display text-[32px] leading-[1.08] sm:text-[38px]">{q.questions[step]}</h2>

              {step === 0 && (
                <>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {GOALS.map(([id, icon]) => (
                      <OptionCard key={id} icon={icon} {...q.goals[id]} selected={goal === id} onClick={() => pickAndAdvance(setGoal, id)} wide={id === "emergency"} />
                    ))}
                  </div>
                  {goal === "emergency" && (
                    <a href={telLink()} className="mt-4 flex items-center gap-3 rounded-tile border border-red-200 bg-red-50 p-4 text-[13.5px] text-red-900">
                      <Phone className="h-4 w-4 shrink-0" /> <span>{q.emergencyCall} <strong dir="ltr">{CLINIC.phoneDisplay}</strong></span>
                    </a>
                  )}
                </>
              )}

              {step === 1 && (
                <div className="mt-6 grid gap-3">
                  {PRIORITIES.map(([id, icon]) => (
                    <OptionCard key={id} icon={icon} {...q.priorities[id]} selected={priority === id} onClick={() => pickAndAdvance(setPriority, id)} row />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 grid gap-3">
                  {TIMELINES.map(([id, icon]) => (
                    <OptionCard key={id} icon={icon} {...q.timelines[id]} selected={timeline === id} onClick={() => pickAndAdvance(setTimeline, id)} row />
                  ))}
                </div>
              )}

              {step === 3 && (
                <form id="lead-form" onSubmit={submit} className="mt-6 space-y-5" noValidate>
                  {goal && (
                    <div className="rounded-tile bg-ink p-5 text-alabaster">
                      <div className="eyebrow text-[10px] text-gold">{q.pathwayLabel}</div>
                      <div className="display mt-1.5 text-[24px] leading-tight">{q.pathway[goal].name}</div>
                      <div className="mt-1 text-[12.5px] text-white/60">
                        {q.pathway[goal].detail}
                        {style && ` · ${plain(t.styles.items[style].name)}`}
                      </div>
                    </div>
                  )}
                  <Field label={q.name} value={name} onChange={setName} placeholder={q.namePh} autoComplete="name" error={touched && !nameOk ? q.nameErr : undefined} />
                  <Field
                    label={q.phone}
                    value={phone}
                    onChange={setPhone}
                    placeholder={q.phonePh}
                    type="tel"
                    autoComplete="tel"
                    ltr
                    error={touched && !phoneOk ? q.phoneErr : undefined}
                  />
                  <div>
                    <div className="mb-2 text-[12.5px] font-semibold">{q.contactTime}</div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {CONTACT_TIMES.map((ct) => (
                        <button key={ct} type="button" onClick={() => setContactTime(ct)} className={`choice ${contactTime === ct ? "choice-on" : ""}`}>
                          {q.times[ct]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-ink-muted">{q.privacy}</p>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!done && (
        <div className="flex items-center justify-between gap-3 border-t border-hairline bg-white/70 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl sm:px-8">
          <button
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-[13px] font-semibold text-ink-muted transition hover:text-ink disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {q.back}
          </button>
          {step < 3 ? (
            <button onClick={() => go(step + 1)} disabled={!canNext} className="btn-primary group">
              {q.continue} <Arrow />
            </button>
          ) : (
            <button type="submit" form="lead-form" className="btn-whatsapp">
              <MessageCircle className="h-4 w-4" /> {q.send}
            </button>
          )}
        </div>
      )}
    </>
  );
}

function OptionCard({
  icon: Icon,
  label,
  hint,
  selected,
  onClick,
  row,
  wide,
}: {
  icon: Icon;
  label: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
  row?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex gap-3.5 rounded-tile border p-4 pe-10 text-start transition-all duration-300 ${
        row || wide ? `items-center ${wide ? "sm:col-span-2" : ""}` : "items-center sm:min-h-[132px] sm:flex-col sm:items-start"
      } ${
        selected ? "border-emerald bg-white shadow-[0_0_0_4px_rgb(var(--emerald)/0.1)]" : "border-ink/[0.08] bg-white/70 hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white"
      }`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${selected ? "bg-emerald text-white" : "bg-alabaster text-emerald group-hover:bg-emerald-soft"}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1">
        <span className="block text-[14.5px] font-semibold leading-tight">{label}</span>
        <span className="mt-1 block text-[12.5px] text-ink-muted">{hint}</span>
      </span>
      <span className={`absolute end-3.5 top-3.5 grid h-5 w-5 place-items-center rounded-full border transition ${selected ? "border-emerald bg-emerald text-white" : "border-ink/15"}`}>
        {selected && <Check className="h-3 w-3" />}
      </span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
  ltr,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  ltr?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12.5px] font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        dir={ltr ? "ltr" : undefined}
        className={`field ${ltr ? "rtl:text-right" : ""} ${error ? "border-red-400" : ""}`}
      />
      {error && <span className="mt-1.5 block text-[12px] text-red-600">{error}</span>}
    </label>
  );
}

function Confirmation({ name, goal, message, onClose }: { name: string; goal: GoalId | null; message: string; onClose: () => void }) {
  const { t } = useI18n();
  const d = t.quiz.done;
  const first = name.trim().split(" ")[0];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="mx-auto mt-6 grid h-20 w-20 place-items-center rounded-full bg-emerald text-white shadow-[0_0_0_10px_rgb(var(--emerald)/0.12)]"
      >
        <CheckCircle2 className="h-9 w-9" />
      </motion.div>
      <h2 className="display mt-8 text-[38px] leading-tight">
        <Rich text={fmt(d.thanks, { name: first })} />
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-[1.7] text-ink-muted">{fmt(d.body, { coord: CLINIC.coordinatorName })}</p>
      {goal && (
        <div className="mx-auto mt-7 max-w-sm rounded-tile border border-hairline bg-white p-5 text-start">
          <div className="eyebrow text-[10px] text-gold-deep">{d.recommended}</div>
          <div className="mt-1.5 text-[15px] font-semibold">{d.consult}</div>
          <div className="text-[13px] text-ink-muted">{fmt(d.towards, { x: t.quiz.pathway[goal].name })}</div>
        </div>
      )}
      <div className="mx-auto mt-7 flex max-w-sm flex-col gap-3">
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          <MessageCircle className="h-4 w-4" /> {d.retry}
        </a>
        <button onClick={onClose} className="btn-glass">
          {d.backSite}
        </button>
      </div>
    </motion.div>
  );
}
