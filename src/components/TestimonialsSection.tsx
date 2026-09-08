import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Quote, ChevronLeft, ChevronRight, CheckCircle, ThumbsUp } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto slide every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  return (
    <section id="testimonios" className="py-24 lg:py-32 bg-[#faf9f6] dark:bg-[#0c1017] transition-colors relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 -left-28 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/5 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Historias Reales de Recuperación</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
            Experiencias de nuestros pacientes
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            La confianza de quienes han transformado su dolor en movimiento y bienestar pleno en nuestro centro en Sabana Grande.
          </p>
        </div>

        {/* Carousel Featured Card with Slide Animation */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative bg-white dark:bg-[#131924] rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/30 overflow-hidden"
              >
                {/* Floating Big Watermark Quote */}
                <Quote className="absolute right-6 -bottom-6 w-32 h-32 sm:w-44 sm:h-44 text-amber-500/10 dark:text-amber-400/5 pointer-events-none -rotate-12" />

                <div className="relative z-10">
                  {/* Top Bar: Stars + Rating Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      {[...Array(TESTIMONIALS_DATA[currentIndex].rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm"
                        />
                      ))}
                      <span className="ml-2 text-xs font-black text-amber-600 dark:text-amber-400">
                        5.0 / 5.0
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                      {TESTIMONIALS_DATA[currentIndex].serviceReceived}
                    </span>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-lg sm:text-2xl text-slate-800 dark:text-slate-100 font-medium leading-relaxed mb-8 italic">
                    “{TESTIMONIALS_DATA[currentIndex].review}”
                  </blockquote>

                  {/* Author Details & Progress */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <img
                        src={TESTIMONIALS_DATA[currentIndex].avatar}
                        alt={TESTIMONIALS_DATA[currentIndex].name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
                      />
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading">
                          {TESTIMONIALS_DATA[currentIndex].name}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          {TESTIMONIALS_DATA[currentIndex].role}
                        </p>
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                          {TESTIMONIALS_DATA[currentIndex].date}
                        </span>
                      </div>
                    </div>

                    {/* Verified Badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Paciente Verificado</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={handlePrev}
                aria-label="Testimonio anterior"
                className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-400 hover:text-slate-950 hover:border-amber-400 flex items-center justify-center shadow-md transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots Indicators */}
              <div className="flex items-center gap-2">
                {TESTIMONIALS_DATA.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(dotIdx);
                    }}
                    aria-label={`Ir al testimonio ${dotIdx + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      currentIndex === dotIdx
                        ? 'w-8 bg-amber-400'
                        : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                aria-label="Siguiente testimonio"
                className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-400 hover:text-slate-950 hover:border-amber-400 flex items-center justify-center shadow-md transition-all active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Google / Trust Rating Overview with Progress Bars */}
        <div className="max-w-xl mx-auto bg-white/80 dark:bg-[#131924]/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
              4.9
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Calificación Clínica Global
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>+1,200 pacientes atendidos y dados de alta con éxito en Caracas</span>
          </div>
        </div>

      </div>
    </section>
  );
};

