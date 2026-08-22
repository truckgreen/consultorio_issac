import React, { useState } from 'react';
import { Users, Sparkles, Award, ArrowUpRight, Calendar } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/equilibraData';
import { TeamMember } from '../types';

interface TeamProps {
  onOpenMemberDetails: (member: TeamMember) => void;
  onBookSpecialistService: (serviceId?: string) => void;
}

export const Team: React.FC<TeamProps> = ({
  onOpenMemberDetails,
  onBookSpecialistService,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todo el Equipo' },
    { id: 'fisioterapia', label: 'Fisioterapeutas' },
    { id: 'medicina', label: 'Traumatología' },
    { id: 'nutricion', label: 'Nutrición' },
    { id: 'psicologia', label: 'Psicología' },
    { id: 'entrenamiento', label: 'Entrenamiento' },
  ];

  const filteredTeam = activeCategory === 'all'
    ? TEAM_MEMBERS
    : TEAM_MEMBERS.filter((m) => m.category === activeCategory);

  return (
    <section id="equipo" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>Especialistas de Excelencia</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Nuestro Equipo Multidisciplinario
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Profesionales altamente calificados y en constante actualización académica, comprometidos con tu bienestar físico y emocional.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-8 pb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Photo & Role Header */}
              <div className="relative h-64 overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                {/* Role Pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                    {member.role}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-amber-300 font-medium mt-0.5">
                    {member.credentials}
                  </p>
                </div>
              </div>

              {/* Bio & Specialty */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Especialidad Principal
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {member.specialty}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed pt-1">
                    {member.bio}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onOpenMemberDetails(member)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    <span>Perfil</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onBookSpecialistService(member.relatedServiceId)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-500/25 transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
