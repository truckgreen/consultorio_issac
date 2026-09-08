import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Code2,
  Sparkles,
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
  const [activeSection, setActiveSection] = useState('inicio');
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Simple active section detection based on scroll position
      const sections = ['inicio', 'sobre-nosotros', 'servicios', 'equipo', 'especialidades', 'contacto'];
      const scrollPos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Inicio', href: '#inicio', id: 'inicio' },
    { label: 'Nosotros', href: '#sobre-nosotros', id: 'sobre-nosotros' },
    { label: 'Servicios', href: '#servicios', id: 'servicios' },
    { label: 'Equipo', href: '#equipo', id: 'equipo' },
    { label: 'Especialidades', href: '#especialidades', id: 'especialidades' },
    { label: 'Contacto', href: '#contacto', id: 'contacto' },
  ];

  return (
    <>
      <header
        id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/20 py-2.5 border-b border-amber-500/15 dark:border-amber-500/10'
          : 'bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-sm py-3.5 border-b border-slate-200/50 dark:border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo with Enhanced Vibrant Glow */}
          <a
            href="#inicio"
            id="brand-logo-link"
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 group-hover:shadow-lg group-hover:shadow-amber-500/50 group-hover:scale-105 transition-all duration-300">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-widest text-slate-900 dark:text-white uppercase font-heading leading-none group-hover:text-amber-500 transition-colors">
                EQUILIBRA
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest text-amber-600 dark:text-amber-400 font-bold uppercase mt-0.5">
                Fisioterapia & Bienestar
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links with Animated Active Indicator */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 rounded-full bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              const isHovered = hoveredLink === link.id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.id)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`relative px-3.5 py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-slate-950 dark:text-amber-300 font-bold'
                      : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {/* Motion pill for active or hovered item */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-amber-400/30 dark:border-amber-500/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Patient Portal / Search appointment */}
            {onOpenPatientPortal && (
              <button
                type="button"
                onClick={onOpenPatientPortal}
                title="Consultar, validar o reprogramar tu cita"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-amber-600 dark:text-slate-200 dark:hover:text-amber-400 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 rounded-full transition-all border border-slate-200 dark:border-slate-700 shadow-sm whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Validar Cita</span>
              </button>
            )}

            {/* Specialist & Admin Protected Access */}
            {onOpenSpecialistAccess && (
              <button
                type="button"
                onClick={onOpenSpecialistAccess}
                title="Acceso exclusivo para Especialistas & Dirección Médica"
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-200 dark:border-slate-700"
                aria-label="Acceso Especialistas y Administrador"
              >
                <KeyRound className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </button>
            )}

            {/* Privacy / ARCO rights button */}
            {onOpenPrivacyModal && (
              <button
                type="button"
                onClick={onOpenPrivacyModal}
                title="Políticas de Privacidad, Cifrado y Auditoría ARCO"
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors border border-emerald-200 dark:border-emerald-800/50"
                aria-label="Privacidad y Seguridad"
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
                className="hidden xl:flex p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-full transition-colors border border-indigo-200 dark:border-indigo-800/50"
                aria-label="Soporte Técnico"
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

            {/* Book Appointment CTA with Glow Animation */}
            <button
              id="header-booking-btn"
              onClick={() => onOpenBooking()}
              className="relative group flex items-center gap-1.5 px-4 py-2 text-xs xl:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 rounded-full shadow-md shadow-amber-400/25 hover:shadow-amber-500/40 transition-all whitespace-nowrap overflow-hidden btn-glow-amber"
            >
              {/* Subtle shimmer sheen */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              <Calendar className="w-3.5 h-3.5 text-slate-950 relative z-10" />
              <span className="relative z-10">Reserva tu cita</span>
            </button>
          </div>

          {/* Mobile Menu Toggle & Theme */}
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
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-amber-500" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Slide-in Mobile Navigation Drawer rendered in document.body via Portal to prevent header clipping */}
    {typeof document !== 'undefined' &&
      createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <div
              id="mobile-navigation-drawer"
              className="fixed inset-0 z-[9999] md:hidden flex justify-end w-screen h-screen h-[100dvh] overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menú principal de navegación"
            >
              {/* Darkened Blur Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm cursor-pointer z-0"
              />

              {/* Full-Height Drawer Content */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="relative w-[86vw] max-w-sm h-screen h-[100dvh] max-h-screen bg-white dark:bg-[#0f141c] shadow-2xl border-l border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto overscroll-contain z-10"
              >
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
                        <Activity className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="font-black text-base tracking-wider text-slate-900 dark:text-white uppercase font-heading block leading-none">
                          EQUILIBRA
                        </span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mt-0.5 block">
                          Menú de Navegación
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      aria-label="Cerrar menú"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Nav Links */}
                  <div className="flex flex-col gap-1">
                    {navLinks.map((link) => {
                      const isActive = activeSection === link.id;
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-2xl transition-all ${
                            isActive
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/20'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <span>{link.label}</span>
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                        </a>
                      );
                    })}
                  </div>

                  {/* Patient & Specialist Portals */}
                  <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                    {onOpenPatientPortal && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenPatientPortal();
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-bold text-amber-900 dark:text-amber-300 active:scale-95 transition-transform shadow-sm"
                      >
                        <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Validar Cita</span>
                      </button>
                    )}

                    {onOpenSpecialistAccess && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenSpecialistAccess();
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-800 dark:text-indigo-300 active:scale-95 transition-transform shadow-sm"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Portal Médico</span>
                      </button>
                    )}
                  </div>

                  {onOpenPrivacyModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPrivacyModal();
                      }}
                      className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold text-emerald-900 dark:text-emerald-300 active:scale-95 transition-transform shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Privacidad & Cifrado ARCO</span>
                    </button>
                  )}

                  {onOpenDeveloperSupport && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDeveloperSupport();
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Contacto Desarrollador</span>
                    </button>
                  )}
                </div>

                {/* Drawer Bottom CTAs */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                  <a
                    href={`tel:${CLINIC_INFO.phoneRaw}`}
                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Llamar: {CLINIC_INFO.phoneDisplay}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBooking();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 rounded-xl shadow-md shadow-amber-400/25 transition-all btn-glow-amber"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reserva tu cita ¡Ahora!</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

