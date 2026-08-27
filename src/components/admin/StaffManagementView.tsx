import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  UserCheck, 
  Clock, 
  Calendar, 
  Search,
  AlertTriangle,
  UserX,
  CheckCircle2,
  CalendarOff,
  FileText,
  X,
  Edit2
} from 'lucide-react';
import { TeamMember, Appointment, SpecialistAbsence } from '../../types';
import { TEAM_MEMBERS } from '../../data/teamData';
import { 
  getStoredSpecialistsAvailability, 
  saveSpecialistAvailability,
  isSpecialistInactiveOnDate
} from '../../utils/specialistAvailability';

interface StaffManagementViewProps {
  appointments: Appointment[];
  onOpenNewAppointmentForStaff: (staffName: string) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  appointments,
  onOpenNewAppointmentForStaff,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilities, setAvailabilities] = useState<Record<string, SpecialistAbsence>>({});
  const [editingAbsenceMember, setEditingAbsenceMember] = useState<TeamMember | null>(null);

  // Form state for absence/inactive configuration
  const [isInactive, setIsInactive] = useState(false);
  const [reason, setReason] = useState<'enfermedad' | 'vacaciones' | 'permiso' | 'capacitacion' | 'otro'>('enfermedad');
  const [reasonDetails, setReasonDetails] = useState('');
  const [inactiveFrom, setInactiveFrom] = useState('');
  const [inactiveUntil, setInactiveUntil] = useState('');
  const [substituteSpecialistId, setSubstituteSpecialistId] = useState('');
  const [absenceNotes, setAbsenceNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setAvailabilities(getStoredSpecialistsAvailability());
    const handler = () => {
      setAvailabilities(getStoredSpecialistsAvailability());
    };
    window.addEventListener('equilibra_specialist_availability_changed', handler);
    return () => window.removeEventListener('equilibra_specialist_availability_changed', handler);
  }, []);

  const openAbsenceEditor = (member: TeamMember) => {
    setEditingAbsenceMember(member);
    const existing = availabilities[member.id];
    if (existing) {
      setIsInactive(existing.isInactive);
      setReason(existing.reason || 'enfermedad');
      setReasonDetails(existing.reasonDetails || '');
      setInactiveFrom(existing.inactiveFrom || todayStr);
      setInactiveUntil(existing.inactiveUntil || '');
      setSubstituteSpecialistId(existing.substituteSpecialistId || '');
      setAbsenceNotes(existing.notes || '');
    } else {
      setIsInactive(false);
      setReason('enfermedad');
      setReasonDetails('Reposo médico');
      setInactiveFrom(todayStr);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 3);
      setInactiveUntil(nextWeek.toISOString().split('T')[0]);
      setSubstituteSpecialistId('');
      setAbsenceNotes('');
    }
  };

  const handleSaveAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAbsenceMember) return;

    const substitute = TEAM_MEMBERS.find(m => m.id === substituteSpecialistId);

    const absenceData: SpecialistAbsence = {
      isInactive,
      reason,
      reasonDetails: reasonDetails.trim(),
      inactiveFrom: isInactive ? inactiveFrom : undefined,
      inactiveUntil: isInactive ? inactiveUntil : undefined,
      substituteSpecialistId: isInactive && substitute ? substitute.id : undefined,
      substituteSpecialistName: isInactive && substitute ? substitute.name : undefined,
      notes: absenceNotes.trim(),
    };

    saveSpecialistAvailability(editingAbsenceMember.id, absenceData);
    setAvailabilities(getStoredSpecialistsAvailability());
    setEditingAbsenceMember(null);
  };

  const handleQuickToggleInactive = (member: TeamMember, setOff: boolean) => {
    if (setOff) {
      openAbsenceEditor(member);
    } else {
      saveSpecialistAvailability(member.id, {
        isInactive: false,
        reason: undefined,
        reasonDetails: undefined,
        inactiveFrom: undefined,
        inactiveUntil: undefined,
      });
      setAvailabilities(getStoredSpecialistsAvailability());
    }
  };

  const filteredStaff = TEAM_MEMBERS.filter(member => {
    const search = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(search) ||
      member.role.toLowerCase().includes(search) ||
      member.specialty.toLowerCase().includes(search)
    );
  });

  const inactiveCount = TEAM_MEMBERS.filter(m => isSpecialistInactiveOnDate(m.id, todayStr)).length;
  const activeCount = TEAM_MEMBERS.length - inactiveCount;

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
            Control de disponibilidad, asignación de pacientes, reposos médicos e inactividad temporal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <UserCheck className="w-4 h-4" />
            <span>{activeCount} Activos</span>
          </div>
          {inactiveCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
              <CalendarOff className="w-4 h-4" />
              <span>{inactiveCount} en Reposo/Ausente</span>
            </div>
          )}
        </div>
      </div>

      {/* Info notice about inactive specialists */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Gestión de Inactividad & Reposo Médico en Tiempo Real:</p>
          <p className="text-slate-600 dark:text-slate-300">
            Cuando marques a un especialista como <strong>Inactivo (Enfermedad / Reposo / Vacaciones)</strong> y fijes sus fechas de ausencia, la página web y el sistema de reservas notificarán automáticamente a los pacientes y reasignarán los servicios a los especialistas de apoyo disponibles durante esos días.
          </p>
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
          const absence = availabilities[member.id];
          const isCurrentlyInactive = isSpecialistInactiveOnDate(member.id, todayStr);
          
          const assignedApps = appointments.filter(
            a => a.specialist_name?.toLowerCase().includes(member.name.toLowerCase()) ||
                 a.specialist_id === member.id
          );
          const todayApps = assignedApps.filter(a => a.fecha === todayStr);

          return (
            <div
              key={member.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                isCurrentlyInactive 
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <div className="space-y-3">
                
                {/* Photo, Role & Inactive Badge */}
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={member.imageUrl || '/imagenes/equipo/isaac.jpg'}
                      alt={member.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30 shrink-0 shadow-sm"
                    />
                    <span 
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        isCurrentlyInactive ? 'bg-rose-500' : 'bg-emerald-500'
                      }`} 
                      title={isCurrentlyInactive ? 'Inactivo / Reposo Médico' : 'Disponible'}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
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

                {/* Status Indicator & Inactive Toggle */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Estado Clínico:</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isCurrentlyInactive 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {isCurrentlyInactive ? '🔴 Inactivo / Reposo' : '🟢 Activo / Disponible'}
                    </span>
                  </div>

                  {isCurrentlyInactive && absence && (
                    <div className="pt-2 border-t border-rose-200/50 dark:border-rose-900/40 text-[11px] text-rose-900 dark:text-rose-200 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <CalendarOff className="w-3.5 h-3.5 text-rose-600" />
                        <span>{absence.reasonDetails || (absence.reason === 'enfermedad' ? 'Reposo Médico' : 'Ausencia temporal')}</span>
                      </div>
                      {absence.inactiveFrom && absence.inactiveUntil && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Periodo: {absence.inactiveFrom} al {absence.inactiveUntil}
                        </p>
                      )}
                      {absence.substituteSpecialistName && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Suplente: {absence.substituteSpecialistName}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => openAbsenceEditor(member)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isCurrentlyInactive ? 'Modificar Reposo' : 'Establecer Reposo / Ausencia'}</span>
                    </button>
                    {isCurrentlyInactive && (
                      <button
                        type="button"
                        onClick={() => handleQuickToggleInactive(member, false)}
                        className="py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-colors"
                        title="Reactivar disponibilidad de inmediato"
                      >
                        Reactivar
                      </button>
                    )}
                  </div>
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
                disabled={isCurrentlyInactive}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm ${
                  isCurrentlyInactive 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-amber-500 dark:hover:bg-amber-400'
                }`}
              >
                {isCurrentlyInactive ? 'Especialista en Reposo' : `+ Asignar Paciente a ${member.name.split(' ')[0]}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit Absence Modal */}
      {editingAbsenceMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <CalendarOff className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Disponibilidad & Reposo Médico
                </h3>
              </div>
              <button 
                onClick={() => setEditingAbsenceMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAbsence} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configurando para: <strong className="text-slate-900 dark:text-white">{editingAbsenceMember.name}</strong> ({editingAbsenceMember.role})
                </p>
              </div>

              {/* Status Switch */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Marcar como Inactivo</span>
                  <span className="text-[11px] text-slate-500">No disponible para recibir pacientes en la web</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isInactive} 
                    onChange={(e) => setIsInactive(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {isInactive && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Motivo de Ausencia / Reposo:
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="enfermedad">🤒 Reposo Médico / Enfermedad</option>
                      <option value="vacaciones">🏖️ Vacaciones / Días Libres</option>
                      <option value="permiso">📝 Permiso Personal</option>
                      <option value="capacitacion">🎓 Capacitación / Congreso</option>
                      <option value="otro">📋 Otro motivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Detalle del Motivo (se mostrará en alertas del sistema):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Reposo médico por 3 días por cuadro viral"
                      value={reasonDetails}
                      onChange={(e) => setReasonDetails(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required={isInactive}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Desde (Fecha inicio):
                      </label>
                      <input
                        type="date"
                        value={inactiveFrom}
                        onChange={(e) => setInactiveFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required={isInactive}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hasta (Fecha fin):
                      </label>
                      <input
                        type="date"
                        value={inactiveUntil}
                        onChange={(e) => setInactiveUntil(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required={isInactive}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Especialista Suplente / Apoyo (Opcional):
                    </label>
                    <select
                      value={substituteSpecialistId}
                      onChange={(e) => setSubstituteSpecialistId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Seleccionar suplente automático por categoría</option>
                      {TEAM_MEMBERS.filter(m => m.id !== editingAbsenceMember.id).map(alt => (
                        <option key={alt.id} value={alt.id}>
                          {alt.name} ({alt.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAbsenceMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors"
                >
                  Guardar Disponibilidad
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
