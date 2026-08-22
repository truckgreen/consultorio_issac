import React from 'react';
import { X, Award, Calendar, Stethoscope, CheckCircle2 } from 'lucide-react';
import { TeamMember } from '../types';

interface TeamDetailModalProps {
  member: TeamMember | null;
  onClose: () => void;
  onBookSpecialist: (serviceId?: string) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  member,
  onClose,
  onBookSpecialist,
}) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative h-64 overflow-hidden bg-slate-200 dark:bg-slate-800">
          <img
            src={member.imageUrl}
            alt={member.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs uppercase tracking-wider">
              {member.role}
            </span>
            <h2 className="text-2xl font-black mt-2">
              {member.name}
            </h2>
            <p className="text-xs text-amber-300 font-semibold mt-0.5">
              {member.credentials}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              Área de Enfoque Clínico
            </h3>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {member.specialty}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Perfil Profesional & Experiencia
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {member.bio}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-amber-900 dark:text-amber-200">Atención Personalizada 1 a 1:</span> Cada sesión se programa de manera exclusiva garantizando enfoque total en tu rehabilitación.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                onBookSpecialist(member.relatedServiceId);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Consulta</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
