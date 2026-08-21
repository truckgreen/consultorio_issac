import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Lock, 
  Calendar, 
  Menu, 
  X, 
  Phone, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { StorageService, DEFAULT_CLINIC_SETTINGS } from '../services/storageService';
import { ClinicSettings } from '../types';

interface NavbarProps {
  onOpenMobileApp: () => void;
  onOpenClinicalPortal: () => void;
  onBookAppointmentClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileApp,
  onBookAppointmentClick
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    setIsOnline(StorageService.isOnline());
    setSettings(StorageService.getClinicSettings());
    const unsub = StorageService.onDatabaseChange(() => {
      setIsOnline(StorageService.isOnline());
      setSettings(StorageService.getClinicSettings());
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsub();
    };
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Tarifas & Videos', href: '#tarifas' },
    { label: 'Especialidades', href: '#especialidades' },
    { label: 'Nuestro Método', href: '#metodo' },
    { label: 'Testimonios', href: '#testimonios' },
    { label: 'Contacto', href: '#contacto' }
  ];

  return (
    <>
      {/* Top micro banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {settings.address}, {settings.floorSuite} · {settings.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {settings.workingHoursWeekdays}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isOnline ? 'Citas en Tiempo Real' : 'Modo Offline'}
            </span>
            <a 
              href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} 
              className="flex items-center gap-1 text-slate-200 hover:text-indigo-300 transition-colors font-medium"
            >
              <Phone className="w-3 h-3 text-indigo-400" />
              {settings.phone}
            </a>
            <span className="text-slate-700">|</span>
            <button
              onClick={onOpenMobileApp}
              className="text-indigo-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-xs"
              title="Acceso restringido para administradores y especialistas"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main sticky navigation */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-3' 
            : 'bg-white border-b border-slate-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo */}
            <a href="#inicio" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-all">
                <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-widest text-xl text-slate-900 font-display uppercase">
                  EQUILIBRA
                </span>
                <span className="text-[10px] tracking-wider text-slate-500 uppercase font-medium">
                  Centro de Bienestar Físico
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-7">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-indigo-600 hover:after:w-full after:transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Discrete Staff / Admin Tool Button */}
              <button
                id="btn-nav-mobile-app"
                onClick={onOpenMobileApp}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
                title="Acceso Exclusivo para Administradores de EQUILIBRA"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Staff</span>
              </button>

              {/* Book Appointment CTA */}
              <button
                id="btn-nav-book-cta"
                onClick={onBookAppointmentClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reserva tu Cita</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                id="btn-nav-mobile-admin"
                onClick={onOpenMobileApp}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200"
                aria-label="Panel Admin"
                title="Panel Administrador"
              >
                <Lock className="w-4 h-4 text-slate-600" />
              </button>
              
              <button
                id="btn-nav-hamburger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                id="btn-mobile-menu-book"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookAppointmentClick();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Reserva tu Cita Ahora
              </button>

              <button
                id="btn-mobile-menu-app"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMobileApp();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                Acceso Staff Administrador
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
