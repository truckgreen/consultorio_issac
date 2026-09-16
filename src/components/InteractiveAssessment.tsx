import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Activity,
  ShieldAlert,
  Loader2,
  HelpCircle,
  HeartPulse,
  Send,
} from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';

interface MedicalTriageResponse {
  recommendedServiceId: string;
  specialistArea: string;
  urgencyLevel: 'baja' | 'moderada' | 'prioritaria';
  triageSummary: string;
  homeAdvice: string[];
  disclaimer?: string;
  confidence?: string;
}

interface InteractiveAssessmentProps {
  onOpenBooking: (serviceId?: string) => void;
}

export const InteractiveAssessment: React.FC<InteractiveAssessmentProps> = ({ onOpenBooking }) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'ai'>('ai');

  // Quick mode states
  const [quickStep, setQuickStep] = useState<number>(1);
  const [quickRecommendedId, setQuickRecommendedId] = useState<string>('fisioterapia');

  // AI Triage states
  const [userSymptoms, setUserSymptoms] = useState('');
  const [duration, setDuration] = useState('menos_de_1_semana');
  const [activityLevel, setActivityLevel] = useState('sedentario_moderado');
  const [ageGroup, setAgeGroup] = useState('adulto');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<MedicalTriageResponse | null>(null);

  const quickGoals = [
    { id: 'dolor', title: 'Aliviar dolor de espalda o cuello', desc: 'Molestias cervicales, lumbalgia o ciática', target: 'fisioterapia' },
    { id: 'deporte', title: 'Lesión deportiva o sobrecarga', desc: 'Desgarros, esguinces, tendinitis o gym', target: 'fisioterapia-deportiva' },
    { id: 'pediatria', title: 'Atención para niños / adolescentes', desc: 'Desarrollo motor, postura y psicomotricidad', target: 'fisioterapia-pediatrica' },
    { id: 'geriatria', title: 'Movilidad para adulto mayor', desc: 'Equilibrio, artrosis y prevención de caídas', target: 'fisioterapia-geriatrica' },
    { id: 'rendimiento', title: 'Entrenamiento & acondicionamiento', desc: 'Fuerza, boxeo funcional y prevención', target: 'entrenamiento-funcional' },
    { id: 'emocional', title: 'Estrés y salud mental', desc: 'Gestión del dolor crónico y equilibrio emocional', target: 'psicologia' }
  ];

  const handleQuickGoalSelect = (targetServiceId: string) => {
    setQuickRecommendedId(targetServiceId);
    setQuickStep(2);
  };

  const handleAiTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSymptoms.trim() || userSymptoms.trim().length < 5) {
      setAiError('Por favor describe brevemente qué sientes o en qué zona tienes la molestia.');
      return;
    }

    setAiError(null);
    setIsLoadingAi(true);

    try {
      const response = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSymptoms,
          duration,
          activityLevel,
          age: ageGroup,
        }),
      });

      const data = await response.json();
      if (data.success && data.triage) {
        setTriageResult(data.triage);
      } else {
        setAiError(data.error || 'No se pudo completar el análisis en este momento.');
      }
    } catch (err) {
      setAiError('Ocurrió un error al procesar tu consulta. Por favor intenta de nuevo.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleReset = () => {
    setTriageResult(null);
    setUserSymptoms('');
    setQuickStep(1);
    setAiError(null);
  };

  const resolvedServiceId = triageResult?.recommendedServiceId || quickRecommendedId;
  const recommendedService = SERVICES_DATA.find((s) => s.id === resolvedServiceId) || SERVICES_DATA[0];

  return (
    <section id="triage-medico" className="py-16 sm:py-24 bg-white dark:bg-[#121824] transition-colors border-y border-slate-200/80 dark:border-slate-800 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-slate-50 dark:from-amber-950/20 dark:via-slate-900 dark:to-[#161e2c] rounded-3xl p-6 sm:p-10 border border-amber-300/50 dark:border-amber-500/20 shadow-xl relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
              <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Orientación Clínica & Asistente Virtual</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
              ¿No sabes qué servicio o especialista necesitas?
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
              Utiliza nuestro Asistente Inteligente de Triage Médico o selecciona tu objetivo para recomendarte el área adecuada.
            </p>

            {/* Mode Switcher */}
            <div className="inline-flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl mt-5 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ai');
                  handleReset();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Asistente IA de Triage</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('quick');
                  handleReset();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'quick'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Guía por Categorías</span>
              </button>
            </div>
          </div>

          {/* AI Mode */}
          {activeTab === 'ai' && (
            <div>
              {!triageResult ? (
                <form onSubmit={handleAiTriageSubmit} className="max-w-2xl mx-auto space-y-4 bg-white dark:bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  {aiError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                      Describe tus síntomas, dolor o lo que te ocurre:
                    </label>
                    <textarea
                      rows={3}
                      value={userSymptoms}
                      onChange={(e) => setUserSymptoms(e.target.value)}
                      placeholder="Ej: Tengo un dolor punzante en la zona lumbar desde hace 4 días que se irradia hacia la pierna derecha al sentarme..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tiempo con el síntoma:
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="menos_de_1_semana">Menos de 1 semana</option>
                        <option value="1_a_4_semanas">1 a 4 semanas</option>
                        <option value="1_a_3_meses">1 a 3 meses</option>
                        <option value="mas_de_3_meses_cronico">Más de 3 meses (Crónico)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nivel de actividad física:
                      </label>
                      <select
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="sedentario">Sedentario / Trabajo de oficina</option>
                        <option value="moderado">Moderado (1-3 días/semana)</option>
                        <option value="deportista">Deportista activo / Alto impacto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Grupo de edad:
                      </label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="pediatrico">Niño / Adolescente (0-17)</option>
                        <option value="adulto_joven">Adulto (18-59 años)</option>
                        <option value="adulto_mayor">Adulto mayor (60+ años)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Análisis instantáneo y confidencial con IA médica</span>
                    </p>

                    <button
                      type="submit"
                      disabled={isLoadingAi}
                      className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                    >
                      {isLoadingAi ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analizando tus síntomas...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Obtener Triage</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* AI Triage Result Card */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-400 dark:border-amber-500/40 shadow-xl space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          Resultado de Triage Asistido
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          Urgencia: {triageResult.urgencyLevel}
                        </span>
                      </div>
                      <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                        {triageResult.specialistArea || recommendedService.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Nueva consulta</span>
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-400/30 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {triageResult.triageSummary}
                  </div>

                  {/* Advice List */}
                  {triageResult.homeAdvice && triageResult.homeAdvice.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span>Pautas iniciales recomendadas:</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {triageResult.homeAdvice.map((advice, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>{advice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer & Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg">
                      * Este análisis es una guía de orientación clínica preliminar y no sustituye la valoración física presencial en nuestra clínica.
                    </p>

                    <button
                      type="button"
                      onClick={() => onOpenBooking(resolvedServiceId)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-full shadow-lg transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Agendar Cita en {recommendedService.title}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Quick Mode */}
          {activeTab === 'quick' && (
            <div>
              <AnimatePresence mode="wait">
                {quickStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {quickGoals.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => handleQuickGoalSelect(g.target)}
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

                {quickStep === 2 && (
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
          )}

        </div>
      </div>
    </section>
  );
};
