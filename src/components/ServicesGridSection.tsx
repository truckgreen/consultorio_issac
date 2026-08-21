import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ServiceDetail } from '../types';
import { 
  ArrowUpRight, 
  Sparkles, 
  Calendar, 
  Layers, 
  Play, 
  DollarSign, 
  Clock 
} from 'lucide-react';

interface ServicesGridSectionProps {
  services: ServiceDetail[];
  onSelectService: (service: ServiceDetail) => void;
  onOpenVideo?: (service: ServiceDetail) => void;
  onBookService: (serviceTitle: string) => void;
}

export const ServicesGridSection: React.FC<ServicesGridSectionProps> = ({
  services,
  onSelectService,
  onOpenVideo,
  onBookService
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos los Servicios (9)' },
    { id: 'fisioterapia', label: 'Fisioterapia Especializada' },
    { id: 'medicina', label: 'Traumatología & Médica' },
    { id: 'mente-nutricion', label: 'Psicología & Nutrición' },
    { id: 'movimiento', label: 'Entrenamiento & Boxeo' }
  ];

  const filteredServices = services.filter((srv) => {
    if (activeCategory === 'todos') return true;
    if (activeCategory === 'fisioterapia') {
      return srv.categoryName.toLowerCase().includes('fisioterapia');
    }
    if (activeCategory === 'medicina') {
      return srv.categoryName.toLowerCase().includes('traumatología');
    }
    if (activeCategory === 'mente-nutricion') {
      return srv.categoryName.toLowerCase().includes('psicología') || srv.categoryName.toLowerCase().includes('nutrición');
    }
    if (activeCategory === 'movimiento') {
      return srv.categoryName.toLowerCase().includes('entrenamiento') || srv.categoryName.toLowerCase().includes('boxeo');
    }
    return true;
  });

  return (
    <section id="servicios" className="py-20 sm:py-28 bg-[#F8FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200/80">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Nuestras Disciplinas Clínicas
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
            Nuestros servicios
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600">
            Un ecosistema integrado de salud donde especialistas coordinan tu recuperación,
            rendimiento y bienestar integral. Tarifas claras y videos explicativos disponibles en cada disciplina.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl border border-slate-200 hover:border-indigo-500/50 transition-all duration-300 flex flex-col group"
            >
              {/* Card Image Container */}
              <div className="relative h-60 overflow-hidden bg-slate-950 cursor-pointer" onClick={() => onSelectService(service)}>
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-bold text-slate-900 shadow-xs border border-slate-100">
                  {service.badge}
                </div>

                {/* Price Tag Overlay on Image */}
                <div className="absolute top-3.5 right-3.5 bg-indigo-600/95 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-extrabold text-white shadow-md border border-indigo-400/40 font-heading">
                  ${service.priceUSD} USD
                </div>

                {/* Bottom title over image */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5">
                  <div className="text-[11px] text-indigo-300 font-semibold mb-0.5">
                    {service.categoryName} · {service.duration}
                  </div>
                  <h3 className="text-xl font-extrabold text-white font-heading tracking-tight drop-shadow-xs">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                {/* Key conditions treated tags */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    Abordaje clínico:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {service.conditions.slice(0, 2).map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Actions: Video, Protocols & Book */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (onOpenVideo) onOpenVideo(service);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
                    title="Ver video explicativo del tratamiento"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                    <span>Ver Video</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectService(service)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer px-2 py-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Detalles</span>
                    </button>

                    <button
                      onClick={() => onBookService(service.title)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Agendar</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
