import { MotionConfig } from "framer-motion";
import BeforeAfterGallery from "./components/BeforeAfterSlider";
import BentoTreatments from "./components/BentoTreatments";
import ClinicPanels from "./components/ClinicPanels";
import ConciergeBar from "./components/ConciergeBar";
import DemoLinkMaker from "./components/DemoLinkMaker";
import EditorialIntro from "./components/EditorialIntro";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import PatientJourney from "./components/PatientJourney";
import SanctuarySection from "./components/SanctuarySection";
import SmileQuizDrawer from "./components/SmileQuizDrawer";
import SmileStyles from "./components/SmileStyles";
import TechShowcase from "./components/TechShowcase";
import Testimonials from "./components/Testimonials";
import { UIProvider } from "./context/UIContext";
import { I18nProvider, useI18n } from "./i18n";

function Site() {
  const { t, lang } = useI18n();
  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded-full bg-ink px-4 py-2 text-alabaster focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {t.skip}
      </a>
      <Navbar />
      {/* Re-key on language so scroll-reveal animations replay in the new language */}
      <main id="main" key={lang}>
        <Hero />
        <EditorialIntro />
        <BeforeAfterGallery />
        <SmileStyles />
        <TechShowcase />
        <BentoTreatments />
        <SanctuarySection />
        <PatientJourney />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <ConciergeBar />
      <SmileQuizDrawer />
      <ClinicPanels />
      <DemoLinkMaker />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider>
        <UIProvider>
          <Site />
        </UIProvider>
      </I18nProvider>
    </MotionConfig>
  );
}
