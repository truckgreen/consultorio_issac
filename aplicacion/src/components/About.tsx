import React from 'react';
import { ShieldCheck, UserCheck, Lightbulb, CheckCircle, Sparkles } from 'lucide-react';
import { CLINIC_INFO, PHILOSOPHY_PILLARS } from '../data/equilibraData';

export const About: React.FC = () => {
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <ShieldCheck className="w-6 h-6 text-amber-500" />;
      case 1:
        return <UserCheck className="w-6 h-6 text-amber-500" />;
      default:
        return <Lightbulb className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <section id="sobre-nosotros" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Info & Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Nuestra Filosofía</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {CLINIC_INFO.aboutTitle}
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {CLINIC_INFO.aboutText}
            </p>

            {/* Quote Box */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 text-slate-700 dark:text-slate-200 italic text-sm sm:text-base">
              "{CLINIC_INFO.motto}"
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "Cabinas privadas de evaluación",
                "Gimnasio terapéutico funcional",
                "Médicos y terapeutas coordinados",
                "Sin tiempos muertos ni máquinas pasivas",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 3 Pillars Grid */}
          <div className="lg:col-span-6 space-y-4">
            {PHILOSOPHY_PILLARS.map((pillar, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {getIcon(idx)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
