import React from 'react';
import { Star, MessageSquare, Quote, Sparkles } from 'lucide-react';
import { TESTIMONIALS } from '../data/equilibraData';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonios" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Historias de Éxito y Recuperación</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Lo que dicen nuestros pacientes
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Experiencias reales de personas y deportistas que recuperaron su movilidad y confianza en EQUILIBRA.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {TESTIMONIALS.map((testi) => (
            <div
              key={testi.id}
              className="flex flex-col justify-between p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Rating Stars & Service Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(testi.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {testi.date}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{testi.review}"
                </p>
              </div>

              {/* Patient Info */}
              <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                <img
                  src={testi.avatarUrl}
                  alt={testi.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {testi.name}
                  </h4>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    {testi.serviceReceived}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
