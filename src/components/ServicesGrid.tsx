import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ArrowUpRight, Check, Sparkles, Filter, Info, Tag } from 'lucide-react';
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
            <span>Precios Transparentes & Atención de Calidad</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
            Nuestros servicios y tarifas
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Atención integral 1 a 1 en Sabana Grande. Conoce los valores de cada especialidad clínica y paquetes con beneficios de ahorro.
          </p>
        </div>

        {/* Category Filter Pills with Smooth Animated Pill */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 mb-14">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* 9 Services Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence>
            {filteredServices.map((service, index) => {
              const imageAsset = APP_IMAGES.services[service.imageKey] || APP_IMAGES.about;
              const isPopular = service.id === 'fisioterapia' || service.id === 'terapia-manual' || service.id === 'traumatologia';

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  key={service.id}
                  className="group relative bg-white dark:bg-[#131924] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400/60 dark:hover:border-amber-500/40 transition-all duration-300 flex flex-col hover:-translate-y-1.5"
                >
                  {/* Top Ribbon for Featured / Most Requested Services */}
                  {isPopular && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 border border-amber-300/40">
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        {service.id === 'traumatologia' ? 'Especialidad Médica' : 'Más Solicitado'}
                      </span>
                    </div>
                  )}

                  {/* Image Container with Dynamic Hover Sheen */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                    <img
                      src={imageAsset.src}
                      alt={imageAsset.alt || service.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover ${imageAsset.position || 'object-[center_15%]'} transform group-hover:scale-108 transition-transform duration-700`}
                      loading="lazy"
                    />
                    {/* Layered cinematic overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent group-hover:from-slate-950/85 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40 pointer-events-none" />

                    {/* Top Badges: Price & Duration */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                      <div className="bg-amber-100 dark:bg-amber-950/90 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-black text-xs sm:text-sm px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-md">
                        <span>{service.priceFormatted} USD</span>
                        <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400">/ sesión</span>
                      </div>

                      <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/20 shadow-md">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{service.duration}</span>
                      </div>
                    </div>

                    {/* Title overlay on bottom of image for punchy contrast */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md font-heading group-hover:text-amber-300 transition-colors">
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

                      {/* Package Option Banner */}
                      {service.packageOption && (
                        <div className="mb-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{service.packageOption}</span>
                          </span>
                          <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-200 dark:bg-amber-900/80 px-2 py-0.5 rounded-md">
                            Plan Ahorro
                          </span>
                        </div>
                      )}

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
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                      <button
                        onClick={() => onSelectService(service)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Ver detalles</span>
                      </button>

                      <button
                        onClick={() => onOpenBooking(service.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 rounded-full shadow-md shadow-amber-400/20 hover:shadow-amber-500/30 transition-all"
                      >
                        <span>Agendar ({service.priceFormatted})</span>
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
              onClick={() => onOpenBooking('fisioterapia')}
              className="px-5 py-2.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-full shrink-0 shadow-md"
            >
              Consulta de Valoración ($35)
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
