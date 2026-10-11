import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Activity,
  Apple,
  ArrowUpRight,
  Brain,
  Check,
  Clock,
  Dumbbell,
  HeartPulse,
  Info,
  PersonStanding,
  Sparkles,
  Stethoscope,
  Tag,
} from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';
import { ServiceItem } from '../types';

interface ServicesGridProps {
  onSelectService: (service: ServiceItem) => void;
  onOpenBooking: (serviceId?: string) => void;
}

// Fade-in & Slide-up animation variants
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const serviceIcons = {
  fisioterapia: Activity,
  'fisioterapia-pediatrica': PersonStanding,
  'fisioterapia-geriatrica': HeartPulse,
  'fisioterapia-deportiva': Dumbbell,
  traumatologia: Stethoscope,
  psicologia: Brain,
  nutricion: Apple,
  'entrenamiento-funcional': Dumbbell,
  boxeo: Activity,
};

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
    <section id="servicios" className="py-20 lg:py-28 bg-[var(--page-background-light)] dark:bg-[var(--page-background-dark)] transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Fade-In + Slide-Up */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Precios Transparentes & Atención de Calidad</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-heading [text-wrap:balance]">
            Nuestros servicios y tarifas
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Atención integral 1 a 1 en Sabana Grande. Conoce los valores de cada especialidad clínica y paquetes con beneficios de ahorro.
          </p>
        </motion.div>

        {/* Category Filter Pills with Smooth Animated Pill */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 mb-14"
        >
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
        </motion.div>

        {/* 9 Services Grid with Scroll Stagger Fade-In & Slide-Up */}
        <motion.div
          layout
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence>
            {filteredServices.map((service) => {
              const isPopular = service.id === 'fisioterapia' || service.id === 'terapia-manual' || service.id === 'traumatologia';
              const ServiceIcon = serviceIcons[service.id as keyof typeof serviceIcons] || Activity;

              return (
                <motion.div
                  layout
                  variants={cardVariants}
                  whileHover={{ y: -7 }}
                  transition={{ duration: 0.35 }}
                  key={service.id}
                  className="group relative bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-[#B1A086]/15 border border-[#D1CEC9] dark:border-white/10 hover:border-[#B1A086] dark:hover:border-[#B1A086]/60 transition-all duration-300 flex flex-col"
                >
                  {/* Minimal brand-book style service graphic */}
                  <div className="relative flex min-h-40 items-center gap-4 border-b border-[#D1CEC9]/70 bg-[#F2EFE8] px-5 py-5 dark:border-white/10 dark:bg-[#1A1917] sm:px-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#D1CEC9] bg-white text-[#0C0C0C] transition-colors group-hover:border-[#B1A086] dark:border-white/15 dark:bg-[#141414] dark:text-[#F2EFE8]">
                      <ServiceIcon className="h-8 w-8 stroke-[1.6]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      {isPopular && (
                        <span className="mb-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#84735B] dark:text-[#C9BCAB]">
                          <Sparkles className="h-3 w-3" />
                          {service.id === 'traumatologia' ? 'Especialidad médica' : 'Más solicitado'}
                        </span>
                      )}
                      <h3 className="text-lg font-bold leading-tight text-[#0C0C0C] font-heading group-hover:text-[#84735B] dark:text-[#F2EFE8] dark:group-hover:text-[#C9BCAB] sm:text-xl">
                        {service.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-[#84735B] dark:text-[#C9BCAB]">{service.priceFormatted} / sesión</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.duration}
                        </span>
                      </div>
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

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onOpenBooking(service.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-full shadow-md shadow-amber-400/20 hover:shadow-amber-500/30 transition-all"
                      >
                        <span>Agendar ({service.priceFormatted})</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Global CTA below grid with Fade-In + Slide-Up */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6 bg-white dark:bg-[#151c28] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg max-w-2xl mx-auto">
            <div className="text-left flex-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                ¿No estás seguro de cuál servicio necesitas?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Nuestros especialistas realizan una evaluación diagnóstica personalizada en tu primera sesión.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenBooking('fisioterapia')}
              className="px-5 py-2.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-full shrink-0 shadow-md"
            >
              Consulta de Valoración ($35)
            </motion.button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
