import React from 'react';
import { motion } from 'motion/react';
import { 
  HeartHandshake, 
  Target, 
  Sparkles, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface IntroPhilosophySectionProps {
  onLearnMore: () => void;
  onBookAppointment: () => void;
}

export const IntroPhilosophySection: React.FC<IntroPhilosophySectionProps> = ({
  onLearnMore,
  onBookAppointment
}) => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
      {/* Subtle graphic lines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Composition with Rehabilitation Activity */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main image with clean border radius */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80"
                  alt="Sesión de rehabilitación activa y fisioterapia en camilla y movimiento"
                  className="w-full h-[420px] object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              </div>

              {/* Floating feature card */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-200 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Recuperación Activa
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      No reposo pasivo: movimiento biomecánico guiado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Accent badge */}
              <div className="absolute -top-4 -left-4 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 border border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Estándar Internacional</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Heading and Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-6 flex flex-col space-y-6"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Filosofía & Compromiso
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading leading-tight">
                El verdadero <br />
                bienestar <br />
                <span className="text-slate-900 underline decoration-indigo-600 decoration-4 underline-offset-4">
                  comienza en movimiento
                </span>
              </h2>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Combinamos <strong className="text-slate-900 font-semibold">fisioterapia basada en evidencia</strong>, 
              entrenamiento y acompañamiento humano para transformar la experiencia de rehabilitación en algo 
              <span className="text-slate-900 font-semibold"> activo, cercano y motivador</span>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
                <Target className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Tratamiento de la Causa</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No enmascaramos síntomas; reeducamos el patrón motor.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Acompañamiento 1 a 1</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sesiones dedicadas con tu especialista asignado.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="btn-intro-learn-more"
                onClick={onLearnMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:shadow transition-all cursor-pointer"
              >
                <span>Más información</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                id="btn-intro-book-fast"
                onClick={onBookAppointment}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
              >
                <span>Agendar mi consulta</span>
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
