import React from 'react';
import { motion } from 'motion/react';
import { 
  Stethoscope, 
  Brain, 
  Apple, 
  Dumbbell, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';

interface SpecialtiesDeepDiveProps {
  onOpenSpecialtyModal: (specialtyTitle: string) => void;
  onBookAppointment: () => void;
}

export const SpecialtiesDeepDive: React.FC<SpecialtiesDeepDiveProps> = ({
  onOpenSpecialtyModal,
  onBookAppointment
}) => {
  const pillars = [
    {
      id: 'medicina-fisioterapia',
      icon: Stethoscope,
      title: 'Medicina & Fisioterapia Especializada',
      description: 'Abordaje integral y de alta precisión para la prevención, diagnóstico y rehabilitación de lesiones. Contamos con traumatología, fisioterapia avanzada y atención especializada en fisioterapia pediátrica y geriátrica.',
      highlights: ['Ecografía musculoesquelética', 'Punción seca & diatermia', 'Rehabilitación postquirúrgica'],
      accentColor: 'from-[#E4B04A]/20 to-[#E4B04A]/5',
      badge: 'Pilar Clínico'
    },
    {
      id: 'salud-mental',
      icon: Brain,
      title: 'Salud Mental & Empoderamiento Emocional',
      description: 'Acompañamiento psicológico personalizado enfocado en el equilibrio emocional, la gestión del estrés y el bienestar integral de niños, jóvenes y adultos en un entorno seguro, humano y confidencial.',
      highlights: ['Gestión del dolor crónico', 'Superación de lesiones (kinesiofobia)', 'Regulación de ansiedad y estrés'],
      accentColor: 'from-[#E4B04A]/20 to-[#E4B04A]/5',
      badge: 'Bienestar Mental'
    },
    {
      id: 'nutricion-clinica',
      icon: Apple,
      title: 'Nutrición Clínica & Deporte de Alto Nivel',
      description: 'Planes de alimentación 100% personalizados adaptados a las exigencias de deportistas de alto rendimiento, así como programas especializados de nutrición para niños y poblaciones con condiciones específicas.',
      highlights: ['Bioimpedancia médica', 'Nutrición antiinflamatoria', 'Optimización metabólica'],
      accentColor: 'from-[#E4B04A]/20 to-[#E4B04A]/5',
      badge: 'Nutrición de Precisión'
    },
    {
      id: 'entrenamiento-movimiento',
      icon: Dumbbell,
      title: 'Entrenamiento Funcional & Movimiento',
      description: 'Clases y sesiones diseñadas para optimizar la condición física, fuerza y movilidad a través de disciplinas activas como entrenamiento funcional, boxeo terapéutico, yoga y pilates.',
      highlights: ['Control motor & estabilidad', 'Boxeo cardiovascular', 'Prevención de lesiones'],
      accentColor: 'from-[#E4B04A]/20 to-[#E4B04A]/5',
      badge: 'Movimiento Activo'
    }
  ];

  return (
    <section id="especialidades" className="py-20 sm:py-28 bg-slate-50 border-y border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 block mb-2">
            Nuestros 4 Ejes Fundamentales
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
            En qué nos especializamos
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Diseñamos un plan terapéutico donde cada área médica y física trabaja de forma sinérgica
            para acelerar tu evolución hacia una vida activa y plena.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg border border-slate-200 hover:border-indigo-500/60 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  
                  {/* Top Icon and Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 font-heading leading-snug group-hover:text-indigo-600 transition-colors">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {pillar.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Bottom CTA */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => onOpenSpecialtyModal(pillar.title)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Más información</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">¿No estás seguro de qué especialidad necesitas?</h4>
              <p className="text-xs text-slate-500">Nuestro equipo médico te orienta en una evaluación inicial 360° para armar tu plan a medida.</p>
            </div>
          </div>
          <button
            onClick={onBookAppointment}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer transition-all"
          >
            <span>Solicitar Orientación Médica</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
