import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  X,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  RefreshCw,
  LogOut,
  Sliders,
  Database,
  Eye,
  EyeOff,
  Sparkles,
  Fingerprint,
  Download,
  FileSpreadsheet,
  Layers,
  UserCheck,
  Ban,
  Package,
  Check,
  ChevronRight,
  TrendingUp,
  Bell,
  Phone,
  Mail,
  Search,
  MessageSquare,
  DollarSign,
  Activity,
  LayoutDashboard,
  Stethoscope,
  Volume2,
  CalendarOff,
  Edit2,
  UserX,
  Settings,
  Bot,
  Send,
  AlertCircle,
  Building2,
  Copy,
} from 'lucide-react';
import { ConfirmedAppointment, SpecialistUser, AdminUser, AdminNotification, TeamMember, SpecialistAbsence, TelegramConfig, SupabaseConfig, PatientRecord } from '../types';
import {
  getAppointmentsFromDatabase,
  getSavedAppointments,
  saveAppointmentToStorage,
} from '../utils/bookingUtils';
import {
  getStoredPatients,
  saveStoredPatient,
  deleteStoredPatient,
} from '../utils/patientUtils';
import { PatientRegistrationModal } from './PatientRegistrationModal';
import {
  getStoredTelegramConfig,
  saveTelegramConfig,
  testTelegramNotification,
  testTelegramSpecialistTagging,
} from '../utils/telegramBot';
import {
  getStoredSpecialistsAvailability,
  saveSpecialistAvailability,
  isSpecialistInactiveOnDate,
} from '../utils/specialistAvailability';
import {
  SPECIALISTS_ACCOUNTS,
  ADMIN_ACCOUNT,
  verifyUserPin,
  isBiometricRegisteredForUser,
  setBiometricRegisteredForUser,
} from '../data/specialistsAuthData';
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
  maskSensitiveData,
} from '../utils/security';
import { SERVICES_DATA } from '../data/servicesData';
import { TEAM_MEMBERS } from '../data/teamData';
import {
  getStoredNotifications,
  saveStoredNotifications,
  requestBrowserNotificationPermission,
  generateWhatsAppAlertUrl,
  playNotificationChime,
} from '../utils/notificationUtils';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import {
  getCurrentSupabaseConfig,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testConnection,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';

interface SpecialistAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PanelTab = 'dashboard' | 'agenda' | 'pacientes' | 'staff' | 'servicios' | 'cancelaciones' | 'auditoria' | 'configuracion';

export const SpecialistAccessModal: React.FC<SpecialistAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Selection before authentication
  const [selectedUserType, setSelectedUserType] = useState<'specialist' | 'admin'>('specialist');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(
    SPECIALISTS_ACCOUNTS[0].id
  );

  // Auth State
  const [authenticatedUser, setAuthenticatedUser] = useState<
    SpecialistUser | AdminUser | null
  >(null);
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticatingBiometric, setIsAuthenticatingBiometric] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<PanelTab>('dashboard');
  const [appointments, setAppointments] = useState<ConfirmedAppointment[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<PatientRecord[]>(getStoredPatients());
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditEntry[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [specialistFilter, setSpecialistFilter] = useState<string>('TODOS');
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>(
    isSupabaseConfigured ? 'idle' : 'error'
  );
  const [supabaseMsg, setSupabaseMsg] = useState<string>(
    isSupabaseConfigured ? 'Supabase configurado' : 'Modo local (sin Supabase)'
  );
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

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

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setSpecialistAvailabilities(getStoredSpecialistsAvailability());
    const handler = () => {
      setSpecialistAvailabilities(getStoredSpecialistsAvailability());
    };
    window.addEventListener('equilibra_specialist_availability_changed', handler);
    return () => window.removeEventListener('equilibra_specialist_availability_changed', handler);
  }, []);

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
  };

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

  // Sync telegram config on window event
  useEffect(() => {
    const handleTelegramUpdated = (e: any) => {
      const updated = e.detail || getStoredTelegramConfig();
      setTelegramConfig(updated);
      setTelegramToken(updated.botToken || '');
      setTelegramChatId(updated.chatId || '');
      setTelegramEnabled(updated.enabled ?? true);
      setSpecialistTags(updated.specialistTags || {});
    };
    window.addEventListener('equilibra_telegram_config_updated', handleTelegramUpdated);
    return () => window.removeEventListener('equilibra_telegram_config_updated', handleTelegramUpdated);
  }, []);

  // Telegram Bot config state
  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveTelegramConfig({
      botToken: telegramToken.trim(),
      chatId: telegramChatId.trim(),
      enabled: telegramEnabled,
      notifyOnBooking: true,
      notifyOnCancellation: true,
      specialistTags: specialistTags,
    });
    setTelegramConfig(updated);
    setTelegramSaveSuccess(true);
    setTimeout(() => setTelegramSaveSuccess(false), 3500);
  };

  const handleTestTelegram = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTelegramTestResult({
        success: false,
        message: 'Por favor ingresa tanto el Token del Bot como el Chat ID (o ID del Grupo) antes de probar.',
      });
      return;
    }
    setIsTestingTelegram(true);
    setTelegramTestResult(null);
    const res = await testTelegramNotification(telegramToken.trim(), telegramChatId.trim());
    setTelegramTestResult(res);
    setIsTestingTelegram(false);
    if (res.success) {
      setTelegramConfig(getStoredTelegramConfig());
    }
  };

  const handleUpdateSpecialistTag = (memberId: string, tag: string) => {
    const updated = {
      ...specialistTags,
      [memberId]: tag,
    };
    setSpecialistTags(updated);
  };

  const handleSaveAllSpecialistTags = () => {
    const updated = saveTelegramConfig({
      specialistTags: specialistTags,
    });
    setTelegramConfig(updated);
    setTagsSaveSuccess(true);
    setTimeout(() => setTagsSaveSuccess(false), 3500);
  };

  const handleTestSpecificTag = async (member: TeamMember) => {
    const tag = specialistTags[member.id] || '';
    if (!tag.trim()) {
      setSpecialistTagTestResult({
        memberId: member.id,
        success: false,
        message: `Primero escribe el usuario de Telegram (ej: @usuario) para ${member.name}.`,
      });
      return;
    }
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setSpecialistTagTestResult({
        memberId: member.id,
        success: false,
        message: 'Debes guardar o ingresar el Token y el Chat ID de Telegram primero.',
      });
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
    setSpecialistTagTestResult({
      memberId: member.id,
      success: res.success,
      message: res.message,
    });
    setTestingTagMemberId(null);
  };
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getCurrentSupabaseConfig());
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [supabaseSaveSuccess, setSupabaseSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    if (ok) {
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

  // Auto-lock session after 15 minutes of inactivity
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notifDropdownRef = useRef<HTMLDivElement | null>(null);

  const resetSessionTimer = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (authenticatedUser) {
      sessionTimeoutRef.current = setTimeout(() => {
        setAuthenticatedUser(null);
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
    isBiometricsSupported().then((supported) => {
      setBiometricAvailable(supported);
    });
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserNotifEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
      loadClinicalData();
      resetSessionTimer();
    }
    return () => {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, [authenticatedUser]);

  // Listen for live notification updates & patient changes
  useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(getStoredNotifications());
    };
    const handlePatientsUpdate = () => {
      setRegisteredPatients(getStoredPatients());
    };
    window.addEventListener('equilibra_notifications_updated', handleNotifUpdate);
    window.addEventListener('equilibra_patients_updated', handlePatientsUpdate);
    setNotifications(getStoredNotifications());
    setRegisteredPatients(getStoredPatients());
    return () => {
      window.removeEventListener('equilibra_notifications_updated', handleNotifUpdate);
      window.removeEventListener('equilibra_patients_updated', handlePatientsUpdate);
    };
  }, []);

  // Close notifications dropdown on outside click
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
      const dbAppointments = await getAppointmentsFromDatabase();
      const local = getSavedAppointments();
      const combined = [
        ...dbAppointments,
        ...local.filter((l) => !dbAppointments.some((d) => d.id === l.id)),
      ];
      setAppointments(combined);

      // Update connection status based on whether we got data from DB
      if (isSupabaseConfigured) {
        setSupabaseStatus('ok');
        setSupabaseMsg(`Supabase activo · ${combined.length} citas sincronizadas`);
      }
    } catch (err) {
      if (isSupabaseConfigured) {
        setSupabaseStatus('error');
        setSupabaseMsg('Error al conectar con Supabase (usando datos locales)');
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
      const { data, error } = await supabase.from('appointments').select('id').limit(1);
      if (error) {
        if (error.code === '42P01') {
          setSupabaseStatus('error');
          setSupabaseMsg('Tabla "appointments" NO existe. Ejecuta el SQL schema en Supabase.');
        } else {
          setSupabaseStatus('error');
          setSupabaseMsg(`Error DB: ${error.message}`);
        }
      } else {
        setSupabaseStatus('ok');
        setSupabaseMsg('✓ Supabase conectado y tabla appointments OK');
        await loadClinicalData();
      }
    } catch (err: any) {
      setSupabaseStatus('error');
      setSupabaseMsg(`Sin conexión: ${err?.message || 'Error de red'}`);
    }
  };

  if (!isOpen) return null;

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
      setPin('');
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
        setBiometricRegisteredForUser(currentSelectedUser.id, true);
        recordSecurityEvent({
          action: 'AUTH_SUCCESS',
          severity: 'INFO',
          details: `Inicio de sesión biométrico (Huella/FaceID) exitoso para [${currentSelectedUser.name}].`,
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
        setExportMessage('¡Huella dactilar vinculada con éxito a tu cuenta!');
        setTimeout(() => setExportMessage(null), 3000);
      }
    } catch {
      setAuthError('Error al registrar la huella dactilar.');
    }
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setPin('');
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
  };

  const handleExportToExcel = () => {
    setIsExportingExcel(true);
    setExportMessage(null);
    try {
      const result = exportAppointmentsToExcel({
        appointments,
        specialistFilterId: specialistFilter,
      });
      if (result.success) {
        setExportMessage(`¡Base de datos exportada a Excel (${result.filename}) correctamente!`);
      } else {
        setExportMessage('No se pudo generar el archivo Excel.');
      }
    } catch (err) {
      console.error(err);
      setExportMessage('Error al exportar la base de datos.');
    } finally {
      setIsExportingExcel(false);
      setTimeout(() => setExportMessage(null), 4000);
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
    }
  };

  // Filter visible notifications based on authenticated role
  const visibleNotifications = notifications.filter((n) => {
    if (!authenticatedUser) return false;
    // Admins see all notifications
    if (authenticatedUser.role === 'admin' || authenticatedUser.role === 'administrador_general') {
      return true;
    }
    // Specialist only sees notifications specifically addressed to them or their specialty
    if (n.specialistId) {
      return n.specialistId === authenticatedUser.id;
    }
    // If notification mentions their name
    if (n.specialistName && n.specialistName.toLowerCase().includes(authenticatedUser.name.toLowerCase())) {
      return true;
    }
    if (n.message && n.message.toLowerCase().includes(authenticatedUser.name.toLowerCase())) {
      return true;
    }
    // General notifications (no specialist attached)
    return !n.specialistId && !n.specialistName;
  });

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    // If specialist, strictly isolate to their own appointments
    if (authenticatedUser?.role === 'specialist') {
      const matchesId = app.specialistId && app.specialistId === authenticatedUser.id;
      const matchesName = app.specialistName && app.specialistName.toLowerCase().includes(authenticatedUser.name.toLowerCase());
      const matchesService = authenticatedUser.relatedServiceId && app.serviceId === authenticatedUser.relatedServiceId;
      const isAssignedToThem = matchesId || matchesName || matchesService;
      if (!isAssignedToThem) return false;
    }

    const matchesSpecialist =
      specialistFilter === 'TODOS' ||
      app.specialistId === specialistFilter ||
      app.specialistName?.toLowerCase().includes(specialistFilter.toLowerCase());

    const matchesDate = !selectedDateFilter || app.fecha === selectedDateFilter;
    const matchesStatus =
      statusFilter === 'TODAS' ||
      (statusFilter === 'CONFIRMADAS' && app.status === 'confirmada') ||
      (statusFilter === 'PENDIENTES' && app.status === 'pendiente_validacion') ||
      (statusFilter === 'COMPLETADAS' && app.status === 'completada') ||
      (statusFilter === 'CANCELADAS' && app.status === 'cancelada');

    const search = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !search ||
      (app.nombre && app.nombre.toLowerCase().includes(search)) ||
      (app.apellido && app.apellido.toLowerCase().includes(search)) ||
      (app.code && app.code.toLowerCase().includes(search)) ||
      (app.telefono && app.telefono.toLowerCase().includes(search)) ||
      (app.motivoConsulta && app.motivoConsulta.toLowerCase().includes(search));

    return matchesSpecialist && matchesDate && matchesStatus && matchesSearch;
  });

  const totalConfirmed = filteredAppointments.filter((a) => a.status === 'confirmada' || a.status === 'completada').length;
  const totalPending = filteredAppointments.filter((a) => a.status === 'pendiente_validacion').length;
  const totalCancellations = filteredAppointments.filter((a) => a.status === 'cancelada');
  const totalPenalties = filteredAppointments.reduce(
    (acc, a) => acc + (a.cancellationPenaltyFee || 0),
    0
  );

  // Group unique patients (combining registered manual records + appointments)
  const uniquePatientsMap = new Map<string, {
    id?: string;
    isRegisteredRecord?: boolean;
    name: string;
    nombre: string;
    apellido: string;
    cedula?: string;
    fechaNacimiento?: string;
    edad?: number;
    genero?: string;
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
  }>();

  // First seed with registered clinical patient records
  registeredPatients.forEach((rp) => {
    // If specialist, only show registered patients assigned to them or created without assignment
    if (authenticatedUser?.role === 'specialist') {
      if (rp.assignedSpecialistId && rp.assignedSpecialistId !== authenticatedUser.id && !rp.assignedSpecialistName?.toLowerCase().includes(authenticatedUser.name.toLowerCase())) {
        return;
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
      bloodType: rp.bloodType,
      allergies: rp.alergias,
      chronicConditions: rp.medicalConditions || rp.antecedentes,
      currentMedication: rp.medicamentosActuales,
      emergencyContactName: rp.contactoEmergencia?.nombre,
      emergencyContactPhone: rp.contactoEmergencia?.telefono,
      notes: rp.clinicalNotes,
      assignedSpecialistId: rp.assignedSpecialistId,
      assignedSpecialistName: rp.assignedSpecialistName,
      totalVisits: rp.completedAppointments || rp.totalAppointments || 0,
      lastVisitDate: rp.lastVisit || (rp.createdAt ? rp.createdAt.split('T')[0] : todayStr),
      lastSpecialist: rp.assignedSpecialistName || 'Sin asignar',
      lastReason: rp.clinicalNotes || 'Expediente clínico completo',
      registeredAt: rp.createdAt || todayStr,
    });
  });

  // Then augment/merge with appointments
  appointments.forEach((app) => {
    if (authenticatedUser?.role === 'specialist') {
      const matchesId = app.specialistId && app.specialistId === authenticatedUser.id;
      const matchesName = app.specialistName && app.specialistName.toLowerCase().includes(authenticatedUser.name.toLowerCase());
      const matchesService = authenticatedUser.relatedServiceId && app.serviceId === authenticatedUser.relatedServiceId;
      if (!matchesId && !matchesName && !matchesService) {
        return;
      }
    }

    const appNombre = (app.nombre || '').trim();
    const appApellido = (app.apellido || '').trim();
    if (!appNombre && !appApellido) return;

    const key = `${appNombre.toLowerCase()}_${appApellido.toLowerCase()}`;
    const existing = uniquePatientsMap.get(key);
    if (existing) {
      existing.totalVisits += 1;
      if (app.fecha && app.fecha >= existing.lastVisitDate) {
        existing.lastVisitDate = app.fecha;
        existing.lastSpecialist = app.specialistName || existing.lastSpecialist || 'Especialista';
        existing.lastReason = app.motivoConsulta || existing.lastReason;
      }
      if (!existing.phone && app.telefono) existing.phone = app.telefono;
      if (!existing.email && app.email) existing.email = app.email;
    } else {
      uniquePatientsMap.set(key, {
        name: `${appNombre} ${appApellido}`.trim(),
        nombre: appNombre,
        apellido: appApellido,
        phone: app.telefono || '',
        email: app.email || '',
        totalVisits: 1,
        lastVisitDate: app.fecha || todayStr,
        lastSpecialist: app.specialistName || 'Especialista',
        lastReason: app.motivoConsulta,
      });
    }
  });

  const uniquePatients = Array.from(uniquePatientsMap.values()).filter((p) => {
    const search = searchQuery.toLowerCase().trim();
    return (
      !search ||
      p.name.toLowerCase().includes(search) ||
      (p.phone && p.phone.toLowerCase().includes(search)) ||
      (p.email && p.email.toLowerCase().includes(search)) ||
      (p.cedula && p.cedula.toLowerCase().includes(search))
    );
  });

  return (
    <AnimatePresence>
      <div
        id="specialist-portal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl bg-white dark:bg-[#101726] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        >
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 px-4 sm:px-6 py-4 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                {authenticatedUser ? <Stethoscope className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base md:text-lg font-bold font-heading truncate">
                    {authenticatedUser
                      ? `${authenticatedUser.role === 'admin' || authenticatedUser.role === 'administrador_general' ? 'Panel de Dirección Médica' : 'Panel Clínico'}: ${authenticatedUser.name}`
                      : 'Acceso Clínico Profesional & Especialistas'}
                  </h2>
                  <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {authenticatedUser ? (authenticatedUser.role === 'administrador_general' ? 'SUPERADMIN' : 'ESPECIALISTA') : 'SEGURO'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                  {authenticatedUser
                    ? `${authenticatedUser.email} • Sesión encriptada`
                    : 'Selecciona tu perfil e ingresa tu clave PIN de seguridad o biometría.'}
                </p>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {authenticatedUser && (
                <>
                  {/* Notification Bell Dropdown */}
                  <div className="relative" ref={notifDropdownRef}>
                    <button
                      onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                      className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                      title="Notificaciones de citas"
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                      {visibleNotifications.filter((n) => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                          {visibleNotifications.filter((n) => !n.read).length}
                        </span>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {showNotificationsDropdown && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-amber-500" />
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                              Notificaciones en Vivo
                            </h4>
                          </div>
                          {visibleNotifications.filter((n) => !n.read).length > 0 && (
                            <button
                              onClick={() => {
                                const visibleIds = new Set(visibleNotifications.map((n) => n.id));
                                const updated = notifications.map((n) => (visibleIds.has(n.id) ? { ...n, read: true } : n));
                                setNotifications(updated);
                                saveStoredNotifications(updated);
                              }}
                              className="text-[10px] text-amber-600 hover:underline font-semibold"
                            >
                              Marcar todas leídas
                            </button>
                          )}
                        </div>

                        {!browserNotifEnabled && (
                          <button
                            onClick={async () => {
                              const granted = await requestBrowserNotificationPermission();
                              setBrowserNotifEnabled(granted);
                              if (granted) {
                                playNotificationChime();
                                setExportMessage('¡Notificaciones activadas en este dispositivo!');
                                setTimeout(() => setExportMessage(null), 3500);
                              }
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-all"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Activar Alertas en este Dispositivo / iPhone</span>
                          </button>
                        )}

                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                          {visibleNotifications.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">
                              No hay notificaciones pendientes.
                            </p>
                          ) : (
                            visibleNotifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  const updated = notifications.map((item) => (item.id === n.id ? { ...item, read: true } : item));
                                  setNotifications(updated);
                                  saveStoredNotifications(updated);
                                }}
                                className={`p-3 rounded-xl transition-all border text-xs cursor-pointer ${
                                  !n.read
                                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50'
                                    : 'bg-slate-50 dark:bg-slate-800/40 border-transparent hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {n.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                                  {n.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-500/30 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {exportMessage && (
            <div className="p-3 bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{exportMessage}</span>
            </div>
          )}

          {/* AUTHENTICATION VIEW */}
          {!authenticatedUser ? (
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              <div className="max-w-md mx-auto space-y-6">
                {/* User Type Switcher (Specialists vs Admin) */}
                <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedUserType('specialist')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedUserType === 'specialist'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>Especialistas ({SPECIALISTS_ACCOUNTS.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUserType('admin')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedUserType === 'admin'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Administrador</span>
                  </button>
                </div>

                {/* Specialist User Selector */}
                {selectedUserType === 'specialist' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Selecciona tu perfil de especialista:
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1">
                      {SPECIALISTS_ACCOUNTS.map((spec) => {
                        const isSel = selectedSpecialistId === spec.id;
                        return (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => setSelectedSpecialistId(spec.id)}
                            className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-3 transition-all ${
                              isSel
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 font-bold ring-2 ring-amber-500/30'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50 dark:bg-slate-900/40'
                            }`}
                          >
                            <img
                              src={spec.avatarUrl}
                              alt={spec.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-300"
                            />
                            <div className="flex-1 truncate">
                              <span className="block truncate font-bold text-slate-900 dark:text-white">
                                {spec.name}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                                {spec.role}
                              </span>
                            </div>
                            {isSel && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Admin Card */}
                {selectedUserType === 'admin' && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-lg">
                      ADM
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {ADMIN_ACCOUNT.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {ADMIN_ACCOUNT.email} • Acceso Seguro
                      </p>
                    </div>
                  </div>
                )}

                {/* PIN Input Form */}
                <form onSubmit={handlePinLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Ingresa tu PIN de 4 dígitos ({currentSelectedUser.name})
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={8}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center text-lg tracking-widest font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all active:scale-98"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Ingresar con PIN</span>
                  </button>
                </form>

                {/* Biometrics (Huella Dactilar / TouchID / FaceID) */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    O accede rápidamente con sensores biométricos de tu teléfono:
                  </p>
                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={isAuthenticatingBiometric}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Fingerprint className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                    <span>
                      {isAuthenticatingBiometric
                        ? 'Escaneando Huella Dactilar...'
                        : 'Acceder con Huella Dactilar / FaceID'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED COMPLETE CLINICAL PANEL */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Desktop / Tablet Sub-navigation Tabs */}
              <div className="bg-slate-100 dark:bg-slate-900/80 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'dashboard'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('agenda')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'agenda'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agenda ({filteredAppointments.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('pacientes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'pacientes'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Pacientes ({uniquePatients.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('staff')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'staff'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Equipo</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('servicios')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'servicios'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Tarifas</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('cancelaciones')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'cancelaciones'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancelaciones ({totalCancellations.length})</span>
                  </button>

                  {/* ADMIN ONLY TABS */}
                  {(authenticatedUser?.role === 'admin' || authenticatedUser?.role === 'administrador_general') && (
                    <>
                      <button
                        onClick={() => setActiveTab('auditoria')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          activeTab === 'auditoria'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Seguridad</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('configuracion')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          activeTab === 'configuracion'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Configuración & Bot</span>
                        {telegramConfig.botToken && telegramConfig.chatId && telegramConfig.enabled ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Bot de Telegram Activo" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400" title="Bot pendiente de configuración" />
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Quick actions: Excel Export & Biometric Setup */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportToExcel}
                    disabled={isExportingExcel}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isExportingExcel ? 'Exportando...' : 'Descargar Excel'}</span>
                  </button>

                  <button
                    onClick={handleRegisterBiometrics}
                    title="Vincular huella/FaceID de este dispositivo a tu cuenta"
                    className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 text-xs flex items-center gap-1"
                  >
                    <Fingerprint className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR (For Agenda & Pacientes) */}
              {(activeTab === 'agenda' || activeTab === 'pacientes') && (
                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2.5 text-xs shrink-0">
                  {/* Live Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={activeTab === 'agenda' ? 'Buscar por paciente, código EQ, teléfono o motivo...' : 'Buscar paciente por nombre, teléfono o email...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter by Specialist (for Admin) */}
                  {activeTab === 'agenda' && (authenticatedUser.role === 'admin' || authenticatedUser.role === 'administrador_general') && (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={specialistFilter}
                        onChange={(e) => setSpecialistFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                      >
                        <option value="TODOS">Todos los Especialistas</option>
                        {SPECIALISTS_ACCOUNTS.map((sp) => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Filter by Status */}
                  {activeTab === 'agenda' && (
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    >
                      <option value="TODAS">Todos los Estados</option>
                      <option value="CONFIRMADAS">Confirmadas</option>
                      <option value="PENDIENTES">Pendientes</option>
                      <option value="COMPLETADAS">Completadas</option>
                      <option value="CANCELADAS">Canceladas</option>
                    </select>
                  )}

                  {/* Filter by Date */}
                  {activeTab === 'agenda' && (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="date"
                        value={selectedDateFilter}
                        onChange={(e) => setSelectedDateFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                      />
                      {selectedDateFilter && (
                        <button
                          onClick={() => setSelectedDateFilter('')}
                          className="text-[11px] text-amber-600 hover:underline"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MAIN CONTENT VIEWS */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">

                    {/* Supabase Connection Status Banner */}
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border text-xs font-semibold ${
                      supabaseStatus === 'ok'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : supabaseStatus === 'testing'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                        : supabaseStatus === 'error'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <div className="flex items-center gap-2">
                        {supabaseStatus === 'ok' && <Database className="w-4 h-4 text-emerald-500" />}
                        {supabaseStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />}
                        {supabaseStatus === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {supabaseStatus === 'idle' && <Database className="w-4 h-4 text-slate-400" />}
                        <div>
                          <span className="block font-bold">
                            Estado Base de Datos Supabase
                          </span>
                          <span className="block text-[11px] opacity-80 mt-0.5">{supabaseMsg}</span>
                          {supabaseStatus === 'error' && !isSupabaseConfigured && (
                            <span className="block text-[10px] mt-1 text-red-600 dark:text-red-400">
                              Las citas se guardan SOLO en este dispositivo (localStorage). Para sincronizar en la nube, configura Supabase.
                            </span>
                          )}
                          {supabaseStatus === 'error' && isSupabaseConfigured && supabaseMsg.includes('appointments') && (
                            <span className="block text-[10px] mt-1">
                              → Ve a Supabase → SQL Editor y ejecuta el schema de la tabla.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={testSupabaseConnection}
                          disabled={supabaseStatus === 'testing'}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus === 'testing' ? 'animate-spin' : ''}`} />
                          <span>Probar Conexión</span>
                        </button>
                        <button
                          onClick={loadClinicalData}
                          disabled={isLoadingData}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                          <span>Recargar Datos</span>
                        </button>
                      </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm">
                        <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold uppercase block">
                          Total Citas
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-100">
                          {appointments.length}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                        <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold uppercase block">
                          Confirmadas
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
                          {totalConfirmed}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 shadow-sm">
                        <span className="text-[11px] text-sky-800 dark:text-sky-300 font-bold uppercase block">
                          Pacientes Únicos
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-sky-950 dark:text-sky-100">
                          {Array.from(new Set(appointments.map(a => `${a.nombre}_${a.apellido}`))).length}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-sm">
                        <span className="text-[11px] text-rose-800 dark:text-rose-300 font-bold uppercase block">
                          Pendientes Validación
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-rose-950 dark:text-rose-100">
                          {totalPending}
                        </span>
                      </div>
                    </div>

                    {/* Quick Overview & Next Appointments */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-500" />
                            <span>Próximas Citas en Agenda</span>
                          </h3>
                          <p className="text-xs text-slate-500">Citas agendadas y alertas en tiempo real</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('agenda')}
                          className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Ver Agenda Completa</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {appointments.slice(0, 4).map((app) => (
                          <div
                            key={app.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                  {app.code}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                  {app.nombre} {app.apellido}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                📅 {app.fecha} ({app.hora}) • 🩺 {app.selectedPackageName || app.serviceId} • 👨‍⚕️ {app.specialistName || 'Especialista'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* WhatsApp Instant Notify Alert */}
                              <a
                                href={generateWhatsAppAlertUrl(app)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                title="Enviar alerta WhatsApp al especialista"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>

                              {app.status !== 'confirmada' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'confirmada')}
                                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
                                >
                                  Validar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AGENDA DE CITAS TAB */}
                {activeTab === 'agenda' && (
                  <div className="space-y-3">
                    {filteredAppointments.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                        No se encontraron citas que coincidan con los filtros aplicados.
                      </div>
                    ) : (
                      filteredAppointments.map((app) => (
                        <div
                          key={app.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
                                {app.code}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {app.nombre} {app.apellido}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                                  app.status === 'confirmada'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : app.status === 'cancelada'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                    : app.status === 'completada'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                              <span>
                                📅 <strong>{app.fecha}</strong> ({app.hora})
                              </span>
                              <span>
                                🩺 <strong>{app.selectedPackageName || app.serviceId}</strong> ({app.selectedPackagePrice || app.servicePrice || '35 USD'})
                              </span>
                              <span>
                                👨‍⚕️ Asignado: <strong>{app.specialistName || 'Lic. Isaac'}</strong>
                              </span>
                              <span>📞 {app.telefono}</span>
                            </div>

                            {app.motivoConsulta && (
                              <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                                <strong>Motivo:</strong> {app.motivoConsulta}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* WhatsApp Direct Notification */}
                            <a
                              href={generateWhatsAppAlertUrl(app)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                              title="Notificar por WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            {app.status !== 'confirmada' && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'confirmada')}
                                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
                              >
                                Validar
                              </button>
                            )}

                            {app.status !== 'cancelada' && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'cancelada')}
                                className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold transition-all"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. DIRECTORIO DE PACIENTES TAB */}
                {activeTab === 'pacientes' && (
                  <div className="space-y-4">
                    {/* Header Banner with Add Patient Button */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-500" />
                          <span>Directorio & Expedientes de Pacientes</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Registra nuevos pacientes, completa su historia clínica o consulta sus antecedentes y citas médicas.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setEditingPatient(null);
                            setIsPatientModalOpen(true);
                          }}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                          <Users className="w-4 h-4" />
                          <span>+ Registrar Nuevo Paciente</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {uniquePatients.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                          <Users className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            No hay pacientes registrados con los filtros aplicados.
                          </p>
                          <button
                            onClick={() => {
                              setEditingPatient(null);
                              setIsPatientModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm"
                          >
                            <span>Registrar Primer Paciente</span>
                          </button>
                        </div>
                      ) : (
                        uniquePatients.map((pat, idx) => {
                          const existingRecord = registeredPatients.find(
                            (r) =>
                              (pat.id && r.id === pat.id) ||
                              ((r.nombre || '').toLowerCase() === (pat.nombre || '').toLowerCase() &&
                                (r.apellido || '').toLowerCase() === (pat.apellido || '').toLowerCase())
                          );

                          return (
                            <div
                              key={pat.id || idx}
                              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-amber-400/50 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                                      {pat.name}
                                    </h4>
                                    {pat.cedula && (
                                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                        C.I. / DNI: <span className="font-bold text-slate-700 dark:text-slate-300">{pat.cedula}</span>
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {pat.isRegisteredRecord && (
                                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        EXPEDIENTE COMPLETO
                                      </span>
                                    )}
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                      {pat.totalVisits} {pat.totalVisits === 1 ? 'Cita' : 'Citas'}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 mt-2.5">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <p>📞 Tel: <strong className="text-slate-800 dark:text-slate-200">{pat.phone || 'No registrado'}</strong></p>
                                    {pat.email && <p>✉️ {pat.email}</p>}
                                    {pat.bloodType && (
                                      <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold text-[10px]">
                                        🩸 {pat.bloodType}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                    <span>📅 Última atención: <strong>{pat.lastVisitDate}</strong></span>
                                    <span>👨‍⚕️ {pat.lastSpecialist}</span>
                                  </div>
                                </div>

                                {/* Clinical Highlights if available */}
                                {(pat.allergies || pat.chronicConditions || pat.currentMedication || pat.lastReason) && (
                                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1">
                                    {pat.allergies && (
                                      <p className="text-rose-600 dark:text-rose-400">
                                        <strong>⚠️ Alergias:</strong> {pat.allergies}
                                      </p>
                                    )}
                                    {pat.chronicConditions && (
                                      <p className="text-amber-700 dark:text-amber-400">
                                        <strong>🩺 Antecedentes:</strong> {pat.chronicConditions}
                                      </p>
                                    )}
                                    {pat.currentMedication && (
                                      <p className="text-slate-600 dark:text-slate-300">
                                        <strong>💊 Medicación actual:</strong> {pat.currentMedication}
                                      </p>
                                    )}
                                    {!pat.allergies && !pat.chronicConditions && !pat.currentMedication && pat.lastReason && (
                                      <p className="text-slate-600 dark:text-slate-400">
                                        <strong>Último motivo:</strong> {pat.lastReason}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Action Footer */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 mt-2">
                                <a
                                  href={`https://wa.me/${pat.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hola ${pat.name}, te contactamos del Centro Clínico EQUILIBRA para hacer seguimiento a tu atención médica y ficha clínica.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      if (existingRecord) {
                                        setEditingPatient(existingRecord);
                                      } else {
                                        // Prefill with available data
                                        setEditingPatient({
                                          id: '',
                                          nombre: pat.nombre || pat.name.split(' ')[0] || '',
                                          apellido: pat.apellido || pat.name.split(' ').slice(1).join(' ') || '',
                                          cedula: pat.cedula || '',
                                          telefono: pat.phone || '',
                                          email: pat.email || '',
                                          totalAppointments: pat.totalVisits || 0,
                                          completedAppointments: pat.totalVisits || 0,
                                          lastVisit: pat.lastVisitDate || todayStr,
                                          totalSpent: 0,
                                          firstVisitDate: todayStr,
                                          clinicalNotes: pat.lastReason || '',
                                          medicalConditions: pat.chronicConditions || '',
                                          alergias: pat.allergies || '',
                                          antecedentes: pat.chronicConditions || '',
                                          medicamentosActuales: pat.currentMedication || '',
                                          createdAt: new Date().toISOString(),
                                        });
                                      }
                                      setIsPatientModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>{existingRecord ? 'Editar Ficha' : 'Completar Registro'}</span>
                                  </button>

                                  {existingRecord && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`¿Estás seguro de eliminar el expediente clínico de ${pat.name}?`)) {
                                          deleteStoredPatient(existingRecord.id);
                                          setRegisteredPatients(getStoredPatients());
                                        }
                                      }}
                                      className="p-1 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                                      title="Eliminar registro"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 4. EQUIPO DE ESPECIALISTAS TAB */}
                {activeTab === 'staff' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-amber-500" />
                          <span>Gestión de Estado, Actividad y Reposos del Equipo</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Cambia la actividad en tiempo real o programa descansos, permisos y suplencias médicas.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ● {TEAM_MEMBERS.length - TEAM_MEMBERS.filter((m) => isSpecialistInactiveOnDate(m.id, todayStr)).length} Activos
                        </span>
                        {TEAM_MEMBERS.filter((m) => isSpecialistInactiveOnDate(m.id, todayStr)).length > 0 && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            ● {TEAM_MEMBERS.filter((m) => isSpecialistInactiveOnDate(m.id, todayStr)).length} En Reposo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {TEAM_MEMBERS.map((member) => {
                        const isInactive = isSpecialistInactiveOnDate(member.id, todayStr);
                        const absenceInfo = specialistAvailabilities[member.id];
                        const currentStatus = isInactive ? 'descanso' : (staffStatuses[member.id] || 'disponible');

                        return (
                          <div
                            key={member.id}
                            className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-3 shadow-sm ${
                              isInactive 
                                ? 'border-amber-500/50 dark:border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10' 
                                : 'border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                                  {member.name}
                                </h4>
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                                  {member.role}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                  {member.specialty}
                                </p>
                              </div>
                            </div>

                            {/* Inactivity banner if inactive */}
                            {isInactive && absenceInfo && (
                              <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-900/60 text-[10px] text-amber-900 dark:text-amber-200 space-y-1">
                                <div className="flex items-center gap-1 font-bold">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Reposo: {absenceInfo.reasonDetails || absenceInfo.reason || 'Ausente'}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400">
                                  📅 Hasta: <strong>{absenceInfo.inactiveUntil || 'Indefinido'}</strong>
                                </p>
                                {absenceInfo.substituteSpecialistName && (
                                  <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                                    🩺 Suplente: {absenceInfo.substituteSpecialistName}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Status Selector & Absence Configuration Button */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                              {/* Quick Status Dropdown */}
                              <div className="relative flex-1">
                                <select
                                  value={currentStatus}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    if (val === 'descanso') {
                                      openAbsenceModal(member);
                                    } else {
                                      // If setting to available/en_consulta, clear inactivity
                                      if (isInactive) {
                                        saveSpecialistAvailability(member.id, { isInactive: false });
                                        setSpecialistAvailabilities(getStoredSpecialistsAvailability());
                                      }
                                      setStaffStatuses((prev) => ({ ...prev, [member.id]: val }));
                                    }
                                  }}
                                  className={`w-full text-[11px] font-bold py-1.5 px-2.5 rounded-xl border appearance-none cursor-pointer focus:outline-none transition-colors ${
                                    currentStatus === 'disponible'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                      : currentStatus === 'en_consulta'
                                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                      : currentStatus === 'de_guardia'
                                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                  }`}
                                >
                                  <option value="disponible">● Disponible</option>
                                  <option value="en_consulta">● En Consulta</option>
                                  <option value="de_guardia">● De Guardia</option>
                                  <option value="descanso">● En Reposo / Ausente</option>
                                </select>
                              </div>

                              {/* Absence Modal Trigger Button */}
                              <button
                                onClick={() => openAbsenceModal(member)}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                title="Configurar reposo médico, vacaciones y suplente"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Absence / Inactivity Modal Popup */}
                    {editingAbsenceMember && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
                        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                                <CalendarOff className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                  Reposo / Inactividad de {editingAbsenceMember.name}
                                </h3>
                                <p className="text-[11px] text-slate-500">{editingAbsenceMember.specialty}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingAbsenceMember(null)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <form onSubmit={handleSaveAbsence} className="space-y-4 text-xs">
                            {/* Toggle Inactivity */}
                            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                  ¿Especialista en Reposo / Inactivo?
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Desactiva su asignación en citas web y transfiere a su suplente
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={isInactiveForm}
                                onChange={(e) => setIsInactiveForm(e.target.checked)}
                                className="w-5 h-5 accent-amber-500 rounded"
                              />
                            </label>

                            {isInactiveForm && (
                              <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 animate-in fade-in">
                                <div>
                                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                    Motivo de la Ausencia:
                                  </label>
                                  <select
                                    value={absenceReason}
                                    onChange={(e) => setAbsenceReason(e.target.value as any)}
                                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                                  >
                                    <option value="enfermedad">Reposo Médico / Enfermedad</option>
                                    <option value="vacaciones">Vacaciones Programadas</option>
                                    <option value="permiso">Permiso Especial / Personal</option>
                                    <option value="capacitacion">Capacitación / Congreso</option>
                                    <option value="otro">Otro Motivo</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                    Detalle / Diagnóstico (visible para administración):
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ej: Reposo traumatológico de 5 días"
                                    value={absenceReasonDetails}
                                    onChange={(e) => setAbsenceReasonDetails(e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                      Desde Fecha:
                                    </label>
                                    <input
                                      type="date"
                                      value={inactiveFromDate}
                                      onChange={(e) => setInactiveFromDate(e.target.value)}
                                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                      Hasta Fecha:
                                    </label>
                                    <input
                                      type="date"
                                      value={inactiveUntilDate}
                                      onChange={(e) => setInactiveUntilDate(e.target.value)}
                                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                    Especialista Suplente Asignado:
                                  </label>
                                  <select
                                    value={substituteId}
                                    onChange={(e) => setSubstituteId(e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                                  >
                                    <option value="">-- Sin especialista suplente (Bloquear horario) --</option>
                                    {TEAM_MEMBERS.filter((m) => m.id !== editingAbsenceMember.id).map((sub) => (
                                      <option key={sub.id} value={sub.id}>
                                        {sub.name} ({sub.role})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={() => setEditingAbsenceMember(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20"
                              >
                                Guardar Disponibilidad
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. SERVICIOS & TARIFAS TAB */}
                {activeTab === 'servicios' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {SERVICES_DATA.map((srv) => (
                        <div
                          key={srv.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {srv.title}
                            </h4>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                              {srv.priceFormatted}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {srv.shortDescription}
                          </p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span>⏱️ {srv.duration}</span>
                            <span>•</span>
                            <span>📋 {srv.pricingTiers?.length || 1} Modalidades</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. CANCELACIONES & RECARGOS TAB */}
                {activeTab === 'cancelaciones' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60">
                        <span className="text-xs text-red-600 font-bold uppercase block">
                          Total Cancelaciones
                        </span>
                        <span className="text-2xl font-extrabold text-red-900 dark:text-red-200">
                          {totalCancellations.length}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                        <span className="text-xs text-amber-600 font-bold uppercase block">
                          Recargos Aplicados (2da+ Canc.)
                        </span>
                        <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-200">
                          {totalPenalties.toFixed(2)} USD
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                        <span className="text-xs text-emerald-600 font-bold uppercase block">
                          Política de Cancelación
                        </span>
                        <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 block mt-1">
                          1ra: Gratuita (0%) • 2da+: Recargo del 20%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {totalCancellations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                          No hay citas canceladas registradas.
                        </div>
                      ) : (
                        totalCancellations.map((c) => (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {c.code} • {c.nombre} {c.apellido}
                              </span>
                              <span className="text-slate-500 block">
                                Fecha: {c.fecha} ({c.hora}) • Motivo: {c.cancellationReason || 'Cancelación'}
                              </span>
                            </div>
                            <div className="text-right">
                              {c.cancellationPenaltyFee ? (
                                <span className="font-bold text-red-600 block">
                                  +20% Recargo ({c.cancellationPenaltyFee} USD)
                                </span>
                              ) : (
                                <span className="font-semibold text-emerald-600 block">
                                  1ra Canc. (0 USD)
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                {c.canceledAt ? new Date(c.canceledAt).toLocaleDateString() : 'Registrado'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 7. AUDITORÍA & SEGURIDAD TAB */}
                {activeTab === 'auditoria' && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Registro de Eventos Criptográficos y de Acceso Clínico:
                    </h4>
                    <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar">
                      {securityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between font-mono"
                        >
                          <div>
                            <span
                              className={`font-bold mr-2 ${
                                log.severity === 'CRITICAL'
                                  ? 'text-red-500'
                                  : log.severity === 'WARNING'
                                  ? 'text-amber-500'
                                  : 'text-emerald-500'
                              }`}
                            >
                              [{log.action}]
                            </span>
                            <span className="text-slate-800 dark:text-slate-200">{log.details}</span>
                          </div>
                          <span className="text-slate-400 text-[10px] shrink-0 ml-2">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. CONFIGURACIÓN, TELEGRAM BOT & SUPABASE TAB */}
                {activeTab === 'configuracion' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Settings className="w-4 h-4 text-amber-500" />
                          <span>Configuración de Integraciones, Telegram Bot & Base de Datos</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Conecta el bot de Telegram y asigna a los especialistas para que el bot los etiquete automáticamente por su especialidad en cada cita agendada.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-xl border ${
                          telegramConfig.botToken && telegramConfig.chatId && telegramConfig.enabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : telegramConfig.botToken && !telegramConfig.chatId
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        }`}>
                          {telegramConfig.botToken && telegramConfig.chatId && telegramConfig.enabled
                            ? '● Telegram Activo y Conectado'
                            : telegramConfig.botToken && !telegramConfig.chatId
                            ? '⚠️ Falta ingresar Chat ID'
                            : '● Telegram Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Telegram Bot Notification Card */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                              <Send className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Bot de Notificaciones Telegram
                              </h4>
                              <p className="text-[11px] text-slate-500">Alertas automáticas en tiempo real al agendar citas</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            telegramConfig.botToken && telegramConfig.chatId && telegramConfig.enabled
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : telegramConfig.botToken && !telegramConfig.chatId
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {telegramConfig.botToken && telegramConfig.chatId && telegramConfig.enabled
                              ? 'Activo'
                              : telegramConfig.botToken && !telegramConfig.chatId
                              ? 'Falta Chat ID'
                              : 'Inactivo'}
                          </span>
                        </div>

                        <form onSubmit={handleSaveTelegram} className="space-y-3.5 text-xs">
                          {/* Toggle Active */}
                          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                Notificaciones automáticas activas
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Despacha alertas a Telegram inmediatamente al recibir reservas
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={telegramEnabled}
                              onChange={(e) => setTelegramEnabled(e.target.checked)}
                              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                            />
                          </label>

                          {/* Token Field */}
                          <div>
                            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Telegram Bot Token:
                            </label>
                            <input
                              type="password"
                              placeholder="Ej: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                              value={telegramToken}
                              onChange={(e) => setTelegramToken(e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-mono text-xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Obtenido a través de <strong>@BotFather</strong> en Telegram al crear tu bot.
                            </p>
                          </div>

                          {/* Chat ID Field */}
                          <div>
                            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Chat ID o ID del Grupo/Canal:
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: -1001987654321 (para grupo) o 987654321 (chat personal)"
                              value={telegramChatId}
                              onChange={(e) => setTelegramChatId(e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-mono text-xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              💡 <strong>Para grupos:</strong> Agrega tu bot como admin al grupo de Telegram y usa el ID del grupo (ej: <code>-1001234567890</code>).
                            </p>
                          </div>

                          {/* Test result message */}
                          {telegramTestResult && (
                            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                              telegramTestResult.success
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                                : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200'
                            }`}>
                              {telegramTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                              <span>{telegramTestResult.message}</span>
                            </div>
                          )}

                          {/* Save feedback */}
                          {telegramSaveSuccess && (
                            <div className="p-3 rounded-xl bg-emerald-500 text-white font-bold flex items-center gap-2 text-xs">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>¡Configuración de Telegram guardada y activa!</span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="submit"
                              className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                              <Check className="w-4 h-4" />
                              <span>Guardar Conexión</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleTestTelegram}
                              disabled={isTestingTelegram || !telegramToken.trim() || !telegramChatId.trim()}
                              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isTestingTelegram ? 'Enviando...' : '🧪 Probar Bot'}</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Supabase & Cloud Database Card */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                              <Database className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Base de Datos Cloud (Supabase)
                              </h4>
                              <p className="text-[11px] text-slate-500">Persistencia segura de expedientes y citas en la nube</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            supabaseConfig.url ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {supabaseConfig.url ? 'Conectado' : 'Almacenamiento Local'}
                          </span>
                        </div>

                        <form onSubmit={handleSaveSupabase} className="space-y-3.5 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Project URL de Supabase:
                            </label>
                            <input
                              type="text"
                              placeholder="https://xyzcompany.supabase.co"
                              value={supabaseUrl}
                              onChange={(e) => setSupabaseUrl(e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              API Anon Key (Public Key):
                            </label>
                            <input
                              type="password"
                              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                              value={supabaseAnonKey}
                              onChange={(e) => setSupabaseAnonKey(e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-mono text-xs"
                            />
                          </div>

                          {supabaseTestResult && (
                            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                              supabaseTestResult.success
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                                : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200'
                            }`}>
                              {supabaseTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                              <span>{supabaseTestResult.message}</span>
                            </div>
                          )}

                          {supabaseSaveSuccess && (
                            <div className="p-3 rounded-xl bg-emerald-500 text-white font-bold flex items-center gap-2 text-xs">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>¡Credenciales de Supabase guardadas exitosamente!</span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="submit"
                              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                              <Check className="w-4 h-4" />
                              <span>Guardar Supabase</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleTestSupabase}
                              disabled={isTestingSupabase || !supabaseUrl || !supabaseAnonKey}
                              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                              <span>Probar Conexión</span>
                            </button>

                            {supabaseConfig.url && (
                              <button
                                type="button"
                                onClick={handleClearSupabase}
                                className="p-2.5 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/50 dark:hover:bg-red-900 text-red-600 dark:text-red-300 transition-all"
                                title="Desconectar Supabase y volver a local"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* SPECIALIST TELEGRAM TAGS ASSIGNMENT SECTION */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Bot className="w-4 h-4 text-sky-500" />
                            <span>Asignación de Usuarios de Telegram (@mentions por Especialista)</span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Asigna el usuario de Telegram (ej: <code>@isaac_fisio</code>) a cada especialista. El bot los etiquetará en el grupo cada vez que un paciente agende en su área.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleSaveAllSpecialistTags}
                          className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0"
                        >
                          <Check className="w-4 h-4" />
                          <span>Guardar Todas las Etiquetas</span>
                        </button>
                      </div>

                      {/* Success banner for tags */}
                      {tagsSaveSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500 text-white font-bold flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>¡Etiquetas de Telegram de los especialistas guardadas con éxito!</span>
                        </div>
                      )}

                      {/* Specialist Tag Test feedback */}
                      {specialistTagTestResult && (
                        <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                          specialistTagTestResult.success
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                            : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200'
                        }`}>
                          {specialistTagTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          <span>{specialistTagTestResult.message}</span>
                        </div>
                      )}

                      {/* Table / List of Specialists */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {TEAM_MEMBERS.map((member) => {
                          const tag = specialistTags[member.id] || '';
                          const isTesting = testingTagMemberId === member.id;

                          return (
                            <div
                              key={member.id}
                              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={member.image}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                      {member.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block truncate">
                                    {member.role}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="relative flex-1 sm:w-40">
                                  <input
                                    type="text"
                                    placeholder="@usuario"
                                    value={tag}
                                    onChange={(e) => handleUpdateSpecialistTag(member.id, e.target.value)}
                                    className="w-full py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-mono dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleTestSpecificTag(member)}
                                  disabled={isTesting || !tag.trim()}
                                  className="py-1.5 px-2.5 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/60 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold text-[11px] flex items-center gap-1 disabled:opacity-40 transition-all shrink-0"
                                  title="Enviar mención de prueba al grupo"
                                >
                                  <Send className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                                  <span>{isTesting ? 'Probando...' : 'Probar'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Commands guide box */}
                      <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-950 dark:text-sky-200 space-y-2">
                        <div className="font-bold flex items-center gap-2 text-sky-900 dark:text-sky-300">
                          <Bot className="w-4 h-4" />
                          <span>¿Cómo funciona el etiquetado en Telegram?</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <li>Cuando un paciente agenda una cita en la web (ej: Fisioterapia Deportiva), el sistema busca al especialista asignado (ej: <strong>Isaac Jewsiejew</strong>).</li>
                          <li>Si tiene configurado un usuario (ej: <code>@isaac_fisio</code>), el bot de Telegram enviará el mensaje al grupo etiquetándolo con <code>🔔 Atención Especialista: @isaac_fisio</code> para que le suene la notificación al profesional en su móvil.</li>
                          <li>Si el especialista está en <strong>reposo médico o ausencia</strong> y tiene un suplente asignado, el bot mencionará automáticamente al suplente.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Clinic Information Card */}
                    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                        <Building2 className="w-4 h-4 text-amber-500" />
                        <span>Información de la Sede Clínica Equilibra</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] block font-bold uppercase">Ubicación</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Av. Principal de Las Mercedes, Caracas</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] block font-bold uppercase">Horario de Atención</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Lunes a Sábado: 8:00 AM - 6:00 PM</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] block font-bold uppercase">Contacto Directo</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">+58 412 123 4567 • info@equilibra.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Bottom Navigation Bar (For iPhone / Mobile Screen Sizes) */}
              <div className="md:hidden bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shrink-0 backdrop-blur-sm">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
                    activeTab === 'dashboard' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mb-0.5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
                    activeTab === 'agenda' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                  }`}
                >
                  <Calendar className="w-4 h-4 mb-0.5" />
                  <span>Agenda</span>
                </button>

                <button
                  onClick={() => setActiveTab('pacientes')}
                  className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
                    activeTab === 'pacientes' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                  }`}
                >
                  <Users className="w-4 h-4 mb-0.5" />
                  <span>Pacientes</span>
                </button>

                <button
                  onClick={() => setActiveTab('staff')}
                  className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
                    activeTab === 'staff' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mb-0.5" />
                  <span>Equipo</span>
                </button>

                {(authenticatedUser?.role === 'admin' || authenticatedUser?.role === 'administrador_general') ? (
                  <button
                    onClick={() => setActiveTab('configuracion')}
                    className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
                      activeTab === 'configuracion' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    <Settings className="w-4 h-4 mb-0.5" />
                    <span>Ajustes</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('servicios')}
                    className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
                      activeTab === 'servicios' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    <Package className="w-4 h-4 mb-0.5" />
                    <span>Tarifas</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Patient Registration & Clinical Profile Modal */}
      {isPatientModalOpen && (
        <PatientRegistrationModal
          editingPatient={editingPatient}
          isOpen={isPatientModalOpen}
          onClose={() => {
            setIsPatientModalOpen(false);
            setEditingPatient(null);
          }}
          onPatientSaved={(patient) => {
            setRegisteredPatients(getStoredPatients());
            setIsPatientModalOpen(false);
            setEditingPatient(null);
          }}
          currentUserName={authenticatedUser?.name || 'Especialista'}
        />
      )}
    </AnimatePresence>
  );
};
