import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { IntroPhilosophySection } from './components/IntroPhilosophySection';
import { ServicesGridSection } from './components/ServicesGridSection';
import { PricingAndVideosSection } from './components/PricingAndVideosSection';
import { SpecialtiesDeepDive } from './components/SpecialtiesDeepDive';
import { MethodologySection } from './components/MethodologySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BookingAndContactSection } from './components/BookingAndContactSection';
import { Footer } from './components/Footer';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { ServiceVideoModal } from './components/ServiceVideoModal';
import { AdminMobileApp } from './components/AdminMobileApp';

import { ServiceDetail, Testimonial } from './types';
import { StorageService } from './services/storageService';

export default function App() {
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  // Modals state
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceDetail | null>(null);
  const [selectedServiceForVideoModal, setSelectedServiceForVideoModal] = useState<ServiceDetail | null>(null);
  const [isAdminAppOpen, setIsAdminAppOpen] = useState(false);
  const [preselectedBookingService, setPreselectedBookingService] = useState<string>('Fisioterapia General');

  const refreshData = () => {
    setServices(StorageService.getServices());
    setTestimonials(StorageService.getTestimonials());
  };

  useEffect(() => {
    refreshData();
    const cleanup = StorageService.onDatabaseChange(() => {
      refreshData();
    });

    // Check if the page is opened with ?admin=true or in standalone PWA mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || window.location.hash === '#admin') {
      setIsAdminAppOpen(true);
    }

    return cleanup;
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookService = (serviceTitle: string) => {
    setPreselectedBookingService(serviceTitle);
    scrollToSection('contacto');
  };

  const handleOpenSpecialtyModal = (specialtyTitle: string) => {
    const match = services.find(
      (s) =>
        s.title.toLowerCase().includes(specialtyTitle.toLowerCase()) ||
        specialtyTitle.toLowerCase().includes(s.title.toLowerCase()) ||
        specialtyTitle.toLowerCase().includes(s.categoryName.toLowerCase())
    ) || services[0];
    setSelectedServiceForModal(match);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20">
      
      {/* Navigation Bar for public website */}
      <Navbar
        onOpenMobileApp={() => setIsAdminAppOpen(true)}
        onOpenClinicalPortal={() => setIsAdminAppOpen(true)}
        onBookAppointmentClick={() => scrollToSection('contacto')}
      />

      {/* Main Public Website Sections */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <HeroSection
          onExploreServices={() => scrollToSection('servicios')}
          onExplorePricing={() => scrollToSection('tarifas')}
          onBookAppointment={() => scrollToSection('contacto')}
        />

        {/* Intro Philosophy Section */}
        <IntroPhilosophySection
          onLearnMore={() => scrollToSection('especialidades')}
          onBookAppointment={() => scrollToSection('contacto')}
        />

        {/* Services Grid with dynamic live prices and videos */}
        <ServicesGridSection
          services={services}
          onSelectService={(srv) => setSelectedServiceForModal(srv)}
          onBookService={handleBookService}
          onOpenVideo={(srv) => setSelectedServiceForVideoModal(srv)}
        />

        {/* Transparent Pricing & Explanatory Video Section */}
        <PricingAndVideosSection
          services={services}
          onOpenVideo={(srv) => setSelectedServiceForVideoModal(srv)}
          onBookService={handleBookService}
        />

        {/* 4 Core Pillars */}
        <SpecialtiesDeepDive
          onOpenSpecialtyModal={handleOpenSpecialtyModal}
          onBookAppointment={() => scrollToSection('contacto')}
        />

        {/* Methodology & Value Proposition */}
        <MethodologySection
          onBookAppointment={() => scrollToSection('contacto')}
          onOpenMobileTracker={() => setIsAdminAppOpen(true)}
        />

        {/* Client Testimonials */}
        <TestimonialsSection
          testimonials={testimonials}
          onTestimonialAdded={refreshData}
        />

        {/* Online Booking Form & Contact Information */}
        <BookingAndContactSection
          preselectedService={preselectedBookingService}
          onBookingSuccess={() => {
            refreshData();
          }}
        />

      </main>

      {/* Footer with Staff Access */}
      <Footer
        onOpenMobileApp={() => setIsAdminAppOpen(true)}
        onOpenClinicalPortal={() => setIsAdminAppOpen(true)}
        onBookAppointment={() => scrollToSection('contacto')}
      />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedServiceForModal}
        isOpen={Boolean(selectedServiceForModal)}
        onClose={() => setSelectedServiceForModal(null)}
        onBookAppointment={handleBookService}
        onOpenVideo={(srv) => {
          setSelectedServiceForModal(null);
          setSelectedServiceForVideoModal(srv);
        }}
      />

      {/* Service Explanatory Video Modal Player */}
      <ServiceVideoModal
        service={selectedServiceForVideoModal}
        isOpen={Boolean(selectedServiceForVideoModal)}
        onClose={() => setSelectedServiceForVideoModal(null)}
        onBookAppointment={handleBookService}
      />

      {/* ADMIN MOBILE APPLICATION (Exclusive for Clinic Staff & Administrators) */}
      {isAdminAppOpen && (
        <AdminMobileApp
          onClose={() => setIsAdminAppOpen(false)}
        />
      )}

    </div>
  );
}
