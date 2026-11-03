import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { CalendarCheck, CalendarDays, Check, CheckCircle2, ClipboardList, LayoutDashboard, Loader2, MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BOOKING_API, bookVisit, fetchSlots, isoDay } from "../config/bookingApi";
import { CLINIC, clinicStatus, sendLead, whatsappLink } from "../config/clinic";
import { DEMO } from "../config/demo";
import { useUI } from "../context/UIContext";
import { useOverlay } from "../hooks/useLockBody";
import { fmt, Rich, useI18n } from "../i18n";
import { Arrow, EASE } from "./ui";

/** Live, timezone-aware "online / replies from" status for the coordinator. */
function useClinicStatus() {
  const [status, setStatus] = useState(clinicStatus);
  useEffect(() => {
    const id = setInterval(() => setStatus(clinicStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/** Floating bottom concierge: WhatsApp + quick booking. */
export default function ConciergeBar() {
  const { openBooking, quizOpen, bookingOpen } = useUI();
  const { t, locale } = useI18n();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const status = useClinicStatus();
  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 480));

  const opensLabel = useMemo(() => {
    if (status.open) return "";
    if (status.daysAhead === 0) return status.opensAt;
    const d = new Date();
    d.setDate(d.getDate() + status.daysAhead);
    return `${new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d)} ${status.opensAt}`;
  }, [status, locale]);

  return (
    <>
      <AnimatePresence>
        {visible && !quizOpen && !bookingOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed bottom-4 end-4 z-40 flex items-center gap-1.5 rounded-full border border-white/50 bg-white/80 p-1.5 shadow-luxe backdrop-blur-2xl sm:bottom-6 sm:end-6"
          >
            <a
              href={whatsappLink(t.concierge.hello)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-full py-1.5 pe-3.5 ps-1.5 transition hover:bg-white"
              aria-label={t.concierge.aria}
            >
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#1FAF5A] text-white">
                <MessageCircle className="h-4 w-4" />
                <span className="absolute -end-0.5 -top-0.5 flex h-3 w-3">
                  {status.open && <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-[#4ADE80]" />}
                  <span className={`relative inline-flex h-3 w-3 rounded-full border-2 border-white ${status.open ? "bg-[#4ADE80]" : "bg-gold"}`} />
                </span>
              </span>
              <span className="hidden text-start sm:block">
                <span className="block text-[12.5px] font-semibold leading-tight">{t.concierge.whatsapp}</span>
                <span className={`block text-[11px] ${status.open ? "text-emerald" : "text-ink-muted"}`}>
                  {status.open ? fmt(t.concierge.online, { name: CLINIC.coordinatorName }) : fmt(t.concierge.offline, { time: opensLabel })}
                </span>
              </span>
            </a>
            <button onClick={openBooking} className="btn btn-sm bg-ink py-3 text-alabaster hover:bg-emerald-deep">
              <CalendarDays className="h-4 w-4" />
              {t.concierge.book}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <BookingModal />
    </>
  );
}

const SLOTS = ["08:30", "09:45", "11:00", "13:30", "15:00", "16:15", "17:30"];

function BookingModal() {
  const { bookingOpen, closeBooking } = useUI();
  const { t } = useI18n();
  useOverlay(bookingOpen, closeBooking);

  return (
    <AnimatePresence>
      {bookingOpen && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-obsidian/45 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeBooking}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t.booking.eyebrow}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-card bg-alabaster shadow-2xl sm:rounded-card"
          >
            <BookingForm onClose={closeBooking} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BookingForm({ onClose }: { onClose: () => void }) {
  const { t, locale } = useI18n();
  const { openPanel } = useUI();
  const b = t.booking;
  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    while (out.length < 10) {
      d.setDate(d.getDate() + 1);
      if (CLINIC.schedule[d.getDay()]) out.push(new Date(d));
    }
    return out;
  }, []);

  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState(0);
  const [returning, setReturning] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<"booked" | "whatsapp" | null>(null);
  /* live free slots per day from the n8n booking API; "failed" falls back to the fixed list */
  const [live, setLive] = useState<Record<string, string[] | "failed">>({});

  const dayKey = isoDay(days[day]);
  useEffect(() => {
    if (!BOOKING_API || live[dayKey]) return;
    fetchSlots(dayKey)
      .then((slots) => setLive((l) => ({ ...l, [dayKey]: slots })))
      .catch(() => setLive((l) => ({ ...l, [dayKey]: "failed" })));
  }, [dayKey, live]);

  const close = CLINIC.schedule[days[day].getDay()][1];
  const fallback = SLOTS.filter((s) => Number(s.slice(0, 2)) < close - 1);
  const dayLive = live[dayKey];
  const isLive = Array.isArray(dayLive);
  const loading = !!BOOKING_API && dayLive === undefined;
  const slots = isLive ? dayLive.filter((s) => Number(s.slice(0, 2)) < close - 1) : loading ? [] : fallback;
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(days[day]);
  const nameOk = name.trim().length >= 2;
  const phoneOk = phone.replace(/\D/g, "").length >= 7;

  const message = [
    b.wa.intro,
    "",
    `• ${b.wa.name}: ${name.trim()}`,
    `• ${b.patient.label}: ${returning ? b.patient.returning : b.patient.new}`,
    `• ${b.wa.reason}: ${b.reasons[reason]}`,
    `• ${b.wa.preferred}: ${dateLabel} ${b.wa.at} ${slot}`,
    `• ${b.wa.phone}: ${phone.trim()}`,
    `• ${t.quiz.wa.language}: ${t.langName}`,
  ].join("\n");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!slot || !nameOk || !phoneOk || sending) return;
    sendLead({ type: "appointment-request", patient: returning ? "returning" : "new", name: name.trim(), phone: phone.trim(), reason: b.reasons[reason], date: dateLabel, time: slot, language: t.langName });
    if (!BOOKING_API) {
      window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
      setDone("whatsapp");
      return;
    }
    setSending(true);
    try {
      await bookVisit({
        name: name.trim(),
        phone: phone.trim(),
        reason: b.reasons[reason],
        patientType: returning ? "returning" : "new",
        day: dayKey,
        time: slot,
        language: t.langName,
        clinic: DEMO.clinic || CLINIC.name,
      });
      setDone("booked");
    } catch {
      /* booking API unreachable: hand over to WhatsApp so the request is never lost */
      setDone("whatsapp");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const booked = done === "booked";
    return (
      <div className="p-8 text-center sm:p-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald text-white"
        >
          <CheckCircle2 className="h-8 w-8" />
        </motion.div>
        <h2 className="display mt-6 text-[34px]">
          <Rich text={booked ? b.booked.title : b.done.title} />
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-[1.7] text-ink-muted">
          {booked ? fmt(b.booked.body, { date: dateLabel, time: slot ?? "" }) : fmt(b.done.body, { coord: CLINIC.coordinatorName, date: dateLabel, time: slot ?? "" })}
        </p>
        <div className="mt-7 flex flex-col gap-3">
          {booked && (
            <button onClick={() => openPanel("form", name.trim())} className="btn-primary group">
              <ClipboardList className="h-4 w-4" /> {b.booked.form}
            </button>
          )}
          <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className={booked ? "btn-glass" : "btn-whatsapp"}>
            <MessageCircle className="h-4 w-4" /> {booked ? b.booked.wa : b.done.again}
          </a>
          {booked && DEMO.clinic && (
            <button onClick={() => openPanel("clinic")} className="group mx-auto mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald hover:underline">
              <LayoutDashboard className="h-4 w-4" /> {b.booked.clinicView} <Arrow className="h-3.5 w-3.5" />
            </button>
          )}
          {!booked && (
            <button onClick={onClose} className="btn-glass">
              {b.done.close}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-start justify-between border-b border-hairline p-6 sm:p-8">
        <div>
          <div className="eyebrow text-gold-deep">{b.eyebrow}</div>
          <h2 className="display mt-1 text-[32px] leading-tight">
            <Rich text={b.title} />
          </h2>
        </div>
        <button type="button" onClick={onClose} className="icon-btn h-10 w-10 hover:rotate-90" aria-label={b.close}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div role="radiogroup" aria-label={b.patient.label} className="grid grid-cols-2 gap-1 rounded-full border border-ink/10 bg-white p-1">
          {[false, true].map((r) => (
            <button
              key={String(r)}
              type="button"
              role="radio"
              aria-checked={returning === r}
              onClick={() => setReturning(r)}
              className={`rounded-full py-2.5 text-[13px] font-semibold transition ${returning === r ? "bg-ink text-alabaster" : "text-ink-muted hover:text-ink"}`}
            >
              {r ? b.patient.returning : b.patient.new}
            </button>
          ))}
        </div>

        <div>
          <div className="mb-2.5 text-[12.5px] font-semibold">{b.reason}</div>
          <div className="flex flex-wrap gap-2">
            {b.reasons.map((r, i) => (
              <button key={r} type="button" onClick={() => setReason(i)} className={`choice rounded-full px-3.5 py-2 ${reason === i ? "choice-on" : ""}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2.5 text-[12.5px] font-semibold">{b.day}</div>
          <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:-mx-8 sm:px-8">
            {days.map((d, i) => (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => {
                  setDay(i);
                  setSlot(null);
                }}
                className={`flex w-[62px] shrink-0 flex-col items-center rounded-tile border py-3 transition ${
                  day === i ? "border-emerald bg-emerald text-white" : "border-ink/10 bg-white hover:border-ink/30"
                }`}
              >
                <span className="text-[10.5px] opacity-70">{new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d)}</span>
                <span className="mt-0.5 text-[20px] font-semibold leading-none">{d.getDate()}</span>
                <span className="mt-1 text-[10.5px] opacity-70">{new Intl.DateTimeFormat(locale, { month: "short" }).format(d)}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <span className="text-[12.5px] font-semibold">{b.time}</span>
            {isLive && (
              <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-emerald">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-emerald" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                </span>
                {b.live}
              </span>
            )}
          </div>
          {loading && (
            <p className="flex items-center gap-2 py-3 text-[13px] text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> {b.loading}
            </p>
          )}
          {!loading && slots.length === 0 && <p className="py-3 text-[13px] text-ink-muted">{b.full}</p>}
          <div className="grid grid-cols-4 gap-2" dir="ltr">
            {slots.map((s) => (
              <button key={s} type="button" onClick={() => setSlot(s)} className={`choice relative font-mono text-[13px] ${slot === s ? "choice-on" : ""}`}>
                {s}
                {slot === s && <Check className="absolute right-1.5 top-1.5 h-3 w-3" />}
              </button>
            ))}
          </div>
          {touched && !slot && <p className="mt-1.5 text-[12px] text-red-600">{b.timeErr}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={b.namePh}
            autoComplete="name"
            aria-label={b.namePh}
            className={`field ${touched && !nameOk ? "border-red-400" : ""}`}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={b.phonePh}
            type="tel"
            dir="ltr"
            autoComplete="tel"
            aria-label={b.phonePh}
            className={`field rtl:text-right ${touched && !phoneOk ? "border-red-400" : ""}`}
          />
        </div>
        <p className="text-[11.5px] text-ink-muted">{fmt(BOOKING_API ? b.liveNote : b.note, { coord: CLINIC.coordinatorName })}</p>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-hairline bg-alabaster/90 px-6 py-4 backdrop-blur-xl sm:px-8">
        <span className="truncate text-[12px] text-ink-muted">{slot ? `${dateLabel} · ${slot}` : b.none}</span>
        {BOOKING_API ? (
          <button type="submit" disabled={sending} className="btn-primary btn-sm shrink-0 py-3">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />} {sending ? b.sending : b.confirm}
          </button>
        ) : (
          <button type="submit" className="btn-whatsapp btn-sm shrink-0 py-3">
            <MessageCircle className="h-4 w-4" /> {b.submit}
          </button>
        )}
      </div>
    </form>
  );
}
