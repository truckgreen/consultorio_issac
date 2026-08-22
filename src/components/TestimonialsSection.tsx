import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Sparkles, Quote, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';

export const TestimonialsSection: React.FC = () => {
  const [filter, setFilter] = useState<string>('todos');

  return (
    <section id="testimonios" className="py-20 lg:py-28 bg-[#faf8f5] dark:bg-[#0f141c] transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Historias Reales de Recuperación</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
            Comentarios de nuestros clientes
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            La confianza de quienes han transformado su dolor en movimiento y bienestar pleno en nuestro centro.
          </p>
        </div>

        {/* Testimonials Grid (Matches Flyer 3 Columns Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {TESTIMONIALS_DATA.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-[#151c28] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5 Golden Stars (From flyer) */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Service Tag */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-900">
                    {item.serviceReceived}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 italic">
                  “{item.review}”
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Google / Trust Rating Overview */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Pacientes 100% verificados
            </span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div>
            Calificación promedio: <strong className="text-amber-500 font-bold">4.9 / 5.0</strong> en atención y satisfacción clínica
          </div>
        </div>

      </div>
    </section>
  );
};
