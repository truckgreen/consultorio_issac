import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesGrid } from './components/ServicesGrid';
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

  // Booking Modal State (optional fallback)
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);

  // Service Detail Modal State
  const [activeDetailService, setActiveDetailService] = useState<ServiceItem | null>(null);

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
      />

      <main>
        {/* Hero Section */}
        <Hero onOpenBooking={() => handleOpenBooking()} />

        {/* About Section: 'El verdadero bienestar comienza en movimiento' */}
        <AboutSection onOpenBooking={() => handleOpenBooking()} />

        {/* 9 Services Grid: 'Nuestros servicios' */}
        <ServicesGrid
          onSelectService={handleSelectService}
          onOpenBooking={(id) => handleOpenBooking(id)}
        />

        {/* 4 Specialties: 'En qué nos especializamos' */}
        <SpecialtiesSection onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* Philosophy: 'Lo que hacemos mejor - Realizamos un abordaje integral' */}
        <PhilosophySection onOpenBooking={() => handleOpenBooking()} />

        {/* Value Proposition: 'Por qué las personas nos prefieren' */}
        <WhyChooseUs onOpenBooking={() => handleOpenBooking()} />

        {/* Interactive Self-Assessment Symptom / Goal Guide */}
        <InteractiveAssessment onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* Directly In-Page Interactive Booking System with Calendar and Real-time Slot Statuses */}
        <BookingSection preselectedServiceId={selectedBookingServiceId} />

        {/* Testimonials: 'Comentarios de nuestros clientes' */}
        <TestimonialsSection />

        {/* Interactive FAQ */}
        <InteractiveFaq />
      </main>

      {/* Contact & Footer with hours, address & appointment CTA */}
      <ContactFooter onOpenBooking={() => handleOpenBooking()} />

      {/* Quick Booking Modal Support */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={handleCloseBooking}
        initialServiceId={selectedBookingServiceId}
      />

      {/* Service Deep Dive Modal */}
      <ServiceDetailModal
        service={activeDetailService}
        onClose={handleCloseDetail}
        onBookService={(id) => handleOpenBooking(id)}
      />
    </div>
  );
}

