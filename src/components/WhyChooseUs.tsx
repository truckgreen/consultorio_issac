import React from 'react';
import { motion } from 'motion/react';
import { Users, ShieldCheck, TrendingUp, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { WHY_CHOOSE_US } from '../data/featuresData';

interface WhyChooseUsProps {
  onOpenBooking: () => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onOpenBooking }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Users':
        return Users;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'TrendingUp':
      default:
        return TrendingUp;
    }
  };

  return (
    <section id="por-que-nosotros" className="py-20 lg:py-28 bg-white dark:bg-[#121824] transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuestra Diferencia</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
            Por qué las personas nos prefieren
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Un estándar superior de cuidado médico y rehabilitación diseñado para que recuperes tu libertad de movimiento con total confianza.
          </p>
        </div>

        {/* 3 Pillars Cards (Matches 3 Columns from Flyer) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WHY_CHOOSE_US.map((item, index) => {
            const Icon = getIcon(item.iconName);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-[#faf8f5] dark:bg-[#161e2c] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-2"
              >
                <div>
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 dark:bg-amber-500/20 text-slate-950 dark:text-amber-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 font-heading group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description directly from Flyer */}
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Protocolo Garantizado</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-600/15 border border-amber-300/40 dark:border-amber-500/20 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              ¿Listo para dar el primer paso hacia tu bienestar?
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Agenda tu cita de valoración con nuestros especialistas hoy mismo.
            </p>
          </div>
          <button
            onClick={onOpenBooking}
            className="px-6 py-3.5 text-sm sm:text-base font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-full shadow-md shadow-amber-400/20 whitespace-nowrap transition-all"
          >
            Reservar Consulta Ahora
          </button>
        </div>

      </div>
    </section>
  );
};
