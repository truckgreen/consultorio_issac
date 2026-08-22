import React, { useState } from 'react';
import { 
  Clock, 
  Check, 
  Calendar, 
  ArrowUpRight, 
  Activity 
} from 'lucide-react';
import { SERVICES } from '../data/equilibraData';
import { ServiceItem } from '../types';

interface ServicesProps {
  onSelectServiceForBooking: (serviceId: string) => void;
  onOpenServiceDetails: (service: ServiceItem) => void;
}

export const Services: React.FC<ServicesProps> = ({
  onSelectServiceForBooking,
  onOpenServiceDetails,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todos los Servicios' },
    { id: 'fisioterapia', label: 'Fisioterapia' },
    { id: 'medicina', label: 'Traumatología' },
    { id: 'movimiento', label: 'Movimiento & Deporte' },
    { id: 'bienestar', label: 'Nutrición & Psicología' },
  ];

  const filteredServices = activeCategory === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === activeCategory);

  return (
    <section id="servicios" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Nuestros Servicios Clínicos</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Tratamientos especializados para cada etapa de tu vida
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Conoce nuestras 9 especialidades de rehabilitación, medicina del deporte y movimiento consciente con tarifas transparentes y atención individualizada.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-8 pb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Image Header with Price & Category Badges */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Category Pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs uppercase tracking-wider border border-white/10">
                    {service.category}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-black text-sm shadow-md">
                    {service.priceFormatted} USD
                  </span>
                </div>

                {/* Bottom title & duration */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    {service.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-200 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{service.duration}</span>
                    {service.packageOption && (
                      <span className="text-amber-300 font-medium">• {service.packageOption}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {service.shortDescription}
                </p>

                {/* Key Benefits List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Beneficios destacados
                  </p>
                  {service.benefits.slice(0, 3).map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onOpenServiceDetails(service)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    <span>Ver Detalles</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectServiceForBooking(service.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-500/25 transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Cita</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
