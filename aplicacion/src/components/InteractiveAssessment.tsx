import React, { useState } from 'react';
import { 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Activity,
  Heart,
  Baby,
  User,
  Dumbbell,
  Stethoscope,
  Apple,
  Brain
} from 'lucide-react';
import { SERVICES } from '../data/equilibraData';

interface InteractiveAssessmentProps {
  onSelectServiceForBooking: (serviceId: string) => void;
}

interface GoalOption {
  id: string;
  title: string;
  subtitle: string;
  serviceId: string;
  icon: any;
  recommendationReason: string;
}

export const InteractiveAssessment: React.FC<InteractiveAssessmentProps> = ({
  onSelectServiceForBooking,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goalOptions: GoalOption[] = [
    {
      id: 'dolor-espalda',
      title: 'Alivio de Dolor Muscular o Espalda',
      subtitle: 'Cervicalgia, lumbalgia o contracturas posturales persistentes',
      serviceId: 'fisioterapia',
      icon: Activity,
      recommendationReason: 'Te recomendamos una sesión de Fisioterapia y Terapia Manual con evaluación biomecánica para tratar la causa raíz de la sobrecarga muscular.'
    },
    {
      id: 'lesion-deportiva',
      title: 'Lesión Deportiva o Readaptación',
      subtitle: 'Esguinces, tendinopatías, rotura de ligamentos o retorno al juego',
      serviceId: 'fisioterapia-deportiva',
      icon: Dumbbell,
      recommendationReason: 'Tu caso se beneficia directamente de Fisioterapia Deportiva con test de fuerza, mediciones objetivas y fases activas de reacondicionamiento en cancha.'
    },
    {
      id: 'ninos-bebes',
      title: 'Fisioterapia y Desarrollo Infantil',
      subtitle: 'Estimulación psicomotriz, escoliosis infantil o marcha',
      serviceId: 'fisioterapia-pediatrica',
      icon: Baby,
      recommendationReason: 'El servicio de Fisioterapia Pediátrica está diseñado con dinámicas lúdicas y respetuosas para apoyar el desarrollo neuromotor de tu pequeño.'
    },
    {
      id: 'adulto-mayor',
      title: 'Adulto Mayor & Equilibrio',
      subtitle: 'Artrosis, movilidad articular, prevención de caídas y fuerza',
      serviceId: 'fisioterapia-geriatrica',
      icon: User,
      recommendationReason: 'Fisioterapia Geriátrica te proporcionará un plan adaptado para preservar la autonomía, fuerza muscular y seguridad en cada paso.'
    },
    {
      id: 'diagnostico-medico',
      title: 'Diagnóstico Médico Especializado',
      subtitle: 'Evaluación de trauma óseo, sospecha de fisura o segunda opinión',
      serviceId: 'traumatologia',
      icon: Stethoscope,
      recommendationReason: 'La consulta médica de Traumatología te brindará diagnóstico de precisión, revisión de estudios radiológicos y derivación inmediata al plan fisioterapéutico.'
    },
    {
      id: 'salud-mental',
      title: 'Estrés, Dolor Crónico o Ansiedad',
      subtitle: 'Acompañamiento psicológico, resiliencia y equilibrio emocional',
      serviceId: 'psicologia',
      icon: Brain,
      recommendationReason: 'Nuestro equipo de Psicología Clínica te otorgará herramientas biopsicosociales para regular el sistema nervioso y recuperar el balance integral.'
    },
    {
      id: 'nutricion-meta',
      title: 'Nutrición Clínica & Rendimiento',
      subtitle: 'Plan antiinflamatorio, recomposición corporal y suplementación',
      serviceId: 'nutricion',
      icon: Apple,
      recommendationReason: 'Una consulta de Nutrición personalizada te permitirá acelerar la regeneración de tejidos y optimizar tu energía diaria con metas realistas.'
    },
    {
      id: 'entrenamiento-activo',
      title: 'Acondicionamiento Físico Seguro',
      subtitle: 'Fuerza funcional, postura o boxeo técnico sin riesgos de lesión',
      serviceId: 'entrenamiento-funcional',
      icon: Heart,
      recommendationReason: 'El Entrenamiento Funcional guiado por profesionales de la salud te garantiza ganar fuerza y condición con una técnica milimétrica.'
    }
  ];

  const selectedOption = goalOptions.find((g) => g.id === selectedGoal);
  const recommendedService = selectedOption 
    ? SERVICES.find((s) => s.id === selectedOption.serviceId)
    : null;

  return (
    <section id="evaluacion" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Guía de Orientación Terapéutica</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            ¿No estás seguro de qué servicio necesitas?
          </h2>

          <p className="text-slate-600 dark:text-slate-300">
            Selecciona tu principal objetivo o síntoma actual y nuestro sistema te orientará de inmediato hacia la especialidad clínica más adecuada.
          </p>
        </div>

        {/* Goal Selector Grid */}
        {!selectedOption ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12">
            {goalOptions.map((goal) => {
              const IconComp = goal.icon;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className="flex flex-col text-left p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <IconComp className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {goal.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed flex-1">
                    {goal.subtitle}
                  </p>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-4">
                    <span>Seleccionar</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Recommendation Result Box */
          <div className="max-w-2xl mx-auto mt-12 bg-gradient-to-br from-amber-500/10 via-slate-50 to-white dark:from-amber-950/30 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-amber-500 shadow-2xl animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Recomendación Clínica Sugerida
              </span>

              <button
                onClick={() => setSelectedGoal(null)}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cambiar selección</span>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {recommendedService?.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                {selectedOption.recommendationReason}
              </p>

              {recommendedService && (
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Duración sesión</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{recommendedService.duration}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Tarifa referencial</span>
                    <p className="font-bold text-amber-600 dark:text-amber-400">{recommendedService.priceFormatted} USD</p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onSelectServiceForBooking(selectedOption.serviceId)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar {recommendedService?.title} Ahora</span>
                </button>

                <button
                  onClick={() => setSelectedGoal(null)}
                  className="px-5 py-3.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
                >
                  Ver otras opciones
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
