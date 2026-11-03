import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { GoalId } from "../config/clinic";

export type CaseId = "veneers" | "implants" | "aligners" | "gums";
export type StyleId = "natural" | "soft" | "hollywood" | "youthful";
/** Full-screen panels: the pre-visit health form and the clinic's view of bookings. */
export type Panel = "form" | "clinic" | null;

type UIState = {
  quizOpen: boolean;
  quizPreset: GoalId | null;
  /** Smile style picked in the Smile Styles section, carried into the quiz message. */
  quizStyle: StyleId | null;
  bookingOpen: boolean;
  galleryCase: CaseId;
  panel: Panel;
  /** Name carried from a booking into the health form, so the patient doesn't type it twice. */
  formName: string;
  openQuiz: (preset?: GoalId, style?: StyleId) => void;
  closeQuiz: () => void;
  openBooking: () => void;
  closeBooking: () => void;
  setGalleryCase: (c: CaseId) => void;
  /** Switch the Smile Gallery to a case and scroll to it — used to cross-link sections. */
  showCase: (c: CaseId) => void;
  openPanel: (p: Exclude<Panel, null>, name?: string) => void;
  closePanel: () => void;
};

const UIContext = createContext<UIState | null>(null);

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** /?form and /?clinic open those panels directly, so they can be linked from WhatsApp. */
function panelFromUrl(): Panel {
  const p = new URLSearchParams(window.location.search);
  return p.has("clinic") ? "clinic" : p.has("form") ? "form" : null;
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizPreset, setQuizPreset] = useState<GoalId | null>(null);
  const [quizStyle, setQuizStyle] = useState<StyleId | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [galleryCase, setGalleryCase] = useState<CaseId>("veneers");
  const [panel, setPanel] = useState<Panel>(panelFromUrl);
  const [formName, setFormName] = useState("");

  const openQuiz = useCallback((preset?: GoalId, style?: StyleId) => {
    setQuizPreset(preset ?? null);
    setQuizStyle(style ?? null);
    setBookingOpen(false);
    setQuizOpen(true);
  }, []);
  const closeQuiz = useCallback(() => setQuizOpen(false), []);
  const openBooking = useCallback(() => {
    setQuizOpen(false);
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);
  const showCase = useCallback((c: CaseId) => {
    setGalleryCase(c);
    scrollToSection("gallery");
  }, []);
  const openPanel = useCallback((p: Exclude<Panel, null>, name = "") => {
    setQuizOpen(false);
    setBookingOpen(false);
    setFormName(name);
    setPanel(p);
  }, []);
  const closePanel = useCallback(() => {
    setPanel(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("form");
    url.searchParams.delete("clinic");
    window.history.replaceState(null, "", url);
  }, []);

  const value = useMemo(
    () => ({
      quizOpen,
      quizPreset,
      quizStyle,
      bookingOpen,
      galleryCase,
      panel,
      formName,
      openQuiz,
      closeQuiz,
      openBooking,
      closeBooking,
      setGalleryCase,
      showCase,
      openPanel,
      closePanel,
    }),
    [quizOpen, quizPreset, quizStyle, bookingOpen, galleryCase, panel, formName, openQuiz, closeQuiz, openBooking, closeBooking, showCase, openPanel, closePanel],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}
