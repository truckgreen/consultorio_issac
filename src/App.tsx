import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Navbar, AppView } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { SubviewHeader } from './components/SubviewHeader';
import { GeminiBotWidget } from './components/GeminiBotWidget';
import { AboutSection } from './components/AboutSection';
import { ServicesGrid } from './components/ServicesGrid';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { TeamSection } from './components/TeamSection';
import { SpecialtiesSection } from './components/SpecialtiesSection';
import { PhilosophySection } from './components/PhilosophySection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { InteractiveAssessment } from './components/InteractiveAssessment';
import { BookingSection } from './components/BookingSection';
import { BookingModal } from './components/BookingModal';
import { GoogleBusinessCard } from './components/GoogleBusinessCard';
import { TestimonialsSection } from './components/TestimonialsSection';
import { InteractiveFaq } from './components/InteractiveFaq';
import { ContactFooter } from './components/ContactFooter';

// Lazy-loaded heavy and secondary modals for optimal initial bundle & load speed
const PatientPortalModal = React.lazy(() =>
  import('./components/PatientPortalModal').then((m) => ({ default: m.PatientPortalModal }))
);
const SpecialistAccessModal = React.lazy(() =>
  import('./components/SpecialistAccessModal').then((m) => ({ default: m.SpecialistAccessModal }))
);
const SecurityPrivacyModal = React.lazy(() =>
  import('./components/SecurityPrivacyModal').then((m) => ({ default: m.SecurityPrivacyModal }))
);
const LegalNoticeModal = React.lazy(() =>
  import('./components/LegalNoticeModal').then((m) => ({ default: m.LegalNoticeModal }))
);
const LaunchAuditModal = React.lazy(() =>
  import('./components/LaunchAuditModal').then((m) => ({ default: m.LaunchAuditModal }))
);
const DeveloperSupportModal = React.lazy(() =>
  import('./components/DeveloperSupportModal').then((m) => ({ default: m.DeveloperSupportModal }))
);
const AppDownloadModal = React.lazy(() =>
  import('./components/AppDownloadModal').then((m) => ({ default: m.AppDownloadModal }))
);
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { NavigationTipToast } from './components/NavigationTipToast';
import { CookieBanner } from './components/CookieBanner';
import { NotFoundPage } from './components/NotFoundPage';
import { ServiceItem } from './types';
import { syncGlobalConfigFromServer } from './lib/supabase';
import { trackPageView } from './utils/analytics';

const THEME_STORAGE_KEY = 'equilibra_theme_preference';

export function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  // 1. Multi-view Routing State based on URL Hash
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const validViews: AppView[] = ['inicio', 'servicios', 'triage', 'equipo', 'citas', 'testimonios', 'contacto'];
      if (validViews.includes(hash as AppView)) {
        return hash as AppView;
      }
    } catch {}
    return 'inicio';
  });

  // Listen to hash changes (browser back/forward buttons & direct links)
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
        const validViews: AppView[] = ['inicio', 'servicios', 'triage', 'equipo', 'citas', 'testimonios', 'contacto'];
        if (validViews.includes(hash as AppView)) {
          setCurrentView(hash as AppView);
        } else if (!hash || hash === 'inicio') {
          setCurrentView('inicio');
        }
      } catch {}
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateView = (view: AppView) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
    trackPageView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global config sync across all devices & direct link detection
  useEffect(() => {
    syncGlobalConfigFromServer();
    trackPageView('homepage');

    // Portal del Paciente con enlace directo (Sin contraseña compleja)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const portalParam = urlParams.get('portal_code') || urlParams.get('cita') || urlParams.get('codigo') || urlParams.get('paciente') || urlParams.get('p');
      if (portalParam && portalParam.trim()) {
        const cleanCode = portalParam.trim().toUpperCase();
        setPortalInitialCode(cleanCode);
        setIsPatientPortalOpen(true);
      }
    } catch (e) {
      console.warn('[Direct Portal Link] Param read note:', e);
    }
  }, []);

  // 2. Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // 3. Modals State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | undefined>(undefined);
  const [selectedDetailService, setSelectedDetailService] = useState<ServiceItem | null>(null);
  
  const [isPatientPortalOpen, setIsPatientPortalOpen] = useState(false);
  const [portalInitialCode, setPortalInitialCode] = useState<string | undefined>(undefined);
  const [isSpecialistAccessOpen, setIsSpecialistAccessOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLegalNoticeOpen, setIsLegalNoticeOpen] = useState(false);
  const [isLaunchAuditOpen, setIsLaunchAuditOpen] = useState(false);
  const [isDeveloperSupportOpen, setIsDeveloperSupportOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);

  // 4. Gemini AI Chatbot Widget State
  const [isGeminiBotOpen, setIsGeminiBotOpen] = useState(false);

  // 5. Custom 404 State
  const [is404Active, setIs404Active] = useState<boolean>(() => {
    const path = window.location.pathname;
    return path !== '/' && path !== '' && path !== '/index.html';
  });

  // Handlers
  const handleOpenBooking = (serviceId?: string) => {
    setSelectedServiceIdForBooking(serviceId);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedServiceIdForBooking(undefined);
  };

  const handleOpenPatientPortal = (code?: string) => {
    setPortalInitialCode(code);
    setIsPatientPortalOpen(true);
  };

  const handleTriggerCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('equilibra_open_cookie_settings'));
  };

  const handleOpenGeminiBot = (initialPrompt?: string) => {
    setIsGeminiBotOpen(true);
    // If prompt passed, trigger custom event that widget can catch or prefill
    if (initialPrompt) {
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('equilibra_gemini_prompt', { detail: initialPrompt }));
      }, 150);
    }
  };

  if (is404Active) {
    return (
      <NotFoundPage
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setIs404Active(false);
          setCurrentView('inicio');
        }}
        onOpenBooking={() => {
          window.history.pushState({}, '', '/');
          setIs404Active(false);
          handleOpenBooking();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EFE8] dark:bg-[#0C0C0C] text-[#0C0C0C] dark:text-[#F2EFE8] font-sans transition-colors selection:bg-[#B1A086] selection:text-slate-950 relative">
      {/* Top Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9E8D74] via-[#B1A086] to-[#D1CEC9] origin-left z-[60] pointer-events-none shadow-sm shadow-[#B1A086]/30"
        style={{ scaleX }}
      />

      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#B1A086]/5 dark:bg-[#B1A086]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#B1A086]/5 dark:bg-[#B1A086]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-slate-400/5 dark:bg-[#B1A086]/5 rounded-full blur-3xl" />
      </div>

      {/* 1. Header Navigation with View Switcher & Gemini Assistant */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenBooking={handleOpenBooking}
        activeView={currentView}
        onSelectView={handleNavigateView}
        onOpenGeminiBot={() => setIsGeminiBotOpen(true)}
        onOpenPatientPortal={() => handleOpenPatientPortal()}
        onOpenSpecialistAccess={() => setIsSpecialistAccessOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenDeveloperSupport={() => setIsDeveloperSupportOpen(true)}
      />

      {/* 2. Subview Context Header (Rendered on non-home views) */}
      <SubviewHeader
        view={currentView}
        onGoHome={() => handleNavigateView('inicio')}
        onOpenBooking={() => handleOpenBooking()}
        onOpenGeminiBot={() => setIsGeminiBotOpen(true)}
      />

      {/* 3. Main Views Content */}
      <main className="relative z-10">
        {/* VIEW: INICIO (HOME - Alto Impacto, Intuitivo, Hub de Navegación) */}
        {currentView === 'inicio' && (
          <HomeView
            onNavigateView={handleNavigateView}
            onOpenBooking={handleOpenBooking}
            onOpenGeminiBot={handleOpenGeminiBot}
            onSelectService={(service) => setSelectedDetailService(service)}
          />
        )}

        {/* VIEW: SERVICIOS & ESPECIALIDADES */}
        {currentView === 'servicios' && (
          <div className="pb-16 space-y-12">
            <ServicesGrid
              onSelectService={(service) => setSelectedDetailService(service)}
              onOpenBooking={handleOpenBooking}
            />
            <SpecialtiesSection onOpenBooking={handleOpenBooking} />
          </div>
        )}

        {/* VIEW: ORIENTACIÓN CLÍNICA & TRIAGE */}
        {currentView === 'triage' && (
          <div className="pb-16 space-y-12">
            <InteractiveAssessment onOpenBooking={handleOpenBooking} />
          </div>
        )}

        {/* VIEW: EQUIPO MÉDICO & FILOSOFÍA */}
        {currentView === 'equipo' && (
          <div className="pb-16 space-y-12">
            <AboutSection onOpenBooking={() => handleOpenBooking()} />
            <TeamSection onOpenBooking={handleOpenBooking} />
            <PhilosophySection onOpenBooking={() => handleOpenBooking()} />
            <WhyChooseUs onOpenBooking={() => handleOpenBooking()} />
          </div>
        )}

        {/* VIEW: CITAS ONLINE DIRECTAS */}
        {currentView === 'citas' && (
          <div className="pb-16">
            <BookingSection
              onOpenPatientPortal={handleOpenPatientPortal}
              onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW: RESEÑAS, TESTIMONIOS & FAQ */}
        {currentView === 'testimonios' && (
          <div className="pb-16 space-y-12">
            <GoogleBusinessCard />
            <TestimonialsSection />
            <InteractiveFaq />
          </div>
        )}

        {/* VIEW: CONTACTO & UBICACIÓN */}
        {currentView === 'contacto' && (
          <div className="pb-12 space-y-12">
            <GoogleBusinessCard />
          </div>
        )}
      </main>

      {/* 4. Global Footer */}
      <ContactFooter
        onOpenBooking={() => handleOpenBooking()}
        onOpenPatientPortal={() => handleOpenPatientPortal()}
        onOpenSpecialistAccess={() => setIsSpecialistAccessOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenLegalNotice={() => setIsLegalNoticeOpen(true)}
        onOpenCookieSettings={handleTriggerCookieSettings}
        onOpenLaunchAudit={() => setIsLaunchAuditOpen(true)}
        onOpenDeveloperSupport={() => setIsDeveloperSupportOpen(true)}
      />

      {/* 5. Floating Interactive Gemini Assistant Widget */}
      <GeminiBotWidget
        isOpen={isGeminiBotOpen}
        onOpen={() => setIsGeminiBotOpen(true)}
        onClose={() => setIsGeminiBotOpen(false)}
        onOpenBooking={handleOpenBooking}
      />

      {/* 6. Floating Conversion Elements */}
      <WhatsAppFloatingButton />

      {/* Floating navigation tip toast */}
      <NavigationTipToast />

      {/* Cookie Consent Banner */}
      <CookieBanner
        onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
        onOpenLegalNotice={() => setIsLegalNoticeOpen(true)}
      />

      {/* 7. Global Modals (Lazy-loaded for maximum performance) */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBooking}
        initialServiceId={selectedServiceIdForBooking}
        onOpenPatientPortal={handleOpenPatientPortal}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenLegalNotice={() => setIsLegalNoticeOpen(true)}
      />

      <ServiceDetailModal
        service={selectedDetailService}
        onClose={() => setSelectedDetailService(null)}
        onBookService={(serviceId) => handleOpenBooking(serviceId)}
      />

      <React.Suspense fallback={null}>
        {isPatientPortalOpen && (
          <PatientPortalModal
            isOpen={isPatientPortalOpen}
            onClose={() => {
              setIsPatientPortalOpen(false);
              setPortalInitialCode(undefined);
            }}
            initialCode={portalInitialCode}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {isSpecialistAccessOpen && (
          <SpecialistAccessModal
            isOpen={isSpecialistAccessOpen}
            onClose={() => setIsSpecialistAccessOpen(false)}
          />
        )}

        {isPrivacyModalOpen && (
          <SecurityPrivacyModal
            isOpen={isPrivacyModalOpen}
            onClose={() => setIsPrivacyModalOpen(false)}
          />
        )}

        {isLegalNoticeOpen && (
          <LegalNoticeModal
            isOpen={isLegalNoticeOpen}
            onClose={() => setIsLegalNoticeOpen(false)}
          />
        )}

        {isLaunchAuditOpen && (
          <LaunchAuditModal
            isOpen={isLaunchAuditOpen}
            onClose={() => setIsLaunchAuditOpen(false)}
            onOpenLegalNotice={() => {
              setIsLaunchAuditOpen(false);
              setIsLegalNoticeOpen(true);
            }}
            onOpenPrivacyPolicy={() => {
              setIsLaunchAuditOpen(false);
              setIsPrivacyModalOpen(true);
            }}
            onOpenCookieSettings={() => {
              setIsLaunchAuditOpen(false);
              handleTriggerCookieSettings();
            }}
            onOpenBooking={() => {
              setIsLaunchAuditOpen(false);
              handleOpenBooking();
            }}
            onTrigger404={() => {
              setIsLaunchAuditOpen(false);
              setIs404Active(true);
            }}
          />
        )}

        {isDeveloperSupportOpen && (
          <DeveloperSupportModal
            isOpen={isDeveloperSupportOpen}
            onClose={() => setIsDeveloperSupportOpen(false)}
          />
        )}

        {isAppDownloadOpen && (
          <AppDownloadModal
            isOpen={isAppDownloadOpen}
            onClose={() => setIsAppDownloadOpen(false)}
          />
        )}
      </React.Suspense>
    </div>
  );
}

export default App;
