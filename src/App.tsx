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
import { TestimonialsSection } from './components/TestimonialsSection';
import { InteractiveFaq } from './components/InteractiveFaq';
import { ContactFooter } from './components/ContactFooter';
import { PatientPortalModal } from './components/PatientPortalModal';
import { SpecialistAccessModal } from './components/SpecialistAccessModal';
import { SecurityPrivacyModal } from './components/SecurityPrivacyModal';
import { DeveloperSupportModal } from './components/DeveloperSupportModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { ServiceItem } from './types';
import { syncGlobalConfigFromServer } from './lib/supabase';

export function App() {
  // Global config sync across all devices
  useEffect(() => {
    syncGlobalConfigFromServer();
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
  const [isDeveloperSupportOpen, setIsDeveloperSupportOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);

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
        
        <TestimonialsSection />
        
        <InteractiveFaq />
      </main>

      {/* 3. Footer */}
      <ContactFooter
        onOpenBooking={() => handleOpenBooking()}
        onOpenPatientPortal={() => handleOpenPatientPortal()}
        onOpenSpecialistAccess={() => setIsSpecialistAccessOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenDeveloperSupport={() => setIsDeveloperSupportOpen(true)}
      />

      {/* 4. Global Modals */}
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
