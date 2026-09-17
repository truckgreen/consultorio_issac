import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ArrowRight, Calendar, ShieldCheck, Sparkles, MapPin, Award, Activity } from 'lucide-react';
import { CLINIC_INFO } from '../data/featuresData';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero = ({ onOpenBooking }: HeroProps) => {
  return (
    <section
      id="inicio"
      className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-20 overflow-hidden"
    >
      {/* Background Image with Cinematic Overlay and Dot Pattern */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full transform scale-105"
          style={{
            backgroundImage: "url('/imagenes/consultorio.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.40)',
          }}
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] via-slate-950/75 to-slate-950/95 dark:from-[#0c1017] dark:via-slate-950/85 dark:to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.28),rgba(0,0,0,0))]" />
        
        {/* Subtle dot grid texture */}
        <div className="absolute inset-0 bg-dot-pattern-dark opacity-40 pointer-events-none" />
      </div>

      {/* Floating Decorative Ambient Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-8 sm:left-24 w-44 h-44 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 blur-2xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -20, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/3 right-8 sm:right-28 w-52 h-52 rounded-full bg-gradient-to-bl from-amber-500/25 to-yellow-300/10 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -18, 0],
            scale: [0.9, 1.05, 0.9],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full bg-amber-400/15 blur-3xl"
        />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Brand Badge with Animated Shimmer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-amber-400/15 border border-amber-400/50 backdrop-blur-md mb-6 shadow-lg shadow-amber-500/10"
        >
          {/* Shimmer Light Bar */}
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-amber-300">
            {CLINIC_INFO.name} • Centro de Rehabilitación & Movimiento
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.12] mb-4 max-w-4xl font-heading"
        >
          Tu camino hacia el{' '}
          <br className="hidden sm:inline" />
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
            bienestar físico
          </span>{' '}
          comienza aquí
        </motion.h1>

        {/* Animated Decorative Line Below Headline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="w-36 sm:w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full mb-6"
        />

        {/* Slogan Quote from Flyer */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-slate-200 font-light italic max-w-3xl mb-10 leading-relaxed border-y border-white/10 py-4 px-2"
        >
          “{CLINIC_INFO.motto}”
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {/* Golden Button from Flyer with Glow and Hover */}
          <a
            href="#servicios"
            id="hero-services-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 hover:scale-[1.03] active:scale-[0.98] rounded-full shadow-xl shadow-amber-400/35 transition-all group btn-glow-amber"
          >
            <span>Conoce nuestros servicios</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </a>

          {/* Secondary Appointment Button */}
          <button
            onClick={() => onOpenBooking()}
            id="hero-book-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-bold text-white bg-white/10 hover:bg-white/20 hover:scale-[1.03] active:scale-[0.98] rounded-full backdrop-blur-md border border-white/25 transition-all shadow-lg hover:border-amber-400/50"
          >
            <Calendar className="w-5 h-5 text-amber-300" />
            <span>Reserva tu cita</span>
          </button>
        </motion.div>

        {/* Glassmorphism Trust Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 w-full max-w-3xl bg-white/[0.08] dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/20 shadow-2xl shadow-black/30"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 items-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-heading drop-shadow-sm">
                100%
              </span>
              <span className="text-xs sm:text-sm text-slate-200 font-medium mt-1">
                Atención Personalizada 1 a 1
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-heading drop-shadow-sm">
                360°
              </span>
              <span className="text-xs sm:text-sm text-slate-200 font-medium mt-1">
                Abordaje Multidisciplinario
              </span>
            </div>

            <div className="flex flex-col items-center col-span-2 sm:col-span-1 pt-4 sm:pt-0">
              <div className="flex items-center gap-1.5 text-amber-400">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-3xl sm:text-4xl font-black font-heading drop-shadow-sm">
                  Clínica
                </span>
              </div>
              <span className="text-xs sm:text-sm text-slate-200 font-medium mt-1">
                Basada en Evidencia
              </span>
            </div>
          </div>
        </motion.div>

        {/* Location Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-xs sm:text-sm text-slate-300"
        >
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Sabana Grande, Caracas • Centro Profesional del Este, Piso 4</span>
        </motion.div>

        {/* Enhanced Scroll Indicator with Glowing Pulse */}
        <motion.a
          href="#sobre-nosotros"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="mt-8 p-3 rounded-full bg-white/10 hover:bg-amber-400/20 text-slate-300 hover:text-amber-300 border border-white/15 hover:border-amber-400/50 backdrop-blur-sm transition-all shadow-lg hover:shadow-amber-500/20"
          aria-label="Desplazarse hacia abajo"
        >
          <ChevronDown className="w-5 h-5 text-amber-400" />
        </motion.a>
      </div>
    </section>
  );
};

