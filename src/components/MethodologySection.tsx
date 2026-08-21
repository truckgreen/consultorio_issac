import React from 'react';
import { motion } from 'motion/react';
import { 
  Users2, 
  Award, 
  Flame, 
  Check, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface MethodologySectionProps {
  onBookAppointment: () => void;
  onOpenMobileTracker: () => void;
}

export const MethodologySection: React.FC<MethodologySectionProps> = ({
  onBookAppointment,
  onOpenMobileTracker
}) => {
  return (
    <section id="metodo" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Part: "Lo que hacemos mejor" */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-20 border-b border-slate-200">
          
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Nuestra Distinción
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
                Lo que hacemos mejor
              </h2>
              <p className="text-lg sm:text-xl font-semibold text-indigo-700 italic">
                “Realizamos un abordaje integral, el paciente no es solo una lesión”
              </p>
            </div>

            <p className="text-base text-slate-600 leading-relaxed">
              Nuestro trabajo se fundamenta en la <strong className="text-slate-900">atención integral y de alta precisión</strong>, 
              entendiendo la armonía perfecta entre cuerpo, mente y movimiento. En nuestro espacio, 
              nos alejamos del modelo clínico tradicional para ofrecer un abordaje multidisciplinario y 
              de estándar internacional donde la fisioterapia avanzada, la traumatología, la nutrición 
              especializada y la salud mental convergen en un mismo ecosistema.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-3.5 py-2 rounded-xl">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Sin derivaciones confusas</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-3.5 py-2 rounded-xl">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Sesiones 100% individualizadas</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-3.5 py-2 rounded-xl">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Tecnología + Terapia Manual</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80"
                alt="Especialista y paciente en sesión en EQUILIBRA"
                className="w-full h-80 sm:h-96 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    360°
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Ecosistema Clínico Unificado</h4>
                    <p className="text-[11px] text-slate-500">Traumatólogo, Fisioterapeuta y Nutricionista en una sola ficha clínica.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Part: "Por qué las personas nos prefieren" */}
        <div className="pt-20">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Nuestros Pilares de Confianza
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
              Por qué las personas nos prefieren
            </h2>
            <p className="text-base text-slate-600">
              Resultados comprobables con un modelo terapéutico humano, tecnológico y riguroso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-xs hover:shadow-xl border border-slate-200 hover:border-indigo-500/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Users2 className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 font-heading leading-snug">
                  Modelo Multidisciplinario & Evaluación 360°
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  Porque simplificamos la salud al reunir en un solo lugar a especialistas en traumatología, 
                  fisioterapia, nutrición, psicología y entrenamiento. Evitamos la fragmentación médica y 
                  diseñamos un plan integral unificado donde cada área colabora en tiempo real para acelerar tus resultados.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600">
                <span>Atención médica coordinada</span>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xs hover:shadow-xl border border-slate-200 hover:border-indigo-500/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Award className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 font-heading leading-snug">
                  Estándar de Alta Calidad & Atención Exclusiva
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  Porque ofrecemos un servicio personalizado, de estándar premium y de alta precisión, 
                  donde cada protocolo de rehabilitación y plan nutricional se adapta rigurosamente 
                  a tus objetivos y necesidades específicas.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600">
                <span>Espacio privado y tecnología</span>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xs hover:shadow-xl border border-slate-200 hover:border-indigo-500/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Flame className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 font-heading leading-snug">
                  Del Dolor al Rendimiento Pleno
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  Porque no nos limitamos a aliviar un síntoma temporal. Acompañamos todo tu proceso: 
                  desde la recuperación médica o pediátrica y la salud mental, hasta la optimización física 
                  mediante disciplinas activas para garantizar un bienestar sostenible a largo plazo.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600">
                <span>Acompañamiento a largo plazo</span>
              </div>
            </motion.div>

          </div>

          {/* Quick CTA strip */}
          <div className="mt-14 text-center">
            <button
              onClick={onBookAppointment}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>Comienza tu valoración inicial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
