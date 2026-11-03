/**
 * Live booking backend: the "AURA Demo — Booking API" workflow in n8n.
 *   GET  {base}/aura-slots?day=YYYY-MM-DD  → { day, slots: ["08:30", …] }   free 60-min slots from Google Calendar
 *   POST {base}/aura-book                   → { ok: true, day, time }         adds the visit to the calendar
 *   GET  {base}/aura-bookings               → { bookings: [...] }             recent bookings, names shortened, phones masked
 * Leave BOOKING_API empty to fall back to the WhatsApp-only flow.
 */
export const BOOKING_API = "https://oussama19.app.n8n.cloud/webhook";

export type LiveBooking = {
  id: number;
  name: string;
  phone: string;
  reason: string;
  patientType: "new" | "returning";
  day: string;
  time: string;
  language: string;
  clinic: string;
  createdAt: string;
};

/** Local calendar date as YYYY-MM-DD (not UTC, so late-evening visitors get the right day). */
export function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(`${BOOKING_API}/${path}`, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(timer);
  }
}

export function fetchSlots(day: string) {
  return call<{ day: string; slots: string[] }>(`aura-slots?day=${day}`).then((r) => r.slots);
}

export function bookVisit(payload: Record<string, string>) {
  return call<{ ok: boolean }>("aura-book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => {
    if (!r.ok) throw new Error("rejected");
  });
}

export function fetchBookings() {
  return call<{ bookings: LiveBooking[] }>("aura-bookings").then((r) => r.bookings);
}
