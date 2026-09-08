import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Activity, Heart, Award, Sparkles } from 'lucide-react';
import { APP_IMAGES } from '../data/images';
import { CLINIC_INFO } from '../data/featuresData';

interface AboutSectionProps {
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  const pillars = [
    {
      icon: Activity,
      title: 'Fisioterapia Basada en Evidencia',
      text: 'Cada técnica y ejercicio se sustenta en los últimos consensos científicos internacionales de rehabilitación ortopédica y neurológica.'
    },
    {
      icon: Award,
      title: 'Entrenamiento Activo y Progresivo',
      text: 'No creemos en el reposo prolongado; devolvemos la confianza a tus articulaciones a través de movimiento dosificado y seguro.'
    },
    {
      icon: Heart,
      title: 'Acompañamiento Humano y Cercano',
      text: 'Tratamos a personas, no solo a diagnósticos. Tu bienestar emocional, metas personales y ritmo de vida son el centro de nuestro plan.'
    }
  ];

  return (
    <section id="sobre-nosotros" className="py-24 lg:py-32 relative overflow-hidden bg-white dark:bg-[#0f1520] transition-colors bg-grid-subtle-light dark:bg-grid-subtle-dark">
      {/* Top Wave Divider Transition from Hero */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none pointer-events-none z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-8 sm:h-12 text-[#faf9f6] dark:text-[#0c1017] fill-current">
          <path d="M0,0 C150,70 350,-20 500,40 C650,100 900,10 1200,50 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      {/* Decorative Ambient Blurs */}
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Images Composition */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Main Image Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 shadow-slate-900/15 dark:shadow-black/50">
                <img
                  src={APP_IMAGES.about.src}
                  alt={APP_IMAGES.about.alt}
                  referrerPolicy="no-referrer"
                  className={`w-full h-[400px] sm:h-[480px] object-cover ${APP_IMAGES.about.position || 'object-center'} transform hover:scale-105 transition-transform duration-700`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider mb-2 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" /> Metodología Activa
                  </span>
                  <p className="text-sm sm:text-base font-semibold drop-shadow-md text-slate-100">
                    Rehabilitación que transforma tu calidad de vida y te devuelve a tus actividades favoritas con seguridad.
                  </p>
                </div>
              </div>

              {/* Floating Stat Card with Smooth Motion Hover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  scale: { duration: 0.5, delay: 0.3 },
                  y: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
                }}
                className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-6 bg-white/95 dark:bg-[#151c28]/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl shadow-amber-500/10 border-2 border-amber-400/40 flex items-center gap-4 max-w-xs"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md shadow-amber-500/25">
                  <Activity className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-heading">
                    Enfoque 360°
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Cuerpo, mente y movimiento en sincronía total
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Narrative and Pillars */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nuestra Esencia</span>
            </div>

            {/* Main Section Title (From Flyer) */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6 font-heading">
              El verdadero bienestar <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 dark:from-amber-400 dark:to-amber-200">
                comienza en movimiento
              </span>
            </h2>

            {/* Lead Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              {CLINIC_INFO.aboutText}
            </p>

            {/* 3 Pillars List with Hover Left Border Effect */}
            <div className="flex flex-col gap-3.5 w-full mb-10">
              {pillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 border-l-4 border-l-transparent hover:border-l-amber-500 hover:bg-white dark:hover:bg-slate-850 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-heading">
                        {pillar.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {pillar.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#especialidades"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-full shadow-lg shadow-amber-400/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Conoce nuestras especialidades</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-300 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Agendar evaluación</span>
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};
