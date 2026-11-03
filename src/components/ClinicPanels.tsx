import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, ClipboardList, Loader2, RefreshCw, ShieldCheck, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { BOOKING_API, fetchBookings, type LiveBooking } from "../config/bookingApi";
import { CLINIC } from "../config/clinic";
import { DEMO } from "../config/demo";
import { useUI } from "../context/UIContext";
import { useOverlay } from "../hooks/useLockBody";
import { fmt, Rich, useI18n } from "../i18n";
import { BrandMark } from "./Navbar";
import { EASE } from "./ui";

/** Pre-visit health forms are kept in this browser only — the demo never sends medical answers anywhere. */
const FORMS_KEY = "aura-health-forms";
type SavedForm = { name: string; conditions: string[]; anxiety: number; at: string };

function readForms(): SavedForm[] {
  try {
    return JSON.parse(localStorage.getItem(FORMS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function ClinicPanels() {
  const { panel, closePanel } = useUI();
  useOverlay(panel !== null, closePanel);
  return (
    <AnimatePresence>
      {panel && (
        <motion.div
          key={panel}
          className="fixed inset-0 z-[96] overflow-y-auto bg-alabaster"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: EASE }}
          role="dialog"
          aria-modal="true"
        >
          {panel === "form" ? <HealthForm onClose={closePanel} /> : <ClinicView onClose={closePanel} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PanelHeader({ title, onClose, closeLabel, children }: { title: string; onClose: () => void; closeLabel: string; children?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 border-b border-hairline bg-alabaster">
      <div className="container-luxe flex h-[68px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark className="h-8 w-8 shrink-0" />
          <span className="truncate text-[14px] font-semibold">{title}</span>
          {children}
        </div>
        <button onClick={onClose} className="icon-btn h-10 w-10 hover:rotate-90" aria-label={closeLabel}>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Pre-visit health form ──────────────────────────────────────────── */

const CONDITIONS = ["heart", "diabetes", "bloodThinners", "pregnant", "allergies", "none"] as const;
type Condition = (typeof CONDITIONS)[number];
const FACES = ["😌", "🙂", "😐", "😟", "😰"];

function HealthForm({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const h = t.health;
  const { formName } = useUI();
  const [name, setName] = useState(formName);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [allergies, setAllergies] = useState("");
  const [medication, setMedication] = useState("");
  const [anxiety, setAnxiety] = useState<number | null>(null);
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (c: Condition) =>
    setConditions((cur) => (c === "none" ? (cur.includes("none") ? [] : ["none"]) : cur.includes(c) ? cur.filter((x) => x !== c) : [...cur.filter((x) => x !== "none"), c]));

  const ok = name.trim().length >= 2 && conditions.length > 0 && anxiety !== null && consent;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!ok) return;
    try {
      localStorage.setItem(FORMS_KEY, JSON.stringify([...readForms(), { name: name.trim(), conditions, anxiety, at: new Date().toISOString() }].slice(-30)));
    } catch {
      /* storage unavailable: the confirmation still shows */
    }
    setDone(true);
  };

  return (
    <>
      <PanelHeader title={h.title.replace(/\*/g, "")} onClose={onClose} closeLabel={h.close} />
      <div className="container-luxe max-w-[640px] py-10 sm:py-14">
        {done ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald text-white">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="display mt-8 text-[40px] leading-tight">
              <Rich text={fmt(h.done.title, { name: name.trim().split(" ")[0] })} />
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.7] text-ink-muted">{h.done.body}</p>
            {anxiety !== null && anxiety >= 3 && <p className="mx-auto mt-4 max-w-sm rounded-tile bg-emerald-soft p-4 text-[14px] text-emerald-deep">{h.done.calm}</p>}
            <button onClick={onClose} className="btn-primary mt-8">
              {h.done.back}
            </button>
          </motion.div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-9">
            <div>
              <h1 className="display text-[40px] leading-[1.05] sm:text-[48px]">
                <Rich text={h.title} />
              </h1>
              <p className="mt-3 text-[15px] text-ink-muted">{h.sub}</p>
            </div>

            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold">{h.name}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`field ${touched && name.trim().length < 2 ? "border-red-400" : ""}`} />
            </label>

            <fieldset>
              <legend className="mb-3 text-[14px] font-semibold">{h.conditionsQ}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONDITIONS.map((c) => {
                  const on = conditions.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(c)}
                      className={`min-h-[52px] rounded-tile border px-3 py-3 text-[14px] font-medium transition ${on ? "border-ink bg-ink text-alabaster" : "border-ink/10 bg-white hover:border-ink/30"}`}
                    >
                      {h.conditions[c]}
                    </button>
                  );
                })}
              </div>
              {touched && conditions.length === 0 && <p className="mt-2 text-[12.5px] text-red-600">{h.pick}</p>}
              {conditions.includes("allergies") && (
                <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder={h.allergiesPh} className="field mt-3" aria-label={h.conditions.allergies} />
              )}
            </fieldset>

            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold">
                {h.medication} <span className="font-normal text-ink-muted">· {h.optional}</span>
              </span>
              <input value={medication} onChange={(e) => setMedication(e.target.value)} placeholder={h.medicationPh} className="field" />
            </label>

            <fieldset>
              <legend className="mb-3 text-[14px] font-semibold">{h.feelingQ}</legend>
              <div className="grid grid-cols-5 gap-2">
                {FACES.map((face, i) => (
                  <button
                    key={face}
                    type="button"
                    aria-pressed={anxiety === i}
                    onClick={() => setAnxiety(i)}
                    className={`flex flex-col items-center gap-1.5 rounded-tile border px-1 py-3 transition ${anxiety === i ? "border-emerald bg-emerald-soft" : "border-ink/10 bg-white hover:border-ink/30"}`}
                  >
                    <span className="text-[26px] leading-none">{face}</span>
                    <span className="text-center text-[11px] leading-tight text-ink-muted">{h.feelings[i]}</span>
                  </button>
                ))}
              </div>
              {touched && anxiety === null && <p className="mt-2 text-[12.5px] text-red-600">{h.pick}</p>}
            </fieldset>

            <label className="flex cursor-pointer items-start gap-3 rounded-tile border border-ink/10 bg-white p-4">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--emerald))]" />
              <span className={`text-[14px] ${touched && !consent ? "text-red-600" : ""}`}>{h.consent}</span>
            </label>

            <div>
              <button type="submit" className="btn-primary w-full py-4 text-[15px]">
                <ClipboardList className="h-4 w-4" /> {h.submit}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-muted">
                <ShieldCheck className="h-3.5 w-3.5" /> {h.demoNote}
              </p>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

/* ── Clinic view (what the front desk sees) ─────────────────────────── */

type Row = LiveBooking & { sample?: boolean };

function ClinicView({ onClose }: { onClose: () => void }) {
  const { t, locale } = useI18n();
  const c = t.clinicView;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const forms = useMemo(readForms, []);

  const load = useCallback(() => {
    if (!BOOKING_API) return;
    setLoading(true);
    fetchBookings()
      .then((b) => {
        setRows(b);
        setFailed(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 20_000);
    return () => window.clearInterval(id);
  }, [load]);

  /* Show sample rows next to a near-empty live list so the view never looks bare in a pitch. */
  const list: Row[] = useMemo(() => {
    const liveRows = rows ?? [];
    const samples = c.samples.map(([name, reason, time], i) => {
      const d = new Date();
      d.setDate(d.getDate() + 1 + (i % 2));
      return {
        id: -1 - i,
        name,
        phone: "",
        reason,
        patientType: i === 1 ? "returning" : "new",
        day: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        time,
        language: t.langName,
        clinic: DEMO.clinic || CLINIC.name,
        createdAt: "",
        sample: true,
      } as Row;
    });
    return [...liveRows, ...(liveRows.length < 4 ? samples : [])].sort((a, b) => (a.day + a.time).localeCompare(b.day + b.time));
  }, [rows, c.samples, t.langName]);

  const formDone = (name: string) => forms.some((f) => f.name.toLowerCase().split(" ")[0] === name.toLowerCase().split(" ")[0]);
  const dayLabel = (iso: string) => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${iso}T12:00:00`));
  const stats = [
    { icon: CalendarCheck, value: list.length, label: c.stats[0] },
    { icon: Users, value: list.filter((r) => r.patientType === "new").length, label: c.stats[1] },
    { icon: ClipboardList, value: list.filter((r) => formDone(r.name)).length, label: c.stats[2] },
  ];

  return (
    <>
      <PanelHeader title={`${DEMO.clinic || CLINIC.name} · ${c.title}`} onClose={onClose} closeLabel={c.close}>
        <span className={`chip hidden sm:inline-flex ${failed ? "border-hairline bg-white text-ink-muted" : "border-emerald/30 bg-emerald-soft text-emerald-deep"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${failed ? "bg-ink/30" : "bg-emerald"}`} /> {failed ? c.offline : c.live}
        </span>
      </PanelHeader>

      <div className="container-luxe py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-[40px] leading-none sm:text-[52px]">
            <Rich text={c.heading} />
          </h1>
          <button onClick={load} disabled={loading} className="btn-glass btn-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {c.refresh}
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="card-luxe flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-soft text-emerald-deep">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="display block text-[34px] leading-none">{value}</span>
                <span className="mt-1 block text-[13px] text-ink-muted">{label}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-card border border-hairline bg-white shadow-card">
          <div className="hidden grid-cols-[1.1fr_1.2fr_1.2fr_0.8fr_0.7fr] gap-4 border-b border-hairline px-6 py-3 text-start sm:grid">
            {c.cols.map((col) => (
              <span key={col} className="eyebrow text-[10px] text-ink-muted">
                {col}
              </span>
            ))}
          </div>
          {rows === null && !failed && BOOKING_API ? (
            <p className="flex items-center gap-2 px-6 py-8 text-[14px] text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> {c.loading}
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {list.map((r) => (
                <li key={r.id} className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-5 py-4 sm:grid-cols-[1.1fr_1.2fr_1.2fr_0.8fr_0.7fr] sm:items-center sm:px-6">
                  <span className="text-[14px] font-semibold">
                    {dayLabel(r.day)} · <span dir="ltr">{r.time}</span>
                  </span>
                  <span className="flex items-center gap-2 text-[14px] sm:order-none">
                    {r.name}
                    {r.sample && <span className="chip border-hairline bg-alabaster text-ink-muted">{c.sample}</span>}
                    {!r.sample && r.phone && <span className="hidden font-mono text-[11px] text-ink-muted lg:inline" dir="ltr">{r.phone}</span>}
                  </span>
                  <span className="text-[13.5px] text-ink-muted">{r.reason}</span>
                  <span>
                    <span className={`chip ${r.patientType === "new" ? "border-gold/40 bg-gold-soft/50 text-gold-deep" : "border-hairline bg-alabaster text-ink-muted"}`}>
                      {r.patientType === "new" ? c.new : c.returning}
                    </span>
                  </span>
                  <span className={`text-[13px] font-medium ${formDone(r.name) ? "text-emerald" : "text-ink-muted"}`}>{formDone(r.name) ? `✓ ${c.formDone}` : c.formPending}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-4 text-[12.5px] text-ink-muted">{failed ? c.offlineNote : c.note}</p>
      </div>
    </>
  );
}
