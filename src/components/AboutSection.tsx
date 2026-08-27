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
    <section id="sobre-nosotros" className="py-20 lg:py-28 relative overflow-hidden bg-white dark:bg-[#121824] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <img
                  src={APP_IMAGES.about.src}
                  alt={APP_IMAGES.about.alt}
                  referrerPolicy="no-referrer"
                  className={`w-full h-[400px] sm:h-[480px] object-cover ${APP_IMAGES.about.position || 'object-center'} transform hover:scale-105 transition-transform duration-500`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" /> Metodología Activa
                  </span>
                  <p className="text-sm sm:text-base font-medium drop-shadow">
                    Rehabilitación que transforma tu calidad de vida y te devuelve a tus actividades favoritas.
                  </p>
                </div>
              </div>

              {/* Floating Stat Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-6 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 max-w-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                    Enfoque 360°
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
              <span>Nuestra Esencia</span>
            </div>

            {/* Main Section Title (From Flyer) */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
              El verdadero bienestar <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-400 dark:to-amber-200">
                comienza en movimiento
              </span>
            </h2>

            {/* Lead Description (From Flyer) */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              {CLINIC_INFO.aboutText}
            </p>

            {/* 3 Pillars List */}
            <div className="flex flex-col gap-4 w-full mb-10">
              {pillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
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
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-full shadow-md shadow-amber-400/20 transition-all hover:scale-[1.02]"
              >
                <span>Conoce nuestras especialidades</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
