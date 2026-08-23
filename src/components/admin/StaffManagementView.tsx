import React, { useState } from 'react';
import { 
  Stethoscope, 
  UserCheck, 
  Clock, 
  Calendar, 
  Phone, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Search
} from 'lucide-react';
import { TeamMember, Appointment } from '../../types';
import { TEAM_MEMBERS } from '../../data/equilibraData';

interface StaffManagementViewProps {
  appointments: Appointment[];
  onOpenNewAppointmentForStaff: (staffName: string) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  appointments,
  onOpenNewAppointmentForStaff,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [staffStatuses, setStaffStatuses] = useState<{ [id: string]: 'disponible' | 'en_consulta' | 'de_guardia' | 'descanso' }>({
    'isaac-jewsiejew': 'disponible',
    'marivid-requena': 'disponible',
    'laury-torrealba': 'en_consulta',
    'stephani-salina': 'disponible',
    'ruben-torrealba': 'de_guardia',
    'cristina-flores': 'disponible',
    'indira-acevedo': 'disponible',
    'juan-alzualde': 'disponible',
    'rebecca-triana': 'disponible'
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStatusChange = (id: string, newStatus: any) => {
    setStaffStatuses(prev => ({
      ...prev,
      [id]: newStatus
    }));
  };

  const filteredStaff = TEAM_MEMBERS.filter(member => {
    const search = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(search) ||
      member.role.toLowerCase().includes(search) ||
      member.specialty.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Stethoscope className="w-6 h-6 text-amber-500" />
            <span>Equipo Médico & Personal Especialista</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de disponibilidad, asignación de pacientes y turnos de los 9 profesionales
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <UserCheck className="w-4 h-4" />
          <span>9 Profesionales Activos</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por especialista, rol o especialidad médica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(member => {
          const currentStatus = staffStatuses[member.id] || 'disponible';
          const assignedApps = appointments.filter(
            a => a.specialist_name?.toLowerCase().includes(member.name.toLowerCase()) ||
                 a.specialist_id === member.id
          );
          const todayApps = assignedApps.filter(a => a.fecha === todayStr);

          return (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors"
            >
              <div className="space-y-3">
                
                {/* Photo & Role */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
                      {member.role}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {member.credentials}
                    </p>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Estado:</span>
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(member.id, e.target.value)}
                    className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${
                      currentStatus === 'disponible'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        : currentStatus === 'en_consulta'
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
                        : currentStatus === 'de_guardia'
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300'
                    }`}
                  >
                    <option value="disponible">🟢 Disponible</option>
                    <option value="en_consulta">🔵 En Consulta</option>
                    <option value="de_guardia">🟡 De Guardia</option>
                    <option value="descanso">⚪ En Descanso</option>
                  </select>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {member.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px]">Citas Hoy</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{todayApps.length} pacientes</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px]">Total Histórico</span>
                    <span className="font-bold text-slate-900 dark:text-white">{assignedApps.length} citas</span>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <button
                onClick={() => onOpenNewAppointmentForStaff(member.name)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-amber-500 dark:hover:bg-amber-400 text-xs font-bold transition-colors shadow-sm"
              >
                + Asignar Paciente a {member.name.split(' ')[0]}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
