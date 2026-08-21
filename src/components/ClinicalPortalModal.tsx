import React, { useState, useEffect } from 'react';
import { PatientRecord, AppointmentBooking, ServiceCategory } from '../types';
import { StorageService } from '../services/storageService';
import { 
  Database, 
  X, 
  Search, 
  UserPlus, 
  Calendar, 
  FileText, 
  Activity, 
  TrendingDown, 
  Plus, 
  Check, 
  AlertCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Smartphone,
  ChevronRight,
  Stethoscope,
  Clock,
  Sparkles,
  Dumbbell,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  PhoneCall,
  Copy,
  Image,
  Video,
  FileCode,
  ExternalLink,
  Wifi
} from 'lucide-react';
import { MEDIA_CONFIG } from '../config/mediaAssets';

interface ClinicalPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPatientMobileApp: (patientCode: string) => void;
}

export const ClinicalPortalModal: React.FC<ClinicalPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenPatientMobileApp
}) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments' | 'database' | 'media_guide'>('patients');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');

  // Selected Patient Detail Modal inside CRM
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  // New Note Form State
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Lic. Mariana Valdés');
  const [newNoteRole, setNewNoteRole] = useState('Fisioterapeuta Principal');
  const [newNotePain, setNewNotePain] = useState<number>(3);
  const [newNoteMobility, setNewNoteMobility] = useState<number>(85);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // New Exercise Form State
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [newExTitle, setNewExTitle] = useState('');
  const [newExSets, setNewExSets] = useState('3 series');
  const [newExReps, setNewExReps] = useState('12 repeticiones');
  const [newExFrequency, setNewExFrequency] = useState('Diario');
  const [newExInstructions, setNewExInstructions] = useState('');

  // Backup import state
  const [importStatus, setImportStatus] = useState<string>('');

  const loadData = () => {
    setPatients(StorageService.getPatients());
    setAppointments(StorageService.getAppointments());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const cleanup = StorageService.onDatabaseChange(() => {
      loadData();
      if (selectedPatient) {
        const refreshed = StorageService.getPatientById(selectedPatient.id);
        if (refreshed) setSelectedPatient(refreshed);
      }
    });
    return cleanup;
  }, [selectedPatient]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.accessCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService = serviceFilter === 'all' || p.service === serviceFilter;
    return matchesSearch && matchesService;
  });

  const handleAddClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newNoteText.trim()) return;

    StorageService.addClinicalNote(selectedPatient.id, {
      author: newNoteAuthor,
      role: newNoteRole,
      note: newNoteText,
      painScore: Number(newNotePain),
      mobilityScore: Number(newNoteMobility)
    });

    setNewNoteText('');
    setShowNoteForm(false);
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newExTitle.trim()) return;

    StorageService.addPatientExercise(selectedPatient.id, {
      title: newExTitle,
      sets: newExSets,
      reps: newExReps,
      frequency: newExFrequency,
      instructions: newExInstructions
    });

    setNewExTitle('');
    setNewExInstructions('');
    setShowExerciseForm(false);
  };

  const handleIncrementSession = (patientId: string) => {
    const patient = StorageService.getPatientById(patientId);
    if (!patient) return;
    const nextSession = Math.min(patient.totalSessions, patient.completedSessions + 1);
    StorageService.updatePatient(patientId, {
      completedSessions: nextSession,
      status: nextSession >= patient.totalSessions ? 'completed' : 'in_progress'
    });
  };

  const handleExportJSON = () => {
    const json = StorageService.exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equilibra-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = StorageService.importDatabaseJSON(content);
      if (success) {
        setImportStatus('✅ Base de datos restaurada correctamente');
        loadData();
      } else {
        setImportStatus('❌ Error al importar archivo JSON');
      }
      setTimeout(() => setImportStatus(''), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      
      <div className="bg-slate-50 rounded-3xl max-w-6xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Top Portal Header */}
        <div className="bg-slate-900 text-white p-5 sm:px-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  EQUILIBRA Cloud Clinical CRM
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Base de Datos Activa
                </span>
              </div>
              <h2 className="text-lg font-bold font-heading">
                Gestión de Pacientes & Seguimiento en Tiempo Real
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Portal Nav Tabs & Stats Bar */}
        <div className="bg-white border-b border-slate-200 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setActiveTab('patients'); setSelectedPatient(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Fichas de Pacientes ({patients.length})
            </button>

            <button
              onClick={() => { setActiveTab('appointments'); setSelectedPatient(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Gestión de Citas Web ({appointments.length})
            </button>

            <button
              onClick={() => { setActiveTab('database'); setSelectedPatient(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Copia de Seguridad & JSON
            </button>

            <button
              onClick={() => { setActiveTab('media_guide'); setSelectedPatient(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'media_guide'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Guía de Videos & Fotos</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronización en Nube Activa
            </span>
            <div>
              <span className="text-slate-400">Pacientes Activos:</span>{' '}
              <strong className="text-slate-900 font-bold">{patients.filter(p => p.status === 'in_progress').length}</strong>
            </div>
            <div>
              <span className="text-slate-400">Citas Hoy:</span>{' '}
              <strong className="text-slate-900 font-bold">4</strong>
            </div>
            <div>
              <span className="text-slate-400">Alivio EVA Medio:</span>{' '}
              <strong className="text-emerald-700 font-bold">-5.2 pts</strong>
            </div>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

          {/* TAB 1: PATIENTS LIST & DETAIL */}
          {activeTab === 'patients' && (
            <>
              {selectedPatient ? (
                /* Patient Full Clinical Dossier */
                <div className="space-y-6 animate-in fade-in">
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Volver al listado de pacientes
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenPatientMobileApp(selectedPatient.accessCode);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Ver Experiencia en App Móvil ({selectedPatient.accessCode})</span>
                    </button>
                  </div>

                  {/* Patient Header Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center font-heading">
                        {selectedPatient.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-bold text-slate-900 font-heading">
                            {selectedPatient.fullName}
                          </h3>
                          <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200">
                            {selectedPatient.accessCode}
                          </span>
                          {selectedPatient.documentId && (
                            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {selectedPatient.documentId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {selectedPatient.email} · {selectedPatient.phone} · {selectedPatient.age} años
                        </p>
                        <div className="text-xs font-medium text-slate-900 pt-1">
                          <span className="text-slate-400">Especialidad:</span> {selectedPatient.service} |{' '}
                          <span className="text-slate-400">Especialista a cargo:</span> {selectedPatient.specialist}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <a
                        href={`tel:${selectedPatient.phone}`}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Llamar al Paciente</span>
                      </a>
                      <button
                        onClick={() => handleIncrementSession(selectedPatient.id)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4 text-indigo-600" />
                        <span>Registrar Sesión (+1)</span>
                      </button>
                    </div>
                  </div>

                  {/* Patient Full Contact & Emergency Details Bar */}
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Teléfonos de Contacto</span>
                      </span>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-900 font-mono flex items-center justify-between">
                          <span>{selectedPatient.phone}</span>
                          <a href={`tel:${selectedPatient.phone}`} className="text-[10px] text-indigo-600 hover:underline">Llamar</a>
                        </div>
                        {selectedPatient.secondaryPhone && (
                          <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
                            <span>Hab: {selectedPatient.secondaryPhone}</span>
                            <a href={`tel:${selectedPatient.secondaryPhone}`} className="text-[10px] text-slate-700 hover:underline">Llamar</a>
                          </div>
                        )}
                        <div className="text-xs text-slate-500 truncate flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="truncate">{selectedPatient.email}</span>
                          <a href={`mailto:${selectedPatient.email}`} className="text-[10px] text-indigo-600 hover:underline ml-1">Email</a>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Contacto de Emergencia</span>
                      </span>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-900">
                          {selectedPatient.emergencyContactName || 'Familiar Registrado'}
                        </div>
                        <div className="text-xs text-amber-950 font-mono font-semibold flex items-center justify-between">
                          <span>{selectedPatient.emergencyContactPhone || selectedPatient.phone}</span>
                          <a href={`tel:${selectedPatient.emergencyContactPhone || selectedPatient.phone}`} className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded font-bold hover:bg-amber-700">Llamar Familiar</a>
                        </div>
                        <div className="text-[11px] text-amber-800 pt-0.5">
                          Parentesco: {selectedPatient.emergencyContactRelation || 'Familiar'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Residencia & Cobertura</span>
                      </span>
                      <div className="space-y-1 text-xs text-slate-700">
                        <div>
                          <strong className="text-slate-900">Dirección:</strong> {selectedPatient.address || 'Caracas, Distrito Capital'}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Tipo Sangre</span>
                            <span className="font-bold text-slate-800">{selectedPatient.bloodType || 'O+'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Seguro Médico</span>
                            <span className="font-bold text-indigo-700">{selectedPatient.insuranceCompany || 'Particular'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinical KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Progreso de Sesiones</span>
                      <div className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
                        {selectedPatient.completedSessions} / {selectedPatient.totalSessions}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {Math.round((selectedPatient.completedSessions / selectedPatient.totalSessions) * 100)}% del protocolo
                      </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Dolor EVA Inicial / Actual</span>
                      <div className="text-2xl font-extrabold text-slate-900 font-heading mt-1 flex items-center gap-2">
                        <span>{selectedPatient.painInitial}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-emerald-600">{selectedPatient.painCurrent}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Alivio de {selectedPatient.painInitial - selectedPatient.painCurrent} puntos
                      </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Movilidad Funcional</span>
                      <div className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
                        {selectedPatient.mobilityProgress}%
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold">
                        Objetivo clínico: 100%
                      </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Próxima Consulta</span>
                      <div className="text-lg font-bold text-slate-900 font-heading mt-1">
                        {selectedPatient.nextAppointmentDate}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {selectedPatient.nextAppointmentTime}
                      </span>
                    </div>
                  </div>

                  {/* Grid of Notes & Prescribed Exercises */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Column 1: Clinical Evolution Notes */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-sm font-bold text-slate-900">Notas de Evolución Médica</h4>
                        </div>
                        <button
                          onClick={() => setShowNoteForm(!showNoteForm)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 cursor-pointer"
                        >
                          {showNoteForm ? 'Cancelar' : '+ Añadir Nota'}
                        </button>
                      </div>

                      {showNoteForm && (
                        <form onSubmit={handleAddClinicalNote} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                          <textarea
                            required
                            rows={3}
                            placeholder="Describa la evolución clínica, respuesta al tratamiento o cambios posturales..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-indigo-600"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Dolor EVA observado (0-10):</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={newNotePain}
                                onChange={(e) => setNewNotePain(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Movilidad estimada (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={newNoteMobility}
                                onChange={(e) => setNewNoteMobility(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 cursor-pointer transition-colors"
                          >
                            Guardar Nota y Sincronizar en App Móvil
                          </button>
                        </form>
                      )}

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {selectedPatient.notes.map((n) => (
                          <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">{n.author} ({n.role})</span>
                              <span className="text-slate-400">{n.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {n.note}
                            </p>
                            {n.painScore !== undefined && (
                              <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-semibold pt-1">
                                <span>EVA: {n.painScore}/10</span>
                                {n.mobilityScore && <span>· Movilidad: {n.mobilityScore}%</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Prescribed Home Exercises */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-sm font-bold text-slate-900">Ejercicios Prescritos para Casa</h4>
                        </div>
                        <button
                          onClick={() => setShowExerciseForm(!showExerciseForm)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 cursor-pointer"
                        >
                          {showExerciseForm ? 'Cancelar' : '+ Prescribir'}
                        </button>
                      </div>

                      {showExerciseForm && (
                        <form onSubmit={handleAddExercise} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                          <input
                            required
                            type="text"
                            placeholder="Nombre del ejercicio (ej. Estiramiento de cadena posterior)"
                            value={newExTitle}
                            onChange={(e) => setNewExTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300"
                          />

                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Series (ej. 3 series)"
                              value={newExSets}
                              onChange={(e) => setNewExSets(e.target.value)}
                              className="px-2 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                            />
                            <input
                              type="text"
                              placeholder="Reps / Tiempo (ej. 15 reps)"
                              value={newExReps}
                              onChange={(e) => setNewExReps(e.target.value)}
                              className="px-2 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                            />
                            <input
                              type="text"
                              placeholder="Frecuencia (ej. Diario)"
                              value={newExFrequency}
                              onChange={(e) => setNewExFrequency(e.target.value)}
                              className="px-2 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                            />
                          </div>

                          <textarea
                            rows={2}
                            placeholder="Instrucciones precisas de ejecución técnica y prevención de dolor..."
                            value={newExInstructions}
                            onChange={(e) => setNewExInstructions(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300"
                          />

                          <button
                            type="submit"
                            className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 cursor-pointer transition-colors"
                          >
                            Asignar a la App Móvil del Paciente
                          </button>
                        </form>
                      )}

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {selectedPatient.exercises.map((ex) => (
                          <div key={ex.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-slate-900">{ex.title}</h5>
                              <span className="text-[10px] text-indigo-600 font-semibold">{ex.sets} · {ex.reps}</span>
                            </div>
                            <p className="text-xs text-slate-600">{ex.instructions}</p>
                            <div className="text-[10px] text-slate-400">Frecuencia: {ex.frequency}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                /* Patients Table Search & Directory */
                <div className="space-y-4 animate-in fade-in">
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar paciente por nombre, código (EQ-XXXX), diagnóstico..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
                      >
                        <option value="all">Todas las especialidades</option>
                        <option value="Fisioterapia Deportiva">Fisioterapia Deportiva</option>
                        <option value="Fisioterapia General">Fisioterapia General</option>
                        <option value="Psicología">Psicología</option>
                        <option value="Traumatología">Traumatología</option>
                        <option value="Nutrición">Nutrición</option>
                      </select>
                    </div>
                  </div>

                  {/* Patients Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3.5 px-4">Código & Paciente</th>
                            <th className="py-3.5 px-4">Especialidad & Diagnóstico</th>
                            <th className="py-3.5 px-4">Sesiones</th>
                            <th className="py-3.5 px-4">Dolor EVA</th>
                            <th className="py-3.5 px-4">Movilidad</th>
                            <th className="py-3.5 px-4">Próxima Cita</th>
                            <th className="py-3.5 px-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredPatients.map((patient) => (
                            <tr
                              key={patient.id}
                              className="hover:bg-slate-50 transition-colors cursor-pointer"
                              onClick={() => setSelectedPatient(patient)}
                            >
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-900 text-indigo-400 font-bold text-xs flex items-center justify-center">
                                    {patient.fullName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">{patient.fullName}</div>
                                    <div className="text-[10px] font-mono text-indigo-600 font-semibold">{patient.accessCode}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900">{patient.service}</div>
                                <div className="text-[11px] text-slate-500 line-clamp-1">{patient.diagnosis}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900">{patient.completedSessions}</span>
                                <span className="text-slate-400">/{patient.totalSessions}</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-emerald-700">{patient.painCurrent}/10</span>
                                  <span className="text-[10px] text-slate-400">(era {patient.painInitial})</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900">{patient.mobilityProgress}%</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-slate-900 font-medium">{patient.nextAppointmentDate}</div>
                                <div className="text-[10px] text-slate-400">{patient.nextAppointmentTime}</div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPatient(patient);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 cursor-pointer"
                                >
                                  Ver Ficha
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

          {/* TAB 2: APPOINTMENTS MANAGEMENT */}
          {activeTab === 'appointments' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Solicitudes de Citas y Turnos Web</h3>
                  <p className="text-xs text-slate-500">
                    Registros automáticos generados por pacientes desde el sitio web de EQUILIBRA.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Paciente & Contacto</th>
                        <th className="py-3.5 px-4">Servicio Solicitado</th>
                        <th className="py-3.5 px-4">Fecha & Hora</th>
                        <th className="py-3.5 px-4">Motivo / Notas</th>
                        <th className="py-3.5 px-4">Código App</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{apt.patientName}</span>
                              {apt.documentId && (
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {apt.documentId}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-0.5">
                              <span className="font-medium text-slate-800">{apt.phone}</span>
                              <a href={`tel:${apt.phone}`} className="text-indigo-600 font-bold hover:underline">Llamar</a>
                              <span>·</span>
                              <span>{apt.email}</span>
                            </div>
                            {apt.emergencyContactPhone && (
                              <div className="text-[9px] text-amber-800 pt-0.5">
                                Emergencia: {apt.emergencyContactPhone}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {apt.service}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900">{apt.preferredDate}</div>
                            <div className="text-[10px] text-slate-400">{apt.preferredTime}</div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                            {apt.notes || 'Consulta general'}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                            {apt.generatedAccessCode || 'EQ-9900'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'pending' ? 'Pendiente' : 'Completada'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-2">
                            {apt.status === 'pending' && (
                              <button
                                onClick={() => StorageService.updateAppointmentStatus(apt.id, 'confirmed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                              >
                                Confirmar
                              </button>
                            )}
                            {apt.generatedAccessCode && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenPatientMobileApp(apt.generatedAccessCode!);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-900 cursor-pointer"
                              >
                                Ver App
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE BACKUP & RESTORE */}
          {activeTab === 'database' && (
            <div className="space-y-6 max-w-2xl mx-auto py-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-heading">
                    Base de Datos Clínica EQUILIBRA
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Gestione las copias de seguridad de las fichas clínicas, registros de citas y autoevaluaciones de los pacientes.
                  </p>
                </div>

                {importStatus && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900">
                    {importStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export JSON */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Exportar Base de Datos</h4>
                      <p className="text-[11px] text-slate-500">Descarga una copia completa en formato JSON.</p>
                    </div>
                    <button
                      onClick={handleExportJSON}
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs cursor-pointer transition-all"
                    >
                      Descargar Backup JSON
                    </button>
                  </div>

                  {/* Import JSON */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Importar Respaldo</h4>
                      <p className="text-[11px] text-slate-500">Cargue un archivo JSON previo de EQUILIBRA.</p>
                    </div>
                    <label className="w-full block py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-center font-bold text-xs text-slate-900 cursor-pointer">
                      Seleccionar Archivo JSON
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Reset to sample data */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Restablecer a Datos de Muestra Iniciales</h5>
                    <p className="text-[11px] text-slate-500">Restaura los registros de prueba (Carlos, Elvira, Daniel) y citas iniciales.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('¿Deseas restaurar la base de datos a los valores de muestra iniciales?')) {
                        StorageService.resetDatabase();
                        loadData();
                        setImportStatus('✅ Base de datos restaurada con éxito.');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & VIDEO CONFIGURATION GUIDE */}
          {activeTab === 'media_guide' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-heading">
                        Guía de Personalización de Videos e Imágenes
                      </h3>
                      <p className="text-xs text-slate-500">
                        Archivo maestro: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-700 font-bold">src/config/mediaAssets.ts</code>
                      </p>
                    </div>
                  </div>

                  <a
                    href="#tarifas"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver Sección de Tarifas y Videos</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Videos List */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-600" />
                      Videos Explicativos de cada Servicio
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Puedes colocar enlaces de <strong>YouTube</strong> (ej: <code>https://youtube.com/watch?v=...</code>), <strong>Vimeo</strong> o videos <strong>MP4 directos</strong>.
                    </p>

                    <div className="space-y-3">
                      {Object.entries(MEDIA_CONFIG.services).map(([srvKey, srvData]: [string, any]) => (
                        <div key={srvKey} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 font-mono">{srvKey}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              srvData.videoUrl ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {srvData.videoUrl ? 'Video Configurado' : 'Modo Simulador'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            URL: {srvData.videoUrl || '"" (usa simulador clínico)'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code Snippet & Storage Guide */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Image className="w-4 h-4 text-indigo-600" />
                      Instrucciones Rápidas
                    </h4>

                    <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 overflow-x-auto">
                      <div className="text-slate-400">// Ejemplo en src/config/mediaAssets.ts:</div>
                      <div className="text-indigo-300">fisioterapia_general: {'{'}</div>
                      <div className="pl-4 text-emerald-300">videoUrl: 'https://www.youtube.com/watch?v=TU_VIDEO',</div>
                      <div className="pl-4 text-emerald-300">image: '/mis_fotos/fisioterapia.jpg'</div>
                      <div className="text-indigo-300">{'}'}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-2">
                      <h5 className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        ¿Dónde guardar tus fotos locales?
                      </h5>
                      <p className="leading-relaxed">
                        Copia tus imágenes o videos a la carpeta <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-indigo-800">public/</code> de la aplicación.
                        Por ejemplo si guardas <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-indigo-800">public/foto.jpg</code>, su ruta en el código será simplemente <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-indigo-800">"/foto.jpg"</code>.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                      <h5 className="font-bold text-slate-900">Documento detallado:</h5>
                      <p>
                        Revisa el archivo <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">GUIA_IMAGENES_Y_VIDEOS.md</code> en la raíz del proyecto para ver todas las explicaciones paso a paso.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
