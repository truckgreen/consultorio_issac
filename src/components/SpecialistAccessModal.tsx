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
} from 'lucide-react';
import { ConfirmedAppointment, SpecialistUser, AdminUser } from '../types';
import {
  getAppointmentsFromDatabase,
  getSavedAppointments,
  saveAppointmentToStorage,
} from '../utils/bookingUtils';
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

interface SpecialistAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [activeTab, setActiveTab] = useState<'agenda' | 'pacientes' | 'cancelaciones' | 'auditoria'>('agenda');
  const [appointments, setAppointments] = useState<ConfirmedAppointment[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditEntry[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [specialistFilter, setSpecialistFilter] = useState<string>('TODOS');
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Auto-lock session after 15 minutes of inactivity
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const loadClinicalData = async () => {
    const dbAppointments = await getAppointmentsFromDatabase();
    const local = getSavedAppointments();
    const combined = [
      ...dbAppointments,
      ...local.filter((l) => !dbAppointments.some((d) => d.id === l.id)),
    ];
    setAppointments(combined);
    setSecurityLogs(getSecurityLogs());
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

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    // If not admin, specialist sees only their appointments by default (or all if not tagged)
    if (authenticatedUser?.role === 'specialist') {
      const isAssigned =
        !app.specialistId ||
        app.specialistId === authenticatedUser.id ||
        (authenticatedUser.relatedServiceId && app.serviceId === authenticatedUser.relatedServiceId);
      if (!isAssigned) return false;
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
      (statusFilter === 'CANCELADAS' && app.status === 'cancelada');

    return matchesSpecialist && matchesDate && matchesStatus;
  });

  const totalCancellations = appointments.filter((a) => a.status === 'cancelada');
  const totalPenalties = appointments.reduce(
    (acc, a) => acc + (a.cancellationPenaltyFee || 0),
    0
  );

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
          className="relative w-full max-w-5xl bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        >
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 p-5 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                {authenticatedUser ? <UserCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-heading">
                    {authenticatedUser
                      ? `${authenticatedUser.role === 'admin' ? 'Panel de Administración' : 'Panel de Especialista'}: ${authenticatedUser.name}`
                      : 'Acceso Clínico Profesional & Administrativo'}
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {authenticatedUser ? authenticatedUser.role.toUpperCase() : 'SEGURO'}
                  </span>
                </div>
                  <p className="text-xs text-slate-300">
                    {authenticatedUser
                      ? `${authenticatedUser.email} • Sesión encriptada`
                      : 'Selecciona tu perfil e ingresa tu clave PIN de seguridad o biometría.'}
                  </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {authenticatedUser && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-500/30 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
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
            /* AUTHENTICATED DASHBOARD */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Dashboard Sub-nav */}
              <div className="bg-slate-100 dark:bg-slate-900/80 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'agenda'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agenda de Citas ({filteredAppointments.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('cancelaciones')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'cancelaciones'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancelaciones & Recargos ({totalCancellations.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('auditoria')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'auditoria'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Auditoría de Seguridad</span>
                  </button>
                </div>

                {/* Quick actions: Excel Export & Biometric Setup */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportToExcel}
                    disabled={isExportingExcel}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isExportingExcel ? 'Exportando...' : 'Descargar Base de Datos (.xlsx)'}</span>
                  </button>

                  <button
                    onClick={handleRegisterBiometrics}
                    title="Vincular huella de este dispositivo a este usuario"
                    className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 text-xs flex items-center gap-1"
                  >
                    <Fingerprint className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs shrink-0">
                {authenticatedUser.role === 'admin' && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Especialista:</span>
                    <select
                      value={specialistFilter}
                      onChange={(e) => setSpecialistFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
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

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Estado:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="TODAS">Todos los Estados</option>
                    <option value="CONFIRMADAS">Confirmadas</option>
                    <option value="PENDIENTES">Pendientes</option>
                    <option value="CANCELADAS">Canceladas</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Fecha:</span>
                  <input
                    type="date"
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                  {selectedDateFilter && (
                    <button
                      onClick={() => setSelectedDateFilter('')}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="ml-auto text-[11px] text-slate-500">
                  Total citas: <strong>{filteredAppointments.length}</strong>
                </div>
              </div>

              {/* TAB CONTENT */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {/* AGENDA TAB */}
                {activeTab === 'agenda' && (
                  <div className="space-y-3">
                    {filteredAppointments.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300">
                        No hay citas que coincidan con los filtros aplicados.
                      </div>
                    ) : (
                      filteredAppointments.map((app) => (
                        <div
                          key={app.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
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
                                🩺 <strong>{app.selectedPackageName || app.serviceId}</strong> ({app.selectedPackagePrice || app.servicePrice || '35€'})
                              </span>
                              <span>
                                👤 Asignado: <strong>{app.specialistName || 'Lic. Isaac'}</strong>
                              </span>
                              <span>📞 {app.telefono}</span>
                            </div>

                            {app.motivoConsulta && (
                              <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg">
                                Motivo: {app.motivoConsulta}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {app.status !== 'confirmada' && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'confirmada')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
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

                {/* CANCELLATIONS TAB */}
                {activeTab === 'cancelaciones' && (
                  <div className="space-y-4">
                    {/* Cancellation Stats */}
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
                          {totalPenalties.toFixed(2)}€
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
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
                                  +20% Recargo ({c.cancellationPenaltyFee}€)
                                </span>
                              ) : (
                                <span className="font-semibold text-emerald-600 block">
                                  1ra Canc. (0€)
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

                {/* AUDIT LOGS TAB */}
                {activeTab === 'auditoria' && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Registro de Eventos Criptográficos y de Acceso Clínico:
                    </h4>
                    <div className="space-y-1.5 max-h-96 overflow-y-auto">
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
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
