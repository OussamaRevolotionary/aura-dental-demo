import { useI18n } from "../i18n";

const TEXT = {
  en: { label: "Concept demo · fictional clinic", sample: "Sample content", booked: "Demo mode — no appointment was created" },
  fr: { label: "Démo conceptuelle · clinique fictive", sample: "Contenu d'exemple", booked: "Mode démo — aucun rendez-vous n'a été créé" },
  ar: { label: "عرض تجريبي · عيادة افتراضية", sample: "محتوى توضيحي", booked: "وضع العرض — لم يتم إنشاء أي موعد" },
} as const;

export function useSandboxText() {
  const { lang } = useI18n();
  return TEXT[lang as keyof typeof TEXT] ?? TEXT.en;
}
