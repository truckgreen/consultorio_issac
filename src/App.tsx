import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
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
import { PatientPortalModal } from './components/PatientPortalModal';
import { SpecialistAccessModal } from './components/SpecialistAccessModal';
import { SecurityPrivacyModal } from './components/SecurityPrivacyModal';
import { LegalNoticeModal } from './components/LegalNoticeModal';
import { LaunchAuditModal } from './components/LaunchAuditModal';
import { DeveloperSupportModal } from './components/DeveloperSupportModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { CookieBanner } from './components/CookieBanner';
import { NotFoundPage } from './components/NotFoundPage';
import { ServiceItem } from './types';
import { syncGlobalConfigFromServer } from './lib/supabase';
import { trackPageView } from './utils/analytics';

export function App() {
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

  // 1. Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('equilibra_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('equilibra_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('equilibra_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // 2. Modals State
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

  // 3. Custom 404 State
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

  if (is404Active) {
    return (
      <NotFoundPage
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setIs404Active(false);
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
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c1017] text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-amber-400 selection:text-slate-950 relative">
      {/* Subtle global ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/5 dark:bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-slate-400/5 dark:bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      {/* 1. Sticky Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenBooking={handleOpenBooking}
        onOpenPatientPortal={() => handleOpenPatientPortal()}
        onOpenSpecialistAccess={() => setIsSpecialistAccessOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenDeveloperSupport={() => setIsDeveloperSupportOpen(true)}
      />

      {/* 2. Main Page Sections */}
      <main>
        <Hero onOpenBooking={() => handleOpenBooking()} />
        
        <AboutSection onOpenBooking={() => handleOpenBooking()} />
        
        <ServicesGrid
          onSelectService={(service) => setSelectedDetailService(service)}
          onOpenBooking={handleOpenBooking}
        />
        
        <TeamSection onOpenBooking={handleOpenBooking} />
        
        <SpecialtiesSection onOpenBooking={handleOpenBooking} />
        
        <PhilosophySection onOpenBooking={() => handleOpenBooking()} />
        
        <WhyChooseUs onOpenBooking={() => handleOpenBooking()} />
        
        <InteractiveAssessment onOpenBooking={handleOpenBooking} />
        
        <BookingSection
          onOpenPatientPortal={handleOpenPatientPortal}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        />

        {/* 08: Ficha de Google Business Profile */}
        <GoogleBusinessCard />
        
        <TestimonialsSection />
        
        <InteractiveFaq />
      </main>

      {/* 3. Footer */}
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

      {/* 4. Floating Conversion Elements */}
      {/* 18: Botón de WhatsApp Visible Flotante */}
      <WhatsAppFloatingButton />

      {/* 03: Banner de Consentimiento de Cookies */}
      <CookieBanner
        onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
        onOpenLegalNotice={() => setIsLegalNoticeOpen(true)}
      />

      {/* 5. Global Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBooking}
        initialServiceId={selectedServiceIdForBooking}
        onOpenPatientPortal={handleOpenPatientPortal}
      />

      <ServiceDetailModal
        service={selectedDetailService}
        onClose={() => setSelectedDetailService(null)}
        onBookService={(serviceId) => handleOpenBooking(serviceId)}
      />

      <PatientPortalModal
        isOpen={isPatientPortalOpen}
        onClose={() => {
          setIsPatientPortalOpen(false);
          setPortalInitialCode(undefined);
        }}
        initialCode={portalInitialCode}
        onOpenBooking={handleOpenBooking}
      />

      <SpecialistAccessModal
        isOpen={isSpecialistAccessOpen}
        onClose={() => setIsSpecialistAccessOpen(false)}
      />

      <SecurityPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* 01: Modal de Aviso Legal y Términos */}
      <LegalNoticeModal
        isOpen={isLegalNoticeOpen}
        onClose={() => setIsLegalNoticeOpen(false)}
      />

      {/* Checklist interactivo 20 de 20 */}
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

      <DeveloperSupportModal
        isOpen={isDeveloperSupportOpen}
        onClose={() => setIsDeveloperSupportOpen(false)}
      />

      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        onClose={() => setIsAppDownloadOpen(false)}
      />
    </div>
  );
}

export default App;
