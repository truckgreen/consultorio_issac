import React from 'react';
import { ArrowLeft, Sparkles, Calendar, ChevronRight, Home } from 'lucide-react';
import { AppView } from './Navbar';

interface SubviewHeaderProps {
  view: AppView;
  onGoHome: () => void;
  onOpenBooking: () => void;
  onOpenGeminiBot: () => void;
}

const VIEW_METADATA: Record<
  AppView,
  {
    title: string;
    subtitle: string;
    badge: string;
  }
> = {
  inicio: {
    title: 'EQUILIBRA - Fisioterapia & Bienestar',
    subtitle: 'Un refugio, no una sala de espera.',
    badge: 'Inicio',
  },
  servicios: {
    title: 'Servicios & Especialidades',
    subtitle: 'Tratamientos biomecánicos personalizados 1 a 1 para recuperar tu movilidad, fuerza y bienestar.',
    badge: 'Catálogo Clínico',
  },
  triage: {
    title: 'Orientación Clínica & Triage',
    subtitle: 'Autoevaluación guiada y mapa de dolor para identificar la terapia adecuada antes de tu consulta.',
    badge: 'Triage Interactivo',
  },
  equipo: {
    title: 'Equipo Médico & Filosofía',
    subtitle: 'Conoce a nuestros fisioterapeutas colegiados y nuestro modelo de atención individual sin prisas.',
    badge: 'Nuestra Esencia',
  },
  citas: {
    title: 'Citas Médicas Online',
    subtitle: 'Agenda tu horario en tiempo real. Confirmación inmediata vía correo electrónico y WhatsApp.',
    badge: 'Reserva Directa',
  },
  testimonios: {
    title: 'Reseñas & Casos de Éxito',
    subtitle: 'Experiencias de pacientes reales que confiaron en EQUILIBRA para superar sus lesiones.',
    badge: 'Google 5.0 ★',
  },
  contacto: {
    title: 'Ubicación & Contacto Directo',
    subtitle: 'Estamos en Sabana Grande, Caracas. Teléfono oficial: 0424-2724617. Abiertos de Lunes a Sábado.',
    badge: 'Sede Sabana Grande',
  },
  admin: {
    title: 'Panel Clínico & Administración',
    subtitle: 'Gestión médica, agenda y configuración del sistema.',
    badge: 'Portal Interno',
  },
};

export const SubviewHeader: React.FC<SubviewHeaderProps> = ({
  view,
  onGoHome,
  onOpenBooking,
  onOpenGeminiBot,
}) => {
  if (view === 'inicio' || view === 'admin') return null;

  const info = VIEW_METADATA[view];

  return (
    <div className="pt-24 pb-8 bg-gradient-to-b from-[#EBE7DF] to-[#F2EFE8] dark:from-[#111] dark:to-[#0C0C0C] border-b border-[#D1CEC9]/60 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#B1A086]" />
              <span>Inicio</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-amber-300">
              {info.title}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B1A086]" />
              <span>Volver al Inicio</span>
            </button>

            <button
              type="button"
              onClick={onOpenGeminiBot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 dark:text-amber-300 bg-amber-400/20 hover:bg-amber-400/30 rounded-full border border-amber-400/40 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>Consultar IA</span>
            </button>

            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-full shadow-xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar</span>
            </button>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="max-w-3xl">
          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/30 mb-2">
            {info.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-slate-950 dark:text-white tracking-tight leading-tight">
            {info.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {info.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
