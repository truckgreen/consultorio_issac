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
  ExternalLink,
  UploadCloud,
  Edit3,
  Trash2,
  Eye,
  FileCheck,
  HeartPulse,
  Filter,
  ShieldCheck,
  BadgeAlert
} from 'lucide-react';
import { Appointment, PatientRecord, MedicalRecordDocument } from '../../types';

interface PatientsDirectoryViewProps {
  patients: PatientRecord[];
  appointments: Appointment[];
  onSelectPatientFile: (patient: PatientRecord, patientAppointments: Appointment[]) => void;
  onOpenNewAppointmentModal: () => void;
  onOpenCreatePatient: () => void;
  onOpenEditPatient: (patient: PatientRecord) => void;
  onOpenDeletePatient: (patient: PatientRecord) => void;
  onOpenUploadPdf: (patient: PatientRecord) => void;
  onViewPdfDocument: (doc: MedicalRecordDocument, patient: PatientRecord) => void;
}

export const PatientsDirectoryView: React.FC<PatientsDirectoryViewProps> = ({
  patients,
  appointments,
  onSelectPatientFile,
  onOpenNewAppointmentModal,
  onOpenCreatePatient,
  onOpenEditPatient,
  onOpenDeletePatient,
  onOpenUploadPdf,
  onViewPdfDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'with-pdf' | 'with-appointments' | 'new'>('all');

  // Filter patients based on search and category
  const filteredPatients = patients.filter(p => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      p.nombre.toLowerCase().includes(search) ||
      p.apellido.toLowerCase().includes(search) ||
      (p.cedula && p.cedula.toLowerCase().includes(search)) ||
      p.telefono.includes(search) ||
      p.email.toLowerCase().includes(search) ||
      (p.medicalConditions && p.medicalConditions.toLowerCase().includes(search));

    if (!matchesSearch) return false;

    if (filterCategory === 'with-pdf') {
      return p.documents && p.documents.length > 0;
    }
    if (filterCategory === 'with-appointments') {
      return (p.totalAppointments || 0) > 0;
    }
    if (filterCategory === 'new') {
      return (p.completedAppointments || 0) === 0;
    }
    return true;
  });

  const totalPatientsWithPdf = patients.filter(p => p.documents && p.documents.length > 0).length;
  const totalPdfFiles = patients.reduce((acc, p) => acc + (p.documents?.length || 0), 0);

  const handleWhatsApp = (phone: string, name: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hola ${name}, te saludamos del equipo médico de EQUILIBRA en Sabana Grande. ¿Cómo ha sido tu evolución tras las sesiones de rehabilitación?`
    );
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Directorio de Pacientes & Expedientes Clínicos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gestión integral de expedientes, evolución médica y registros en PDF de EQUILIBRA
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenCreatePatient}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-black shadow-md shadow-amber-500/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrar Nuevo Paciente</span>
          </button>

          <button
            onClick={onOpenNewAppointmentModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total Pacientes</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{patients.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Expedientes con PDF</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {totalPatientsWithPdf} <span className="text-xs font-normal text-slate-400">({totalPdfFiles} docs)</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Sesiones Clínicas</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{appointments.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Historias Digitales</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">100% Activas</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar paciente por nombre, apellido, cédula, teléfono, email o diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
              filterCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Todos ({patients.length})
          </button>

          <button
            onClick={() => setFilterCategory('with-pdf')}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterCategory === 'with-pdf'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Con PDFs ({totalPatientsWithPdf})</span>
          </button>

          <button
            onClick={() => setFilterCategory('with-appointments')}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
              filterCategory === 'with-appointments'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Con Citas
          </button>

          <button
            onClick={() => setFilterCategory('new')}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
              filterCategory === 'new'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Nuevos Ingresos
          </button>
        </div>
      </div>

      {/* Empty Search State */}
      {filteredPatients.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No se encontraron pacientes con los criterios indicados
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Prueba con otro término de búsqueda o registra un nuevo paciente.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
            >
              Restablecer Filtros
            </button>
            <button
              onClick={onOpenCreatePatient}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20"
            >
              + Registrar Paciente
            </button>
          </div>
        </div>
      )}

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map(patient => {
          const patientApps = appointments.filter(
            a =>
              ((a.nombre || '').toLowerCase().trim() === (patient.nombre || '').toLowerCase().trim() &&
               (a.apellido || '').toLowerCase().trim() === (patient.apellido || '').toLowerCase().trim()) ||
              (a.telefono && patient.telefono && a.telefono.replace(/\D/g, '') === patient.telefono.replace(/\D/g, ''))
          );

          const docsCount = patient.documents?.length || 0;

          return (
            <div
              key={patient.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                
                {/* Top Row: Avatar, Name, and Quick Edit/Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-black text-base flex items-center justify-center shrink-0">
                      {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {patient.nombre} {patient.apellido}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                        {patient.cedula && <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{patient.cedula}</span>}
                        {patient.cedula && <span>•</span>}
                        {patient.edad && <span>{patient.edad} años</span>}
                        <span>•</span>
                        <span>{patient.lastVisit ? `Última: ${patient.lastVisit}` : 'Nuevo'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Header action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenEditPatient(patient)}
                      title="Editar ficha"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenDeletePatient(patient)}
                      title="Eliminar paciente"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

                {/* Medical Condition & Clinical Highlight */}
                {patient.medicalConditions && (
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] space-y-0.5">
                    <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" />
                      <span>Diagnóstico / Motivo</span>
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 line-clamp-2 font-medium">
                      {patient.medicalConditions}
                    </p>
                  </div>
                )}

                {/* PDF Documents Section on the card */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-500" />
                      <span>Expedientes PDF ({docsCount})</span>
                    </span>

                    <button
                      onClick={() => onOpenUploadPdf(patient)}
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>+ Subir PDF</span>
                    </button>
                  </div>

                  {docsCount > 0 ? (
                    <div className="space-y-1.5">
                      {patient.documents!.slice(0, 2).map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => onViewPdfDocument(doc, patient)}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:border-amber-500/60 transition-all text-[11px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {doc.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold shrink-0 ml-1">
                            Ver PDF →
                          </span>
                        </div>
                      ))}
                      {docsCount > 2 && (
                        <p
                          onClick={() => onSelectPatientFile(patient, patientApps)}
                          className="text-[10px] text-slate-400 text-center cursor-pointer hover:text-amber-500 pt-0.5"
                        >
                          + {docsCount - 2} documentos más en el expediente
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Sin informes PDF anexados aún.
                    </p>
                  )}
                </div>

                {/* Metrics Footer (Spent and Appointments) */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[9px]">Total Invertido</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ${patient.totalSpent || 0} USD
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[9px]">Citas en Agenda</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {patientApps.length} {patientApps.length === 1 ? 'cita' : 'citas'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons: WhatsApp & Ver Expediente */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleWhatsApp(patient.telefono, patient.nombre)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onSelectPatientFile(patient, patientApps)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-amber-600 dark:hover:bg-amber-400 text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm"
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
