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

/** Sandbox by default: only `?live=1` talks to the n8n backend. Everything else is local and offline. */
export const LIVE = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("live") === "1";

/** Deterministic fake free slots for a day (same day → same slots), never touches the network. */
export function demoSlots(day: string): string[] {
  const pool = ["08:30", "09:45", "11:00", "13:30", "15:00", "16:15", "17:30"];
  let h = 0;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool.filter((_, i) => (h >> i) % 3 !== 0).slice(0, 4);
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!LIVE) throw new Error("sandbox");
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
  if (!LIVE) return Promise.resolve(demoSlots(day));
  return call<{ day: string; slots: string[] }>(`aura-slots?day=${day}`).then((r) => r.slots);
}

export function bookVisit(payload: Record<string, string>) {
  if (!LIVE) return Promise.resolve(); // demo mode: nothing is sent or stored
  return call<{ ok: boolean }>("aura-book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => {
    if (!r.ok) throw new Error("rejected");
  });
}

export function fetchBookings() {
  if (!LIVE) return Promise.resolve<LiveBooking[]>([]);
  return call<{ bookings: LiveBooking[] }>("aura-bookings").then((r) => r.bookings);
}
