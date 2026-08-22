import React from 'react';
import { Users, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { WHY_CHOOSE_US } from '../data/equilibraData';

export const WhyUs: React.FC = () => {
  const getWhyIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-7 h-7 text-amber-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-7 h-7 text-amber-500" />;
      case 'TrendingUp':
      default:
        return <TrendingUp className="w-7 h-7 text-amber-500" />;
    }
  };

  return (
    <section id="por-que-nosotros" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Nuestra Ventaja Competitiva</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            ¿Por qué elegir EQUILIBRA?
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Un nuevo paradigma en fisioterapia y medicina deportiva donde tu recuperación es activa, personalizada y medible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {WHY_CHOOSE_US.map((item) => (
            <div
              key={item.id}
              className="flex flex-col p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  {getWhyIcon(item.iconName)}
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed flex-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
