import React from 'react';
import { 
  Activity, 
  HeartHandshake, 
  Salad, 
  Flame, 
  CheckCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SPECIALTIES } from '../data/equilibraData';

interface SpecialtiesProps {
  onSelectSpecialtyForBooking: (specialtyId: string) => void;
}

export const Specialties: React.FC<SpecialtiesProps> = ({ onSelectSpecialtyForBooking }) => {
  const getSpecialtyIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-6 h-6 text-amber-500" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-amber-500" />;
      case 'Salad':
        return <Salad className="w-6 h-6 text-amber-500" />;
      case 'Flame':
      default:
        return <Flame className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <section id="especialidades" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Nuestras 4 Grandes Áreas</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Especialidades Médicas & de Movimiento
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Un ecosistema de salud integral diseñado para acompañarte desde el diagnóstico médico hasta el alto rendimiento físico.
          </p>
        </div>

        {/* 4 Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
          {SPECIALTIES.map((spec) => (
            <div
              key={spec.id}
              className="flex flex-col justify-between p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getSpecialtyIcon(spec.iconName)}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  {spec.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {spec.description}
                </p>

                {/* Sub-specialties tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {spec.subSpecialties.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-semibold"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Highlights */}
                <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                  {spec.highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                <button
                  onClick={() => onSelectSpecialtyForBooking(spec.id)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 transition-colors"
                >
                  <span>Consultar sobre {spec.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
