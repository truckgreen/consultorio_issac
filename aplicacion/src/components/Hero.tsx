import React from 'react';
import { 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Star, 
  HeartPulse, 
  Users, 
  Award 
} from 'lucide-react';
import { CLINIC_INFO } from '../data/equilibraData';

interface HeroProps {
  onOpenBooking: (serviceId?: string) => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExploreServices }) => {
  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 lg:py-24 bg-gradient-to-b from-amber-500/10 via-slate-50 to-slate-50 dark:from-amber-950/20 dark:via-slate-950 dark:to-slate-950 transition-colors">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-semibold tracking-wide uppercase shadow-sm">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Centro Clínico & Readaptación en Caracas</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Tu camino hacia el <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
                bienestar físico
              </span>{" "}
              comienza aquí.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {CLINIC_INFO.motto} Fisioterapia avanzada, traumatología médica, nutrición, psicología y entrenamiento funcional en un solo espacio 100% coordinado.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onOpenBooking()}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-base shadow-lg shadow-amber-500/25 transition-all group"
              >
                <Calendar className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                <span>Agendar Cita en Línea</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreServices}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-base shadow-sm transition-all"
              >
                <span>Ver Servicios & Tarifas</span>
              </button>
            </div>

            {/* Quick Location & Schedule Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left border-t border-slate-200 dark:border-slate-800 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Sabana Grande, Caracas</p>
                  <p className="text-xs">Centro Profesional del Este, Piso 4</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Lun a Vie: 8am - 7pm</p>
                  <p className="text-xs">Sábados: 8am a 2pm</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Image Composition & Stats Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Image Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-[4/5] group">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=85"
                  alt="Sesión de Fisioterapia en Equilibra"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="px-3 py-1 rounded-md bg-amber-500 text-white font-bold text-xs uppercase tracking-wider">
                    Atención 1 a 1
                  </span>
                  <h3 className="text-xl font-bold mt-2">
                    Recuperación Activa Basada en Ciencia
                  </h3>
                  <p className="text-xs text-slate-200 mt-1">
                    Evaluación biomecánica y rehabilitación sin camillas masivas.
                  </p>
                </div>
              </div>

              {/* Floating Floating Stat 1 - Satisfaction */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl flex items-center gap-3.5 backdrop-blur-md animate-bounce-subtle">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">98%</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Satisfacción de Pacientes</p>
                </div>
              </div>

              {/* Floating Floating Stat 2 - Specialists */}
              <div className="absolute -top-6 -right-4 sm:-right-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl flex items-center gap-3.5 backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">+3,500</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Casos Atendidos</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
