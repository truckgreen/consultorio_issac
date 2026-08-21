import React, { useState, useEffect } from 'react';
import { PatientRecord, AppointmentBooking, ServiceDetail } from '../types';
import { StorageService } from '../services/storageService';
import { INITIAL_SERVICES } from '../data/mockData';
import { 
  Smartphone, 
  X, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Send, 
  MessageSquare, 
  User, 
  Search, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  RefreshCw, 
  Building2, 
  Activity, 
  Phone, 
  Mail,
  MapPin,
  ShieldAlert,
  Copy,
  FileText,
  HeartPulse,
  Stethoscope,
  BadgeCheck,
  UserCheck,
  PhoneCall,
  Info,
  DollarSign,
  Play,
  Sparkles
} from 'lucide-react';

interface MobilePatientAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPatientCode?: string;
  onOpenCRM: () => void;
  services?: ServiceDetail[];
  onOpenVideo?: (service: ServiceDetail) => void;
}

export const MobilePatientAppModal: React.FC<MobilePatientAppModalProps> = ({
  isOpen,
  onClose,
  defaultPatientCode,
  onOpenCRM,
  services = INITIAL_SERVICES,
  onOpenVideo
}) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'chat' | 'patients' | 'prices' | 'stats'>('appointments');
  const [serviceSearch, setServiceSearch] = useState<string>('');

  
  // Appointment filters
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'today' | 'pending' | 'confirmed'>('all');
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // Active Chat State
  const [activeChatPatientId, setActiveChatPatientId] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState<string>('');
  const [isSimulatingReply, setIsSimulatingReply] = useState<boolean>(false);
  const [showChatContactDrawer, setShowChatContactDrawer] = useState<boolean>(false);

  // Selected Patient for full contact dossier modal/drawer
  const [viewingPatientDetails, setViewingPatientDetails] = useState<PatientRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadData = () => {
    const pList = StorageService.getPatients();
    const aList = StorageService.getAppointments();
    setPatients(pList);
    setAppointments(aList);

    // If defaultPatientCode provided, set as active chat patient
    if (defaultPatientCode) {
      const match = pList.find(p => p.accessCode.toUpperCase() === defaultPatientCode.toUpperCase());
      if (match) {
        setActiveChatPatientId(match.id);
      }
    } else if (!activeChatPatientId && pList.length > 0) {
      setActiveChatPatientId(pList[0].id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, defaultPatientCode]);

  useEffect(() => {
    const cleanup = StorageService.onDatabaseChange(() => {
      loadData();
      if (viewingPatientDetails) {
        const updated = StorageService.getPatientById(viewingPatientDetails.id);
        if (updated) setViewingPatientDetails(updated);
      }
    });
    return cleanup;
  }, [activeChatPatientId, viewingPatientDetails]);

  if (!isOpen) return null;

  const activePatientForChat = patients.find(p => p.id === activeChatPatientId) || patients[0];

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
      apt.service.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
      apt.phone.includes(appointmentSearch) ||
      (apt.documentId && apt.documentId.toLowerCase().includes(appointmentSearch.toLowerCase())) ||
      (apt.generatedAccessCode && apt.generatedAccessCode.toLowerCase().includes(appointmentSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (appointmentFilter === 'pending') return apt.status === 'pending';
    if (appointmentFilter === 'confirmed') return apt.status === 'confirmed';
    if (appointmentFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return apt.preferredDate === todayStr || apt.preferredDate.includes(todayStr.slice(5));
    }
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: AppointmentBooking['status']) => {
    StorageService.updateAppointmentStatus(id, newStatus);
    loadData();
  };

  const handleOpenChatWithPatient = (patientName: string, accessCode?: string) => {
    let match = patients.find(p => p.fullName.toLowerCase() === patientName.toLowerCase());
    if (!match && accessCode) {
      match = patients.find(p => p.accessCode.toUpperCase() === accessCode.toUpperCase());
    }
    if (match) {
      setActiveChatPatientId(match.id);
      setActiveTab('chat');
    } else {
      if (patients.length > 0) {
        setActiveChatPatientId(patients[0].id);
        setActiveTab('chat');
      }
    }
  };

  const handleOpenPatientContactFromAppointment = (apt: AppointmentBooking) => {
    let match = patients.find(p => p.fullName.toLowerCase() === apt.patientName.toLowerCase());
    if (!match && apt.generatedAccessCode) {
      match = patients.find(p => p.accessCode.toUpperCase() === apt.generatedAccessCode?.toUpperCase());
    }

    if (match) {
      setViewingPatientDetails(match);
    } else {
      // Create temporary view object from appointment data
      const tempPatient: PatientRecord = {
        id: apt.id,
        accessCode: apt.generatedAccessCode || 'EQ-TEMP',
        fullName: apt.patientName,
        documentId: apt.documentId || 'V-En verificación',
        email: apt.email,
        phone: apt.phone,
        emergencyContactName: apt.emergencyContactName || 'Familiar de Contacto',
        emergencyContactPhone: apt.emergencyContactPhone || apt.phone,
        emergencyContactRelation: 'Familiar',
        address: apt.address || 'Caracas, Distrito Capital',
        city: 'Caracas',
        preferredContactMethod: 'Llamada Telefónica',
        bloodType: 'Sin registrar',
        allergies: 'Sin alergias registradas',
        insuranceCompany: 'Particular',
        age: 30,
        service: apt.service,
        specialist: 'Por asignar',
        specialistRole: 'Equipo de Especialistas',
        diagnosis: apt.notes || 'Consulta agendada vía web',
        status: apt.status === 'confirmed' ? 'active' : 'scheduled',
        painInitial: 5,
        painCurrent: 5,
        mobilityProgress: 50,
        completedSessions: 0,
        totalSessions: 6,
        nextAppointmentDate: apt.preferredDate,
        nextAppointmentTime: apt.preferredTime,
        registeredAt: apt.createdAt.split('T')[0],
        treatmentGoal: 'Primera consulta de evaluación biomecánica.',
        notes: [],
        exercises: [],
        painHistory: [],
        chatMessages: []
      };
      setViewingPatientDetails(tempPatient);
    }
  };

  const handleSendAdminMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessageText.trim() || !activePatientForChat) return;

    StorageService.sendChatMessage(activePatientForChat.id, 'specialist', chatMessageText.trim());
    setChatMessageText('');
    loadData();
  };

  const handleQuickPresetMessage = (preset: string) => {
    if (!activePatientForChat) return;
    StorageService.sendChatMessage(activePatientForChat.id, 'specialist', preset);
    loadData();
  };

  const handleSimulatePatientReply = () => {
    if (!activePatientForChat) return;
    setIsSimulatingReply(true);

    const replies = [
      '¡Perfecto, muchas gracias! Ahí estaré puntual para mi cita.',
      'Excelente, he sentido una gran mejoría tras las indicaciones dadas.',
      'Hola doctor, ¿debo llevar algún examen o informe médico previo a la consulta?',
      'Entendido, ya guardé los datos de contacto y la hora en mi agenda.'
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    setTimeout(() => {
      StorageService.sendChatMessage(activePatientForChat.id, 'patient', randomReply);
      setIsSimulatingReply(false);
      loadData();
    }, 900);
  };

  const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
      
      <div className="relative max-w-5xl w-full my-auto flex flex-col lg:flex-row gap-8 items-center justify-center animate-in fade-in zoom-in-95">
        
        {/* Left Side: Desktop Admin Panel Overview */}
        <div className="hidden lg:flex flex-col space-y-6 max-w-md text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5" />
            <span>App Exclusiva para Administradores & Especialistas</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold font-heading leading-tight text-white">
              Gestión de Pacientes y Contacto Directo
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consola móvil exclusiva para el personal administrativo y médico de <strong>EQUILIBRA</strong>.
              Accede a todos los datos de contacto (teléfono, contacto de emergencia, cédula, dirección, seguro) 
              para contactar a cualquier paciente al instante, confirmar citas y chatear directamente.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold">Citas Registradas</div>
              <div className="text-2xl font-extrabold text-white font-heading">{appointments.length}</div>
              <div className="text-[10px] text-indigo-300 pt-0.5">{pendingAppointmentsCount} por confirmar</div>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold">Fichas de Contacto</div>
              <div className="text-2xl font-extrabold text-white font-heading">{patients.length}</div>
              <div className="text-[10px] text-emerald-400 pt-0.5">Datos 100% disponibles</div>
            </div>
          </div>

          {/* Patient Quick Selector */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center justify-between">
              <span>Directorio Rápido de Pacientes:</span>
              <span className="text-[10px] text-slate-400 font-normal">{patients.length} pacientes</span>
            </span>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {patients.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-left transition-all border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/40 flex items-center justify-center font-bold text-[10px] text-white">
                      {p.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold leading-tight text-white">{p.fullName}</div>
                      <div className="text-[10px] text-slate-300">{p.phone} · {p.documentId || p.accessCode}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setViewingPatientDetails(p);
                      }}
                      className="p-1.5 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/60 text-indigo-200 cursor-pointer"
                      title="Ver Ficha Completa de Contacto"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveChatPatientId(p.id);
                        setActiveTab('chat');
                      }}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                      title="Chatear con Paciente"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Jump to Desktop CRM */}
          <div>
            <button
              onClick={() => {
                onClose();
                onOpenCRM();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer"
            >
              <span>Abrir Portal Clínico CRM Completo (Escritorio)</span>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Right Side: Smartphone Device Shell (Admin Mobile App) */}
        <div className="relative w-full max-w-[390px] h-[740px] bg-slate-950 rounded-[50px] p-3.5 shadow-2xl border-[6px] border-slate-800 flex flex-col overflow-hidden text-slate-900">
          
          {/* Top Notch / Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
            <div className="w-12 h-1 bg-[#222] rounded-full" />
          </div>

          {/* Close button on phone top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-40 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
            title="Cerrar App"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Inner Phone Screen */}
          <div className="w-full h-full bg-slate-50 rounded-[40px] overflow-hidden flex flex-col pt-7 pb-2 relative font-sans">
            
            {/* App Top Bar */}
            <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  EQ
                </div>
                <div>
                  <div className="text-[11px] font-extrabold font-heading tracking-wide uppercase">
                    EQUILIBRA Admin & Staff
                  </div>
                  <div className="text-[9px] text-indigo-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    Sede Sabana Grande · Modo Administrador
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 px-2 py-0.5 rounded-md">
                  Staff Only
                </span>
              </div>
            </div>

            {/* Screen Body Content */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 relative">
              
              {/* ========================================================= */}
              {/* TAB 1: CITAS AGENDADAS (Appointments)                    */}
              {/* ========================================================= */}
              {activeTab === 'appointments' && (
                <div className="space-y-3 animate-in fade-in">
                  
                  {/* Header & Search */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          Citas & Contacto de Pacientes
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {filteredAppointments.length} citas registradas
                        </p>
                      </div>

                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                        {appointments.filter(a => a.status === 'confirmed').length} Confirmadas
                      </span>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar paciente, teléfono, cédula o servicio..."
                        value={appointmentSearch}
                        onChange={(e) => setAppointmentSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
                      <button
                        onClick={() => setAppointmentFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          appointmentFilter === 'all' 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Todas ({appointments.length})
                      </button>
                      <button
                        onClick={() => setAppointmentFilter('pending')}
                        className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          appointmentFilter === 'pending' 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Pendientes ({appointments.filter(a => a.status === 'pending').length})
                      </button>
                      <button
                        onClick={() => setAppointmentFilter('confirmed')}
                        className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          appointmentFilter === 'confirmed' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Confirmadas ({appointments.filter(a => a.status === 'confirmed').length})
                      </button>
                      <button
                        onClick={() => setAppointmentFilter('today')}
                        className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          appointmentFilter === 'today' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Hoy / Próximas
                      </button>
                    </div>
                  </div>

                  {/* Appointments List */}
                  <div className="space-y-2.5">
                    {filteredAppointments.length === 0 ? (
                      <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                        No se encontraron citas con los filtros seleccionados.
                      </div>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-indigo-300 transition-all"
                        >
                          {/* Top row */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                                {apt.documentId && (
                                  <span className="text-[9px] font-mono font-medium text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                                    {apt.documentId}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-medium text-indigo-700 block">
                                {apt.service}
                              </span>
                            </div>

                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              apt.status === 'confirmed' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : apt.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : apt.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'completed' ? 'Completada' : apt.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                            </span>
                          </div>

                          {/* Date and time box */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-indigo-600" />
                              <span>{apt.preferredDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-600" />
                              <span>{apt.preferredTime}</span>
                            </div>
                          </div>

                          {/* Patient Contact Info Card */}
                          <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                                <Phone className="w-3 h-3 text-indigo-600" />
                                <span>{apt.phone}</span>
                              </div>
                              <a
                                href={`tel:${apt.phone}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-bold hover:bg-indigo-700"
                              >
                                <PhoneCall className="w-2.5 h-2.5" />
                                <span>Llamar</span>
                              </a>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5 border-t border-indigo-100/60">
                              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                                <Mail className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span className="truncate">{apt.email}</span>
                              </div>
                              <a
                                href={`mailto:${apt.email}`}
                                className="text-[9px] text-indigo-700 font-bold hover:underline"
                              >
                                Email
                              </a>
                            </div>

                            {apt.emergencyContactPhone && (
                              <div className="text-[9px] text-amber-900 bg-amber-100/60 px-2 py-1 rounded-lg flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <ShieldAlert className="w-2.5 h-2.5 text-amber-700" />
                                  <span>Emergencia: {apt.emergencyContactPhone}</span>
                                </span>
                                <a href={`tel:${apt.emergencyContactPhone}`} className="font-bold underline text-amber-950">
                                  Llamar
                                </a>
                              </div>
                            )}
                          </div>

                          {apt.notes && (
                            <p className="text-[10px] text-slate-600 italic bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                              Motivo/Síntoma: “{apt.notes}”
                            </p>
                          )}

                          {/* Quick Admin Actions */}
                          <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-slate-100">
                            {/* View Full Contact Details */}
                            <button
                              onClick={() => handleOpenPatientContactFromAppointment(apt)}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold cursor-pointer transition-colors"
                              title="Ver ficha completa de contacto"
                            >
                              <User className="w-3 h-3 text-slate-600" />
                              <span>Ficha Contacto</span>
                            </button>

                            {/* Chat button */}
                            <button
                              onClick={() => handleOpenChatWithPatient(apt.patientName, apt.generatedAccessCode)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Chat</span>
                            </button>

                            <div className="flex items-center gap-1">
                              {apt.status !== 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold cursor-pointer"
                                  title="Confirmar cita"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Confirmar</span>
                                </button>
                              )}

                              {apt.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                  className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                                  title="Marcar como atendida"
                                >
                                  Completar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: CHAT DIRECTO CON PACIENTES                        */}
              {/* ========================================================= */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full space-y-2 animate-in fade-in">
                  
                  {/* Chat Patient Header Bar with Quick Contact Details */}
                  <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {activePatientForChat?.fullName.slice(0, 2).toUpperCase() || 'PA'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {activePatientForChat?.fullName}
                            </h4>
                            <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded">
                              {activePatientForChat?.accessCode}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500">
                            {activePatientForChat?.service} · {activePatientForChat?.phone}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown switch & contact drawer toggle */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowChatContactDrawer(!showChatContactDrawer)}
                          className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            showChatContactDrawer ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="Ver datos de contacto del paciente"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>

                        <select
                          value={activeChatPatientId}
                          onChange={(e) => setActiveChatPatientId(e.target.value)}
                          className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 focus:outline-none max-w-[95px]"
                        >
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.fullName.split(' ')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Expandable Fast Contact Bar */}
                    {showChatContactDrawer && activePatientForChat && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] space-y-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>Datos para Contactar:</span>
                          <button
                            onClick={() => setViewingPatientDetails(activePatientForChat)}
                            className="text-[9px] text-indigo-600 underline cursor-pointer"
                          >
                            Ver Ficha Completa
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-indigo-600" />
                            <a href={`tel:${activePatientForChat.phone}`} className="font-bold text-indigo-700 underline">
                              {activePatientForChat.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-indigo-600" />
                            <a href={`mailto:${activePatientForChat.email}`} className="truncate font-semibold text-slate-700">
                              {activePatientForChat.email}
                            </a>
                          </div>
                          {activePatientForChat.emergencyContactPhone && (
                            <div className="col-span-2 flex items-center justify-between bg-amber-50 px-2 py-1 rounded border border-amber-200 text-amber-900">
                              <span>Emergencia: {activePatientForChat.emergencyContactName || 'Familiar'} ({activePatientForChat.emergencyContactPhone})</span>
                              <a href={`tel:${activePatientForChat.emergencyContactPhone}`} className="font-bold underline">
                                Llamar
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages Feed Stream */}
                  <div className="flex-1 min-h-[260px] max-h-[290px] overflow-y-auto space-y-2 p-2 bg-slate-100/70 rounded-2xl border border-slate-200/80">
                    {activePatientForChat?.chatMessages && activePatientForChat.chatMessages.length > 0 ? (
                      activePatientForChat.chatMessages.map((msg) => {
                        const isAdmin = msg.sender === 'specialist';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1 text-[8px] text-slate-400 px-1 mb-0.5">
                              <span className="font-semibold">
                                {isAdmin ? 'EQUILIBRA Staff (Admin)' : activePatientForChat.fullName}
                              </span>
                              <span>· {msg.timestamp}</span>
                            </div>

                            <div
                              className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed ${
                                isAdmin
                                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-4 text-xs text-slate-400">
                        Inicia una conversación directa con este paciente.
                      </div>
                    )}

                    {isSimulatingReply && (
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 p-2 italic animate-pulse">
                        <MessageSquare className="w-3 h-3" />
                        <span>Paciente escribiendo respuesta...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Preset Replies for Admin */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>Respuestas Rápidas Staff:</span>
                      <button
                        onClick={handleSimulatePatientReply}
                        disabled={isSimulatingReply}
                        className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer disabled:opacity-50"
                      >
                        + Simular Paciente
                      </button>
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-1 text-[9px]">
                      <button
                        onClick={() => handleQuickPresetMessage('¡Hola! Confirmamos tu cita en Sabana Grande piso 4. Te esperamos.')}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer"
                      >
                        Confirmar cita
                      </button>
                      <button
                        onClick={() => handleQuickPresetMessage('¿Cómo has sentido la movilidad y el dolor tras tu última sesión?')}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer"
                      >
                        Evolución dolor
                      </button>
                      <button
                        onClick={() => handleQuickPresetMessage('Te recordamos traer ropa cómoda deportiva a tu cita de hoy.')}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer"
                      >
                        Pauta consulta
                      </button>
                    </div>
                  </div>

                  {/* Chat Input Field */}
                  <form onSubmit={handleSendAdminMessage} className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder={`Escribir a ${activePatientForChat?.fullName.split(' ')[0]}...`}
                      value={chatMessageText}
                      onChange={(e) => setChatMessageText(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                    <button
                      type="submit"
                      disabled={!chatMessageText.trim()}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: PACIENTES & DATOS COMPLETOS DE CONTACTO            */}
              {/* ========================================================= */}
              {activeTab === 'patients' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        Directorio & Fichas de Pacientes
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {patients.length} pacientes con ficha de contacto
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {patients.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-indigo-300 transition-all"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                              {p.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                                <span>{p.fullName}</span>
                                {p.documentId && (
                                  <span className="text-[9px] font-normal text-slate-500">
                                    ({p.documentId})
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-indigo-700 font-medium">
                                {p.service} · {p.age} años
                              </div>
                            </div>
                          </div>

                          <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                            {p.accessCode}
                          </span>
                        </div>

                        {/* Patient Contact Card snippet */}
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-slate-800 font-semibold">
                              <Phone className="w-3 h-3 text-indigo-600" />
                              <span>{p.phone}</span>
                            </div>
                            <a
                              href={`tel:${p.phone}`}
                              className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold"
                            >
                              Llamar
                            </a>
                          </div>

                          <div className="flex items-center gap-1 text-slate-600 truncate">
                            <Mail className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate">{p.email}</span>
                          </div>

                          {p.emergencyContactPhone && (
                            <div className="text-[9px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 flex items-center justify-between">
                              <span className="truncate">Emergencia: {p.emergencyContactName || 'Familiar'} ({p.emergencyContactPhone})</span>
                              <a href={`tel:${p.emergencyContactPhone}`} className="font-bold underline ml-1">
                                Llamar
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Clinical summary pills */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-slate-50/80 p-1.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase">Dolor EVA</span>
                            <span className="font-bold text-slate-800">{p.painCurrent}/10</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase">Sesiones</span>
                            <span className="font-bold text-slate-800">{p.completedSessions}/{p.totalSessions}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase">Progreso</span>
                            <span className="font-bold text-emerald-600">{p.mobilityProgress}%</span>
                          </div>
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            onClick={() => setViewingPatientDetails(p)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            <User className="w-3 h-3 text-slate-600" />
                            <span>Ver Todos los Datos</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveChatPatientId(p.id);
                              setActiveTab('chat');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chatear</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: SEDE & OPERACIONES                                */}
              {/* ========================================================= */}
              {activeTab === 'stats' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold font-heading uppercase tracking-wide">
                        Sede Caracas Sabana Grande
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Centro Profesional del Este, piso 4, oficina 46.
                    </p>
                    <div className="text-[10px] text-indigo-300 pt-1 flex justify-between border-t border-white/10">
                      <span>Horario hoy: 8:00 AM - 7:00 PM</span>
                      <span className="font-bold text-emerald-400">Abierto</span>
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Citas Agendadas</span>
                      <div className="text-xl font-extrabold text-slate-900 font-heading">
                        {appointments.length}
                      </div>
                      <span className="text-[8px] text-emerald-600 font-semibold">{appointments.filter(a => a.status === 'confirmed').length} confirmadas</span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Pacientes en Base</span>
                      <div className="text-xl font-extrabold text-indigo-600 font-heading">
                        {patients.length}
                      </div>
                      <span className="text-[8px] text-slate-500">Contactables 100%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                    <h5 className="text-[11px] font-bold text-indigo-900 uppercase">
                      Especialistas en Sede:
                    </h5>
                    <ul className="text-[10px] text-indigo-800 space-y-1">
                      <li>• Lic. Alejandro Rivas (Fisioterapia General)</li>
                      <li>• Lic. Mariana Valdés (Fisioterapia Deportiva)</li>
                      <li>• Dr. Fernando Carrillo (Traumatología)</li>
                      <li>• Lic. Claudia Navarro (Psicología)</li>
                      <li>• Lic. Valeria Morales (Nutrición)</li>
                      <li>• Dra. Elena Castellanos (Pediátrica)</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenCRM();
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Ver CRM Completo en Computadora
                  </button>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB: TARIFAS & VIDEOS CLÍNICOS (Prices & Videos in App)   */}
              {/* ========================================================= */}
              {activeTab === 'prices' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        Tarifas Oficiales & Videos
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Precios transparentes y demostraciones clínicas
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Tasa BCV al día
                    </span>
                  </div>

                  {/* Service Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar servicio o especialidad..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  {/* List of Services with Price & Video Action */}
                  <div className="space-y-2">
                    {services
                      .filter(s => 
                        s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                        s.categoryName.toLowerCase().includes(serviceSearch.toLowerCase())
                      )
                      .map((srv) => (
                        <div
                          key={srv.id}
                          className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-bold uppercase text-indigo-700 block">
                                {srv.categoryName}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 leading-tight">
                                {srv.title}
                              </h5>
                              <span className="text-[10px] text-slate-500">
                                Duración: {srv.duration}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-sm font-extrabold text-indigo-950 font-heading block">
                                ${srv.priceUSD} USD
                              </span>
                              <span className="text-[8px] text-slate-400">
                                por sesión
                              </span>
                            </div>
                          </div>

                          {/* Quick Included items summary */}
                          <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="truncate">{srv.includedItems[0] || 'Atención personalizada y equipamiento clínico'}</span>
                          </div>

                          {/* Video Action Button */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-[9px] text-slate-400">
                              Demostración: {srv.videoData?.duration || '3:45 min'}
                            </span>

                            <button
                              onClick={() => {
                                if (onOpenVideo) {
                                  onOpenVideo(srv);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Ver Video Explicativo</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* MODAL / DRAWER: TODOS LOS DATOS DEL PACIENTE PARA CONTACTAR */}
              {/* ========================================================= */}
              {viewingPatientDetails && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex flex-col justify-end p-2 animate-in fade-in">
                  <div className="bg-white rounded-3xl p-4 max-h-[92%] overflow-y-auto space-y-3.5 shadow-2xl border border-slate-200">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {viewingPatientDetails.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {viewingPatientDetails.fullName}
                          </h4>
                          <span className="text-[9px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold">
                            {viewingPatientDetails.accessCode} · {viewingPatientDetails.documentId || 'C.I. V-19.482.102'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setViewingPatientDetails(null)}
                        className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                        title="Cerrar Ficha"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {copiedField && (
                      <div className="p-2 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡{copiedField} copiado al portapapeles!</span>
                      </div>
                    )}

                    {/* Section 1: Direct Contact Numbers */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Canales de Contacto Directo:
                      </div>

                      {/* Phone 1 */}
                      <div className="p-2.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-indigo-800 font-bold block">Teléfono Principal</span>
                          <span className="text-xs font-extrabold text-slate-900 font-mono">
                            {viewingPatientDetails.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(viewingPatientDetails.phone, 'Teléfono principal')}
                            className="p-1.5 rounded-lg bg-white text-slate-600 hover:bg-indigo-100 text-[10px] border border-indigo-200 cursor-pointer"
                            title="Copiar teléfono"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`tel:${viewingPatientDetails.phone}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 shadow-xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Llamar</span>
                          </a>
                        </div>
                      </div>

                      {/* Secondary Phone if available */}
                      {viewingPatientDetails.secondaryPhone && (
                        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block">Teléfono Secundario / Habitación</span>
                            <span className="text-xs font-semibold text-slate-800 font-mono">
                              {viewingPatientDetails.secondaryPhone}
                            </span>
                          </div>
                          <a
                            href={`tel:${viewingPatientDetails.secondaryPhone}`}
                            className="px-2 py-1 rounded-lg bg-slate-200 text-slate-800 text-[10px] font-bold hover:bg-slate-300"
                          >
                            Llamar
                          </a>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-amber-900 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            Contacto de Emergencia / Familiar:
                          </span>
                          <span className="text-[9px] font-semibold text-amber-800">
                            {viewingPatientDetails.emergencyContactRelation || 'Familiar'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {viewingPatientDetails.emergencyContactName || 'Familiar Responsable'}
                            </div>
                            <div className="text-[10px] font-mono font-semibold text-amber-950">
                              {viewingPatientDetails.emergencyContactPhone || viewingPatientDetails.phone}
                            </div>
                          </div>
                          <a
                            href={`tel:${viewingPatientDetails.emergencyContactPhone || viewingPatientDetails.phone}`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-700"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Llamar Familiar</span>
                          </a>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div className="truncate max-w-[200px]">
                          <span className="text-[9px] text-slate-500 font-bold block">Correo Electrónico</span>
                          <span className="text-xs font-semibold text-slate-800 truncate block">
                            {viewingPatientDetails.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(viewingPatientDetails.email, 'Correo electrónico')}
                            className="p-1.5 rounded-lg bg-white text-slate-600 hover:bg-slate-100 text-[10px] border border-slate-200 cursor-pointer"
                            title="Copiar correo"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`mailto:${viewingPatientDetails.email}`}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Location & Demographic details */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[10px]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                        Ubicación & Datos Personales:
                      </span>

                      <div className="flex items-start gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900">Dirección: </span>
                          <span>{viewingPatientDetails.address || 'Caracas, Distrito Capital'}</span>
                          {viewingPatientDetails.city && <span className="block text-slate-500">Ciudad: {viewingPatientDetails.city}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-slate-700">
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase">Cédula / DNI</span>
                          <span className="font-bold">{viewingPatientDetails.documentId || 'V-19.482.102'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase">Edad / Grupo</span>
                          <span className="font-bold">{viewingPatientDetails.age} años</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase">Tipo de Sangre</span>
                          <span className="font-bold">{viewingPatientDetails.bloodType || 'O+'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase">Alergias</span>
                          <span className="font-bold text-rose-700">{viewingPatientDetails.allergies || 'Ninguna registrada'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[8px] uppercase">Seguro Médico / Cobertura</span>
                          <span className="font-bold text-indigo-800">{viewingPatientDetails.insuranceCompany || 'Particular'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Clinical & Appointment Summary */}
                    <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-[10px] space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-900 block">
                        Tratamiento & Cita:
                      </span>
                      <div className="text-slate-800">
                        <strong>Especialidad:</strong> {viewingPatientDetails.service}
                      </div>
                      <div className="text-slate-800">
                        <strong>Especialista a Cargo:</strong> {viewingPatientDetails.specialist}
                      </div>
                      <div className="text-slate-800">
                        <strong>Próxima Cita:</strong> {viewingPatientDetails.nextAppointmentDate} a las {viewingPatientDetails.nextAppointmentTime}
                      </div>
                      {viewingPatientDetails.diagnosis && (
                        <p className="text-[9px] text-slate-600 italic bg-white p-1.5 rounded-lg border border-indigo-100 mt-1">
                          Diagnóstico: {viewingPatientDetails.diagnosis}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          const targetId = viewingPatientDetails.id;
                          setViewingPatientDetails(null);
                          setActiveChatPatientId(targetId);
                          setActiveTab('chat');
                        }}
                        className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir Chat</span>
                      </button>

                      <a
                        href={`tel:${viewingPatientDetails.phone}`}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-center shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Llamar Ahora</span>
                      </a>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Mobile Bottom Tab Bar (Admin Controls) */}
            <div className="px-2 pt-2 pb-1 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'appointments'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Calendar className="w-4 h-4" />
                  {pendingAppointmentsCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-amber-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                      {pendingAppointmentsCount}
                    </span>
                  )}
                </div>
                <span className="text-[8px]">Citas</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <MessageSquare className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                </div>
                <span className="text-[8px]">Chat Staff</span>
              </button>

              <button
                onClick={() => setActiveTab('patients')}
                className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'patients'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-[8px]">Directorio</span>
              </button>

              <button
                onClick={() => setActiveTab('prices')}
                className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'prices'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-[8px]">Tarifas</span>
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'stats'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[8px]">Sede</span>
              </button>
            </div>

            {/* Bottom Home Indicator Line */}
            <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto mt-1 shrink-0" />

          </div>

        </div>

      </div>

    </div>
  );
};
