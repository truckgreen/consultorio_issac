import React from 'react';
import { ServiceDetail } from '../types';
import { 
  X, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Users,
  Play,
  DollarSign,
  Clock,
  Zap
} from 'lucide-react';

interface ServiceDetailModalProps {
  service: ServiceDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVideo?: (service: ServiceDetail) => void;
  onBookAppointment: (serviceTitle: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  onOpenVideo,
  onBookAppointment
}) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Image and Badge */}
        <div className="space-y-4">
          <div className="relative h-56 rounded-2xl overflow-hidden shadow-inner">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            
            <div className="absolute top-3.5 left-3.5 bg-white/95 px-3 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-xs">
              {service.badge}
            </div>

            <div className="absolute top-3.5 right-12 bg-indigo-600 px-3 py-1 rounded-lg text-xs font-extrabold text-white shadow-md font-heading">
              ${service.priceUSD} USD
            </div>

            <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
              <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block">
                {service.categoryName} · {service.duration}
              </span>
              <h3 className="text-2xl font-bold font-heading">
                {service.title}
              </h3>
            </div>
          </div>

          {/* Transparent Price & Duration Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                Tarifa Oficial por Sesión / Consulta
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-950 font-heading">
                  ${service.priceUSD} USD
                </span>
                <span className="text-xs text-slate-600">
                  (o equivalente en Bs a tasa BCV)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Duración estimada: {service.duration}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenVideo(service);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Ver Video Explicativo</span>
            </button>
          </div>

          <p className="text-sm font-medium text-slate-900 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
            “{service.tagline}”
          </p>

          <p className="text-sm text-slate-600 leading-relaxed">
            {service.description}
          </p>

          {/* Included Items in Price */}
          {service.includedItems && service.includedItems.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Incluido en tu tarifa:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.includedItems.map((inc, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Options */}
          {service.packageOptions && service.packageOptions.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                Planes y Paquetes de Ahorro:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {service.packageOptions.map((pkg, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{pkg.name}</div>
                      <div className="text-sm font-extrabold text-indigo-700 font-heading mt-0.5">{pkg.price}</div>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-1">{pkg.savings}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits Grid */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Beneficios Clínicos y Objetivos:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conditions Treated */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Patologías & Condiciones Abordadas:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {service.conditions.map((c, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-indigo-50/70 text-slate-800 text-xs font-semibold border border-indigo-100">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Specialists */}
          <div className="space-y-1 text-xs text-slate-500 pt-1">
            <span className="font-semibold text-slate-900">Especialistas y Equipo:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {service.specialists.map((s, idx) => (
                <span key={idx} className="text-xs text-slate-900 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Cerrar
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenVideo) onOpenVideo(service);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-indigo-600" />
                <span>Video Explicativo</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onBookAppointment(service.title);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Cita</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

