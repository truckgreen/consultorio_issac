import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, HeartHandshake, Salad, Flame, ArrowRight, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';
import { SPECIALTIES_DATA } from '../data/specialtiesData';
import { SpecialtyItem } from '../types';

interface SpecialtiesSectionProps {
  onOpenBooking: (serviceId?: string) => void;
}

export const SpecialtiesSection: React.FC<SpecialtiesSectionProps> = ({ onOpenBooking }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Activity':
        return Activity;
      case 'HeartHandshake':
        return HeartHandshake;
      case 'Salad':
        return Salad;
      case 'Flame':
      default:
        return Flame;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="especialidades" className="py-20 lg:py-28 bg-white dark:bg-[#121824] transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Puntales Clínicos</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
            En qué nos especializamos
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Cuatro pilares interconectados que garantizan un abordaje de estándar internacional, enfocado en tu recuperación y máximo rendimiento.
          </p>
        </div>

        {/* 4 Specialties Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SPECIALTIES_DATA.map((specialty, index) => {
            const IconComponent = getIcon(specialty.iconName);
            const isExpanded = expandedId === specialty.id;

            return (
              <motion.div
                key={specialty.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#faf8f5] dark:bg-[#161e2c] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 dark:bg-amber-500/20 text-slate-950 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">
                        {specialty.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {specialty.subSpecialties.slice(0, 3).map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description from Flyer */}
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {specialty.description}
                  </p>

                  {/* Expandable Highlights */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mb-6 pt-4 border-t border-slate-200 dark:border-slate-800"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
                          Aspectos Clave de la Especialidad:
                        </h4>
                        <div className="space-y-2.5">
                          {specialty.highlights.map((item, hIdx) => (
                            <div key={hIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Controls (Matches 'Más información' pill in flyer) */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    onClick={() => toggleExpand(specialty.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm"
                  >
                    <span>{isExpanded ? 'Menos detalles' : 'Más información'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => onOpenBooking()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-full shadow-sm shadow-amber-400/20 transition-all"
                  >
                    <span>Consultar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
