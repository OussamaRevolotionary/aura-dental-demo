import { DEMO } from "./demo";

/** Clinic contact & business details used across CTAs, WhatsApp hand-offs, status indicators and footer. */
export const CLINIC = {
  name: "AURA Dental Studio",
  /** International format, digits only — used for wa.me links. */
  whatsappNumber: "41791234567",
  phoneDisplay: "+41 79 123 45 67",
  email: "concierge@auradental.studio",
  address: ["Bahnhofstrasse 42", "8001 Zürich, Switzerland"],
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bahnhofstrasse%2042%2C%208001%20Z%C3%BCrich",
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=AURA%20Dental%20Studio%20Z%C3%BCrich",
  rating: "4.98",
  reviewCount: "640+",
  coordinatorName: "Sofia",
  timeZone: "Europe/Zurich",
  /** Opening hours per weekday (0 = Sunday), [open, close] in 24h. Drives the live "online" status. */
  schedule: { 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 17], 6: [9, 14] } as Record<number, [number, number]>,
  /** Optional: POST endpoint (CRM, Zapier, n8n…) that receives each lead as JSON. Leave empty to disable. */
  leadWebhookUrl: "",
};

export type GoalId = "whiter" | "straighter" | "replace" | "makeover" | "emergency";

/** In a personalised demo, messages greet the prospect's clinic and can go to their own WhatsApp. */
export function whatsappLink(message: string) {
  const number = DEMO.whatsapp || CLINIC.whatsappNumber;
  const text = DEMO.clinic ? message.split(CLINIC.name).join(DEMO.clinic) : message;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function telLink() {
  return `tel:${CLINIC.phoneDisplay.replace(/\s/g, "")}`;
}

export function sendLead(payload: Record<string, string>) {
  if (!CLINIC.leadWebhookUrl) return;
  fetch(CLINIC.leadWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, source: "auradental.studio", submittedAt: new Date().toISOString() }),
    keepalive: true,
  }).catch(() => undefined);
}

/** Is the clinic open right now (Zürich time)? If not, when does it next open? */
export function clinicStatus(now = new Date()): { open: boolean; daysAhead: number; opensAt: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC.timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const hour = Number(get("hour")) + Number(get("minute")) / 60;

  const today = CLINIC.schedule[day];
  if (today && hour >= today[0] && hour < today[1]) return { open: true, daysAhead: 0, opensAt: "" };
  for (let ahead = 0; ahead < 8; ahead++) {
    const d = (day + ahead) % 7;
    const s = CLINIC.schedule[d];
    if (!s || (ahead === 0 && hour >= s[0])) continue;
    return { open: false, daysAhead: ahead, opensAt: `${String(s[0]).padStart(2, "0")}:00` };
  }
  return { open: false, daysAhead: 1, opensAt: "08:00" };
}
