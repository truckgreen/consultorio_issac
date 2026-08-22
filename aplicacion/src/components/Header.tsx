import React, { useState } from 'react';
import { 
  Calendar, 
  Moon, 
  Sun, 
  Database, 
  Menu, 
  X, 
  Phone, 
  Sparkles,
  BookmarkCheck
} from 'lucide-react';
import { CLINIC_INFO } from '../data/equilibraData';
import { SupabaseConfig } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  appointmentsCount: number;
  onOpenMyAppointments: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  supabaseConfig,
  onOpenSupabaseModal,
  appointmentsCount,
  onOpenMyAppointments,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Servicios', id: 'servicios' },
    { label: 'Evaluación', id: 'evaluacion' },
    { label: 'Equipo', id: 'equipo' },
    { label: 'Especialidades', id: 'especialidades' },
    { label: 'Por Qué Nosotros', id: 'por-que-nosotros' },
    { label: 'Preguntas', id: 'faq' },
    { label: 'Contacto', id: 'contacto' },
  ];

  const handleNavClick = (id: string) => {
    onScrollToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNavClick('hero'); }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                {CLINIC_INFO.name}
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              </span>
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 tracking-wider uppercase">
                Fisioterapia & Bienestar
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & CTA */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSupabaseModal}
              title={supabaseConfig.isConnected ? 'Conectado a Supabase' : 'Configurar conexión Supabase'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>{supabaseConfig.isConnected ? 'Supabase' : 'Supabase'}</span>
              <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            </button>

            {/* My Appointments Pill */}
            <button
              onClick={onOpenMyAppointments}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ver mis citas agendadas"
            >
              <BookmarkCheck className="w-5 h-5 text-amber-500" />
              {appointmentsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {appointmentsCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Main Booking Button */}
            <button
              onClick={() => handleNavClick('reserva')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-sm shadow-md shadow-amber-500/25 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Cita</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenMyAppointments}
              className="relative p-2 text-slate-600 dark:text-slate-300"
            >
              <BookmarkCheck className="w-5 h-5 text-amber-500" />
              {appointmentsCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {appointmentsCount}
                </span>
              )}
            </button>
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenSupabaseModal(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Conexión Supabase ({supabaseConfig.isConnected ? 'Conectado' : 'Configurar'})</span>
            </button>
            <button
              onClick={() => handleNavClick('reserva')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/25"
            >
              <Calendar className="w-5 h-5" />
              <span>Agendar Cita en Línea</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
