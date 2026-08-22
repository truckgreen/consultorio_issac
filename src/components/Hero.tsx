import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ArrowRight, Calendar, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { APP_IMAGES } from '../data/images';
import { CLINIC_INFO } from '../data/featuresData';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section
      id="inicio"
      className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={APP_IMAGES.hero.src}
          alt={APP_IMAGES.hero.alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105 filter brightness-[0.45] dark:brightness-[0.35]"
        />
        {/* Subtle Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-slate-950/70 to-slate-950/90 dark:from-[#0f141c] dark:via-slate-950/80 dark:to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.25),rgba(255,255,255,0))]" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Brand Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 backdrop-blur-md mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-amber-300">
            {CLINIC_INFO.name} • Centro de Rehabilitación & Movimiento
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl"
        >
          Tu camino hacia el <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-300">
            bienestar físico
          </span>{' '}
          comienza aquí
        </motion.h1>

        {/* Slogan Quote from Flyer */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-slate-200 font-light italic max-w-3xl mb-10 leading-relaxed border-y border-white/10 py-4"
        >
          “{CLINIC_INFO.motto}”
        </motion.p>

        {/* Action Buttons (Matches the Golden CTA from screenshot) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {/* Exact Golden Button from Flyer */}
          <a
            href="#servicios"
            id="hero-services-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 hover:scale-[1.02] active:scale-[0.98] rounded-full shadow-lg shadow-amber-400/30 transition-all group"
          >
            <span>Conoce nuestros servicios</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Secondary Appointment Button */}
          <button
            onClick={() => onOpenBooking()}
            id="hero-book-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-bold text-white bg-white/10 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] rounded-full backdrop-blur-md border border-white/20 transition-all shadow-md"
          >
            <Calendar className="w-5 h-5 text-amber-300" />
            <span>Reserva tu cita</span>
          </button>
        </motion.div>

        {/* Highlight Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-white/15 w-full max-w-3xl"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
              100%
            </span>
            <span className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Atención Personalizada 1 a 1
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
              360°
            </span>
            <span className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Abordaje Multidisciplinario
            </span>
          </div>

          <div className="flex flex-col items-center col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-2xl sm:text-3xl font-extrabold font-heading">
                Clínica
              </span>
            </div>
            <span className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Basada en Evidencia
            </span>
          </div>
        </motion.div>

        {/* Location Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 flex items-center gap-2 text-xs sm:text-sm text-slate-300/80"
        >
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Sabana Grande, Caracas • Centro Profesional del Este, Piso 4</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.a
          href="#sobre-nosotros"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-8 text-slate-400 hover:text-amber-400 transition-colors p-2"
          aria-label="Desplazarse hacia abajo"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.a>
      </div>
    </section>
  );
};
