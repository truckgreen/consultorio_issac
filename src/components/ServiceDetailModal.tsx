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
            {/* Quick Specs */}
            <div className="flex flex-wrap items-center gap-4 py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 text-amber-500" />
                <span><strong>Duración:</strong> {service.duration}</span>
              </div>
              <div className="text-slate-300 dark:text-slate-600">|</div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Users className="w-4 h-4 text-amber-500" />
                <span><strong>Modalidad:</strong> Presencial 1 a 1</span>
              </div>
            </div>

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
