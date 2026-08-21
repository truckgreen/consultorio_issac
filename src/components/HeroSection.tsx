import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Users, 
  Sparkles,
  CheckCircle2,
  Play,
  DollarSign
} from 'lucide-react';

interface HeroSectionProps {
  onExploreServices: () => void;
  onBookAppointment: () => void;
  onExplorePricing: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreServices,
  onBookAppointment,
  onExplorePricing
}) => {
  return (
    <section id="inicio" className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28">
      {/* Background ambient lighting and subtle organic gradients */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography and Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col space-y-7"
          >
            {/* Tag pill */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Centro de Bienestar Integral
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Fisioterapia Basada en Evidencia
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-heading leading-[1.12]">
                Tu camino hacia el <br />
                <span className="relative inline-block text-slate-900">
                  bienestar físico
                  <span className="absolute left-0 -bottom-1.5 w-full h-[6px] bg-indigo-600 rounded-full opacity-70" />
                </span> <br />
                comienza aquí
              </h1>
            </div>

            {/* Quote block */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-indigo-600 shadow-xs">
              <p className="text-lg sm:text-xl font-medium text-slate-800 italic leading-relaxed">
                “El lugar donde la mente, el cuerpo y el movimiento encuentran su equilibrio.”
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold tracking-wider text-slate-900 uppercase font-display">EQUILIBRA</span>
                <span>Sabana Grande · Caracas</span>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Evaluación Médica 360°</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Equipo Multidisciplinario</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Tarifas Claras & Videos</span>
              </div>
            </div>

            {/* Buttons Group */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="btn-hero-services"
                onClick={onExploreServices}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Nuestros servicios</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-pricing"
                onClick={onExplorePricing}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                <span>Ver Tarifas & Videos</span>
              </button>

              <button
                id="btn-hero-booking"
                onClick={onBookAppointment}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Reservar Cita</span>
              </button>
            </div>

          </motion.div>

          {/* Right Column: High Quality Visual Showcase & Patient Outcome Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 group">
              
              {/* Primary Image */}
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85"
                alt="Instalaciones y terapia en EQUILIBRA"
                className="w-full h-[460px] object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.95]"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Floating Pill: Multidisciplinary */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900">Abordaje 360°</div>
                  <div className="text-[10px] text-slate-500">Fisioterapia · Traumatología</div>
                </div>
              </div>

              {/* Live Medical Indicators Card overlay on Hero */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-slate-800 text-white shadow-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white tracking-wide">
                      Eficacia Clínica Comprobada
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-mono">
                    Protocolos 2026
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/50">
                    <div className="text-lg font-bold text-indigo-400 font-heading">85%</div>
                    <div className="text-[10px] text-slate-300">Recuperación Media</div>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/50">
                    <div className="text-lg font-bold text-white font-heading">EVA 2.1</div>
                    <div className="text-[10px] text-slate-300">Alivio del Dolor</div>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/50">
                    <div className="text-lg font-bold text-emerald-400 font-heading">100%</div>
                    <div className="text-[10px] text-slate-300">Personalizado</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Más de 1,200 pacientes atendidos
                  </span>
                  <span className="text-indigo-400 font-semibold">Caracas, VE</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

