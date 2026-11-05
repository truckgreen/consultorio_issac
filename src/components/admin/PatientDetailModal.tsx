import React, { useState, useMemo } from 'react';
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
  BadgeAlert,
  ArrowUpDown,
  Flame,
  Dumbbell,
  Check,
  Copy,
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { PatientRecord, Appointment, MedicalRecordDocument, ClinicalTimelineEvent } from '../../types';
import {
  formatPatientDisplayId,
  filterAppointmentsForPatient,
  calculatePatientAppointmentStats,
  extractClinicalTimeline,
  saveStoredPatient,
} from '../../utils/patientUtils';
import { saveAppointmentToStorage } from '../../utils/bookingUtils';

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
  onPatientUpdated?: (patient: PatientRecord) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  patientAppointments = [],
  onOpenNewAppointmentForPatient,
  onOpenEditPatient,
  onOpenDeletePatient,
  onOpenUploadPdf,
  onViewPdfDocument,
  onDeletePdfDocument,
  onPatientUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'expediente' | 'documentos' | 'citas'>('timeline');
  const [timelineSort, setTimelineSort] = useState<'desc' | 'asc'>('desc');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'evoluciones' | 'sesiones'>('all');
  const [copiedId, setCopiedId] = useState(false);

  // Quick form state to add a new clinical evolution note directly
  const [isAddingEvolution, setIsAddingEvolution] = useState(false);
  const [newNoteDate, setNewNoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newNoteSpecialist, setNewNoteSpecialist] = useState('Lic. Isaac Jewsiejew');
  const [newNotePainScore, setNewNotePainScore] = useState<number>(3);
  const [newNoteText, setNewNoteText] = useState('');
  const [newExercisesInput, setNewExercisesInput] = useState('');
  const [quickExercises, setQuickExercises] = useState<string[]>([]);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Compute matched appointments and stats
  const matchedAppointments = useMemo(() => {
    if (!patient) return [];
    return filterAppointmentsForPatient(patient, patientAppointments);
  }, [patient, patientAppointments]);

  const stats = useMemo(() => {
    if (!patient) {
      return {
        totalBooked: 0,
        completed: 0,
        confirmed: 0,
        pending: 0,
        canceled: 0,
        rescheduled: 0,
        noShow: 0,
        attendanceRate: 100,
        totalSpent: 0,
      };
    }
    return calculatePatientAppointmentStats(patient, matchedAppointments);
  }, [patient, matchedAppointments]);

  // Extract chronological timeline events
  const timelineEvents = useMemo(() => {
    if (!patient) return [];
    const all = extractClinicalTimeline(patient, matchedAppointments, timelineSort);
    if (timelineFilter === 'evoluciones') {
      return all.filter((e) => e.type === 'evolucion' || e.type === 'evaluacion_inicial' || Boolean(e.evolutionNotes));
    }
    if (timelineFilter === 'sesiones') {
      return all.filter((e) => e.type === 'sesion' || e.status === 'COMPLETADA' || e.status === 'completada');
    }
    return all;
  }, [patient, matchedAppointments, timelineSort, timelineFilter]);

  if (!isOpen || !patient) return null;

  const displayId = formatPatientDisplayId(patient.id);

  const handleCopyId = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(displayId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

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

  const getEvaColorClass = (score?: number) => {
    if (score === undefined || score === null) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    if (score === 0) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
    if (score <= 3) return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
    if (score <= 6) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
  };

  const getEvaLabel = (score?: number) => {
    if (score === undefined || score === null) return 'No registrado';
    if (score === 0) return 'Sin Dolor (0/10)';
    if (score <= 3) return `Dolor Leve (${score}/10)`;
    if (score <= 6) return `Dolor Moderado (${score}/10)`;
    return `Dolor Severo (${score}/10)`;
  };

  const handleAddQuickExercise = (ex: string) => {
    if (!quickExercises.includes(ex)) {
      setQuickExercises([...quickExercises, ex]);
    }
  };

  const handleRemoveQuickExercise = (ex: string) => {
    setQuickExercises(quickExercises.filter((e) => e !== ex));
  };

  const handleSaveEvolutionNote = () => {
    if (!newNoteText.trim()) return;
    setIsSavingNote(true);

    try {
      const allExercises = [
        ...quickExercises,
        ...(newExercisesInput.trim() ? newExercisesInput.split(',').map((s) => s.trim()).filter(Boolean) : [])
      ];

      // Update patient clinical notes summary
      const updatedNotes = patient.clinicalNotes
        ? `${patient.clinicalNotes}\n[${newNoteDate} - ${newNoteSpecialist}]: ${newNoteText.trim()}`
        : `[${newNoteDate} - ${newNoteSpecialist}]: ${newNoteText.trim()}`;

      const updatedPatient: PatientRecord = {
        ...patient,
        clinicalNotes: updatedNotes,
        lastVisit: newNoteDate,
      };

      saveStoredPatient(updatedPatient);

      // Create a virtual appointment / record of this session
      const newEvolutionApp: Appointment = {
        id: `evol_${Date.now()}`,
        code: `EVO-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: patient.id,
        patient_id: patient.id,
        fecha: newNoteDate,
        hora: '10:00 AM',
        nombre: patient.nombre,
        apellido: patient.apellido,
        telefono: patient.telefono,
        email: patient.email,
        serviceId: 'fisioterapia-evolucion',
        service_title: 'Nota de Evolución Clínica',
        serviceTitle: 'Nota de Evolución Clínica',
        specialistName: newNoteSpecialist,
        specialist_name: newNoteSpecialist,
        painScore: newNotePainScore,
        evolutionNotes: newNoteText.trim(),
        homeExercises: allExercises.length > 0 ? allExercises : undefined,
        status: 'COMPLETADA',
        amount: 0,
        createdAt: new Date().toISOString(),
      };

      saveAppointmentToStorage(newEvolutionApp);

      if (onPatientUpdated) {
        onPatientUpdated(updatedPatient);
      }

      // Reset form
      setNewNoteText('');
      setQuickExercises([]);
      setNewExercisesInput('');
      setIsAddingEvolution(false);
    } catch (err) {
      console.error('Error saving evolution note:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-4 max-h-[94vh] flex flex-col">
        
        {/* Header with Patient ID, Avatar, and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                  {patient.nombre} {patient.apellido}
                </h2>
                
                {/* Standardized Patient ID Badge with 1-click copy */}
                <button
                  onClick={handleCopyId}
                  title="Copiar ID del Paciente"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-mono font-black transition-all cursor-pointer"
                >
                  <span>{displayId}</span>
                  {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
                </button>

                {patient.cedula && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    C.I. {patient.cedula}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                <span>Expediente Clínico Digital EQUILIBRA</span>
                {patient.edad && <span>• {patient.edad} años</span>}
                {patient.genero && <span>• ({patient.genero === 'M' ? 'Masc.' : patient.genero === 'F' ? 'Fem.' : 'Otro'})</span>}
                <span>• Tel: {patient.telefono}</span>
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
                <span className="hidden sm:inline">Editar Ficha</span>
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
                title="Archivar paciente"
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

        {/* Real-time Patient Appointment Metrics Dashboard Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs shrink-0">
          {/* 1. Total Citas Agendadas */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span>Citas Agendadas</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {stats.totalBooked}
              </span>
              <span className="text-[10px] text-slate-400">totales</span>
            </div>
          </div>

          {/* 2. Asistidas / Completadas */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Asistidas</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.completed}
              </span>
              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">sesiones</span>
            </div>
          </div>

          {/* 3. Cancelaciones */}
          <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Cancelaciones</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                {stats.canceled}
              </span>
              <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70">
                {stats.canceled === 1 ? 'cita' : 'citas'}
              </span>
            </div>
          </div>

          {/* 4. Reprogramadas */}
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              <span>Reprogramadas</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {stats.rescheduled}
              </span>
              <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">veces</span>
            </div>
          </div>

          {/* 5. Tasa de Cumplimiento / Asistencia */}
          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Asistencia</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {stats.attendanceRate}%
              </span>
              <span className="text-[10px] text-blue-600/70 dark:text-blue-400/70">fidelidad</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Línea de Tiempo de Evolución ({timelineEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('expediente')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'expediente'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Ficha & Diagnóstico</span>
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'documentos'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Registros PDF ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('citas')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'citas'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Historial Citas ({matchedAppointments.length})</span>
          </button>
        </div>

        {/* TAB 1: CHRONOLOGICAL CLINICAL EVOLUTION TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
            {/* Timeline Controls & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Filtrar:</span>
                <button
                  onClick={() => setTimelineFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    timelineFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Todos ({timelineEvents.length})
                </button>
                <button
                  onClick={() => setTimelineFilter('evoluciones')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    timelineFilter === 'evoluciones'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Notas Clínicas
                </button>
                <button
                  onClick={() => setTimelineFilter('sesiones')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    timelineFilter === 'sesiones'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Solo Asistidas
                </button>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setTimelineSort(timelineSort === 'desc' ? 'asc' : 'desc')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
                  title="Cambiar orden cronológico"
                >
                  <ArrowUpDown className="w-3 h-3 text-amber-500" />
                  <span>{timelineSort === 'desc' ? 'Más recientes primero' : 'Más antiguas primero'}</span>
                </button>

                <button
                  onClick={() => setIsAddingEvolution(!isAddingEvolution)}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingEvolution ? 'Cancelar' : '+ Registrar Evolución'}</span>
                </button>
              </div>
            </div>

            {/* Quick Add Evolution Entry Form */}
            {isAddingEvolution && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Registrar Nueva Evolución Clínica para {patient.nombre}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
                    ID: {displayId}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Fecha de la Sesión
                    </label>
                    <input
                      type="date"
                      value={newNoteDate}
                      onChange={(e) => setNewNoteDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Especialista Tratante
                    </label>
                    <input
                      type="text"
                      value={newNoteSpecialist}
                      onChange={(e) => setNewNoteSpecialist(e.target.value)}
                      placeholder="Nombre del especialista"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1 flex items-center justify-between">
                      <span>Escala de Dolor (EVA 0-10)</span>
                      <span className={`px-1.5 py-0.2 rounded font-black text-[10px] ${getEvaColorClass(newNotePainScore)}`}>
                        {newNotePainScore}/10 - {getEvaLabel(newNotePainScore)}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={newNotePainScore}
                      onChange={(e) => setNewNotePainScore(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Nota de Evolución, Movilidad y Hallazgos Físicos
                  </label>
                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Ej: Paciente refiere mejoría en rango de flexión lumbar (80°). Se realizó terapia manual y liberación miofascial..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Prescripción de Ejercicios para el Hogar (Home Exercises)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {['Movilidad escapular 3x12', 'Estiramiento isquiotibial 20s', 'Puente de glúteo 3x10', 'Crioterapia 15 min'].map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => handleAddQuickExercise(ex)}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:border-amber-500 transition-colors"
                      >
                        + {ex}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={newExercisesInput}
                    onChange={(e) => setNewExercisesInput(e.target.value)}
                    placeholder="Escribe otros ejercicios separados por coma..."
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />

                  {quickExercises.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {quickExercises.map((q) => (
                        <span
                          key={q}
                          className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1"
                        >
                          <span>{q}</span>
                          <button type="button" onClick={() => handleRemoveQuickExercise(q)} className="hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingEvolution(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!newNoteText.trim() || isSavingNote}
                    onClick={handleSaveEvolutionNote}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingNote ? 'Guardando...' : 'Guardar Evolución'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Vertical Chronological Timeline Display */}
            {timelineEvents.length === 0 ? (
              <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-sm">
                    No hay registros de evolución aún
                  </h5>
                  <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                    Registra la primera evolución de {patient.nombre} o agenda su sesión de fisioterapia.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingEvolution(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar Primera Nota</span>
                </button>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {timelineEvents.map((event, index) => {
                  const isEvolution = event.type === 'evolucion' || event.type === 'evaluacion_inicial';
                  const isCanceled = event.status === 'CANCELADA' || event.status === 'cancelada';
                  const isRescheduled = event.status === 'REPROGRAMADA' || event.status === 'reprogramada';
                  const isCompleted = event.status === 'COMPLETADA' || event.status === 'completada';

                  return (
                    <div key={event.id || index} className="relative group">
                      {/* Timeline Node Icon Dot */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                          isCanceled
                            ? 'bg-rose-500 border-white dark:border-slate-900 text-white'
                            : isRescheduled
                            ? 'bg-amber-500 border-white dark:border-slate-900 text-slate-950'
                            : isCompleted
                            ? 'bg-emerald-500 border-white dark:border-slate-900 text-white'
                            : 'bg-amber-500 border-white dark:border-slate-900 text-slate-950'
                        }`}
                      >
                        {isCanceled ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : isRescheduled ? (
                          <RotateCcw className="w-3 h-3" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Activity className="w-3 h-3" />
                        )}
                      </div>

                      {/* Timeline Event Card */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2.5 hover:border-amber-500/50 transition-all">
                        
                        {/* Event Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                                {event.title}
                              </span>
                              {event.appointmentCode && (
                                <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/50">
                                  {event.appointmentCode}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>📅 {event.date}</span>
                              {event.time && <span>• ⏰ {event.time}</span>}
                              {event.specialistName && <span>• 👨‍⚕️ {event.specialistName}</span>}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            {/* Pain Score Badge */}
                            {event.painScore !== undefined && event.painScore !== null && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${getEvaColorClass(
                                  event.painScore
                                )}`}
                                title={`Escala de Dolor EVA: ${event.painScore}/10`}
                              >
                                <Flame className="w-3 h-3" />
                                <span>EVA {event.painScore}/10</span>
                              </span>
                            )}

                            {/* Status Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCanceled
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : isRescheduled
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : isCompleted
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {event.status || 'Registrado'}
                            </span>
                          </div>
                        </div>

                        {/* Clinical Evolution Text Note */}
                        {event.evolutionNotes && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed text-xs">
                            <p className="whitespace-pre-line">{event.evolutionNotes}</p>
                          </div>
                        )}

                        {/* Prescribed Home Exercises */}
                        {event.homeExercises && event.homeExercises.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Dumbbell className="w-3 h-3 text-amber-500" />
                              <span>Ejercicios & Tareas Asignadas:</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {event.homeExercises.map((exercise, exIdx) => (
                                <span
                                  key={exIdx}
                                  className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 text-[10px] font-semibold"
                                >
                                  ✓ {exercise}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLINICAL DOSSIER / FICHA & ANTECEDENTES */}
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

            {/* General Clinical Summary */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
              <h4 className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Resumen Clínico Integral</span>
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-line">
                "{patient.clinicalNotes || 'Sin notas registradas.'}"
              </p>
            </div>

          </div>
        )}

        {/* TAB 3: DOCUMENTS & PDFS SECTION */}
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

        {/* TAB 4: APPOINTMENTS HISTORY */}
        {activeTab === 'citas' && (
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>Historial de Citas en EQUILIBRA ({matchedAppointments.length})</span>
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

            {matchedAppointments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                No hay citas agendadas actualmente para este paciente.
              </div>
            ) : (
              <div className="space-y-2">
                {matchedAppointments.map((app) => (
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
                          {app.service_title || app.serviceTitle || 'Fisioterapia'}
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
                          app.status === 'CONFIRMADA' || app.status === 'confirmada'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : app.status === 'COMPLETADA' || app.status === 'completada'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : app.status === 'CANCELADA' || app.status === 'cancelada'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
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
