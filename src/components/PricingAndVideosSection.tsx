import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  Play, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { ServiceDetail } from '../types';

interface PricingAndVideosSectionProps {
  services: ServiceDetail[];
  onOpenVideo?: (service: ServiceDetail) => void;
  onBookService: (serviceTitle: string) => void;
}

export const PricingAndVideosSection: React.FC<PricingAndVideosSectionProps> = ({
  services,
  onOpenVideo,
  onBookService
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todas las Tarifas' },
    { id: 'fisioterapia', label: 'Fisioterapia & Readaptación' },
    { id: 'medica', label: 'Traumatología & Médica' },
    { id: 'bienestar', label: 'Nutrición & Psicología' },
    { id: 'activa', label: 'Entrenamiento & Boxeo' }
  ];

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'todos') return true;
    if (selectedCategory === 'fisioterapia') return s.categoryName.toLowerCase().includes('fisioterapia');
    if (selectedCategory === 'medica') return s.categoryName.toLowerCase().includes('traumatología');
    if (selectedCategory === 'bienestar') return s.categoryName.toLowerCase().includes('nutrición') || s.categoryName.toLowerCase().includes('psicología');
    if (selectedCategory === 'activa') return s.categoryName.toLowerCase().includes('entrenamiento') || s.categoryName.toLowerCase().includes('boxeo');
    return true;
  });

  return (
    <section id="tarifas" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200/80">
            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
            Tarifas Claras & Videos Explicativos
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
            Precios Transparentes y Videos de Cada Servicio
          </h2>

          <p className="text-base sm:text-lg text-slate-600">
            Consulta los valores oficiales de cada sesión, consulta y paquete de rehabilitación. 
            Haz clic en <strong className="text-indigo-600 font-semibold">“Ver Video Explicativo”</strong> para ver la demostración clínica y la metodología antes de asistir.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services & Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className="bg-slate-50 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                
                {/* Header of card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
                      {service.categoryName}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 font-heading leading-tight mt-0.5">
                      {service.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
                    {service.duration}
                  </span>
                </div>

                {/* Price Display */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Tarifa por Sesión / Consulta:
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 font-heading">
                      ${service.priceUSD} USD
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / individual
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Aceptamos Pago Móvil, Transferencia, Zelle y Efectivo (Bs tasa BCV)
                  </div>
                </div>

                {/* Included in Price items */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    ¿Qué incluye tu sesión?
                  </span>
                  {service.includedItems.slice(0, 3).map((inc, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>

                {/* Package Options Preview if available */}
                {service.packageOptions && service.packageOptions.length > 1 && (
                  <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-indigo-600" />
                        {service.packageOptions[1].name}
                      </span>
                      <span className="font-extrabold text-indigo-700">
                        {service.packageOptions[1].price}
                      </span>
                    </div>
                    <div className="text-[10px] text-indigo-700">
                      {service.packageOptions[1].savings}
                    </div>
                  </div>
                )}

              </div>

              {/* Card Actions: Video Button & Booking Button */}
              <div className="pt-5 mt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center gap-2.5">
                
                {/* Explanatory Video Trigger Button */}
                <button
                  onClick={() => {
                    if (onOpenVideo) onOpenVideo(service);
                  }}
                  className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs hover:border-indigo-400 group-hover:bg-indigo-50 group-hover:text-indigo-900 transition-all cursor-pointer"
                  title="Ver video explicativo con pasos clínicos del tratamiento"
                >
                  <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                  <span>Ver Video</span>
                </button>

                {/* Book this service button */}
                <button
                  onClick={() => onBookService(service.title)}
                  className="w-full sm:w-1/2 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar Cita</span>
                </button>

              </div>

            </motion.div>
          ))}
        </div>

        {/* Transparent Policy Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Garantía de Claridad & Facturación Oficial
            </div>
            <h4 className="text-lg sm:text-xl font-bold font-heading text-white">
              Métodos de Pago y Flexibilidad en EQUILIBRA
            </h4>
            <p className="text-xs text-slate-300 max-w-2xl">
              Emitimos recibos e informes médicos para reembolsos de pólizas de seguro de salud nacionales e internacionales. Tarifas en Bs calculadas a tasa oficial del BCV del día de la consulta.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700">
              Pago Móvil
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700">
              Zelle / Transferencias
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700">
              Punto de Venta / Débito
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700">
              Efectivo USD / Bs
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
