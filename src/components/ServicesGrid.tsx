import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ArrowUpRight, Check, Sparkles, Filter, Info } from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';
import { APP_IMAGES } from '../data/images';
import { ServiceItem } from '../types';

interface ServicesGridProps {
  onSelectService: (service: ServiceItem) => void;
  onOpenBooking: (serviceId?: string) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  onSelectService,
  onOpenBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos los servicios' },
    { id: 'fisioterapia', label: 'Fisioterapia Especializada' },
    { id: 'medicina', label: 'Traumatología' },
    { id: 'bienestar', label: 'Salud & Nutrición' },
    { id: 'movimiento', label: 'Entrenamiento & Boxeo' },
  ];

  const filteredServices = SERVICES_DATA.filter((service) => {
    if (activeCategory === 'todos') return true;
    if (activeCategory === 'fisioterapia') return service.category === 'fisioterapia';
    if (activeCategory === 'medicina') return service.category === 'medicina';
    if (activeCategory === 'bienestar') return service.category === 'bienestar';
    if (activeCategory === 'movimiento') return service.category === 'movimiento';
    return true;
  });

  return (
    <section id="servicios" className="py-20 lg:py-28 bg-[#faf8f5] dark:bg-[#0f141c] transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atención Integral</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
            Nuestros servicios
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Diseñados para cada etapa de tu vida y condición física: desde el diagnóstico y la rehabilitación activa hasta la optimización deportiva y el bienestar emocional.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-md scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 9 Services Grid (Responsive: 1 col on mobile, 2 col on tablet, 3 col on desktop) */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence>
            {filteredServices.map((service, index) => {
              const imageAsset = APP_IMAGES.services[service.imageKey] || APP_IMAGES.about;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={service.id}
                  className="group bg-white dark:bg-[#151c28] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col hover:-translate-y-1.5"
                >
                  {/* Image Container with Hover Zoom and Category Badge */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={imageAsset.src}
                      alt={imageAsset.alt || service.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                    
                    {/* Duration badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/20">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{service.duration}</span>
                    </div>

                    {/* Title overlay on bottom of image for punchy contrast */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow font-heading group-hover:text-amber-300 transition-colors">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-2">
                        {service.shortDescription}
                      </p>

                      {/* Benefits preview (top 2) */}
                      <div className="space-y-2 mb-6">
                        {service.benefits.slice(0, 2).map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <Check className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <button
                        onClick={() => onSelectService(service)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Ver detalles</span>
                      </button>

                      <button
                        onClick={() => onOpenBooking(service.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-full shadow-sm shadow-amber-400/20 transition-all group-hover:bg-amber-400"
                      >
                        <span>Agendar</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Global CTA below grid */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6 bg-white dark:bg-[#151c28] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg max-w-2xl mx-auto">
            <div className="text-left flex-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                ¿No estás seguro de cuál servicio necesitas?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Nuestros especialistas realizan una evaluación diagnóstica personalizada en tu primera sesión.
              </p>
            </div>
            <button
              onClick={() => onOpenBooking()}
              className="px-5 py-2.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-full shrink-0 shadow-md"
            >
              Consulta de Valoración
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
