import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  X,
  Users,
  Calendar,
  CheckCircle2,
  FileText,
  RefreshCw,
  LogOut,
  Database,
  Eye,
  EyeOff,
  Fingerprint,
  FileSpreadsheet,
  Package,
  Check,
  ChevronRight,
  Bell,
  Search,
  MessageSquare,
  LayoutDashboard,
  Stethoscope,
  Volume2,
  CalendarOff,
  CalendarRange,
  Edit2,
  Settings,
  Bot,
  Send,
  AlertCircle,
  Building2,
  Trash2,
  ExternalLink,
  Link,
  ArrowLeft,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Clock,
  DollarSign,
  Ban,
  Copy,
  Activity,
  Menu,
  FolderOpen,
  UserPlus,
  Mail,
} from 'lucide-react';
import {
  ConfirmedAppointment,
  SpecialistUser,
  AdminUser,
  AdminNotification,
  TeamMember,
  SpecialistAbsence,
  TelegramConfig,
  SupabaseConfig,
  PatientRecord,
  KapsoConfig,
  MedicalRecordDocument,
  ContactMessage,
} from '../types';
import {
  getAppointmentsFromDatabase,
  getSavedAppointments,
  saveAppointmentToStorage,
  deleteAppointmentFromStorageAndServer,
  clearAllAppointmentsFromSystem,
  performMonthlyCutoff,
} from '../utils/bookingUtils';
import {
  getStoredPatients,
  saveStoredPatient,
  deleteStoredPatient,
  formatPatientDisplayId,
} from '../utils/patientUtils';
import {
  deletePatientFromDb,
  addDocumentToPatient,
  removeDocumentFromPatient,
  getContactMessagesFromDb,
  updateContactMessageStatus,
  deleteContactMessageFromDb,
  getCurrentSupabaseConfig,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testConnection,
  SUPABASE_SQL_SCHEMA,
  syncGlobalConfigFromServer,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';
import { PatientRegistrationModal } from './PatientRegistrationModal';
import { PatientDetailModal } from './admin/PatientDetailModal';
import { UploadMedicalRecordModal } from './admin/UploadMedicalRecordModal';
import { PdfViewerModal } from './admin/PdfViewerModal';
import {
  getStoredTelegramConfig,
  saveTelegramConfig,
  testTelegramNotification,
  testTelegramSpecialistTagging,
} from '../utils/telegramBot';
import {
  getStoredKapsoConfig,
  saveKapsoConfig,
  testKapsoNotification,
} from '../utils/kapsoWhatsApp';
import {
  getStoredSpecialistsAvailability,
  saveSpecialistAvailability,
  isSpecialistInactiveOnDate,
} from '../utils/specialistAvailability';
import {
  SPECIALISTS_ACCOUNTS,
  ADMIN_ACCOUNT,
  verifyUserPin,
  setBiometricRegisteredForUser,
} from '../data/specialistsAuthData';
import {
  isUserAdmin,
  isAppointmentAssignedToSpecialist,
  matchesSpecialistFilter,
} from '../utils/specialistUtils';
import {
  isBiometricsSupported,
  authenticateWithBiometrics,
  registerBiometricCredential,
} from '../utils/biometrics';
import { exportAppointmentsToExcel } from '../utils/excelExporter';
import {
  getSecurityLogs,
  SecurityAuditEntry,
  recordSecurityEvent,
  setStaffSession,
  clearStaffSession,
} from '../utils/security';
import { SERVICES_DATA } from '../data/servicesData';
import { TEAM_MEMBERS } from '../data/teamData';
import {
  getStoredNotifications,
  saveStoredNotifications,
  clearAllStoredNotifications,
  requestBrowserNotificationPermission,
  generateWhatsAppAlertUrl,
  playNotificationChime,
  getDirectPortalLink,
} from '../utils/notificationUtils';

interface AdminPanelViewProps {
  onBackToSite: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBooking?: (serviceId?: string) => void;
}

type PanelTab =
  | 'dashboard'
  | 'agenda'
  | 'pacientes'
  | 'mensajes'
  | 'staff'
  | 'servicios'
  | 'cancelaciones'
  | 'actualizaciones'
  | 'auditoria'
  | 'configuracion';

const TAB_LABELS: Record<PanelTab, { label: string; group: string; subtitle: string }> = {
  dashboard: { label: 'Dashboard Ejecutivo', group: 'Operación Clínica', subtitle: 'Resumen diario, métricas y próximas citas' },
  agenda: { label: 'Agenda & Citas', group: 'Operación Clínica', subtitle: 'Gestión integral de reservas y estados' },
  pacientes: { label: 'Directorio de Pacientes', group: 'Operación Clínica', subtitle: 'Expedientes, evolución clínica e historial' },
  mensajes: { label: 'Bandeja de Consultas', group: 'Operación Clínica', subtitle: 'Mensajes recibidos desde el sitio web' },
  staff: { label: 'Equipo Médico', group: 'Gestión Clínica', subtitle: 'Disponibilidad, turnos y reposos médicos' },
  servicios: { label: 'Servicios & Tarifas', group: 'Gestión Clínica', subtitle: 'Catálogo de especialidades y modalidades' },
  cancelaciones: { label: 'Cancelaciones', group: 'Gestión Clínica', subtitle: 'Control de anulaciones y recargos' },
  actualizaciones: { label: 'Novedades', group: 'Sistema', subtitle: 'Historial de mejoras de la plataforma' },
  auditoria: { label: 'Seguridad & Auditoría', group: 'Sistema', subtitle: 'Registro criptográfico de eventos clínicos' },
  configuracion: { label: 'Integraciones & Ajustes', group: 'Sistema', subtitle: 'WhatsApp Kapso, Telegram, Supabase y cierres' },
};

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  onBackToSite,
  darkMode,
  onToggleDarkMode,
  onOpenBooking,
}) => {
  // Login selection state
  const [selectedUserType, setSelectedUserType] = useState<'specialist' | 'admin'>('admin');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(SPECIALISTS_ACCOUNTS[0].id);
  const [specialistSearch, setSpecialistSearch] = useState('');

  // Auth State
  const [authenticatedUser, setAuthenticatedUser] = useState<SpecialistUser | AdminUser | null>(null);
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticatingBiometric, setIsAuthenticatingBiometric] = useState<boolean>(false);
  const [, setBiometricAvailable] = useState<boolean>(false);

  // Layout & Tabs
  const [activeTab, setActiveTab] = useState<PanelTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [agendaViewMode, setAgendaViewMode] = useState<'table' | 'cards'>('table');

  // Data State
  const [appointments, setAppointments] = useState<ConfirmedAppointment[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<PatientRecord[]>(getStoredPatients());
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditEntry[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

  // Patient Modals
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);
  const [detailPatient, setDetailPatient] = useState<PatientRecord | null>(null);
  const [uploadPdfPatient, setUploadPdfPatient] = useState<PatientRecord | null>(null);
  const [viewingPdfDoc, setViewingPdfDoc] = useState<{ doc: MedicalRecordDocument; patient: PatientRecord } | null>(null);

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('CURRENT');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [specialistFilter, setSpecialistFilter] = useState<string>('TODOS');
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState<boolean>(false);

  // Monthly Cut-off Modal State
  const [monthlyCutoffModal, setMonthlyCutoffModal] = useState<{
    isOpen: boolean;
    cutoffDate: string;
    onlyCompletedOrCanceled: boolean;
    exportBeforeDelete: boolean;
  } | null>(null);
  const [isProcessingCutoff, setIsProcessingCutoff] = useState(false);
  const [cutoffResultMsg, setCutoffResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Supabase connection state
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>(
    isSupabaseConfigured ? 'idle' : 'error'
  );
  const [supabaseMsg, setSupabaseMsg] = useState<string>(
    isSupabaseConfigured ? 'Supabase conectado' : 'Modo local (sin Supabase)'
  );
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Data Clearing & Archive Confirmation State
  const [confirmActionModal, setConfirmActionModal] = useState<{
    isOpen: boolean;
    type: 'appointments' | 'notifications' | 'all' | 'single_appointment' | 'archive_patient' | 'delete_message';
    targetId?: string;
    targetTitle?: string;
  } | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Staff status and availability state
  const [specialistAvailabilities, setSpecialistAvailabilities] = useState<Record<string, SpecialistAbsence>>({});
  const [editingAbsenceMember, setEditingAbsenceMember] = useState<TeamMember | null>(null);
  const [isInactiveForm, setIsInactiveForm] = useState(false);
  const [absenceReason, setAbsenceReason] = useState<'enfermedad' | 'vacaciones' | 'permiso' | 'capacitacion' | 'otro'>('enfermedad');
  const [absenceReasonDetails, setAbsenceReasonDetails] = useState('');
  const [inactiveFromDate, setInactiveFromDate] = useState('');
  const [inactiveUntilDate, setInactiveUntilDate] = useState('');
  const [substituteId, setSubstituteId] = useState('');
  const [absenceNotes, setAbsenceNotes] = useState('');

  const [staffStatuses, setStaffStatuses] = useState<{ [id: string]: 'disponible' | 'en_consulta' | 'de_guardia' | 'descanso' }>({
    'isaac-jewsiejew': 'disponible',
    'marivid-requena': 'disponible',
    'laury-torrealba': 'en_consulta',
    'stephani-salina': 'disponible',
    'ruben-torrealba': 'de_guardia',
    'cristina-flores': 'disponible',
    'indira-acevedo': 'disponible',
    'gabriela-rodriguez': 'disponible',
    'kareinys-martinez': 'disponible',
    'rebecca-triana': 'disponible',
  });

  // Telegram Bot config state
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(getStoredTelegramConfig());
  const [telegramToken, setTelegramToken] = useState(telegramConfig.botToken || '');
  const [telegramChatId, setTelegramChatId] = useState(telegramConfig.chatId || '');
  const [telegramEnabled, setTelegramEnabled] = useState(telegramConfig.enabled ?? true);
  const [specialistTags, setSpecialistTags] = useState<Record<string, string>>(telegramConfig.specialistTags || {});
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [testingTagMemberId, setTestingTagMemberId] = useState<string | null>(null);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [specialistTagTestResult, setSpecialistTagTestResult] = useState<{ memberId: string; success: boolean; message: string } | null>(null);
  const [telegramSaveSuccess, setTelegramSaveSuccess] = useState(false);
  const [tagsSaveSuccess, setTagsSaveSuccess] = useState(false);

  // Kapso WhatsApp state
  const [kapsoConfig, setKapsoConfig] = useState<KapsoConfig>(getStoredKapsoConfig());
  const [kapsoApiKey, setKapsoApiKey] = useState(kapsoConfig.apiKey || '');
  const [kapsoPhoneNumberId, setKapsoPhoneNumberId] = useState(kapsoConfig.phoneNumberId || '');
  const [kapsoAdminPhone, setKapsoAdminPhone] = useState(kapsoConfig.adminPhone || '');
  const [kapsoEnabled, setKapsoEnabled] = useState(kapsoConfig.enabled ?? false);
  const [kapsoNotifyPatient, setKapsoNotifyPatient] = useState(kapsoConfig.notifyPatient ?? true);
  const [kapsoNotifyAdmin, setKapsoNotifyAdmin] = useState(kapsoConfig.notifyAdmin ?? true);
  const [isTestingKapso, setIsTestingKapso] = useState(false);
  const [kapsoTestResult, setKapsoTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [kapsoSaveSuccess, setKapsoSaveSuccess] = useState(false);

  // Supabase manual config state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getCurrentSupabaseConfig());
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [supabaseSaveSuccess, setSupabaseSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notifDropdownRef = useRef<HTMLDivElement | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ type, text });
    window.setTimeout(() => {
      setToastMsg((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    setSpecialistAvailabilities(getStoredSpecialistsAvailability());
    const handler = () => setSpecialistAvailabilities(getStoredSpecialistsAvailability());
    window.addEventListener('equilibra_specialist_availability_changed', handler);
    return () => window.removeEventListener('equilibra_specialist_availability_changed', handler);
  }, []);

  // Sync configs on mount
  useEffect(() => {
    syncGlobalConfigFromServer();
    const cfg = getStoredTelegramConfig();
    if (cfg.botToken) setTelegramToken(cfg.botToken);
    if (cfg.chatId) setTelegramChatId(cfg.chatId);
    if (typeof cfg.enabled === 'boolean') setTelegramEnabled(cfg.enabled);
    if (cfg.specialistTags) setSpecialistTags(cfg.specialistTags);

    const supCfg = getCurrentSupabaseConfig();
    if (supCfg.url) setSupabaseUrl(supCfg.url);
    if (supCfg.anonKey) setSupabaseAnonKey(supCfg.anonKey);

    const kCfg = getStoredKapsoConfig();
    if (kCfg.apiKey) setKapsoApiKey(kCfg.apiKey);
    if (kCfg.phoneNumberId) setKapsoPhoneNumberId(kCfg.phoneNumberId);
    if (kCfg.adminPhone) setKapsoAdminPhone(kCfg.adminPhone);
    if (typeof kCfg.enabled === 'boolean') setKapsoEnabled(kCfg.enabled);
    if (typeof kCfg.notifyPatient === 'boolean') setKapsoNotifyPatient(kCfg.notifyPatient);
    if (typeof kCfg.notifyAdmin === 'boolean') setKapsoNotifyAdmin(kCfg.notifyAdmin);

    const handleTelegramUpdated = (e: any) => {
      const updated = e.detail || getStoredTelegramConfig();
      setTelegramConfig(updated);
      if (updated.botToken) setTelegramToken(updated.botToken);
      if (updated.chatId) setTelegramChatId(updated.chatId);
      setTelegramEnabled(updated.enabled ?? true);
      setSpecialistTags(updated.specialistTags || {});
    };
    const handleSupabaseUpdated = (e: any) => {
      const updated = e.detail || getCurrentSupabaseConfig();
      setSupabaseConfig(getCurrentSupabaseConfig());
      if (updated.url) setSupabaseUrl(updated.url);
      if (updated.anonKey) setSupabaseAnonKey(updated.anonKey);
    };
    const handleKapsoUpdated = (e: any) => {
      const updated = e.detail || getStoredKapsoConfig();
      setKapsoConfig(updated);
      if (updated.apiKey) setKapsoApiKey(updated.apiKey);
      if (updated.phoneNumberId) setKapsoPhoneNumberId(updated.phoneNumberId);
      if (updated.adminPhone) setKapsoAdminPhone(updated.adminPhone);
      setKapsoEnabled(updated.enabled ?? false);
      setKapsoNotifyPatient(updated.notifyPatient ?? true);
      setKapsoNotifyAdmin(updated.notifyAdmin ?? true);
    };
    window.addEventListener('equilibra_telegram_config_updated', handleTelegramUpdated);
    window.addEventListener('equilibra_supabase_config_updated', handleSupabaseUpdated);
    window.addEventListener('equilibra_kapso_config_updated', handleKapsoUpdated);
    return () => {
      window.removeEventListener('equilibra_telegram_config_updated', handleTelegramUpdated);
      window.removeEventListener('equilibra_supabase_config_updated', handleSupabaseUpdated);
      window.removeEventListener('equilibra_kapso_config_updated', handleKapsoUpdated);
    };
  }, []);

  useEffect(() => {
    isBiometricsSupported().then((supported) => setBiometricAvailable(supported));
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserNotifEnabled(Notification.permission === 'granted');
    }
  }, []);

  const resetSessionTimer = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (authenticatedUser) {
      sessionTimeoutRef.current = setTimeout(() => {
        setAuthenticatedUser(null);
        clearStaffSession();
        setPin('');
        recordSecurityEvent({
          action: 'AUTH_FAILED',
          severity: 'INFO',
          details: 'Sesión clínica cerrada automáticamente por inactividad (15 min).',
        });
      }, 15 * 60 * 1000);
    }
  };

  useEffect(() => {
    if (authenticatedUser) {
      loadClinicalData();
      resetSessionTimer();
    }
    return () => {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, [authenticatedUser]);

  useEffect(() => {
    const handleNotifUpdate = () => setNotifications(getStoredNotifications());
    const handlePatientsUpdate = () => setRegisteredPatients(getStoredPatients());
    window.addEventListener('equilibra_notifications_updated', handleNotifUpdate);
    window.addEventListener('equilibra_patients_updated', handlePatientsUpdate);
    setNotifications(getStoredNotifications());
    setRegisteredPatients(getStoredPatients());
    return () => {
      window.removeEventListener('equilibra_notifications_updated', handleNotifUpdate);
      window.removeEventListener('equilibra_patients_updated', handlePatientsUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadClinicalData = async () => {
    setIsLoadingData(true);
    try {
      const [dbAppointments, dbMessages] = await Promise.all([
        getAppointmentsFromDatabase(),
        getContactMessagesFromDb().catch(() => []),
      ]);
      const local = getSavedAppointments();
      const combined = [
        ...dbAppointments,
        ...local.filter((l) => !dbAppointments.some((d) => d.id === l.id)),
      ];
      setAppointments(combined);
      setContactMessages(dbMessages || []);
      setRegisteredPatients(getStoredPatients());

      if (isSupabaseConfigured) {
        setSupabaseStatus('ok');
        setSupabaseMsg(`Supabase activo · ${combined.length} citas`);
      }
    } catch {
      if (isSupabaseConfigured) {
        setSupabaseStatus('error');
        setSupabaseMsg('Error Supabase (modo local activo)');
      }
      setAppointments(getSavedAppointments());
    } finally {
      setIsLoadingData(false);
    }
    setSecurityLogs(getSecurityLogs());
    setNotifications(getStoredNotifications());
  };

  const testSupabaseConnection = async () => {
    if (!isSupabaseConfigured) {
      setSupabaseStatus('error');
      setSupabaseMsg('Variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no configuradas.');
      return;
    }
    setSupabaseStatus('testing');
    setSupabaseMsg('Probando conexión...');
    try {
      const { error } = await supabase.from('appointments').select('id').limit(1);
      if (error) {
        setSupabaseStatus('error');
        setSupabaseMsg(
          error.code === '42P01'
            ? 'Tabla "appointments" no existe. Ejecuta el schema SQL.'
            : `Error DB: ${error.message}`
        );
      } else {
        setSupabaseStatus('ok');
        setSupabaseMsg('Conexión verificada · Tabla appointments OK');
        await loadClinicalData();
      }
    } catch (err: any) {
      setSupabaseStatus('error');
      setSupabaseMsg(`Sin conexión: ${err?.message || 'Error de red'}`);
    }
  };

  const currentSelectedUser =
    selectedUserType === 'admin'
      ? ADMIN_ACCOUNT
      : SPECIALISTS_ACCOUNTS.find((s) => s.id === selectedSpecialistId) || SPECIALISTS_ACCOUNTS[0];

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const result = verifyUserPin(currentSelectedUser.id, pin);
    if (result.success && result.user) {
      setAuthenticatedUser(result.user);
      setStaffSession(result.user);
      setPin('');
      setActiveTab('dashboard');
      recordSecurityEvent({
        action: 'AUTH_SUCCESS',
        severity: 'INFO',
        details: `Inicio de sesión exitoso con PIN para [${result.user.name}] (${result.user.role}).`,
      });
    } else {
      setAuthError(result.message);
      recordSecurityEvent({
        action: 'AUTH_FAILED',
        severity: 'WARNING',
        details: `Intento fallido de autenticación para usuario [${currentSelectedUser.name}].`,
      });
    }
  };

  const handleBiometricLogin = async () => {
    setAuthError(null);
    setIsAuthenticatingBiometric(true);
    try {
      const bioResult = await authenticateWithBiometrics(currentSelectedUser.id);
      if (bioResult.success) {
        setAuthenticatedUser(currentSelectedUser);
        setStaffSession(currentSelectedUser);
        setBiometricRegisteredForUser(currentSelectedUser.id, true);
        setActiveTab('dashboard');
        recordSecurityEvent({
          action: 'AUTH_SUCCESS',
          severity: 'INFO',
          details: `Inicio de sesión biométrico exitoso para [${currentSelectedUser.name}].`,
        });
      } else {
        setAuthError(bioResult.message);
      }
    } catch {
      setAuthError('No se pudo verificar la huella dactilar.');
    } finally {
      setIsAuthenticatingBiometric(false);
    }
  };

  const handleRegisterBiometrics = async () => {
    if (!authenticatedUser) return;
    try {
      const res = await registerBiometricCredential(authenticatedUser.id, authenticatedUser.name);
      if (res.success) {
        setBiometricRegisteredForUser(authenticatedUser.id, true);
        showToast('Huella dactilar / FaceID vinculada con éxito a tu cuenta.', 'success');
      }
    } catch {
      showToast('No se pudo registrar la biometría en este dispositivo.', 'error');
    }
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    clearStaffSession();
    setPin('');
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
  };

  const handleExportToExcel = () => {
    setIsExportingExcel(true);
    try {
      const result = exportAppointmentsToExcel({
        appointments,
        specialistFilterId: specialistFilter,
        filenamePrefix: 'EQUILIBRA_Cierre_Mensual',
      });
      if (result.success) {
        showToast(`Base de datos exportada (${result.filename}) correctamente.`, 'success');
      } else {
        showToast('No se pudo generar el archivo Excel.', 'error');
      }
    } catch {
      showToast('Error al exportar la base de datos.', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleUpdateStatus = (
    id: string,
    newStatus: 'confirmada' | 'pendiente_validacion' | 'cancelada' | 'completada'
  ) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    setAppointments(updated);
    const target = updated.find((a) => a.id === id);
    if (target) {
      saveAppointmentToStorage(target);
      recordSecurityEvent({
        action: 'BOOKING_SUCCESS',
        severity: 'INFO',
        details: `Estado de cita [${target.code}] actualizado a '${newStatus}' por ${authenticatedUser?.name}.`,
      });
      setSecurityLogs(getSecurityLogs());
      showToast(`Cita ${target.code} actualizada a ${newStatus.replace('_', ' ')}.`, 'success');
    }
  };

  const handleReassignSpecialist = (appointmentId: string, newSpecialistId: string) => {
    const targetSpec = SPECIALISTS_ACCOUNTS.find((s) => s.id === newSpecialistId);
    if (!targetSpec) return;

    const updated = appointments.map((a) =>
      a.id === appointmentId ? { ...a, specialistId: targetSpec.id, specialistName: targetSpec.name } : a
    );
    setAppointments(updated);
    const target = updated.find((a) => a.id === appointmentId);
    if (target) {
      saveAppointmentToStorage(target);
      recordSecurityEvent({
        action: 'BOOKING_SUCCESS',
        severity: 'INFO',
        details: `Cita [${target.code}] reasignada a ${targetSpec.name} por ${authenticatedUser?.name}.`,
      });
      setSecurityLogs(getSecurityLogs());
      showToast(`Cita ${target.code} reasignada a ${targetSpec.name}.`, 'success');
    }
  };

  const handleCopyPortalLink = (code: string, patientName: string) => {
    const directLink = getDirectPortalLink(code);
    navigator.clipboard?.writeText(directLink);
    showToast(`Enlace 1-Click copiado para ${patientName} (${code}).`, 'info');
  };

  const handleConfirmClearAction = async () => {
    if (!confirmActionModal) return;
    setIsClearing(true);
    try {
      if (confirmActionModal.type === 'single_appointment' && confirmActionModal.targetId) {
        await deleteAppointmentFromStorageAndServer(confirmActionModal.targetId);
        setAppointments((prev) =>
          prev.filter((a) => a.id !== confirmActionModal.targetId && a.code !== confirmActionModal.targetId)
        );
        showToast('Cita eliminada correctamente.', 'success');
      } else if (confirmActionModal.type === 'appointments') {
        await clearAllAppointmentsFromSystem();
        setAppointments([]);
        showToast('Todas las citas han sido eliminadas del sistema.', 'success');
      } else if (confirmActionModal.type === 'notifications') {
        clearAllStoredNotifications();
        setNotifications([]);
        showToast('Historial de notificaciones vaciado.', 'success');
      } else if (confirmActionModal.type === 'all') {
        await clearAllAppointmentsFromSystem();
        clearAllStoredNotifications();
        setAppointments([]);
        setNotifications([]);
        showToast('Citas y alertas restablecidas por completo.', 'success');
      } else if (confirmActionModal.type === 'archive_patient' && confirmActionModal.targetId) {
        await deletePatientFromDb(confirmActionModal.targetId);
        deleteStoredPatient(confirmActionModal.targetId);
        setRegisteredPatients(getStoredPatients());
        if (detailPatient?.id === confirmActionModal.targetId) {
          setDetailPatient(null);
        }
        showToast('Expediente archivado conservando historial clínico.', 'success');
      } else if (confirmActionModal.type === 'delete_message' && confirmActionModal.targetId) {
        await deleteContactMessageFromDb(confirmActionModal.targetId);
        setContactMessages((prev) => prev.filter((m) => m.id !== confirmActionModal.targetId));
        showToast('Mensaje eliminado de la bandeja.', 'success');
      }
    } catch {
      showToast('Error al procesar la acción solicitada.', 'error');
    } finally {
      setIsClearing(false);
      setConfirmActionModal(null);
    }
  };

  const handleExecuteMonthlyCutoff = async () => {
    if (!monthlyCutoffModal) return;
    setIsProcessingCutoff(true);
    setCutoffResultMsg(null);
    try {
      if (monthlyCutoffModal.exportBeforeDelete) {
        exportAppointmentsToExcel({
          appointments: appointments.filter((a) => a.fecha && a.fecha < monthlyCutoffModal.cutoffDate),
          specialistFilterId: 'TODOS',
          filenamePrefix: `EQUILIBRA_Cierre_Mes_${monthlyCutoffModal.cutoffDate}`,
        });
      }
      const result = await performMonthlyCutoff(
        monthlyCutoffModal.cutoffDate,
        monthlyCutoffModal.onlyCompletedOrCanceled
      );
      await loadClinicalData();
      recordSecurityEvent({
        action: 'BOOKING_SUCCESS',
        severity: 'INFO',
        details: `Corte mensual hasta ${monthlyCutoffModal.cutoffDate}: ${result.deletedCount} citas procesadas por ${authenticatedUser?.name}.`,
      });
      setCutoffResultMsg({
        type: 'success',
        text: `Cierre mensual completado: ${result.deletedCount} citas depuradas.`,
      });
      setTimeout(() => {
        setMonthlyCutoffModal(null);
        setCutoffResultMsg(null);
      }, 2500);
    } catch (err: any) {
      setCutoffResultMsg({
        type: 'error',
        text: err?.message || 'Error al procesar el corte mensual.',
      });
    } finally {
      setIsProcessingCutoff(false);
    }
  };

  // Absence handlers
  const openAbsenceModal = (member: TeamMember) => {
    setEditingAbsenceMember(member);
    const existing = specialistAvailabilities[member.id];
    if (existing) {
      setIsInactiveForm(existing.isInactive);
      setAbsenceReason(existing.reason || 'enfermedad');
      setAbsenceReasonDetails(existing.reasonDetails || '');
      setInactiveFromDate(existing.inactiveFrom || todayStr);
      setInactiveUntilDate(existing.inactiveUntil || '');
      setSubstituteId(existing.substituteSpecialistId || '');
      setAbsenceNotes(existing.notes || '');
    } else {
      setIsInactiveForm(true);
      setAbsenceReason('enfermedad');
      setAbsenceReasonDetails('Reposo médico');
      setInactiveFromDate(todayStr);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 3);
      setInactiveUntilDate(nextWeek.toISOString().split('T')[0]);
      setSubstituteId('');
      setAbsenceNotes('');
    }
  };

  const handleSaveAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAbsenceMember) return;
    const substitute = TEAM_MEMBERS.find((m) => m.id === substituteId);
    const absenceData: SpecialistAbsence = {
      isInactive: isInactiveForm,
      reason: absenceReason,
      reasonDetails: absenceReasonDetails.trim(),
      inactiveFrom: isInactiveForm ? inactiveFromDate : undefined,
      inactiveUntil: isInactiveForm ? inactiveUntilDate : undefined,
      substituteSpecialistId: isInactiveForm && substitute ? substitute.id : undefined,
      substituteSpecialistName: isInactiveForm && substitute ? substitute.name : undefined,
      notes: absenceNotes.trim(),
    };
    saveSpecialistAvailability(editingAbsenceMember.id, absenceData);
    setSpecialistAvailabilities(getStoredSpecialistsAvailability());
    setEditingAbsenceMember(null);
    showToast(`Disponibilidad de ${editingAbsenceMember.name} actualizada.`, 'success');
  };

  // Telegram & Kapso & Supabase config handlers
  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveTelegramConfig({
      botToken: telegramToken.trim(),
      chatId: telegramChatId.trim(),
      enabled: telegramEnabled,
      notifyOnBooking: true,
      notifyOnCancellation: true,
      specialistTags,
    });
    setTelegramConfig(updated);
    setTelegramSaveSuccess(true);
    setTimeout(() => setTelegramSaveSuccess(false), 3500);
  };

  const handleTestTelegram = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTelegramTestResult({ success: false, message: 'Ingresa Bot Token y Chat ID antes de probar.' });
      return;
    }
    setIsTestingTelegram(true);
    setTelegramTestResult(null);
    const res = await testTelegramNotification(telegramToken.trim(), telegramChatId.trim());
    setTelegramTestResult(res);
    setIsTestingTelegram(false);
    if (res.success) setTelegramConfig(getStoredTelegramConfig());
  };

  const handleSaveKapso = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveKapsoConfig({
      apiKey: kapsoApiKey.trim(),
      phoneNumberId: kapsoPhoneNumberId.trim(),
      adminPhone: kapsoAdminPhone.trim(),
      enabled: kapsoEnabled,
      notifyPatient: kapsoNotifyPatient,
      notifyAdmin: kapsoNotifyAdmin,
    });
    setKapsoConfig(updated);
    setKapsoSaveSuccess(true);
    setTimeout(() => setKapsoSaveSuccess(false), 3500);
  };

  const handleTestKapso = async () => {
    if (!kapsoApiKey.trim() || !kapsoPhoneNumberId.trim()) {
      setKapsoTestResult({ success: false, message: 'Ingresa API Key y Phone Number ID de Kapso.' });
      return;
    }
    setIsTestingKapso(true);
    setKapsoTestResult(null);
    const res = await testKapsoNotification(kapsoApiKey.trim(), kapsoPhoneNumberId.trim(), kapsoAdminPhone.trim());
    setKapsoTestResult(res);
    setIsTestingKapso(false);
  };

  const handleUpdateSpecialistTag = (memberId: string, tag: string) => {
    setSpecialistTags((prev) => ({ ...prev, [memberId]: tag }));
  };

  const handleSaveAllSpecialistTags = () => {
    const updated = saveTelegramConfig({ specialistTags });
    setTelegramConfig(updated);
    setTagsSaveSuccess(true);
    setTimeout(() => setTagsSaveSuccess(false), 3500);
  };

  const handleTestSpecificTag = async (member: TeamMember) => {
    const tag = specialistTags[member.id] || '';
    if (!tag.trim()) {
      setSpecialistTagTestResult({ memberId: member.id, success: false, message: `Escribe el @usuario para ${member.name}.` });
      return;
    }
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setSpecialistTagTestResult({ memberId: member.id, success: false, message: 'Configura Token y Chat ID de Telegram primero.' });
      return;
    }
    setTestingTagMemberId(member.id);
    setSpecialistTagTestResult(null);
    const res = await testTelegramSpecialistTagging(
      telegramToken.trim(),
      telegramChatId.trim(),
      member.name,
      tag,
      member.role || member.specialty
    );
    setSpecialistTagTestResult({ memberId: member.id, success: res.success, message: res.message });
    setTestingTagMemberId(null);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveSupabaseCredentials(supabaseUrl, supabaseAnonKey)) {
      setSupabaseSaveSuccess(true);
      setSupabaseConfig(getCurrentSupabaseConfig());
      setTimeout(() => setSupabaseSaveSuccess(false), 3000);
      loadClinicalData();
    }
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    const res = await testConnection(supabaseUrl, supabaseAnonKey);
    setSupabaseTestResult(res);
    setIsTestingSupabase(false);
  };

  const handleClearSupabase = () => {
    clearSupabaseCredentials();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setSupabaseConfig(getCurrentSupabaseConfig());
    setSupabaseTestResult(null);
    loadClinicalData();
  };

  // Document PDF handlers for PatientDetailModal
  const handleSavePatientDocument = async (newDoc: MedicalRecordDocument) => {
    if (!uploadPdfPatient) return;
    await addDocumentToPatient(uploadPdfPatient.id, newDoc);
    const updatedList = getStoredPatients();
    const target = updatedList.find((p) => p.id === uploadPdfPatient.id);
    if (target) {
      const docs = [...(target.documents || []), newDoc];
      const merged = { ...target, documents: docs };
      saveStoredPatient(merged);
      setDetailPatient(merged);
    }
    setRegisteredPatients(getStoredPatients());
    setUploadPdfPatient(null);
    showToast('Documento clínico adjuntado al expediente.', 'success');
  };

  const handleDeletePatientDocument = async (patientId: string, docId: string) => {
    await removeDocumentFromPatient(patientId, docId);
    const updatedList = getStoredPatients();
    const target = updatedList.find((p) => p.id === patientId);
    if (target) {
      const merged = { ...target, documents: (target.documents || []).filter((d) => d.id !== docId) };
      saveStoredPatient(merged);
      setDetailPatient(merged);
    }
    setRegisteredPatients(getStoredPatients());
    showToast('Documento eliminado del expediente.', 'info');
  };

  const handleUpdateMessageStatus = async (id: string, status: 'NUEVO' | 'RESPONDIDO' | 'ARCHIVADO') => {
    await updateContactMessageStatus(id, status);
    setContactMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    showToast(`Consulta marcada como ${status.toLowerCase()}.`, 'success');
  };

  // Role checks
  const isAdmin = isUserAdmin(authenticatedUser);
  const isSpecialist = Boolean(authenticatedUser && !isAdmin);

  // Filtered notifications
  const visibleNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        if (!authenticatedUser) return false;
        if (isAdmin) return true;
        if (n.specialistId) return n.specialistId === authenticatedUser.id;
        return isAppointmentAssignedToSpecialist(n as any, authenticatedUser as SpecialistUser);
      }),
    [notifications, authenticatedUser, isAdmin]
  );

  // Filtered appointments
  const filteredAppointments = useMemo(
    () =>
      appointments.filter((app) => {
        if (isSpecialist) {
          if (!isAppointmentAssignedToSpecialist(app, authenticatedUser as SpecialistUser)) return false;
        } else if (isAdmin && specialistFilter !== 'TODOS') {
          if (!matchesSpecialistFilter(app, specialistFilter)) return false;
        }

        const matchesDate = !selectedDateFilter || app.fecha === selectedDateFilter;

        let matchesMonth = true;
        if (selectedMonthFilter !== 'ALL' && !selectedDateFilter) {
          const now = new Date();
          const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const targetMonth = selectedMonthFilter === 'CURRENT' ? currentYearMonth : selectedMonthFilter;
          matchesMonth = Boolean(app.fecha && app.fecha.startsWith(targetMonth));
        }

        const st = (app.status || '').toLowerCase();
        const matchesStatus =
          statusFilter === 'TODAS' ||
          (statusFilter === 'CONFIRMADAS' && st === 'confirmada') ||
          (statusFilter === 'PENDIENTES' && (st === 'pendiente_validacion' || st === 'pendiente')) ||
          (statusFilter === 'COMPLETADAS' && st === 'completada') ||
          (statusFilter === 'CANCELADAS' && st === 'cancelada');

        const search = searchQuery.toLowerCase().trim();
        const cleanSearch = search.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const cleanSearchNoEq = cleanSearch.replace(/^EQ/, '');
        const appCodeClean = (app.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const appIdClean = (app.id || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const searchDigits = search.replace(/[^\d]/g, '');
        const appPhoneDigits = (app.telefono || '').replace(/[^\d]/g, '');

        const matchesSearch =
          !search ||
          (app.nombre && app.nombre.toLowerCase().includes(search)) ||
          (app.apellido && app.apellido.toLowerCase().includes(search)) ||
          (app.code && app.code.toLowerCase().includes(search)) ||
          (app.id && app.id.toLowerCase().includes(search)) ||
          (cleanSearch.length >= 3 &&
            (appCodeClean.includes(cleanSearch) || cleanSearch.includes(appCodeClean) || appIdClean.includes(cleanSearch))) ||
          (cleanSearchNoEq.length >= 4 && appCodeClean.includes(cleanSearchNoEq)) ||
          (searchDigits.length >= 4 && appPhoneDigits.includes(searchDigits)) ||
          (app.email && app.email.toLowerCase().includes(search)) ||
          (app.motivoConsulta && app.motivoConsulta.toLowerCase().includes(search));

        return matchesDate && matchesMonth && matchesStatus && matchesSearch;
      }),
    [appointments, isSpecialist, isAdmin, authenticatedUser, specialistFilter, selectedDateFilter, selectedMonthFilter, statusFilter, searchQuery]
  );

  const totalConfirmed = filteredAppointments.filter((a) => {
    const st = (a.status || '').toLowerCase();
    return st === 'confirmada' || st === 'completada';
  }).length;
  const totalPending = filteredAppointments.filter((a) => {
    const st = (a.status || '').toLowerCase();
    return st === 'pendiente_validacion' || st === 'pendiente';
  }).length;
  const totalCancellations = filteredAppointments.filter((a) => (a.status || '').toLowerCase() === 'cancelada');
  const totalPenalties = filteredAppointments.reduce((acc, a) => acc + ((a as any).cancellationPenaltyFee || a.cancellationFeeAmount || 0), 0);
  const estimatedRevenue = filteredAppointments
    .filter((a) => (a.status || '').toLowerCase() !== 'cancelada')
    .reduce((acc, a) => acc + (typeof a.amount === 'number' && a.amount > 0 ? a.amount : 35), 0);
  const todayAppointmentsCount = filteredAppointments.filter((a) => a.fecha === todayStr).length;
  const unreadMessagesCount = contactMessages.filter((m) => (m.status || 'NUEVO') === 'NUEVO').length;

  // Build unified patient directory
  const uniquePatients = useMemo(() => {
    const uniquePatientsMap = new Map<
      string,
      {
        id?: string;
        isRegisteredRecord?: boolean;
        name: string;
        nombre: string;
        apellido: string;
        cedula?: string;
        fechaNacimiento?: string;
        edad?: number;
        genero?: 'M' | 'F' | 'OTRO';
        direccion?: string;
        phone: string;
        email: string;
        bloodType?: string;
        allergies?: string;
        chronicConditions?: string;
        currentMedication?: string;
        emergencyContactName?: string;
        emergencyContactPhone?: string;
        notes?: string;
        assignedSpecialistId?: string;
        assignedSpecialistName?: string;
        totalVisits: number;
        lastVisitDate: string;
        lastSpecialist: string;
        lastReason?: string;
        registeredAt?: string;
        hasPackage?: boolean;
        packageName?: string;
        packageUsedSessions?: number;
        packageTotalSessions?: number;
        packageCode?: string;
        portalCode?: string;
        cancellationCount: number;
        completedVisits: number;
        rescheduledCount: number;
      }
    >();

    registeredPatients
      .filter((rp) => !rp.archived)
      .forEach((rp) => {
        if (isSpecialist) {
          const isAssigned =
            (rp as any).assignedSpecialistId === authenticatedUser?.id ||
            ((rp as any).assignedSpecialistName &&
              isAppointmentAssignedToSpecialist(
                { specialistName: (rp as any).assignedSpecialistName } as any,
                authenticatedUser as SpecialistUser
              ));
          const hasAppWithSpecialist = appointments.some(
            (a) =>
              isAppointmentAssignedToSpecialist(a, authenticatedUser as SpecialistUser) &&
              (a.email?.toLowerCase() === rp.email?.toLowerCase() ||
                `${a.nombre} ${a.apellido}`.trim().toLowerCase() === `${rp.nombre} ${rp.apellido}`.trim().toLowerCase())
          );
          if (!isAssigned && !hasAppWithSpecialist) return;
        } else if (isAdmin && specialistFilter !== 'TODOS') {
          const targetSpecialist = SPECIALISTS_ACCOUNTS.find((s) => s.id === specialistFilter);
          if (targetSpecialist) {
            const isAssigned =
              (rp as any).assignedSpecialistId === targetSpecialist.id ||
              ((rp as any).assignedSpecialistName &&
                isAppointmentAssignedToSpecialist(
                  { specialistName: (rp as any).assignedSpecialistName } as any,
                  targetSpecialist
                ));
            const hasAppWithSpecialist = appointments.some(
              (a) =>
                isAppointmentAssignedToSpecialist(a, targetSpecialist) &&
                (a.email?.toLowerCase() === rp.email?.toLowerCase() ||
                  `${a.nombre} ${a.apellido}`.trim().toLowerCase() === `${rp.nombre} ${rp.apellido}`.trim().toLowerCase())
            );
            if (!isAssigned && !hasAppWithSpecialist) return;
          }
        }

        const pNombre = (rp.nombre || '').trim();
        const pApellido = (rp.apellido || '').trim();
        if (!pNombre && !pApellido) return;

        const key = `${pNombre.toLowerCase()}_${pApellido.toLowerCase()}`;
        uniquePatientsMap.set(key, {
          id: rp.id,
          isRegisteredRecord: true,
          name: `${pNombre} ${pApellido}`.trim(),
          nombre: pNombre,
          apellido: pApellido,
          cedula: rp.cedula,
          fechaNacimiento: rp.fechaNacimiento,
          edad: rp.edad,
          genero: rp.genero,
          direccion: rp.direccion,
          phone: rp.telefono || '',
          email: rp.email || '',
          bloodType: (rp as any).bloodType,
          allergies: rp.alergias,
          chronicConditions: rp.medicalConditions || rp.antecedentes,
          currentMedication: rp.medicamentosActuales,
          emergencyContactName: rp.contactoEmergencia?.nombre,
          emergencyContactPhone: rp.contactoEmergencia?.telefono,
          notes: rp.clinicalNotes,
          assignedSpecialistId: (rp as any).assignedSpecialistId,
          assignedSpecialistName: (rp as any).assignedSpecialistName,
          totalVisits: rp.completedAppointments || rp.totalAppointments || 0,
          completedVisits: rp.completedAppointments || 0,
          rescheduledCount: rp.rescheduledAppointments || 0,
          hasPackage: Boolean(rp.hasPackage || rp.packageName || rp.packageTotalSessions),
          packageName: rp.packageName,
          packageUsedSessions: rp.packageUsedSessions || 0,
          packageTotalSessions: rp.packageTotalSessions || 0,
          cancellationCount: rp.cancellationCount || 0,
          lastVisitDate: rp.lastVisit || (rp.createdAt ? rp.createdAt.split('T')[0] : todayStr),
          lastSpecialist: (rp as any).assignedSpecialistName || 'Sin asignar',
          lastReason: rp.clinicalNotes || 'Expediente clínico completo',
          registeredAt: rp.createdAt || todayStr,
        });
      });

    appointments.forEach((app) => {
      if (isSpecialist) {
        if (!isAppointmentAssignedToSpecialist(app, authenticatedUser as SpecialistUser)) return;
      } else if (isAdmin && specialistFilter !== 'TODOS') {
        if (!matchesSpecialistFilter(app, specialistFilter)) return;
      }

      const appNombre = (app.nombre || '').trim();
      const appApellido = (app.apellido || '').trim();
      if (!appNombre && !appApellido) return;

      const key = `${appNombre.toLowerCase()}_${appApellido.toLowerCase()}`;
      const statusLower = (app.status || '').toLowerCase();
      const isCancelled = statusLower === 'cancelada';
      const isRescheduled = statusLower === 'reprogramada' || Boolean(app.rescheduledCount && app.rescheduledCount > 0);
      const isCompleted = statusLower === 'completada';

      const existing = uniquePatientsMap.get(key);
      if (existing) {
        existing.totalVisits += 1;
        if (isCompleted) existing.completedVisits += 1;
        if (isCancelled) existing.cancellationCount += 1;
        if (isRescheduled) existing.rescheduledCount += 1;
        if (!existing.id && (app.patientId || app.patient_id)) existing.id = app.patientId || app.patient_id;
        if (app.fecha && app.fecha >= existing.lastVisitDate) {
          existing.lastVisitDate = app.fecha;
          existing.lastSpecialist = app.specialistName || existing.lastSpecialist || 'Especialista';
          existing.lastReason = app.motivoConsulta || existing.lastReason;
        }
        if (!existing.phone && app.telefono) existing.phone = app.telefono;
        if (!existing.email && app.email) existing.email = app.email;
        if ((app.packageTotalSessions || 0) > 1 || app.packageCode) {
          existing.hasPackage = true;
          existing.packageName = app.selectedPackageName || existing.packageName;
          existing.packageTotalSessions = app.packageTotalSessions || existing.packageTotalSessions || 0;
          existing.packageUsedSessions = Math.max(existing.packageUsedSessions || 0, app.packageSessionNumber || 1);
          if (app.packageCode) existing.packageCode = app.packageCode;
        }
        if (app.packageCode || app.code) {
          existing.portalCode = existing.portalCode || app.packageCode || app.code;
        }
      } else {
        const generatedId =
          app.patientId ||
          app.patient_id ||
          `PAC-${Math.abs((key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000) % 9000) + 1000)}`;
        uniquePatientsMap.set(key, {
          id: generatedId,
          name: `${appNombre} ${appApellido}`.trim(),
          nombre: appNombre,
          apellido: appApellido,
          phone: app.telefono || '',
          email: app.email || '',
          totalVisits: 1,
          completedVisits: isCompleted ? 1 : 0,
          rescheduledCount: isRescheduled ? 1 : 0,
          hasPackage: Boolean((app.packageTotalSessions || 0) > 1 || app.packageCode),
          packageName: app.selectedPackageName,
          packageUsedSessions: app.packageSessionNumber || 1,
          packageTotalSessions: app.packageTotalSessions || 0,
          packageCode: app.packageCode,
          portalCode: app.packageCode || app.code,
          cancellationCount: isCancelled ? 1 : app.cancellationCount || 0,
          lastVisitDate: app.fecha || todayStr,
          lastSpecialist: app.specialistName || 'Especialista',
          lastReason: app.motivoConsulta,
        });
      }
    });

    const search = searchQuery.toLowerCase().trim();
    return Array.from(uniquePatientsMap.values()).filter(
      (p) =>
        !search ||
        p.name.toLowerCase().includes(search) ||
        (p.phone && p.phone.toLowerCase().includes(search)) ||
        (p.email && p.email.toLowerCase().includes(search)) ||
        (p.cedula && p.cedula.toLowerCase().includes(search)) ||
        (p.id && formatPatientDisplayId(p.id).toLowerCase().includes(search))
    );
  }, [registeredPatients, appointments, isSpecialist, isAdmin, authenticatedUser, specialistFilter, searchQuery, todayStr]);

  const toPatientRecord = (pat: typeof uniquePatients[number], existing?: PatientRecord): PatientRecord => {
    if (existing) return existing;
    return {
      id: pat.id || `PAC-${Math.floor(1000 + Math.random() * 9000)}`,
      nombre: pat.nombre,
      apellido: pat.apellido,
      cedula: pat.cedula,
      telefono: pat.phone,
      email: pat.email,
      fechaNacimiento: pat.fechaNacimiento,
      edad: pat.edad,
      genero: pat.genero,
      direccion: pat.direccion,
      totalAppointments: pat.totalVisits,
      completedAppointments: pat.completedVisits,
      canceledAppointments: pat.cancellationCount,
      rescheduledAppointments: pat.rescheduledCount,
      lastVisit: pat.lastVisitDate,
      totalSpent: 0,
      firstVisitDate: pat.lastVisitDate || todayStr,
      clinicalNotes: pat.notes || pat.lastReason,
      medicalConditions: pat.chronicConditions,
      alergias: pat.allergies,
      antecedentes: pat.chronicConditions,
      medicamentosActuales: pat.currentMedication,
      hasPackage: pat.hasPackage,
      packageName: pat.packageName,
      packageCode: pat.packageCode,
      packageTotalSessions: pat.packageTotalSessions,
      packageUsedSessions: pat.packageUsedSessions,
      cancellationCount: pat.cancellationCount,
      createdAt: pat.registeredAt || new Date().toISOString(),
    };
  };

  // Service distribution for Dashboard
  const topServices = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAppointments.forEach((a) => {
      const label = a.selectedPackageName || a.serviceTitle || a.service_title || a.serviceId || 'Fisioterapia';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredAppointments]);

  const filteredLogs = useMemo(() => {
    const q = auditSearch.toLowerCase().trim();
    if (!q) return securityLogs;
    return securityLogs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.severity.toLowerCase().includes(q)
    );
  }, [securityLogs, auditSearch]);

  const filteredSpecialists = useMemo(() => {
    const q = specialistSearch.toLowerCase().trim();
    if (!q) return SPECIALISTS_ACCOUNTS;
    return SPECIALISTS_ACCOUNTS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q)
    );
  }, [specialistSearch]);

  const navGroups: { title: string; items: { id: PanelTab; label: string; icon: React.ElementType; badge?: string | number; adminOnly?: boolean }[] }[] = [
    {
      title: 'Operación Clínica',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'agenda', label: 'Agenda & Citas', icon: Calendar, badge: filteredAppointments.length },
        { id: 'pacientes', label: 'Pacientes', icon: Users, badge: uniquePatients.length },
        { id: 'mensajes', label: 'Consultas Web', icon: Mail, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
      ],
    },
    {
      title: 'Gestión Clínica',
      items: [
        { id: 'staff', label: 'Equipo Médico', icon: Stethoscope, badge: TEAM_MEMBERS.length },
        { id: 'servicios', label: 'Tarifas & Planes', icon: Package },
        { id: 'cancelaciones', label: 'Cancelaciones', icon: Ban, badge: totalCancellations.length > 0 ? totalCancellations.length : undefined },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { id: 'actualizaciones', label: 'Novedades V1.11', icon: FileText },
        { id: 'auditoria', label: 'Seguridad & Logs', icon: ShieldCheck, adminOnly: true },
        { id: 'configuracion', label: 'Integraciones', icon: Settings, adminOnly: true },
      ],
    },
  ];

  // =========================================================================
  // 1. STANDALONE LOGIN SCREEN (FULL VIEWPORT SEPARATE VIEW)
  // =========================================================================
  if (!authenticatedUser) {
    return (
      <div className="min-h-screen bg-[#F6F4EF] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Top Minimal Utility Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0F1522]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0C0C0C] border border-[#B1A086]/40 p-1.5 flex items-center justify-center shrink-0">
              <img src="/brand_book/isotipo_tres_barras_creamy.svg" alt="EQUILIBRA" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-black tracking-wider uppercase font-heading">EQUILIBRA</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Portal Administrativo & Clínico</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Alternar tema"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Sitio Público</span>
            </button>
          </div>
        </header>

        {/* Centered Dual-Column Login Canvas */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Left Info Panel */}
            <div className="lg:col-span-5 bg-[#0C0C0C] text-[#F2EFE8] p-6 sm:p-8 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-slate-800">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#B1A086]/15 border border-[#B1A086]/40 flex items-center justify-center text-[#B1A086]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#B1A086] uppercase tracking-wider">Acceso Restringido</p>
                    <h1 className="text-xl font-black font-heading text-white leading-tight">
                      Consola Clínica EQUILIBRA
                    </h1>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Entorno independiente para la dirección médica y fisioterapeutas colegiados. Gestiona agendas, expedientes con línea de tiempo, cierres mensuales e integraciones de mensajería.
                </p>

                <div className="pt-2 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B1A086] shrink-0" />
                    <span>Aislamiento de agendas por especialista</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B1A086] shrink-0" />
                    <span>Expedientes digitales con ID único PAC-XXXX</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B1A086] shrink-0" />
                    <span>Cierre automático tras 15 min de inactividad</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Sede Sabana Grande · Caracas</p>
                <p>Centro Profesional del Este, Piso 4, Ofic. 46</p>
              </div>
            </div>

            {/* Right Login Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Selecciona tu rol e ingresa tu PIN de seguridad o biometría.
                </p>
              </div>

              {/* Role Segmented Switch */}
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedUserType('admin')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedUserType === 'admin'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Administrador General</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserType('specialist')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedUserType === 'specialist'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Especialistas ({SPECIALISTS_ACCOUNTS.length})</span>
                </button>
              </div>

              {/* Account Selector */}
              {selectedUserType === 'admin' ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                    ADM
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{ADMIN_ACCOUNT.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {ADMIN_ACCOUNT.email} · Control Total del Sistema
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={specialistSearch}
                      onChange={(e) => setSpecialistSearch(e.target.value)}
                      placeholder="Buscar especialista por nombre o área..."
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                    {filteredSpecialists.map((spec) => {
                      const isSel = selectedSpecialistId === spec.id;
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setSelectedSpecialistId(spec.id)}
                          className={`p-2 rounded-xl border text-left text-xs flex items-center gap-3 transition-colors cursor-pointer ${
                            isSel
                              ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 font-semibold'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <img
                            src={spec.avatarUrl}
                            alt={spec.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="block truncate font-bold text-slate-900 dark:text-white">{spec.name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{spec.role}</span>
                          </div>
                          {isSel && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PIN Form */}
              <form onSubmit={handlePinLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    PIN de Seguridad ({currentSelectedUser.name})
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={8}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      autoFocus
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center text-lg tracking-widest font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Ingresar con PIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={isAuthenticatingBiometric}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{isAuthenticatingBiometric ? 'Escaneando...' : 'Huella / FaceID'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED FULL-VIEWPORT SAAS ADMIN WORKSPACE
  // =========================================================================
  const currentTabInfo = TAB_LABELS[activeTab];

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0C0C0C] border border-[#B1A086]/40 p-1 flex items-center justify-center shrink-0">
              <img src="/brand_book/isotipo_tres_barras_creamy.svg" alt="EQUILIBRA" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-sm tracking-wider uppercase font-heading text-slate-900 dark:text-white block leading-none">
                EQUILIBRA
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate mt-0.5">
                {isAdmin ? 'Dirección Médica' : 'Portal Especialista'}
              </span>
            </div>
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-5 overflow-y-auto">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.title} className="space-y-1">
                <div className="px-2.5 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {group.title}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        if (isMobile) setMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Back to Public Site */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {authenticatedUser.name
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{authenticatedUser.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {isAdmin ? 'Administrador General' : 'Especialista'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRegisterBiometrics}
            title="Vincular huella / FaceID"
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Fingerprint className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onBackToSite}
            className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sitio Web</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="py-2 px-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex"
      onClick={resetSessionTimer}
    >
      {/* Persistent Desktop Left Sidebar (260px) */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] shrink-0 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setMobileNavOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 z-10 flex flex-col">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Top Workspace Header (64px) */}
        <header className="h-16 sticky top-0 z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          {/* Left: Mobile Menu + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="Abrir menú del panel"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="hidden sm:inline font-medium">{currentTabInfo.group}</span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
                <span className="font-bold text-slate-900 dark:text-white truncate">{currentTabInfo.label}</span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentTabInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right: 1-2 Actions + Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadClinicalData}
              disabled={isLoadingData}
              title="Sincronizar datos en vivo"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Notificaciones de citas"
              >
                <Bell className="w-4 h-4" />
                {visibleNotifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {visibleNotifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notificaciones</span>
                    <div className="flex items-center gap-2">
                      {visibleNotifications.filter((n) => !n.read).length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const visibleIds = new Set(visibleNotifications.map((n) => n.id));
                            const updated = notifications.map((n) => (visibleIds.has(n.id) ? { ...n, read: true } : n));
                            setNotifications(updated);
                            saveStoredNotifications(updated);
                          }}
                          className="text-[11px] text-amber-600 hover:underline font-semibold"
                        >
                          Marcar leídas
                        </button>
                      )}
                      {visibleNotifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmActionModal({
                              isOpen: true,
                              type: 'notifications',
                              targetTitle: 'todas las notificaciones',
                            })
                          }
                          className="text-[11px] text-red-600 hover:underline font-semibold"
                        >
                          Vaciar
                        </button>
                      )}
                    </div>
                  </div>

                  {!browserNotifEnabled && (
                    <button
                      type="button"
                      onClick={async () => {
                        const granted = await requestBrowserNotificationPermission();
                        setBrowserNotifEnabled(granted);
                        if (granted) {
                          playNotificationChime();
                          showToast('Alertas activadas en este dispositivo.', 'success');
                        }
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Activar Alertas del Navegador</span>
                    </button>
                  )}

                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {visibleNotifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No hay notificaciones pendientes.</p>
                    ) : (
                      visibleNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            const updated = notifications.map((item) => (item.id === n.id ? { ...item, read: true } : item));
                            setNotifications(updated);
                            saveStoredNotifications(updated);
                          }}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            !n.read
                              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-bold text-slate-900 dark:text-white truncate">{n.title}</span>
                            <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleExportToExcel}
              disabled={isExportingExcel}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isExportingExcel ? 'Exportando...' : 'Exportar Excel'}</span>
            </button>

            {onOpenBooking && (
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Nueva Cita</span>
              </button>
            )}
          </div>
        </header>

        {/* Inline Toast Banner */}
        {toastMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b ${
              toastMsg.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : toastMsg.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-slate-800 text-white border-slate-900'
            }`}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : toastMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Link className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Filter Toolbar for Agenda & Pacientes */}
        {(activeTab === 'agenda' || activeTab === 'pacientes') && (
          <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'agenda'
                    ? 'Buscar por paciente, código EQ, teléfono o motivo...'
                    : 'Buscar paciente por ID PAC-XXXX, nombre, cédula, teléfono o email...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isAdmin && (
              <select
                value={specialistFilter}
                onChange={(e) => setSpecialistFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium text-xs"
              >
                <option value="TODOS">Todos los Especialistas ({appointments.length})</option>
                {SPECIALISTS_ACCOUNTS.map((sp) => {
                  const count = appointments.filter((a) => isAppointmentAssignedToSpecialist(a, sp)).length;
                  return (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} ({count})
                    </option>
                  );
                })}
              </select>
            )}

            {activeTab === 'agenda' && (
              <>
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => {
                    setSelectedMonthFilter(e.target.value);
                    setSelectedDateFilter('');
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium text-xs"
                >
                  <option value="CURRENT">Mes Actual</option>
                  <option value="ALL">Todo el Historial</option>
                  {(Array.from(new Set(appointments.map((a) => (a.fecha ? a.fecha.slice(0, 7) : '')))).filter(Boolean) as string[])
                    .sort()
                    .reverse()
                    .map((ym) => {
                      const [y, m] = ym.split('-');
                      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                      return (
                        <option key={ym} value={ym}>
                          {monthNames[parseInt(m, 10) - 1]} {y}
                        </option>
                      );
                    })}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium text-xs"
                >
                  <option value="TODAS">Todos los Estados</option>
                  <option value="CONFIRMADAS">Confirmadas</option>
                  <option value="PENDIENTES">Pendientes</option>
                  <option value="COMPLETADAS">Completadas</option>
                  <option value="CANCELADAS">Canceladas</option>
                </select>

                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-mono"
                  />
                  {selectedDateFilter && (
                    <button
                      type="button"
                      onClick={() => setSelectedDateFilter('')}
                      className="text-xs text-amber-600 hover:underline font-medium"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* View Mode Switch (Table / Cards) */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setAgendaViewMode('table')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      agendaViewMode === 'table'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                    title="Vista de Tabla"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaViewMode('cards')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      agendaViewMode === 'cards'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                    title="Vista de Tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const firstDayCurrentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
                        setMonthlyCutoffModal({
                          isOpen: true,
                          cutoffDate: firstDayCurrentMonth,
                          onlyCompletedOrCanceled: false,
                          exportBeforeDelete: true,
                        });
                      }}
                      className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <CalendarRange className="w-3.5 h-3.5" />
                      <span>Cierre de Mes</span>
                    </button>

                    {appointments.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmActionModal({
                            isOpen: true,
                            type: 'appointments',
                            targetTitle: 'todas las citas registradas en el sistema',
                          })
                        }
                        className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Vaciar Todo</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'pacientes' && (
              <button
                type="button"
                onClick={() => {
                  setEditingPatient(null);
                  setIsPatientModalOpen(true);
                }}
                className="ml-auto px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrar Paciente</span>
              </button>
            )}
          </div>
        )}

        {/* Main Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto space-y-6">
          {/* =============================================================== */}
          {/* TAB 1: DASHBOARD                                                */}
          {/* =============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Sync Status Strip */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      supabaseStatus === 'ok'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : supabaseStatus === 'error'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Sincronización de Base de Datos · {supabaseStatus === 'ok' ? 'Activa' : supabaseStatus === 'testing' ? 'Verificando' : 'Local / Desconectada'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{supabaseMsg}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={testSupabaseConnection}
                    disabled={supabaseStatus === 'testing'}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    Probar Conexión
                  </button>
                  <button
                    type="button"
                    onClick={loadClinicalData}
                    disabled={isLoadingData}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 text-xs font-semibold transition-opacity cursor-pointer"
                  >
                    Sincronizar
                  </button>
                </div>
              </div>

              {/* 4-Column KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Citas del Periodo</span>
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {filteredAppointments.length}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {todayAppointmentsCount} para hoy
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Confirmadas / Asistidas</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {totalConfirmed}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium tabular-nums">
                      {totalPending} pendientes
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Pacientes Activos</span>
                    <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {uniquePatients.length}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {registeredPatients.filter((p) => !p.archived).length} fichas
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Ingresos Estimados</span>
                    <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      ${estimatedRevenue}
                    </span>
                    <span className="text-xs text-rose-600 dark:text-rose-400 tabular-nums">
                      {totalCancellations.length} anuladas
                    </span>
                  </div>
                </div>
              </div>

              {/* Split Dashboard Workspace: Upcoming Appointments + Service Breakdown */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Upcoming Appointments Queue */}
                <div className="xl:col-span-8 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Próximas Citas en Agenda</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isSpecialist ? `Asignadas a ${authenticatedUser.name}` : 'Todas las reservas recientes de la clínica'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('agenda')}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver agenda completa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {filteredAppointments.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No hay citas registradas en este periodo</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cambia el filtro de mes en la pestaña Agenda o crea una nueva reserva manual.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredAppointments.slice(0, 6).map((app) => (
                        <div
                          key={app.id}
                          className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                                {app.code}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">·</span>
                              <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                {app.nombre} {app.apellido}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">·</span>
                              <span
                                className={`text-[11px] font-semibold ${
                                  (app.status || '').toLowerCase() === 'confirmada'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : (app.status || '').toLowerCase() === 'cancelada'
                                    ? 'text-red-600 dark:text-red-400'
                                    : (app.status || '').toLowerCase() === 'completada'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 font-mono tabular-nums">
                              <span>{app.fecha} · {app.hora}</span>
                              <span>/</span>
                              <span className="font-sans">{app.selectedPackageName || app.serviceId}</span>
                              <span>/</span>
                              <span className="font-sans">{app.specialistName || 'Sin asignar'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={generateWhatsAppAlertUrl(app)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            {(app.status || '').toLowerCase() !== 'confirmada' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app.id, 'confirmada')}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Validar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Service Demand + Quick Links */}
                <div className="xl:col-span-4 space-y-6">
                  <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Servicios Más Solicitados</h3>
                      <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>

                    {topServices.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 py-4">Sin suficientes datos en este periodo.</p>
                    ) : (
                      <div className="space-y-3">
                        {topServices.map(([name, count]) => {
                          const pct = Math.round((count / Math.max(1, filteredAppointments.length)) * 100);
                          return (
                            <div key={name} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">{name}</span>
                                <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div className="h-full bg-amber-600 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Accesos Rápidos</h3>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPatient(null);
                          setIsPatientModalOpen(true);
                        }}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left font-semibold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Registrar Nuevo Paciente</span>
                        <UserPlus className="w-4 h-4 text-amber-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('staff')}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left font-semibold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Gestionar Reposos & Turnos</span>
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('configuracion')}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left font-semibold flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>WhatsApp Kapso & Telegram</span>
                          <Settings className="w-4 h-4 text-sky-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: AGENDA DE CITAS                                          */}
          {/* =============================================================== */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No se encontraron citas con los filtros aplicados.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDateFilter('');
                      setStatusFilter('TODAS');
                      setSelectedMonthFilter('ALL');
                    }}
                    className="mt-2 inline-flex px-3.5 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    Mostrar Todo el Historial
                  </button>
                </div>
              ) : agendaViewMode === 'table' ? (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                          <th className="py-3 px-4 whitespace-nowrap">Código</th>
                          <th className="py-3 px-4">Paciente</th>
                          <th className="py-3 px-4 whitespace-nowrap">Fecha & Hora</th>
                          <th className="py-3 px-4">Servicio / Plan</th>
                          <th className="py-3 px-4">Especialista</th>
                          <th className="py-3 px-4 whitespace-nowrap">Estado</th>
                          <th className="py-3 px-4 text-right whitespace-nowrap">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredAppointments.map((app) => {
                          const st = (app.status || '').toLowerCase();
                          return (
                            <tr
                              key={app.id}
                              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums whitespace-nowrap">
                                {app.code}
                              </td>
                              <td className="py-3 px-4 min-w-[160px]">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {app.nombre} {app.apellido}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono tabular-nums">{app.telefono}</div>
                              </td>
                              <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{app.fecha}</div>
                                <div className="text-[11px] text-slate-500">{app.hora}</div>
                              </td>
                              <td className="py-3 px-4 min-w-[170px]">
                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                  {app.selectedPackageName || app.serviceId}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                                  {app.selectedPackagePrice || app.servicePrice || '35 USD'}
                                  {((app.packageTotalSessions || 0) > 1 || app.packageCode) &&
                                    ` · Sesión ${app.packageSessionNumber || 1}/${app.packageTotalSessions || '?'}`}
                                </div>
                              </td>
                              <td className="py-3 px-4 min-w-[160px]">
                                {isAdmin ? (
                                  <select
                                    value={
                                      app.specialistId ||
                                      SPECIALISTS_ACCOUNTS.find((s) => isAppointmentAssignedToSpecialist(app, s))?.id ||
                                      ''
                                    }
                                    onChange={(e) => handleReassignSpecialist(app.id, e.target.value)}
                                    className="w-full text-[11px] font-medium py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                                  >
                                    <option value="" disabled>-- Asignar --</option>
                                    {SPECIALISTS_ACCOUNTS.map((sp) => (
                                      <option key={sp.id} value={sp.id}>
                                        {sp.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                                    {app.specialistName || 'Sin asignar'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`font-semibold text-[11px] uppercase ${
                                    st === 'confirmada'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : st === 'cancelada'
                                      ? 'text-red-600 dark:text-red-400'
                                      : st === 'completada'
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-amber-600 dark:text-amber-400'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPortalLink(app.packageCode || app.code, `${app.nombre} ${app.apellido}`)}
                                    title="Copiar enlace Portal 1-Click"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  >
                                    <Link className="w-3.5 h-3.5" />
                                  </button>

                                  <a
                                    href={generateWhatsAppAlertUrl(app)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Notificar por WhatsApp"
                                    className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>

                                  {st !== 'confirmada' && st !== 'completada' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(app.id, 'confirmada')}
                                      className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] cursor-pointer"
                                    >
                                      Validar
                                    </button>
                                  )}

                                  {st === 'confirmada' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(app.id, 'completada')}
                                      className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] cursor-pointer"
                                    >
                                      Completar
                                    </button>
                                  )}

                                  {st !== 'cancelada' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(app.id, 'cancelada')}
                                      className="px-2 py-1 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold text-[11px] cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                  )}

                                  {isAdmin && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmActionModal({
                                          isOpen: true,
                                          type: 'single_appointment',
                                          targetId: app.id,
                                          targetTitle: `${app.nombre} ${app.apellido} (${app.code})`,
                                        })
                                      }
                                      title="Eliminar cita"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredAppointments.map((app) => {
                    const st = (app.status || '').toLowerCase();
                    return (
                      <div
                        key={app.id}
                        className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">{app.code}</span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {app.nombre} {app.apellido}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span
                              className={`text-[11px] font-bold uppercase ${
                                st === 'confirmada'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : st === 'cancelada'
                                  ? 'text-red-600 dark:text-red-400'
                                  : st === 'completada'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-mono tabular-nums">{app.fecha} ({app.hora})</span>
                            <span>·</span>
                            <span>{app.selectedPackageName || app.serviceId} ({app.selectedPackagePrice || app.servicePrice || '35 USD'})</span>
                            <span>·</span>
                            <span>Especialista: <strong className="text-slate-800 dark:text-slate-200">{app.specialistName || 'Sin asignar'}</strong></span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">{app.telefono}</span>
                          </div>

                          {app.motivoConsulta && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Motivo: {app.motivoConsulta}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyPortalLink(app.packageCode || app.code, `${app.nombre} ${app.apellido}`)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Link className="w-3.5 h-3.5" />
                            <span>Portal 1-Click</span>
                          </button>
                          <a
                            href={generateWhatsAppAlertUrl(app)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          {st !== 'confirmada' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'confirmada')}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
                            >
                              Validar
                            </button>
                          )}
                          {st !== 'cancelada' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'cancelada')}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-semibold cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: DIRECTORIO DE PACIENTES                                  */}
          {/* =============================================================== */}
          {activeTab === 'pacientes' && (
            <div className="space-y-4">
              {uniquePatients.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <Users className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No hay pacientes registrados con los filtros actuales.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPatient(null);
                      setIsPatientModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registrar Primer Paciente</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uniquePatients.map((pat, idx) => {
                    const existingRecord = registeredPatients.find(
                      (r) =>
                        (pat.id && r.id === pat.id) ||
                        ((r.nombre || '').toLowerCase() === (pat.nombre || '').toLowerCase() &&
                          (r.apellido || '').toLowerCase() === (pat.apellido || '').toLowerCase())
                    );
                    const patientObj = toPatientRecord(pat, existingRecord);

                    return (
                      <div
                        key={pat.id || idx}
                        className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{pat.name}</h3>
                                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                                  {formatPatientDisplayId(pat.id || existingRecord?.id)}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-0.5 font-mono tabular-nums">
                                {pat.cedula && <span>C.I. {pat.cedula}</span>}
                                {pat.cedula && <span>·</span>}
                                <span>{pat.phone || 'Sin teléfono'}</span>
                                {pat.email && (
                                  <>
                                    <span>·</span>
                                    <span className="font-sans truncate">{pat.email}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-right text-xs font-mono tabular-nums shrink-0">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {pat.totalVisits} {pat.totalVisits === 1 ? 'cita' : 'citas'}
                              </div>
                              {pat.cancellationCount > 0 && (
                                <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                                  {pat.cancellationCount} cancel.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Package Progress */}
                          {pat.hasPackage && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {pat.packageName || 'Paquete de Sesiones'}
                                </span>
                                <span className="font-mono font-bold tabular-nums text-amber-700 dark:text-amber-400">
                                  {pat.packageUsedSessions || 0}/{pat.packageTotalSessions || '?'} sesiones
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(((pat.packageUsedSessions || 0) / (pat.packageTotalSessions || 1)) * 100)
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Clinical Highlights */}
                          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span>Última atención: <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{pat.lastVisitDate}</strong></span>
                              <span>·</span>
                              <span>{pat.lastSpecialist}</span>
                            </div>
                            {pat.allergies && (
                              <p className="text-rose-600 dark:text-rose-400 font-medium">Alergias: {pat.allergies}</p>
                            )}
                            {pat.chronicConditions && (
                              <p className="text-amber-700 dark:text-amber-400">Antecedentes: {pat.chronicConditions}</p>
                            )}
                            {!pat.allergies && !pat.chronicConditions && pat.lastReason && (
                              <p className="line-clamp-2">Nota: {pat.lastReason}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailPatient(patientObj)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition-opacity cursor-pointer"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Ver Expediente & Línea de Tiempo</span>
                            </button>

                            <a
                              href={`https://wa.me/${pat.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                                pat.portalCode
                                  ? `Hola ${pat.name}, te compartimos el enlace directo a tu Portal del Paciente en EQUILIBRA: ${getDirectPortalLink(pat.portalCode)}`
                                  : `Hola ${pat.name}, te contactamos de EQUILIBRA para dar seguimiento a tu atención clínica.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                              title="Escribir por WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPatient(patientObj);
                                setIsPatientModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>{existingRecord ? 'Editar' : 'Completar'}</span>
                            </button>

                            {existingRecord && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmActionModal({
                                    isOpen: true,
                                    type: 'archive_patient',
                                    targetId: existingRecord.id,
                                    targetTitle: `el expediente de ${pat.name}`,
                                  })
                                }
                                title="Archivar expediente"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: BANDEJA DE CONSULTAS WEB                                 */}
          {/* =============================================================== */}
          {activeTab === 'mensajes' && (
            <div className="space-y-4">
              {contactMessages.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Mail className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bandeja de consultas vacía</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aquí aparecerán los mensajes enviados desde el formulario de contacto de la web pública.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contactMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{msg.name}</span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-slate-500">{msg.email}</span>
                          {msg.phone && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">·</span>
                              <span className="font-mono tabular-nums text-slate-500">{msg.phone}</span>
                            </>
                          )}
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span
                            className={`font-semibold ${
                              (msg.status || 'NUEVO') === 'NUEVO'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {msg.status || 'NUEVO'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{msg.message}</p>
                        <p className="text-[11px] font-mono tabular-nums text-slate-400">
                          Recibido: {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(msg.status || 'NUEVO') !== 'RESPONDIDO' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateMessageStatus(msg.id, 'RESPONDIDO')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                          >
                            Marcar Respondido
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmActionModal({
                              isOpen: true,
                              type: 'delete_message',
                              targetId: msg.id,
                              targetTitle: `el mensaje de ${msg.name}`,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 5: EQUIPO MÉDICO & REPOSOS                                  */}
          {/* =============================================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Estado y Disponibilidad del Equipo Clínico
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Gestiona actividad en tiempo real, reposos médicos y reasignación automática a suplentes.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold tabular-nums">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {TEAM_MEMBERS.length - TEAM_MEMBERS.filter((m) => isSpecialistInactiveOnDate(m.id, todayStr)).length} Activos
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-rose-600 dark:text-rose-400">
                    {TEAM_MEMBERS.filter((m) => isSpecialistInactiveOnDate(m.id, todayStr)).length} En Reposo
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEAM_MEMBERS.map((member) => {
                  const isInactive = isSpecialistInactiveOnDate(member.id, todayStr);
                  const absenceInfo = specialistAvailabilities[member.id];
                  const currentStatus = isInactive ? 'descanso' : staffStatuses[member.id] || 'disponible';

                  return (
                    <div
                      key={member.id}
                      className={`p-4 rounded-xl bg-white dark:bg-[#111827] border flex flex-col justify-between gap-3 ${
                        isInactive ? 'border-amber-400 dark:border-amber-700' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={member.image}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{member.name}</h3>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate">{member.role}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                              {member.specialty}
                            </p>
                          </div>
                        </div>

                        {isInactive && absenceInfo && (
                          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                            <p className="font-bold">Reposo: {absenceInfo.reasonDetails || absenceInfo.reason}</p>
                            <p className="text-[11px] font-mono tabular-nums">Hasta: {absenceInfo.inactiveUntil || 'Indefinido'}</p>
                            {absenceInfo.substituteSpecialistName && (
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                                Suplente: {absenceInfo.substituteSpecialistName}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <select
                          value={currentStatus}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            if (val === 'descanso') {
                              openAbsenceModal(member);
                            } else {
                              if (isInactive) {
                                saveSpecialistAvailability(member.id, { isInactive: false });
                                setSpecialistAvailabilities(getStoredSpecialistsAvailability());
                              }
                              setStaffStatuses((prev) => ({ ...prev, [member.id]: val }));
                            }
                          }}
                          className="flex-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <option value="disponible">Disponible</option>
                          <option value="en_consulta">En Consulta</option>
                          <option value="de_guardia">De Guardia</option>
                          <option value="descanso">En Reposo / Ausente</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => openAbsenceModal(member)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Configurar reposo o suplencia"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 6: SERVICIOS & TARIFAS                                      */}
          {/* =============================================================== */}
          {activeTab === 'servicios' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES_DATA.map((srv) => (
                <div
                  key={srv.id}
                  className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{srv.title}</h3>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm tabular-nums shrink-0">
                        {srv.priceFormatted}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{srv.shortDescription}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <span>Duración: {srv.duration}</span>
                    <span>{srv.pricingTiers?.length || 1} modalidades</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 7: CANCELACIONES & PENALIDADES                              */}
          {/* =============================================================== */}
          {activeTab === 'cancelaciones' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium block">Total Cancelaciones</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1 block">
                    {totalCancellations.length}
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium block">Recargos Aplicados (2da+)</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1 block">
                    ${totalPenalties.toFixed(2)} USD
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium block">Política Vigente</span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2 block">
                    1ra: Gratuita (0%) · 2da+: Recargo 20%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {totalCancellations.length === 0 ? (
                  <p className="p-10 text-center text-xs text-slate-500">No hay citas canceladas registradas.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {totalCancellations.map((c) => (
                      <div key={c.id} className="p-4 flex items-center justify-between text-xs gap-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            <span className="font-mono text-amber-700 dark:text-amber-400 mr-2">{c.code}</span>
                            {c.nombre} {c.apellido}
                          </div>
                          <div className="text-slate-500">
                            <span className="font-mono tabular-nums">{c.fecha} ({c.hora})</span> · Motivo: {c.cancellationReason || 'Cancelación'}
                          </div>
                        </div>
                        <div className="text-right font-mono tabular-nums shrink-0">
                          {(c as any).cancellationPenaltyFee || c.cancellationFeeAmount ? (
                            <span className="font-bold text-rose-600 block">
                              +20% (${(c as any).cancellationPenaltyFee || c.cancellationFeeAmount} USD)
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-600 block">1ra Canc. ($0)</span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {c.canceledAt ? new Date(c.canceledAt).toLocaleDateString() : 'Registrado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 8: NOVEDADES                                                */}
          {/* =============================================================== */}
          {activeTab === 'actualizaciones' && (
            <div className="space-y-4 max-w-4xl">
              <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">EQUILIBRA V1.11 · Consola Independiente</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Panel separado en vista dedicada con línea de tiempo clínica, auditoría y sincronización en la nube.
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">Versión Activa</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['Panel Administrativo Independiente', 'Vista dedicada a pantalla completa con navegación lateral y tablas de alta densidad.'],
                  ['Expedientes & Línea de Tiempo', 'Visualización cronológica de notas de evolución, escala de dolor EVA y documentos PDF.'],
                  ['ID Único de Paciente (PAC-XXXX)', 'Seguimiento automático de citas agendadas, completadas, reprogramaciones y cancelaciones.'],
                  ['Integración WhatsApp & Telegram', 'Confirmaciones automáticas vía Kapso WhatsApp y alertas con menciones por especialista en Telegram.'],
                  ['Seguridad & Auditoría', 'Registro criptográfico de accesos, cierres de sesión automáticos y control de roles.'],
                  ['Cierre Mensual & Excel', 'Respaldo automático en Excel y depuración controlada de citas anteriores sin tocar expedientes.'],
                ].map(([title, desc]) => (
                  <div key={title} className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 9: AUDITORÍA & SEGURIDAD (ADMIN)                            */}
          {/* =============================================================== */}
          {activeTab === 'auditoria' && isAdmin && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registro de Eventos Criptográficos y Acceso</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{filteredLogs.length} eventos registrados</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Filtrar eventos por acción o detalle..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span
                          className={`font-bold mr-2.5 ${
                            log.severity === 'CRITICAL'
                              ? 'text-red-600 dark:text-red-400'
                              : log.severity === 'WARNING'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          [{log.action}]
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-sans">{log.details}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 10: INTEGRACIONES & AJUSTES (ADMIN)                         */}
          {/* =============================================================== */}
          {activeTab === 'configuracion' && isAdmin && (
            <div className="space-y-6">
              {/* Kapso WhatsApp */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Automático (Kapso)</h3>
                    <p className="text-xs text-slate-500">Confirmaciones instantáneas de citas por WhatsApp a pacientes y recepción.</p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      kapsoConfig.apiKey && kapsoConfig.phoneNumberId && kapsoConfig.enabled
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {kapsoConfig.apiKey && kapsoConfig.phoneNumberId && kapsoConfig.enabled ? 'Activo' : 'Sin Configurar'}
                  </span>
                </div>

                <form onSubmit={handleSaveKapso} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <span className="font-semibold">Activar WhatsApp</span>
                      <input type="checkbox" checked={kapsoEnabled} onChange={(e) => setKapsoEnabled(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <span className="font-semibold">Aviso al Paciente</span>
                      <input type="checkbox" checked={kapsoNotifyPatient} onChange={(e) => setKapsoNotifyPatient(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <span className="font-semibold">Aviso a Clínica</span>
                      <input type="checkbox" checked={kapsoNotifyAdmin} onChange={(e) => setKapsoNotifyAdmin(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold block mb-1">Kapso API Key</label>
                      <input
                        type="password"
                        value={kapsoApiKey}
                        onChange={(e) => setKapsoApiKey(e.target.value)}
                        placeholder="kapso_live_..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Phone Number ID</label>
                      <input
                        type="text"
                        value={kapsoPhoneNumberId}
                        onChange={(e) => setKapsoPhoneNumberId(e.target.value)}
                        placeholder="100234567890123"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Teléfono Recepción</label>
                      <input
                        type="tel"
                        value={kapsoAdminPhone}
                        onChange={(e) => setKapsoAdminPhone(e.target.value)}
                        placeholder="584242724617"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  {kapsoTestResult && (
                    <div
                      className={`p-3 rounded-lg border text-xs font-semibold ${
                        kapsoTestResult.success
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200'
                      }`}
                    >
                      {kapsoTestResult.message}
                    </div>
                  )}

                  {kapsoSaveSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-600 text-white font-semibold">
                      Configuración de WhatsApp Kapso guardada correctamente.
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                    >
                      Guardar Conexión WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={handleTestKapso}
                      disabled={isTestingKapso || !kapsoApiKey.trim() || !kapsoPhoneNumberId.trim()}
                      className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {isTestingKapso ? 'Enviando...' : 'Probar Envío WhatsApp'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Telegram + Supabase */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Telegram */}
                <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bot de Telegram</h3>
                      <p className="text-xs text-slate-500">Alertas en tiempo real al agendar o cancelar</p>
                    </div>
                    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                      {telegramConfig.botToken && telegramConfig.chatId && telegramConfig.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <form onSubmit={handleSaveTelegram} className="space-y-3 text-xs">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <span className="font-semibold">Notificaciones automáticas activas</span>
                      <input type="checkbox" checked={telegramEnabled} onChange={(e) => setTelegramEnabled(e.target.checked)} className="w-4 h-4 accent-sky-600" />
                    </label>
                    <div>
                      <label className="font-semibold block mb-1">Telegram Bot Token</label>
                      <input
                        type="password"
                        value={telegramToken}
                        onChange={(e) => setTelegramToken(e.target.value)}
                        placeholder="123456789:ABC..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Chat ID o Grupo</label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="-1001987654321"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    {telegramTestResult && (
                      <div
                        className={`p-2.5 rounded-lg border font-semibold ${
                          telegramTestResult.success ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-700 bg-red-50'
                        }`}
                      >
                        {telegramTestResult.message}
                      </div>
                    )}
                    {telegramSaveSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-600 text-white font-semibold">Configuración de Telegram guardada.</div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="submit" className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold cursor-pointer">
                        Guardar Telegram
                      </button>
                      <button
                        type="button"
                        onClick={handleTestTelegram}
                        disabled={isTestingTelegram || !telegramToken.trim() || !telegramChatId.trim()}
                        className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        {isTestingTelegram ? 'Enviando...' : 'Probar Bot'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Supabase */}
                <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Base de Datos Supabase</h3>
                      <p className="text-xs text-slate-500">Persistencia en la nube de citas y pacientes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(SUPABASE_SQL_SCHEMA);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2500);
                      }}
                      className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSql ? 'SQL Copiado' : 'Copiar SQL Schema'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveSupabase} className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold block mb-1">Project URL</label>
                      <input
                        type="text"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="https://xyz.supabase.co"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Anon Public Key</label>
                      <input
                        type="password"
                        value={supabaseAnonKey}
                        onChange={(e) => setSupabaseAnonKey(e.target.value)}
                        placeholder="eyJhbGciOi..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    {supabaseTestResult && (
                      <div
                        className={`p-2.5 rounded-lg border font-semibold ${
                          supabaseTestResult.success ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-700 bg-red-50'
                        }`}
                      >
                        {supabaseTestResult.message}
                      </div>
                    )}
                    {supabaseSaveSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-600 text-white font-semibold">Credenciales Supabase guardadas.</div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="submit" className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer">
                        Guardar Supabase
                      </button>
                      <button
                        type="button"
                        onClick={handleTestSupabase}
                        disabled={isTestingSupabase || !supabaseUrl || !supabaseAnonKey}
                        className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        Probar
                      </button>
                      {supabaseConfig.url && (
                        <button
                          type="button"
                          onClick={handleClearSupabase}
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Desconectar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Telegram Mentions per Specialist */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Etiquetas de Telegram por Especialista</h3>
                    <p className="text-xs text-slate-500">El bot mencionará al especialista correspondiente cuando agenden en su área.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAllSpecialistTags}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Guardar Etiquetas
                  </button>
                </div>

                {tagsSaveSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">Etiquetas guardadas con éxito.</div>
                )}
                {specialistTagTestResult && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs font-semibold ${
                      specialistTagTestResult.success ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-700 bg-red-50'
                    }`}
                  >
                    {specialistTagTestResult.message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TEAM_MEMBERS.map((member) => {
                    const tag = specialistTags[member.id] || '';
                    const isTesting = testingTagMemberId === member.id;
                    return (
                      <div
                        key={member.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{member.role}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="text"
                            placeholder="@usuario"
                            value={tag}
                            onChange={(e) => handleUpdateSpecialistTag(member.id, e.target.value)}
                            className="w-32 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleTestSpecificTag(member)}
                            disabled={isTesting || !tag.trim()}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                          >
                            {isTesting ? '...' : 'Probar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Maintenance & Monthly Cutoff */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-red-200 dark:border-red-900/40 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mantenimiento, Cierre Mensual y Depuración</h3>
                  <p className="text-xs text-slate-500">Gestiona el archivado mensual o limpieza de registros de prueba.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Cierre de Mes</h4>
                      <p className="text-slate-500 mt-1">Exporta a Excel y archiva citas pasadas sin borrar expedientes.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
                        setMonthlyCutoffModal({
                          isOpen: true,
                          cutoffDate: firstDay,
                          onlyCompletedOrCanceled: false,
                          exportBeforeDelete: true,
                        });
                      }}
                      className="py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
                    >
                      Ejecutar Cierre
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Vaciar Citas</h4>
                      <p className="text-slate-500 mt-1">Elimina las {appointments.length} reservas del servidor y local.</p>
                    </div>
                    <button
                      type="button"
                      disabled={appointments.length === 0}
                      onClick={() =>
                        setConfirmActionModal({
                          isOpen: true,
                          type: 'appointments',
                          targetTitle: 'todas las citas registradas en el sistema',
                        })
                      }
                      className="py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Vaciar ({appointments.length})
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Vaciar Alertas</h4>
                      <p className="text-slate-500 mt-1">Limpia las {notifications.length} notificaciones guardadas.</p>
                    </div>
                    <button
                      type="button"
                      disabled={notifications.length === 0}
                      onClick={() =>
                        setConfirmActionModal({
                          isOpen: true,
                          type: 'notifications',
                          targetTitle: 'todo el historial de notificaciones',
                        })
                      }
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Vaciar ({notifications.length})
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-red-800 dark:text-red-300">Restablecer Todo</h4>
                      <p className="text-red-700/80 dark:text-red-400/80 mt-1">Elimina citas y alertas en un solo paso.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmActionModal({
                          isOpen: true,
                          type: 'all',
                          targetTitle: 'todas las citas y todo el historial de notificaciones',
                        })
                      }
                      className="py-2 px-3 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold cursor-pointer"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Compact Bottom Navigation Bar (<= 15% viewport height) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-[#111827]/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md flex items-center justify-around px-2">
        {[
          { id: 'dashboard' as PanelTab, label: 'Resumen', icon: LayoutDashboard },
          { id: 'agenda' as PanelTab, label: 'Agenda', icon: Calendar },
          { id: 'pacientes' as PanelTab, label: 'Pacientes', icon: Users },
          { id: 'staff' as PanelTab, label: 'Equipo', icon: Stethoscope },
          ...(isAdmin ? [{ id: 'configuracion' as PanelTab, label: 'Ajustes', icon: Settings }] : [{ id: 'servicios' as PanelTab, label: 'Tarifas', icon: Package }]),
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 text-[10px] font-semibold ${
                active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* =================================================================== */}
      {/* CLINICAL SUB-MODALS (REUSED & INTEGRATED CLEANLY)                   */}
      {/* =================================================================== */}

      {/* Patient Registration / Edit Modal */}
      {isPatientModalOpen && (
        <PatientRegistrationModal
          editingPatient={editingPatient}
          isOpen={isPatientModalOpen}
          onClose={() => {
            setIsPatientModalOpen(false);
            setEditingPatient(null);
          }}
          onPatientSaved={(saved) => {
            setRegisteredPatients(getStoredPatients());
            if (detailPatient && detailPatient.id === saved.id) {
              setDetailPatient(saved);
            }
            setIsPatientModalOpen(false);
            setEditingPatient(null);
            showToast('Ficha del paciente guardada.', 'success');
          }}
          currentUserName={authenticatedUser?.name || 'Especialista'}
        />
      )}

      {/* Patient Detail & Chronological Timeline Modal */}
      {detailPatient && (
        <PatientDetailModal
          isOpen={Boolean(detailPatient)}
          onClose={() => setDetailPatient(null)}
          patient={detailPatient}
          patientAppointments={appointments}
          onOpenNewAppointmentForPatient={() => {
            setDetailPatient(null);
            if (onOpenBooking) onOpenBooking();
          }}
          onOpenEditPatient={(p) => {
            setEditingPatient(p);
            setIsPatientModalOpen(true);
          }}
          onOpenDeletePatient={(p) =>
            setConfirmActionModal({
              isOpen: true,
              type: 'archive_patient',
              targetId: p.id,
              targetTitle: `el expediente de ${p.nombre} ${p.apellido}`,
            })
          }
          onOpenUploadPdf={(p) => setUploadPdfPatient(p)}
          onViewPdfDocument={(doc, p) => setViewingPdfDoc({ doc, patient: p })}
          onDeletePdfDocument={handleDeletePatientDocument}
          onPatientUpdated={(updated) => {
            setDetailPatient(updated);
            setRegisteredPatients(getStoredPatients());
            loadClinicalData();
          }}
        />
      )}

      {/* Upload Medical Record PDF Modal */}
      {uploadPdfPatient && (
        <UploadMedicalRecordModal
          isOpen={Boolean(uploadPdfPatient)}
          onClose={() => setUploadPdfPatient(null)}
          patient={uploadPdfPatient}
          onSaveDocument={handleSavePatientDocument}
        />
      )}

      {/* PDF Document Viewer Modal */}
      {viewingPdfDoc && (
        <PdfViewerModal
          isOpen={Boolean(viewingPdfDoc)}
          onClose={() => setViewingPdfDoc(null)}
          document={viewingPdfDoc.doc}
          patient={viewingPdfDoc.patient}
        />
      )}

      {/* Specialist Absence Modal */}
      {editingAbsenceMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reposo / Inactividad · {editingAbsenceMember.name}
                </h3>
                <p className="text-xs text-slate-500">{editingAbsenceMember.specialty}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAbsenceMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAbsence} className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Especialista en Reposo / Inactivo</span>
                  <span className="text-[11px] text-slate-500">Transfiere nuevas citas a su suplente asignado</span>
                </div>
                <input
                  type="checkbox"
                  checked={isInactiveForm}
                  onChange={(e) => setIsInactiveForm(e.target.checked)}
                  className="w-4 h-4 accent-amber-600"
                />
              </label>

              {isInactiveForm && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold block mb-1">Motivo</label>
                    <select
                      value={absenceReason}
                      onChange={(e) => setAbsenceReason(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="enfermedad">Reposo Médico / Enfermedad</option>
                      <option value="vacaciones">Vacaciones Programadas</option>
                      <option value="permiso">Permiso Especial</option>
                      <option value="capacitacion">Capacitación / Congreso</option>
                      <option value="otro">Otro Motivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Detalle</label>
                    <input
                      type="text"
                      value={absenceReasonDetails}
                      onChange={(e) => setAbsenceReasonDetails(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold block mb-1">Desde</label>
                      <input
                        type="date"
                        value={inactiveFromDate}
                        onChange={(e) => setInactiveFromDate(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Hasta</label>
                      <input
                        type="date"
                        value={inactiveUntilDate}
                        onChange={(e) => setInactiveUntilDate(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Suplente Asignado</label>
                    <select
                      value={substituteId}
                      onChange={(e) => setSubstituteId(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="">-- Sin suplente (Bloquear horario) --</option>
                      {TEAM_MEMBERS.filter((m) => m.id !== editingAbsenceMember.id).map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAbsenceMember(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
                >
                  Guardar Disponibilidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmActionModal?.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Confirmar Acción</h3>
                <p className="text-xs text-slate-500">Esta operación modificará registros activos.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Deseas continuar y procesar <strong>{confirmActionModal.targetTitle}</strong>?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isClearing}
                onClick={() => setConfirmActionModal(null)}
                className="flex-1 py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isClearing}
                onClick={handleConfirmClearAction}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs disabled:opacity-50 cursor-pointer"
              >
                {isClearing ? 'Procesando...' : 'Sí, Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Cutoff Modal */}
      {monthlyCutoffModal?.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cierre de Mes y Depuración de Agenda</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Depurar citas anteriores a:</label>
                <input
                  type="date"
                  value={monthlyCutoffModal.cutoffDate}
                  onChange={(e) => setMonthlyCutoffModal({ ...monthlyCutoffModal, cutoffDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={monthlyCutoffModal.exportBeforeDelete}
                  onChange={(e) => setMonthlyCutoffModal({ ...monthlyCutoffModal, exportBeforeDelete: e.target.checked })}
                  className="accent-amber-600"
                />
                <span>Descargar respaldo Excel antes de depurar (Recomendado)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={monthlyCutoffModal.onlyCompletedOrCanceled}
                  onChange={(e) => setMonthlyCutoffModal({ ...monthlyCutoffModal, onlyCompletedOrCanceled: e.target.checked })}
                  className="accent-amber-600"
                />
                <span>Eliminar únicamente citas Completadas o Canceladas</span>
              </label>
            </div>

            {cutoffResultMsg && (
              <div
                className={`p-3 rounded-lg border text-xs font-semibold ${
                  cutoffResultMsg.type === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-red-300 bg-red-50 text-red-700'
                }`}
              >
                {cutoffResultMsg.text}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isProcessingCutoff}
                onClick={() => setMonthlyCutoffModal(null)}
                className="flex-1 py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessingCutoff}
                onClick={handleExecuteMonthlyCutoff}
                className="flex-1 py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs disabled:opacity-50 cursor-pointer"
              >
                {isProcessingCutoff ? 'Procesando...' : 'Confirmar Cierre de Mes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelView;
