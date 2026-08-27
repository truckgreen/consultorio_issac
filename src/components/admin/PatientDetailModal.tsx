import React, { useState } from 'react';
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
  Activity,
  Edit3,
  Trash2,
  UploadCloud,
  FileCheck,
  Eye,
  Download,
  AlertCircle,
  ShieldCheck,
  MapPin,
  HeartPulse,
  Pill,
  BadgeAlert
} from 'lucide-react';
import { PatientRecord, Appointment, MedicalRecordDocument } from '../../types';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord | null;
  patientAppointments: Appointment[];
  onOpenNewAppointmentForPatient: (patient: PatientRecord) => void;
  onOpenEditPatient?: (patient: PatientRecord) => void;
  onOpenDeletePatient?: (patient: PatientRecord) => void;
  onOpenUploadPdf?: (patient: PatientRecord) => void;
  onViewPdfDocument?: (doc: MedicalRecordDocument, patient: PatientRecord) => void;
  onDeletePdfDocument?: (patientId: string, docId: string) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  patientAppointments,
  onOpenNewAppointmentForPatient,
  onOpenEditPatient,
  onOpenDeletePatient,
  onOpenUploadPdf,
  onViewPdfDocument,
  onDeletePdfDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'expediente' | 'documentos' | 'citas'>('documentos');

  if (!isOpen || !patient) return null;

  const handleWhatsApp = () => {
    const clean = patient.telefono.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hola ${patient.nombre}, te saludamos del equipo médico de EQUILIBRA Sabana Grande. ¿Cómo te has sentido con tu plan de rehabilitación y evolución?`
    );
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  const documents = patient.documents || [];

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'informe':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
      case 'resonancia':
      case 'radiografia':
      case 'tomografia':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200';
      case 'laboratorio':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'receta':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'informe': return 'Informe Clínico';
      case 'resonancia': return 'Resonancia (RM)';
      case 'radiografia': return 'Radiografía (RX)';
      case 'laboratorio': return 'Laboratorio';
      case 'receta': return 'Receta / Indicación';
      case 'consentimiento': return 'Consentimiento';
      default: return 'Estudio PDF';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header with Avatar, Details and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                  {patient.nombre} {patient.apellido}
                </h2>
                {patient.cedula && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    {patient.cedula}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>Expediente Clínico Digital EQUILIBRA</span>
                {patient.edad && <span>• {patient.edad} años</span>}
                {patient.genero && <span>• ({patient.genero === 'M' ? 'Masc.' : patient.genero === 'F' ? 'Fem.' : 'Otro'})</span>}
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {onOpenEditPatient && (
              <button
                onClick={() => onOpenEditPatient(patient)}
                title="Editar datos del paciente"
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}

            {onOpenUploadPdf && (
              <button
                onClick={() => onOpenUploadPdf(patient)}
                title="Subir documento o informe PDF"
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>+ Subir PDF</span>
              </button>
            )}

            {onOpenDeletePatient && (
              <button
                onClick={() => onOpenDeletePatient(patient)}
                title="Eliminar paciente"
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              title="Cerrar ventana"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'documentos'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Registros Médicos PDF ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('expediente')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'expediente'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Ficha & Diagnóstico</span>
          </button>

          <button
            onClick={() => setActiveTab('citas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'citas'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Historial de Citas ({patientAppointments.length})</span>
          </button>
        </div>

        {/* Tab 1: Documents & PDFs Section */}
        {activeTab === 'documentos' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-amber-500" />
                  <span>Documentos & Informes en Formato PDF</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Resonancias, radiografías, informes médicos y recetas anexadas a la ficha.
                </p>
              </div>

              {onOpenUploadPdf && (
                <button
                  onClick={() => onOpenUploadPdf(patient)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subir PDF</span>
                </button>
              )}
            </div>

            {documents.length === 0 ? (
              <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-sm">
                    No hay registros médicos PDF adjuntos
                  </h5>
                  <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                    Puedes adjuntar informes traumatológicos, resonancias magnéticas, radiografías o recetas para este paciente.
                  </p>
                </div>
                {onOpenUploadPdf && (
                  <button
                    onClick={() => onOpenUploadPdf(patient)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Subir Primer Registro PDF</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeColor(
                            doc.category
                          )}`}
                        >
                          {getCategoryLabel(doc.category)}
                        </span>
                        <h5 className="font-black text-slate-900 dark:text-white text-sm truncate">
                          {doc.title}
                        </h5>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>📄 {doc.fileName}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                        <span>•</span>
                        <span>📅 {doc.uploadedAt}</span>
                        {doc.uploadedBy && (
                          <>
                            <span>•</span>
                            <span>👨‍⚕️ {doc.uploadedBy}</span>
                          </>
                        )}
                      </p>

                      {doc.specialistNotes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                          "{doc.specialistNotes}"
                        </p>
                      )}
                    </div>

                    {/* Document Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {onViewPdfDocument && (
                        <button
                          onClick={() => onViewPdfDocument(doc, patient)}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver PDF</span>
                        </button>
                      )}

                      <a
                        href={doc.fileData}
                        download={doc.fileName}
                        className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition-colors"
                        title="Descargar archivo PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {onDeletePdfDocument && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar el archivo "${doc.title}"?`)) {
                              onDeletePdfDocument(patient.id, doc.id);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Clinical Dossier / Ficha & Contact */}
        {activeTab === 'expediente' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
            
            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                {patient.direccion && (
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{patient.direccion}</span>
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Contacto de Emergencia
                </h4>
                {patient.contactoEmergencia ? (
                  <>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {patient.contactoEmergencia.nombre} ({patient.contactoEmergencia.parentesco})
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      📞 {patient.contactoEmergencia.telefono}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 italic">No registrado</p>
                )}
              </div>
            </div>

            {/* Pathologies & Allergies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Diagnóstico / Motivo</span>
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold">
                  {patient.medicalConditions || 'Sin condición registrada.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-1">
                <span className="font-bold text-red-800 dark:text-red-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <BadgeAlert className="w-3.5 h-3.5" />
                  <span>Alergias</span>
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold">
                  {patient.alergias || 'Ninguna conocida.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                <span className="font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5" />
                  <span>Medicamentos</span>
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold">
                  {patient.medicamentosActuales || 'Ninguno.'}
                </p>
              </div>
            </div>

            {/* Antecedents */}
            {patient.antecedentes && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Antecedentes Quirúrgicos & Traumatológicos
                </span>
                <p className="text-slate-800 dark:text-slate-200">
                  {patient.antecedentes}
                </p>
              </div>
            )}

            {/* Evolution Notes */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
              <h4 className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Notas Clínicas de Fisioterapia & Evolución</span>
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{patient.clinicalNotes || 'Sin notas registradas.'}"
              </p>
            </div>

          </div>
        )}

        {/* Tab 3: Appointments History */}
        {activeTab === 'citas' && (
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>Historial de Sesiones en EQUILIBRA ({patientAppointments.length})</span>
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

            {patientAppointments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                No hay citas agendadas actualmente para este paciente.
              </div>
            ) : (
              <div className="space-y-2">
                {patientAppointments.map((app) => (
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
                          {app.service_title || app.serviceTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{app.fecha} • {app.hora}</span>
                        <span>•</span>
                        <span>Esp: {app.specialist_name || app.specialistName || 'Asignado'}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'CONFIRMADA'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : app.status === 'COMPLETADA'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {app.status}
                      </span>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ${app.amount || 35} USD
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={handleWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contactar por WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenNewAppointmentForPatient(patient);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Cita</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
