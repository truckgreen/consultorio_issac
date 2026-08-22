import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, ArrowRight, RotateCcw, CheckCircle2, Calendar } from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';

interface InteractiveAssessmentProps {
  onOpenBooking: (serviceId?: string) => void;
}

export const InteractiveAssessment: React.FC<InteractiveAssessmentProps> = ({ onOpenBooking }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [recommendedServiceId, setRecommendedServiceId] = useState<string>('fisioterapia');

  const goals = [
    { id: 'dolor', title: 'Aliviar dolor o molestia', desc: 'Molestias en espalda, cuello, hombro o rodilla' },
    { id: 'deporte', title: 'Lesión deportiva o retorno al juego', desc: 'Atletas que buscan recuperar fuerza y técnica' },
    { id: 'pediatria', title: 'Atención para niños / adolescentes', desc: 'Desarrollo motor, postura y psicomotricidad' },
    { id: 'geriatria', title: 'Movilidad para adulto mayor', desc: 'Equilibrio, artrosis y prevención de caídas' },
    { id: 'rendimiento', title: 'Entrenamiento & acondicionamiento', desc: 'Boxeo, fuerza funcional y nutrición' },
    { id: 'emocional', title: 'Estrés y salud mental', desc: 'Gestión del dolor crónico y equilibrio emocional' }
  ];

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoal(goalId);
    let rec = 'fisioterapia';
    if (goalId === 'dolor') rec = 'fisioterapia';
    else if (goalId === 'deporte') rec = 'fisioterapia-deportiva';
    else if (goalId === 'pediatria') rec = 'fisioterapia-pediatrica';
    else if (goalId === 'geriatria') rec = 'fisioterapia-geriatrica';
    else if (goalId === 'rendimiento') rec = 'entrenamiento-funcional';
    else if (goalId === 'emocional') rec = 'psicologia';

    setRecommendedServiceId(rec);
    setStep(2);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedGoal('');
    setSelectedZone('');
  };

  const recommendedService = SERVICES_DATA.find(s => s.id === recommendedServiceId) || SERVICES_DATA[0];

  return (
    <section className="py-16 bg-white dark:bg-[#121824] transition-colors border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-slate-100 dark:from-amber-950/20 dark:via-slate-900 dark:to-[#161e2c] rounded-3xl p-6 sm:p-10 border border-amber-300/50 dark:border-amber-500/20 shadow-lg">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guía Rápida Interactiva</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              ¿No sabes qué servicio necesitas?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Selecciona tu objetivo principal y te orientaremos hacia el área de atención más adecuada.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGoal(g.id)}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-1 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {g.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {g.desc}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-amber-300 dark:border-amber-500/40 shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Recomendación para tu objetivo:
                    </span>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white font-heading mt-1">
                      {recommendedService.title}
                    </h4>
                  </div>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cambiar opción</span>
                  </button>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {recommendedService.shortDescription}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {recommendedService.benefits.slice(0, 4).map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => onOpenBooking(recommendedService.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-full shadow-md transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar {recommendedService.title}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
};
