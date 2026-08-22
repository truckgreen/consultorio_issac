import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Award,
  Calendar,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Brain,
  Apple,
  Dumbbell,
  ArrowRight,
  UserCheck,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { TEAM_MEMBERS } from '../data/teamData';
import { TeamMember } from '../types';

interface TeamSectionProps {
  onOpenBooking: (serviceId?: string) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onOpenBooking }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const categories = [
    { id: 'todos', label: 'Todo el Equipo (9)' },
    { id: 'fisioterapia', label: 'Fisioterapia' },
    { id: 'medicina', label: 'Traumatología' },
    { id: 'nutricion', label: 'Nutrición' },
    { id: 'psicologia', label: 'Psicología' },
    { id: 'entrenamiento', label: 'Boxeo & Movimiento' },
    { id: 'asistencia', label: 'Asistencia Clínica' },
  ];

  const filteredMembers =
    selectedCategory === 'todos'
      ? TEAM_MEMBERS
      : TEAM_MEMBERS.filter((m) => m.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fisioterapia':
        return <HeartPulse className="w-3.5 h-3.5" />;
      case 'medicina':
        return <Stethoscope className="w-3.5 h-3.5" />;
      case 'nutricion':
        return <Apple className="w-3.5 h-3.5" />;
      case 'psicologia':
        return <Brain className="w-3.5 h-3.5" />;
      case 'entrenamiento':
        return <Dumbbell className="w-3.5 h-3.5" />;
      case 'asistencia':
        return <UserCheck className="w-3.5 h-3.5" />;
      default:
        return <Award className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section
      id="equipo"
      className="py-20 lg:py-28 bg-white dark:bg-[#0f141c] relative overflow-hidden transition-colors"
    >
      {/* Background Decorative Blur */}
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Especialistas de Primera Línea</span>
          </div>

          {/* Instagram Title Styling: NUESTRO EQUIPO / FISIOJEWSIJEW */}
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-amber-600 dark:text-amber-400 block">
              Nuestro
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-heading uppercase">
              EQUIPO
            </h2>
            <span className="text-xs sm:text-sm font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block">
              FISIOJEWSIJEW
            </span>
          </div>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Un equipo multidisciplinario listo para acompañarte en cada etapa de tu bienestar: desde el diagnóstico médico y la rehabilitación activa, hasta el rendimiento físico y la salud mental.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`filter-team-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3x3 Responsive Grid of Team Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedMember(member)}
              id={`team-card-${member.id}`}
              className="group cursor-pointer bg-slate-50 dark:bg-[#151c28] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Member Portrait Frame */}
                <div className="relative aspect-[4/4.8] rounded-2xl overflow-hidden mb-4 bg-slate-200 dark:bg-slate-800">
                  <img
                    src={member.image}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Discipline Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 backdrop-blur-md shadow-sm">
                      {getCategoryIcon(member.category)}
                      <span className="capitalize">{member.category}</span>
                    </span>
                  </div>
                </div>

                {/* Name & Role (Exactly formatted as the reference image) */}
                <div className="text-center px-1">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-heading group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {member.specialty}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-amber-700 dark:text-amber-400 font-bold group-hover:underline flex items-center gap-1">
                  <span>Ver perfil y agendar</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[11px] text-slate-400">Sabana Grande</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Multidisciplinary Philosophy Callout */}
        <div className="mt-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-bold bg-white/20 px-3 py-1 rounded-full inline-block">
              Atención 360 Grados
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
              ¿No sabes qué especialista necesitas primero?
            </h3>
            <p className="text-sm text-amber-50 leading-relaxed">
              Nuestro equipo realiza una evaluación integral para canalizar tu caso directamente con el médico, fisioterapeuta, nutricionista o psicólogo adecuado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenBooking('fisioterapia')}
            className="px-6 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-50 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Agendar Evaluación General</span>
          </button>
        </div>
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-[#151c28] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
            >
              <button
                onClick={() => setSelectedMember(null)}
                aria-label="Cerrar modal"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-5">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover object-top shadow-md border-2 border-amber-500"
                />
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                    {selectedMember.credentials || selectedMember.role}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading mt-1">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedMember.role}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Área de Especialidad
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedMember.specialty}
                  </p>
                </div>

                {selectedMember.bio && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Perfil Profesional
                    </span>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                      {selectedMember.bio}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Atención presencial en Sabana Grande, Centro Profesional del Este.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const servId = selectedMember.relatedServiceId || 'fisioterapia';
                    setSelectedMember(null);
                    onOpenBooking(servId);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Cita con {selectedMember.name.split(' ')[0]}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
