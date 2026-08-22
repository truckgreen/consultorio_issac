import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Clock, 
  DollarSign, 
  Activity, 
  UserPlus, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Appointment, PatientRecord } from '../../types';

interface PatientsDirectoryViewProps {
  appointments: Appointment[];
  onSelectPatientFile: (patient: PatientRecord, patientAppointments: Appointment[]) => void;
  onOpenNewAppointmentModal: () => void;
}

export const PatientsDirectoryView: React.FC<PatientsDirectoryViewProps> = ({
  appointments,
  onSelectPatientFile,
  onOpenNewAppointmentModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregate patients from appointments
  const patientsMap = new Map<string, PatientRecord>();

  appointments.forEach(app => {
    const key = `${app.nombre.trim().toLowerCase()}_${app.apellido.trim().toLowerCase()}`;
    const existing = patientsMap.get(key);

    if (!existing) {
      patientsMap.set(key, {
        id: `pat_${key}`,
        nombre: app.nombre,
        apellido: app.apellido,
        telefono: app.telefono,
        email: app.email,
        totalAppointments: 1,
        completedAppointments: app.status === 'COMPLETADA' ? 1 : 0,
        lastVisit: app.fecha,
        totalSpent: app.status !== 'CANCELADA' ? (app.amount || 35) : 0,
        firstVisitDate: app.fecha,
        clinicalNotes: app.notes || app.motivo || 'Paciente regular de fisioterapia y rehabilitación en EQUILIBRA.'
      });
    } else {
      existing.totalAppointments += 1;
      if (app.status === 'COMPLETADA') existing.completedAppointments += 1;
      if (app.fecha > existing.lastVisit) existing.lastVisit = app.fecha;
      if (app.fecha < existing.firstVisitDate) existing.firstVisitDate = app.fecha;
      if (app.status !== 'CANCELADA') existing.totalSpent += (app.amount || 35);
      if (app.notes && !existing.clinicalNotes?.includes(app.notes)) {
        existing.clinicalNotes = `${existing.clinicalNotes} | ${app.notes}`;
      }
    }
  });

  const patientsList = Array.from(patientsMap.values());

  const filteredPatients = patientsList.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(search) ||
      p.apellido.toLowerCase().includes(search) ||
      p.telefono.includes(search) ||
      p.email.toLowerCase().includes(search)
    );
  });

  const handleWhatsApp = (phone: string, name: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hola ${name}, te saludamos del equipo médico de EQUILIBRA en Sabana Grande. ¿Cómo ha sido tu evolución tras las sesiones de rehabilitación?`);
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Directorio de Pacientes & Expedientes Clínicos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {patientsList.length} pacientes registrados en el sistema de EQUILIBRA
          </p>
        </div>

        <button
          onClick={onOpenNewAppointmentModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Agendar para Paciente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map(patient => {
          const patientApps = appointments.filter(
            a => a.nombre.toLowerCase() === patient.nombre.toLowerCase() && a.apellido.toLowerCase() === patient.apellido.toLowerCase()
          );

          return (
            <div
              key={patient.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Top Row: Avatar & Name */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-black text-base flex items-center justify-center shrink-0">
                      {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {patient.nombre} {patient.apellido}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        <span>Última visita: {patient.lastVisit}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    {patient.totalAppointments} {patient.totalAppointments === 1 ? 'cita' : 'citas'}
                  </span>
                </div>

                {/* Contact details */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.telefono}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{patient.email}</span>
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px]">Total Invertido</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${patient.totalSpent} USD</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px]">Atendidas</span>
                    <span className="font-bold text-slate-900 dark:text-white">{patient.completedAppointments} sesiones</span>
                  </div>
                </div>

                {/* Medical note snippet */}
                {patient.clinicalNotes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/40 dark:border-amber-900/30">
                    "{patient.clinicalNotes}"
                  </p>
                )}

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleWhatsApp(patient.telefono, patient.nombre)}
                  className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onSelectPatientFile(patient, patientApps)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-amber-600 dark:hover:bg-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver Expediente</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
