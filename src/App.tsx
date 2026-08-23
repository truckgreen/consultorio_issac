import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesGrid } from './components/ServicesGrid';
import { TeamSection } from './components/TeamSection';
import { SpecialtiesSection } from './components/SpecialtiesSection';
import { PhilosophySection } from './components/PhilosophySection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { InteractiveAssessment } from './components/InteractiveAssessment';
import { BookingSection } from './components/BookingSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { InteractiveFaq } from './components/InteractiveFaq';
import { ContactFooter } from './components/ContactFooter';
import { BookingModal } from './components/BookingModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { SecurityPrivacyModal } from './components/SecurityPrivacyModal';
import { PatientPortalModal } from './components/PatientPortalModal';
import { SpecialistAccessModal } from './components/SpecialistAccessModal';
import { DeveloperSupportModal } from './components/DeveloperSupportModal';
import { ServiceItem } from './types';

export default function App() {
  // Dark mode initialized from localStorage or default dark/light preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('equilibra_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Selected Service for on-page booking
  const [selectedBookingServiceId, setSelectedBookingServiceId] = useState<string>('fisioterapia');

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [activeDetailService, setActiveDetailService] = useState<ServiceItem | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [patientPortalOpen, setPatientPortalOpen] = useState<boolean>(false);
  const [specialistAccessOpen, setSpecialistAccessOpen] = useState<boolean>(false);
  const [developerSupportOpen, setDeveloperSupportOpen] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('equilibra_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('equilibra_theme', 'light');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleOpenBooking = (serviceId?: string) => {
    if (serviceId) {
      setSelectedBookingServiceId(serviceId);
    }
    const section = document.getElementById('agendar-cita');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      setBookingModalOpen(true);
    }
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
  };

  const handleSelectService = (service: ServiceItem) => {
    setActiveDetailService(service);
  };

  const handleCloseDetail = () => {
    setActiveDetailService(null);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f141c] text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Navigation Header */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenBooking={handleOpenBooking}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        onOpenPatientPortal={() => setPatientPortalOpen(true)}
        onOpenSpecialistAccess={() => setSpecialistAccessOpen(true)}
        onOpenDeveloperSupport={() => setDeveloperSupportOpen(true)}
      />

      <main>
        {/* Hero Section */}
        <Hero onOpenBooking={() => handleOpenBooking()} />

        {/* About Section */}
        <AboutSection onOpenBooking={() => handleOpenBooking()} />

        {/* 9 Services Grid */}
        <ServicesGrid
          onSelectService={handleSelectService}
          onOpenBooking={(id) => handleOpenBooking(id)}
        />

        {/* Multidisciplinary Team Section */}
        <TeamSection onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* 4 Specialties */}
        <SpecialtiesSection onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* Philosophy */}
        <PhilosophySection onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* Value Proposition */}
        <WhyChooseUs onOpenBooking={() => handleOpenBooking()} />

        {/* Interactive Self-Assessment Symptom / Goal Guide */}
        <InteractiveAssessment onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* Directly In-Page Interactive Booking System with Calendar and Security Controls */}
        <BookingSection
          preselectedServiceId={selectedBookingServiceId}
          onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
          onOpenPatientPortal={() => setPatientPortalOpen(true)}
        />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Interactive FAQ */}
        <InteractiveFaq />
      </main>

      {/* Contact & Footer with hours, address, portals & security */}
      <ContactFooter
        onOpenBooking={() => handleOpenBooking()}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        onOpenPatientPortal={() => setPatientPortalOpen(true)}
        onOpenSpecialistAccess={() => setSpecialistAccessOpen(true)}
        onOpenDeveloperSupport={() => setDeveloperSupportOpen(true)}
      />

      {/* Quick Booking Modal Support */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={handleCloseBooking}
        initialServiceId={selectedBookingServiceId}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
      />

      {/* Service Deep Dive Modal */}
      <ServiceDetailModal
        service={activeDetailService}
        onClose={handleCloseDetail}
        onBookService={(id) => handleOpenBooking(id)}
      />

      {/* Security, Privacy & ARCO Data Compliance Modal */}
      <SecurityPrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      {/* Secure Patient Portal for Appointment Verification & Receipt Management */}
      <PatientPortalModal
        isOpen={patientPortalOpen}
        onClose={() => setPatientPortalOpen(false)}
        onOpenBooking={(id) => handleOpenBooking(id)}
      />

      {/* Specialist & Clinical Staff Access Gate (PIN Protected) */}
      <SpecialistAccessModal
        isOpen={specialistAccessOpen}
        onClose={() => setSpecialistAccessOpen(false)}
      />

      {/* Developer Contact & Technical Support Modal */}
      <DeveloperSupportModal
        isOpen={developerSupportOpen}
        onClose={() => setDeveloperSupportOpen(false)}
      />
    </div>
  );
}
