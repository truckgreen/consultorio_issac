import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Check, Users, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { ServiceItem } from '../types';
import { APP_IMAGES } from '../data/images';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookService,
}) => {
  if (!service) return null;

  const imageAsset = APP_IMAGES.services[service.imageKey] || APP_IMAGES.about;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative bg-white dark:bg-[#151c28] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
        >
          {/* Header Image Frame */}
          <div className="relative h-60 w-full overflow-hidden bg-slate-900">
            <img
              src={imageAsset.src}
              alt={imageAsset.alt || service.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title on Image */}
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" /> Especialidad Clínica
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
                {service.title}
              </h3>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Quick Specs & Base Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Duración:</strong> {service.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Users className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Modalidad:</strong> Presencial 1 a 1</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                <span className="text-base sm:text-lg">{service.priceFormatted}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ sesión</span>
              </div>
            </div>

            {/* Pricing Section: Direct Flyer Image or Breakdown */}
            {service.pricingFlyerImage ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Planes, Evaluaciones & Tarifas</span>
                  </h4>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Tarifas Oficiales
                  </span>
                </div>
                
                {/* Official Flyer Image Container */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-slate-950 shadow-md group">
                  <img
                    src={service.pricingFlyerImage}
                    alt={`Tarifas y planes de ${service.title}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain max-h-[480px] mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                    onError={(e) => {
                      // Fallback if local file not yet copied to public folder
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.flyer-fallback') as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  
                  {/* Invisible fallback if image isn't loaded yet */}
                  <div className="flyer-fallback hidden p-6 text-center space-y-3 bg-slate-900 text-white">
                    <p className="text-sm font-bold text-amber-400">Ruta de imagen configurada:</p>
                    <code className="text-xs px-3 py-1.5 rounded-lg bg-black/50 text-slate-300 font-mono inline-block">
                      {service.pricingFlyerImage}
                    </code>
                    <p className="text-xs text-slate-400">
                      (Coloca el archivo <span className="text-amber-300">precios.jpg</span> en la carpeta pública o sube tu imagen)
                    </p>
                  </div>
                </div>
              </div>
            ) : service.pricingTiers && service.pricingTiers.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Planes, Evaluaciones & Tarifas</span>
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {service.pricingTiers.map((tier, tIdx) => (
                    <div
                      key={tIdx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        tier.highlight
                          ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/30 dark:border-amber-500/40 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {tier.name}
                          </span>
                          {tier.highlight && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-400 text-slate-950">
                              Recomendado
                            </span>
                          )}
                        </div>
                        {tier.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {tier.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                          {tier.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Fallback Price Note & Package info */
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Tarifa por sesión individual:</span>
                  <span className="text-amber-600 dark:text-amber-400 text-base">{service.priceFormatted}</span>
                </div>
                {service.priceNote && (
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    {service.priceNote}
                  </p>
                )}
                {service.packageOption && (
                  <div className="pt-2 mt-2 border-t border-amber-500/20 flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <span>Opción de Paquete:</span>
                    <span className="bg-amber-500/20 px-2.5 py-0.5 rounded-full">{service.packageOption}</span>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Description */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Descripción del Servicio
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {service.fullDescription}
              </p>
            </div>

            {/* Methodology */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
                Metodología de Trabajo:
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {service.methodology}
              </p>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Beneficios Principales
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                ¿Para quién está recomendado?
              </h4>
              <div className="flex flex-wrap gap-2">
                {service.targetAudience.map((audience, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  onClose();
                  onBookService(service.id);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-full shadow-md shadow-amber-400/20 active:scale-95 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar {service.title}</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
