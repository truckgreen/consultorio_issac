import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Phone,
  Menu,
  X,
  Calendar,
  Activity,
  ChevronRight,
  ShieldCheck,
  Search,
  KeyRound,
  Lock,
  Code2,
} from 'lucide-react';
import { CLINIC_INFO } from '../data/featuresData';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBooking: (serviceId?: string) => void;
  onOpenPrivacyModal?: () => void;
  onOpenPatientPortal?: () => void;
  onOpenSpecialistAccess?: () => void;
  onOpenDeveloperSupport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenBooking,
  onOpenPrivacyModal,
  onOpenPatientPortal,
  onOpenSpecialistAccess,
  onOpenDeveloperSupport,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Sobre Nosotros', href: '#sobre-nosotros' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Equipo', href: '#equipo' },
    { label: 'Especialidades', href: '#especialidades' },
    { label: '¿Por qué Nosotros?', href: '#por-que-nosotros' },
    { label: 'Agendar Cita', href: '#agendar-cita' },
    { label: 'Testimonios', href: '#testimonios' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#0f141c]/95 backdrop-blur-md shadow-md py-2.5 border-b border-slate-200/60 dark:border-slate-800/80'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#inicio"
            id="brand-logo-link"
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-widest text-slate-900 dark:text-white uppercase font-heading">
                EQUILIBRA
              </span>
              <span className="text-[10px] tracking-wider text-amber-700 dark:text-amber-400 font-semibold uppercase -mt-1">
                Fisioterapia & Bienestar
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-2.5 py-1.5 text-xs xl:text-sm font-medium text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Patient Portal / Search appointment */}
            {onOpenPatientPortal && (
              <button
                type="button"
                onClick={onOpenPatientPortal}
                title="Consultar o validar tu cita agendada"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-all border border-slate-200 dark:border-slate-700"
              >
                <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden xl:inline">Validar Cita</span>
              </button>
            )}

            {/* Specialist Access */}
            {onOpenSpecialistAccess && (
              <button
                type="button"
                onClick={onOpenSpecialistAccess}
                title="Acceso protegido para especialistas clínicos"
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-200 dark:border-slate-700"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}

            {/* Privacy / ARCO rights button */}
            {onOpenPrivacyModal && (
              <button
                type="button"
                onClick={onOpenPrivacyModal}
                title="Políticas de Privacidad, Cifrado y Auditoría ARCO"
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors border border-emerald-200 dark:border-emerald-800/50"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}

            {/* Developer Support / Help */}
            {onOpenDeveloperSupport && (
              <button
                type="button"
                onClick={onOpenDeveloperSupport}
                title="Contacto con el desarrollador & Soporte técnico web"
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-full transition-colors border border-indigo-200 dark:border-indigo-800/50"
              >
                <Code2 className="w-4 h-4" />
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleDarkMode}
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-200 dark:border-slate-700"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Book Appointment CTA */}
            <button
              id="header-booking-btn"
              onClick={() => onOpenBooking()}
              className="flex items-center gap-2 px-4.5 py-2.5 text-xs xl:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-full shadow-md shadow-amber-400/20 hover:shadow-amber-500/30 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserva tu cita</span>
            </button>
          </div>

          {/* Mobile Menu & Dark Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              aria-label="Alternar modo oscuro"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-[#0f141c] border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              ))}

              {/* Patient & Specialist Mobile Portals */}
              <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
                {onOpenPatientPortal && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenPatientPortal();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-300"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Validar Cita</span>
                  </button>
                )}

                {onOpenPrivacyModal && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenPrivacyModal();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-300"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Privacidad ARCO</span>
                  </button>
                )}
              </div>

              {onOpenSpecialistAccess && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSpecialistAccess();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Portal Especialistas (Acceso PIN)</span>
                </button>
              )}

              {onOpenDeveloperSupport && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDeveloperSupport();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-800 dark:text-indigo-300"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Contacto con Desarrollador & Soporte</span>
                </button>
              )}

              <div className="pt-3 mt-1 flex flex-col gap-2">
                <a
                  href={`tel:${CLINIC_INFO.phoneRaw}`}
                  className="flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Llamar: {CLINIC_INFO.phoneDisplay}</span>
                </a>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserva tu cita ¡Ahora!</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
