import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Stethoscope, 
  Plus,
  PhoneCall,
  Activity
} from 'lucide-react';
import { PatientRecord, Appointment } from '../../types';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord | null;
  patientAppointments: Appointment[];
  onOpenNewAppointmentForPatient: (patient: PatientRecord) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  patientAppointments,
  onOpenNewAppointmentForPatient,
}) => {
  if (!isOpen || !patient) return null;

  const handleWhatsApp = () => {
    const clean = patient.telefono.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hola ${patient.nombre}, te saludamos de EQUILIBRA Sabana Grande. ¿Cómo te has sentido con tu plan de rehabilitación?`);
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {patient.nombre} {patient.apellido}
              </h2>
              <p className="text-xs text-slate-500">
                Expediente Clínico de Fisioterapia & Rehabilitación
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact & Summary Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Datos de Contacto
            </h4>
            <p className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>{patient.telefono}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400 truncate">
              <Mail className="w-4 h-4 text-amber-500" />
              <span>{patient.email}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Resumen Clínico
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Sesiones:</span>
              <span className="font-bold text-slate-900 dark:text-white">{patient.totalAppointments} citas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Invertido:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">${patient.totalSpent} USD</span>
            </div>
          </div>
        </div>

        {/* Medical & Evolution Notes */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1.5 text-xs">
          <h4 className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Notas de Evolución y Diagnóstico</span>
          </h4>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
            "{patient.clinicalNotes}"
          </p>
        </div>

        {/* History of Appointments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>Historial de Citas ({patientAppointments.length})</span>
            </h4>

            <button
              onClick={() => {
                onOpenNewAppointmentForPatient(patient);
                onClose();
              }}
              className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Nueva Cita</span>
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {patientAppointments.map(app => (
              <div
                key={app.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {app.code}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {app.service_title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{app.fecha} • {app.hora}</span>
                    <span>•</span>
                    <span>Esp: {app.specialist_name || 'Asignado'}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    app.status === 'CONFIRMADA'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : app.status === 'COMPLETADA'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {app.status}
                  </span>
                  <span className="block font-bold text-slate-700 dark:text-slate-300 text-xs mt-1">
                    ${app.amount || 35} USD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contactar por WhatsApp</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-amber-500 transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>

      </div>
    </div>
  );
};
