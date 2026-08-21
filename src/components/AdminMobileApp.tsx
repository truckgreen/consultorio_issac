import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  Download, 
  Search, 
  Plus, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  Save, 
  RefreshCw, 
  Smartphone, 
  Activity, 
  FileText, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Video, 
  ShieldCheck,
  ChevronRight,
  Send,
  Dumbbell,
  AlertCircle,
  TrendingDown,
  Percent,
  Play
} from 'lucide-react';
import { PatientRecord, AppointmentBooking, ServiceDetail, ClinicSettings, ServiceCategory } from '../types';
import { StorageService, DEFAULT_CLINIC_SETTINGS } from '../services/storageService';

interface AdminMobileAppProps {
  onClose: () => void;
}

type AdminTab = 'patients' | 'appointments' | 'services' | 'clinic_web' | 'install_app';

export const AdminMobileApp: React.FC<AdminMobileAppProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('patients');
  
  // Data State
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  
  // Live sync & network state
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [patientSearch, setPatientSearch] = useState('');
  const [patientFilterStatus, setPatientFilterStatus] = useState<string>('all');
  const [appointmentFilter, setAppointmentFilter] = useState<string>('all');

  // Selected Patient Detail Modal / Drawer
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [newClinicalNoteText, setNewClinicalNoteText] = useState('');
  const [newClinicalNotePain, setNewClinicalNotePain] = useState(5);
  const [chatInputText, setChatInputText] = useState('');

  // Modals for adding
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDetail | null>(null);

  // New Patient Form
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: '',
    documentId: '',
    phone: '',
    email: '',
    service: 'Fisioterapia General' as ServiceCategory,
    specialist: 'Lic. Mariana Valdés',
    diagnosis: '',
    painInitial: 6,
    age: 30,
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  // New / Edit Service Form
  const [serviceForm, setServiceForm] = useState({
    id: '',
    title: '',
    categoryName: 'Fisioterapia',
    tagline: '',
    description: '',
    priceUSD: 35,
    duration: '50 - 60 min',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
    videoUrl: '',
    includedItems: 'Evaluación goniométrica, Terapia manual ortopédica, Agentes físicos'
  });

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Notification Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Data
  const refreshData = () => {
    setPatients(StorageService.getPatients());
    setAppointments(StorageService.getAppointments());
    setServices(StorageService.getServices());
    setClinicSettings(StorageService.getClinicSettings());
    setIsOnline(StorageService.isOnline());
    setLastSyncTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.onDatabaseChange(() => {
      refreshData();
    });

    // PWA Install Prompt listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      showToast('¡App móvil de administración instalada con éxito!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      unsub();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Update selected patient when database changes
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find(p => p.id === selectedPatient.id);
      if (updated) setSelectedPatient(updated);
    }
  }, [patients]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await StorageService.triggerManualSync();
    refreshData();
    setIsSyncing(false);
    showToast('Sincronización con la nube completada.');
  };

  // Trigger PWA Installation
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        showToast('Instalando EQUILIBRA Admin...');
      }
      setDeferredPrompt(null);
    } else {
      setActiveTab('install_app');
    }
  };

  // --- ACTIONS: PATIENTS ---
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.fullName || !newPatientForm.phone) {
      showToast('Por favor completa los campos obligatorios.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const accessCode = `EQ-${randomNum}`;

    const newPat: PatientRecord = {
      id: 'pat-' + Date.now(),
      accessCode,
      fullName: newPatientForm.fullName,
      documentId: newPatientForm.documentId || `V-${Math.floor(10000000 + Math.random() * 20000000)}`,
      phone: newPatientForm.phone,
      email: newPatientForm.email || 'paciente@equilibra.com',
      service: newPatientForm.service,
      specialist: newPatientForm.specialist,
      specialistRole: 'Especialista',
      diagnosis: newPatientForm.diagnosis || 'Evaluación funcional inicial',
      status: 'active',
      painInitial: newPatientForm.painInitial,
      painCurrent: newPatientForm.painInitial,
      mobilityProgress: 40,
      completedSessions: 0,
      totalSessions: 8,
      age: newPatientForm.age || 30,
      emergencyContactName: newPatientForm.emergencyContactName || 'Familiar',
      emergencyContactPhone: newPatientForm.emergencyContactPhone || newPatientForm.phone,
      registeredAt: new Date().toISOString().split('T')[0],
      nextAppointmentDate: new Date().toISOString().split('T')[0],
      nextAppointmentTime: '10:00 AM',
      treatmentGoal: 'Recuperación funcional y fortalecimiento biomecánico.',
      notes: [
        {
          id: 'note-init-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          author: 'Administración EQUILIBRA',
          role: 'Admin',
          note: `Ficha creada. Motivo de ingreso: ${newPatientForm.diagnosis || 'Evaluación funcional'}`
        }
      ],
      exercises: [
        {
          id: 'ex-1',
          title: 'Movilidad articular y estiramiento descompresivo',
          sets: '2 series',
          reps: '10 repeticiones',
          frequency: 'Diario en casa',
          instructions: 'Realizar movimientos suaves respetando el umbral de dolor.',
          completedToday: false
        }
      ],
      painHistory: [
        { date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), score: newPatientForm.painInitial }
      ],
      chatMessages: [
        {
          id: 'msg-init',
          sender: 'specialist',
          text: `Hola ${newPatientForm.fullName}, bienvenido a EQUILIBRA. Aquí puedes consultar tu evolución clínica y ejercicios terapéuticos.`,
          timestamp: 'Hoy'
        }
      ]
    };

    StorageService.savePatient(newPat);
    setShowAddPatientModal(false);
    setSelectedPatient(newPat);
    showToast(`Paciente ${newPat.fullName} registrado correctamente (Código: ${accessCode})`);
  };

  const handleAddClinicalNote = () => {
    if (!selectedPatient || !newClinicalNoteText.trim()) return;

    StorageService.addClinicalNote(selectedPatient.id, {
      author: 'Especialista EQUILIBRA',
      role: 'Fisioterapeuta / Médico',
      note: newClinicalNoteText.trim(),
      painScore: newClinicalNotePain,
      mobilityScore: Math.min(100, Math.round(50 + (Math.max(0, selectedPatient.painInitial - newClinicalNotePain) / selectedPatient.painInitial) * 50))
    });

    setNewClinicalNoteText('');
    showToast('Nota de evolución clínica guardada.');
  };

  const handleSendAdminChatMessage = () => {
    if (!selectedPatient || !chatInputText.trim()) return;
    StorageService.sendChatMessage(selectedPatient.id, 'specialist', chatInputText.trim());
    setChatInputText('');
  };

  // --- ACTIONS: APPOINTMENTS ---
  const handleUpdateAppointmentStatus = (id: string, status: AppointmentBooking['status']) => {
    StorageService.updateAppointmentStatus(id, status);
    showToast(`Cita actualizada a estado: ${status.toUpperCase()}`);
  };

  // --- ACTIONS: SERVICES & PRICING ---
  const handleQuickPriceChange = (serviceId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) return;
    StorageService.updateServicePrice(serviceId, newPrice);
    showToast(`Tarifa actualizada a $${newPrice} USD.`);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.priceUSD) {
      showToast('Por favor completa el nombre del servicio y el precio.');
      return;
    }

    const serviceId = serviceForm.id || serviceForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = services.find(s => s.id === serviceId);

    const updatedService: ServiceDetail = {
      id: serviceId,
      title: serviceForm.title,
      categoryName: serviceForm.categoryName,
      tagline: serviceForm.tagline || 'Atención personalizada en EQUILIBRA',
      description: serviceForm.description || 'Tratamiento integral de alta precisión.',
      image: serviceForm.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
      badge: 'Atención 1 a 1',
      priceUSD: Number(serviceForm.priceUSD),
      priceLabel: `$${serviceForm.priceUSD} USD / Sesión Individual`,
      duration: serviceForm.duration || '55 - 60 min',
      includedItems: serviceForm.includedItems.split(',').map(i => i.trim()).filter(Boolean),
      packageOptions: existing?.packageOptions || [
        { name: 'Sesión Individual', price: `$${serviceForm.priceUSD} USD`, sessions: '1 sesión', savings: 'Tarifa Estándar' },
        { name: 'Pack 5 Sesiones', price: `$${Number(serviceForm.priceUSD) * 5 * 0.85} USD`, sessions: '5 sesiones', savings: '15% Descuento' }
      ],
      benefits: existing?.benefits || ['Alivio del dolor', 'Mejora de movilidad', 'Atención 1 a 1'],
      conditions: existing?.conditions || ['Dolor musculoesquelético', 'Lesiones'],
      methodology: existing?.methodology || 'Evaluación biomecánica y terapia avanzada.',
      specialists: existing?.specialists || ['Equipo Clínico EQUILIBRA'],
      videoData: {
        title: `Protocolo Clínico: ${serviceForm.title}`,
        duration: '3:00 min',
        presenter: 'Especialista EQUILIBRA',
        presenterRole: 'Especialista Principal',
        synopsis: serviceForm.description || 'Demostración de protocolo clínico.',
        videoPoster: serviceForm.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
        videoType: 'physio',
        customVideoUrl: serviceForm.videoUrl || undefined,
        chapters: existing?.videoData?.chapters || [
          { time: '0:00', title: 'Evaluación', description: 'Historia y diagnóstico' },
          { time: '1:30', title: 'Tratamiento', description: 'Terapia aplicada' }
        ],
        keyPoints: existing?.videoData?.keyPoints || ['Atención 1 a 1', 'Sin esperas'],
        techniquesShown: existing?.videoData?.techniquesShown || ['Terapia manual', 'Agentes físicos'],
        equipmentUsed: existing?.videoData?.equipmentUsed || ['Camillas ergonómicas', 'Tecnología médica']
      }
    };

    StorageService.saveService(updatedService);
    setShowAddServiceModal(false);
    setEditingService(null);
    showToast(`Servicio "${updatedService.title}" guardado con éxito.`);
  };

  const handleDeleteService = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el servicio "${title}"?`)) {
      StorageService.deleteService(id);
      showToast(`Servicio "${title}" eliminado.`);
    }
  };

  // --- ACTIONS: CLINIC SETTINGS ---
  const handleSaveClinicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveClinicSettings(clinicSettings);
    showToast('Información y configuración de la clínica guardada correctamente.');
  };

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch) ||
      (p.documentId && p.documentId.toLowerCase().includes(patientSearch.toLowerCase())) ||
      p.accessCode.toLowerCase().includes(patientSearch.toLowerCase());
    
    if (patientFilterStatus === 'all') return matchesSearch;
    return matchesSearch && p.status === patientFilterStatus;
  });

  // Filtered Appointments
  const filteredAppointments = appointments.filter(a => {
    if (appointmentFilter === 'all') return true;
    return a.status === appointmentFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-hidden">
      
      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 px-4 py-2.5 rounded-2xl bg-slate-900 text-white border border-indigo-500 shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Admin App Container */}
      <div className="w-full max-w-5xl h-[95vh] sm:h-[90vh] bg-slate-900 text-slate-100 rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white font-heading tracking-wide">
                  EQUILIBRA Admin
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  App Móvil
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isOnline ? '🟢 En línea · Citas sincronizadas' : '🟠 Modo Local'}</span>
                {lastSyncTime && <span className="text-[10px] text-slate-500">({lastSyncTime})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Install PWA Button */}
            <button
              onClick={handleInstallPWA}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isAppInstalled 
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
              title="Instalar App en Celular o Computadora"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAppInstalled ? 'App Instalada' : 'Descargar / Instalar'}</span>
            </button>

            {/* Sync Cloud Button */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Forzar sincronización de datos con el servidor"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Close Admin App & Return to Public Site */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
              title="Cerrar y volver a la página web"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Top Desktop Tabs Navigation */}
        <div className="hidden sm:flex items-center px-4 bg-slate-950/60 border-b border-slate-800/80 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'patients'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pacientes & Fichas ({patients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Citas en Vivo ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Servicios & Precios ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clinic_web')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'clinic_web'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración Web & Clínica</span>
          </button>

          <button
            onClick={() => setActiveTab('install_app')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'install_app'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Instalar en Móvil</span>
          </button>
        </div>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900">
          
          {/* ======================================================== */}
          {/* TAB 1: PACIENTES & FICHAS MÉDICAS */}
          {/* ======================================================== */}
          {activeTab === 'patients' && (
            <div className="space-y-4">
              
              {/* Patient Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Buscar paciente por nombre, cédula, teléfono o código..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                  />
                  {patientSearch && (
                    <button
                      onClick={() => setPatientSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={patientFilterStatus}
                    onChange={(e) => setPatientFilterStatus(e.target.value)}
                    className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">En tratamiento</option>
                    <option value="scheduled">Cita agendada</option>
                    <option value="completed">Alta médica</option>
                  </select>

                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Paciente</span>
                  </button>
                </div>
              </div>

              {/* Patients Grid / List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredPatients.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
                    <Users className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold">No se encontraron pacientes con ese criterio.</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className="p-4 rounded-3xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded inline-block">
                              {patient.accessCode}
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mt-1">
                              {patient.fullName}
                            </h4>
                            <p className="text-xs text-slate-400">
                              {patient.documentId || 'C.I. Sin registrar'} · {patient.age} años
                            </p>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            patient.status === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : patient.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {patient.status === 'active' ? 'En Tratamiento' : patient.status === 'completed' ? 'Alta Médica' : 'Agendado'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1">
                          <div className="text-slate-300 font-semibold truncate">
                            🏥 {patient.service}
                          </div>
                          <div className="text-slate-400 text-[11px] truncate">
                            Diagnóstico: {patient.diagnosis}
                          </div>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                            EVA: {patient.painCurrent}/10
                          </span>
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            Mov: {patient.mobilityProgress}%
                          </span>
                        </div>

                        <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-xs font-bold">
                          Ver Ficha <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CITAS EN TIEMPO REAL */}
          {/* ======================================================== */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    Citas Agendadas y Recepción en Vivo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Las citas agendadas por la web o teléfono se actualizan automáticamente en tiempo real.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">Todas las citas ({appointments.length})</option>
                    <option value="confirmed">Confirmadas</option>
                    <option value="pending">Pendientes</option>
                    <option value="completed">Completadas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-3">
                {filteredAppointments.length === 0 ? (
                  <div className="p-8 text-center bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-400">
                    No hay citas registradas en esta categoría.
                  </div>
                ) : (
                  filteredAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white font-heading">
                            {apt.patientName}
                          </span>
                          {apt.generatedAccessCode && (
                            <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-bold">
                              {apt.generatedAccessCode}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            apt.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            apt.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                            apt.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {apt.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1 font-semibold text-indigo-300">
                            <Activity className="w-3.5 h-3.5" />
                            {apt.service}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {apt.preferredDate} · {apt.preferredTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {apt.phone}
                          </span>
                        </div>

                        {apt.notes && (
                          <p className="text-xs text-slate-400 italic">
                            “{apt.notes}”
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/${apt.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hola ${apt.patientName}, te contactamos de EQUILIBRA para confirmar tu cita de ${apt.service} programada para el ${apt.preferredDate} a las ${apt.preferredTime}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Call Button */}
                        <a
                          href={`tel:${apt.phone}`}
                          className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Llamar</span>
                        </a>

                        {/* Status Toggle dropdown */}
                        <select
                          value={apt.status}
                          onChange={(e) => handleUpdateAppointmentStatus(apt.id, e.target.value as any)}
                          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmada</option>
                          <option value="completed">Completada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: GESTIÓN DE SERVICIOS Y PRECIOS (LIVE PRICING) */}
          {/* ======================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Gestión de Tarifas, Precios y Servicios de la Web
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cambia precios en tiempo real o añade nuevos servicios. Se actualizan al instante en la web pública y en el servidor.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setServiceForm({
                      id: '',
                      title: '',
                      categoryName: 'Fisioterapia',
                      tagline: 'Tratamiento personalizado en EQUILIBRA',
                      description: 'Descripción completa del tratamiento.',
                      priceUSD: 40,
                      duration: '50 - 60 min',
                      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
                      videoUrl: '',
                      includedItems: 'Valoración inicial, Terapia manual, Ejercicios'
                    });
                    setShowAddServiceModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar Nuevo Servicio</span>
                </button>
              </div>

              {/* Services Cards with Quick Price Editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            {srv.categoryName}
                          </span>
                          <h4 className="text-base font-bold text-white font-heading">
                            {srv.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                            {srv.description}
                          </p>
                        </div>

                        <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 shrink-0 font-mono">
                          {srv.duration}
                        </span>
                      </div>

                      {/* Quick Price Editor Section */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300">
                            Tarifa por Sesión ($ USD):
                          </label>
                          <span className="text-xs font-extrabold text-emerald-400 font-mono">
                            ${srv.priceUSD} USD
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                            <input
                              type="number"
                              defaultValue={srv.priceUSD}
                              id={`price-input-${srv.id}`}
                              className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-hidden focus:border-indigo-500"
                              placeholder="35"
                            />
                          </div>

                          <button
                            onClick={() => {
                              const input = document.getElementById(`price-input-${srv.id}`) as HTMLInputElement;
                              if (input) handleQuickPriceChange(srv.id, Number(input.value));
                            }}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Guardar</span>
                          </button>
                        </div>
                      </div>

                      {/* Video configuration */}
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">
                          Video: {srv.videoData?.customVideoUrl ? srv.videoData.customVideoUrl : 'Video por defecto'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setServiceForm({
                            id: srv.id,
                            title: srv.title,
                            categoryName: srv.categoryName,
                            tagline: srv.tagline,
                            description: srv.description,
                            priceUSD: srv.priceUSD,
                            duration: srv.duration,
                            image: srv.image,
                            videoUrl: srv.videoData?.customVideoUrl || '',
                            includedItems: srv.includedItems.join(', ')
                          });
                          setEditingService(srv);
                          setShowAddServiceModal(true);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Completo</span>
                      </button>

                      <button
                        onClick={() => handleDeleteService(srv.id, srv.title)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CONFIGURACIÓN DE LA PÁGINA WEB & CLÍNICA */}
          {/* ======================================================== */}
          {activeTab === 'clinic_web' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  Información y Textos de la Página Web
                </h3>
                <p className="text-xs text-slate-400">
                  Modifica los teléfonos de contacto, horarios y anuncios de la clínica mostrados en la web pública.
                </p>
              </div>

              <form onSubmit={handleSaveClinicSettings} className="space-y-5">
                
                {/* Contact numbers */}
                <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Teléfonos y Canales de Atención
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Teléfono Principal / WhatsApp:</label>
                      <input
                        type="text"
                        value={clinicSettings.phone}
                        onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value, whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Línea Fija / Emergencias:</label>
                      <input
                        type="text"
                        value={clinicSettings.emergencyPhone}
                        onChange={(e) => setClinicSettings({ ...clinicSettings, emergencyPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-full">
                      <label className="text-xs font-semibold text-slate-300">Correo Electrónico:</label>
                      <input
                        type="email"
                        value={clinicSettings.email}
                        onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Location */}
                <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Ubicación y Dirección Física
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Dirección Principal:</label>
                      <input
                        type="text"
                        value={clinicSettings.address}
                        onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Piso / Oficina / Local:</label>
                        <input
                          type="text"
                          value={clinicSettings.floorSuite}
                          onChange={(e) => setClinicSettings({ ...clinicSettings, floorSuite: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Ciudad:</label>
                        <input
                          type="text"
                          value={clinicSettings.city}
                          onChange={(e) => setClinicSettings({ ...clinicSettings, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Horarios de Atención
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Lunes a Viernes:</label>
                      <input
                        type="text"
                        value={clinicSettings.workingHoursWeekdays}
                        onChange={(e) => setClinicSettings({ ...clinicSettings, workingHoursWeekdays: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Sábados:</label>
                      <input
                        type="text"
                        value={clinicSettings.workingHoursSaturdays}
                        onChange={(e) => setClinicSettings({ ...clinicSettings, workingHoursSaturdays: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Toda la Configuración Web</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: DESCARGAR & INSTALAR LA APP EN EL CELULAR */}
          {/* ======================================================== */}
          {activeTab === 'install_app' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Descargar e Instalar la App Admin en tu Celular
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Instala esta aplicación directamente en la pantalla de inicio de tu teléfono para gestionar pacientes, citas y precios con 1 toque.
                </p>
              </div>

              {/* Direct 1-Click Install Button */}
              {deferredPrompt && (
                <div className="p-5 rounded-3xl bg-indigo-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div>
                    <h4 className="text-sm font-bold">¡Instalación Automática Lista!</h4>
                    <p className="text-xs text-indigo-100">Tu navegador soporta instalación con un solo clic.</p>
                  </div>
                  <button
                    onClick={handleInstallPWA}
                    className="px-5 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-xs hover:bg-indigo-50 shadow-md cursor-pointer shrink-0"
                  >
                    Instalar Ahora en mi Celular
                  </button>
                </div>
              )}

              {/* Step by Step Guides for Android and iPhone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Android Guide */}
                <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>En Android (Google Chrome)</span>
                  </div>

                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Abre esta página en <strong>Google Chrome</strong> en tu móvil.</li>
                    <li>Toca el menú de <strong>tres puntos (⋮)</strong> arriba a la derecha.</li>
                    <li>Selecciona <strong>“Instalar aplicación”</strong> o <strong>“Añadir a la pantalla de inicio”</strong>.</li>
                    <li>¡Listo! El icono de EQUILIBRA Admin aparecerá en tus aplicaciones.</li>
                  </ol>
                </div>

                {/* iPhone / iPad Guide */}
                <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>En iPhone / iPad (Safari)</span>
                  </div>

                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Abre esta página en el navegador <strong>Safari</strong>.</li>
                    <li>Toca el botón <strong>Compartir (icono con flecha hacia arriba)</strong>.</li>
                    <li>Desplázate hacia abajo y pulsa <strong>“Añadir a la pantalla de inicio”</strong>.</li>
                    <li>Toca <strong>“Añadir”</strong> arriba a la derecha para guardarla.</li>
                  </ol>
                </div>

              </div>

              {/* Direct link copy / WhatsApp share */}
              <div className="p-5 rounded-3xl bg-slate-800/60 border border-slate-700 text-center space-y-3">
                <h4 className="text-xs font-bold text-white">¿Quieres abrirla en tu teléfono ahora?</h4>
                <p className="text-xs text-slate-400">
                  Copia el enlace directo de administración o envíatelo por WhatsApp:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      const url = window.location.origin + '/?admin=true';
                      navigator.clipboard.writeText(url);
                      showToast('Enlace copiado al portapapeles.');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Copiar Enlace Directo
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent('Acceso a App Admin EQUILIBRA: ' + window.location.origin + '/?admin=true')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Enviar a mi WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Bottom Mobile Tab Bar (For small screens) */}
        <nav className="sm:hidden grid grid-cols-5 p-1 bg-slate-950 border-t border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('patients')}
            className={`py-2 flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'patients' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pacientes</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-2 flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'appointments' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Citas</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'services' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Precios</span>
          </button>

          <button
            onClick={() => setActiveTab('clinic_web')}
            className={`py-2 flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'clinic_web' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Web</span>
          </button>

          <button
            onClick={() => setActiveTab('install_app')}
            className={`py-2 flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'install_app' ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Instalar</span>
          </button>
        </nav>

      </div>

      {/* ======================================================== */}
      {/* PATIENT DETAIL MODAL (ANAMNESIS, PAIN, EXERCISES, CHAT) */}
      {/* ======================================================== */}
      {selectedPatient && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-3xl h-[100vh] sm:h-[90vh] bg-slate-900 text-slate-100 sm:rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {selectedPatient.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-heading">
                      {selectedPatient.fullName}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded">
                      {selectedPatient.accessCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedPatient.service} · {selectedPatient.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedPatient.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Patient Info */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* Medical Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Dolor Actual</div>
                  <div className="text-xl font-extrabold text-rose-400 font-heading mt-1">
                    {selectedPatient.painCurrent} / 10
                  </div>
                  <div className="text-[10px] text-slate-500">Inicial: {selectedPatient.painInitial}/10</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Movilidad</div>
                  <div className="text-xl font-extrabold text-emerald-400 font-heading mt-1">
                    {selectedPatient.mobilityProgress}%
                  </div>
                  <div className="text-[10px] text-slate-500">Rango articular</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Sesiones</div>
                  <div className="text-xl font-extrabold text-indigo-400 font-heading mt-1">
                    {selectedPatient.completedSessions} / {selectedPatient.totalSessions}
                  </div>
                  <div className="text-[10px] text-slate-500">Completadas</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Próxima Cita</div>
                  <div className="text-xs font-bold text-white font-heading mt-1.5 truncate">
                    {selectedPatient.nextAppointmentDate}
                  </div>
                  <div className="text-[10px] text-slate-500">{selectedPatient.nextAppointmentTime}</div>
                </div>
              </div>

              {/* Diagnosis & Clinical History */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Diagnóstico y Objetivo del Tratamiento
                </h4>
                <p className="text-xs text-white font-medium">
                  {selectedPatient.diagnosis}
                </p>
                <p className="text-[11px] text-slate-400">
                  Meta: {selectedPatient.treatmentGoal}
                </p>
              </div>

              {/* Clinical Evolution Notes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Evolución Clínica y Notas del Especialista
                </h4>

                {/* Add new note */}
                <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                  <textarea
                    rows={2}
                    value={newClinicalNoteText}
                    onChange={(e) => setNewClinicalNoteText(e.target.value)}
                    placeholder="Escribir nueva nota de evolución, respuesta al tratamiento o cambios..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Nivel de dolor observado:</span>
                      <select
                        value={newClinicalNotePain}
                        onChange={(e) => setNewClinicalNotePain(Number(e.target.value))}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <option key={n} value={n}>{n}/10</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleAddClinicalNote}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Guardar Nota</span>
                    </button>
                  </div>
                </div>

                {/* Notes list */}
                <div className="space-y-2">
                  {selectedPatient.notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300">{note.author} ({note.role})</span>
                        <span>{note.date}</span>
                      </div>
                      <p className="text-xs text-slate-200">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescribed Exercises */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Ejercicios Prescritos para Casa
                </h4>

                <div className="space-y-2">
                  {selectedPatient.exercises.map((ex) => (
                    <div key={ex.id} className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white">{ex.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {ex.sets} · {ex.reps} · {ex.frequency}
                        </div>
                        <div className="text-[10px] text-slate-500">{ex.instructions}</div>
                      </div>

                      <button
                        onClick={() => {
                          StorageService.togglePatientExercise(selectedPatient.id, ex.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          ex.completedToday ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{ex.completedToday ? 'Completado' : 'Pendiente'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Patient Chat */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat Directo con el Paciente
                </h4>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 max-h-60 overflow-y-auto">
                  {selectedPatient.chatMessages && selectedPatient.chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'specialist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-2.5 rounded-2xl text-xs ${
                        msg.sender === 'specialist'
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-slate-800 text-slate-200 rounded-tl-xs'
                      }`}>
                        <p>{msg.text}</p>
                        <span className="text-[9px] opacity-70 block text-right mt-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendAdminChatMessage();
                    }}
                    placeholder="Enviar mensaje al paciente..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendAdminChatMessage}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NUEVO PACIENTE */}
      {/* ======================================================== */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Registrar Nuevo Paciente
              </h3>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nombre Completo (*):</label>
                <input
                  type="text"
                  required
                  value={newPatientForm.fullName}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, fullName: e.target.value })}
                  placeholder="Ej: José Antonio Páez"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Cédula / DNI:</label>
                  <input
                    type="text"
                    value={newPatientForm.documentId}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, documentId: e.target.value })}
                    placeholder="V-18.492.102"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Teléfono (*):</label>
                  <input
                    type="tel"
                    required
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    placeholder="+58 412 123 4567"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Servicio Clínico:</label>
                <select
                  value={newPatientForm.service}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, service: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                >
                  <option value="Fisioterapia General">Fisioterapia General</option>
                  <option value="Fisioterapia Deportiva">Fisioterapia Deportiva</option>
                  <option value="Fisioterapia Pediátrica">Fisioterapia Pediátrica</option>
                  <option value="Fisioterapia Geriátrica">Fisioterapia Geriátrica</option>
                  <option value="Traumatología">Traumatología</option>
                  <option value="Psicología">Psicología</option>
                  <option value="Nutrición">Nutrición</option>
                  <option value="Entrenamiento Funcional">Entrenamiento Funcional</option>
                  <option value="Boxeo">Boxeo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Motivo de Consulta / Diagnóstico:</label>
                <textarea
                  rows={2}
                  value={newPatientForm.diagnosis}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, diagnosis: e.target.value })}
                  placeholder="Ej: Cervicalgia crónica con limitación en rotación..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Crear Ficha y Generar Código de Acceso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: AGREGAR / EDITAR SERVICIO Y TARIFA */}
      {/* ======================================================== */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                {editingService ? 'Editar Servicio y Tarifa' : 'Añadir Nuevo Servicio'}
              </h3>
              <button
                onClick={() => {
                  setShowAddServiceModal(false);
                  setEditingService(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nombre del Servicio (*):</label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="Ej: Terapia de Ondas de Choque"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Precio ($ USD) (*):</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.priceUSD}
                    onChange={(e) => setServiceForm({ ...serviceForm, priceUSD: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Duración:</label>
                  <input
                    type="text"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    placeholder="50 - 60 min"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Categoría:</label>
                <select
                  value={serviceForm.categoryName}
                  onChange={(e) => setServiceForm({ ...serviceForm, categoryName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                >
                  <option value="Fisioterapia">Fisioterapia</option>
                  <option value="Traumatología">Traumatología</option>
                  <option value="Nutrición">Nutrición</option>
                  <option value="Psicología">Psicología</option>
                  <option value="Entrenamiento">Entrenamiento Funcional / Boxeo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Descripción:</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Explica en qué consiste el tratamiento..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Enlace de Video Explicativo (YouTube o MP4):</label>
                <input
                  type="text"
                  value={serviceForm.videoUrl}
                  onChange={(e) => setServiceForm({ ...serviceForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Guardar Servicio y Publicar en la Web
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
