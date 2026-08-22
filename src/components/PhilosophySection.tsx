import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, Dumbbell, Apple, Stethoscope, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { APP_IMAGES } from '../data/images';
import { PHILOSOPHY_DATA } from '../data/featuresData';

interface PhilosophySectionProps {
  onOpenBooking: () => void;
}

export const PhilosophySection: React.FC<PhilosophySectionProps> = ({ onOpenBooking }) => {
  const [activeArea, setActiveArea] = useState<number>(0);

  const interactiveAreas = [
    {
      title: 'Biomecánica & Columna',
      icon: Stethoscope,
      desc: 'Corrección postural y reeducación articular para disipar cargas mecánicas perjudiciales.'
    },
    {
      title: 'Salud Mental & Estrés',
      icon: Brain,
      desc: 'El sistema nervioso regula la percepción del dolor. Integramos relajación y acompañamiento.'
    },
    {
      title: 'Nutrición Tisular',
      icon: Apple,
      desc: 'Micronutrientes y hábitos antiinflamatorios para acelerar la reparación de tendones y cartílagos.'
    },
    {
      title: 'Fuerza Funcional',
      icon: Dumbbell,
      desc: 'El músculo es la verdadera armadura del cuerpo. Fortalecemos patrones de movimiento seguros.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#faf8f5] dark:bg-[#0f141c] transition-colors relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Narrative Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{PHILOSOPHY_DATA.title}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 font-heading">
              {PHILOSOPHY_DATA.subtitle}
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              {PHILOSOPHY_DATA.description}
            </p>

            {/* 3 Pillars from Data */}
            <div className="space-y-4 mb-8">
              {PHILOSOPHY_DATA.pillars.map((pillar, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{pillar.title}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-full shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02]"
            >
              <span>Comienza tu valoración 360°</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Right Column: Interactive Ecosystem Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Ecosistema Interconectado
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Haz clic en cada dimensión para ver cómo interactúan
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <HeartPulse className="w-5 h-5" />
                </div>
              </div>

              {/* Interactive Quadrant Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {interactiveAreas.map((area, idx) => {
                  const Icon = area.icon;
                  const isSelected = activeArea === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveArea(idx)}
                      className={`p-4 rounded-2xl text-left transition-all duration-200 border ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {area.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Description Box */}
              <motion.div
                key={activeArea}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/5 border border-amber-300/40 dark:border-amber-400/20"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                  Abordaje Integrado: {interactiveAreas[activeArea].title}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {interactiveAreas[activeArea].desc}
                </p>
              </motion.div>

              {/* Photo preview in frame */}
              <div className="mt-6 rounded-2xl overflow-hidden h-44 relative">
                <img
                  src={APP_IMAGES.philosophy.src}
                  alt={APP_IMAGES.philosophy.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs font-semibold text-white">
                    Instalaciones adaptadas para evaluaciones biomecánicas de alta precisión.
                  </span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
