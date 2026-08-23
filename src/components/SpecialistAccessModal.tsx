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
} from 'lucide-react';
import { ConfirmedAppointment, SlotStatus } from '../types';
import {
  getAppointmentsFromDatabase,
  getSavedAppointments,
  saveAppointmentToStorage,
} from '../utils/bookingUtils';
import {
  verifySpecialistPin,
  getAuthShieldStatus,
  getSecurityLogs,
  SecurityAuditEntry,
  recordSecurityEvent,
  maskSensitiveData,
} from '../utils/security';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { SERVICES_DATA } from '../data/servicesData';

interface SpecialistAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecialistAccessModal: React.FC<SpecialistAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState(getAuthShieldStatus());

  const [activeTab, setActiveTab] = useState<'agenda' | 'pacientes' | 'auditoria'>('agenda');
  const [appointments, setAppointments] = useState<ConfirmedAppointment[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditEntry[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');

  // Inactivity Auto-Lock Timer (15 minutes = 900,000 ms)
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetSessionTimer = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (isAuthenticated) {
      sessionTimeoutRef.current = setTimeout(() => {
        setIsAuthenticated(false);
        setPin('');
        recordSecurityEvent({
          action: 'AUTH_FAILED',
          severity: 'INFO',
          details: 'Sesión de especialista cerrada automáticamente por inactividad (15 min).',
        });
      }, 15 * 60 * 1000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAuthStatus(getAuthShieldStatus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      loadClinicalData();
      resetSessionTimer();
    }
    return () => {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, [isAuthenticated]);

  const loadClinicalData = async () => {
    const dbAppointments = await getAppointmentsFromDatabase();
    const local = getSavedAppointments();
    const combined = [...dbAppointments, ...local.filter((l) => !dbAppointments.some((d) => d.id === l.id))];
    setAppointments(combined);
    setSecurityLogs(getSecurityLogs());
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = verifySpecialistPin(pin);
    setAuthStatus(getAuthShieldStatus());

    if (result.success) {
      setIsAuthenticated(true);
      setAuthError(null);
      setPin('');
    } else {
      setAuthError(result.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin('');
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
  };

  const handleUpdateStatus = (id: string, newStatus: 'confirmada' | 'pendiente_validacion') => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    setAppointments(updated);
    const target = updated.find((a) => a.id === id);
    if (target) {
      saveAppointmentToStorage(target);
      recordSecurityEvent({
        action: 'BOOKING_SUCCESS',
        severity: 'INFO',
        details: `Estado de cita [${target.code}] actualizado a '${newStatus}' por especialista.`,
      });
      setSecurityLogs(getSecurityLogs());
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesDate = !selectedDateFilter || app.fecha === selectedDateFilter;
    const matchesStatus =
      statusFilter === 'TODAS' ||
      (statusFilter === 'CONFIRMADAS' && app.status === 'confirmada') ||
      (statusFilter === 'PENDIENTES' && app.status === 'pendiente_validacion');
    return matchesDate && matchesStatus;
  });

  return (
    <AnimatePresence>
      <div
        id="specialist-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <KeyRound className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-heading">
                    Portal Clínico de Especialistas
                  </h2>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Acceso Restringido
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {isAuthenticated
                    ? 'Sesión activa con cifrado de expediente clínico'
                    : 'Ingreso protegido con escudo contra ataques de fuerza bruta'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Authentication Screen */}
          {!isAuthenticated ? (
            <div className="p-8 max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Identificación de Especialista
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ingresa tu PIN clínico maestro para desbloquear el expediente de pacientes y la agenda de turnos.
                </p>
              </div>

              {authStatus.isLocked ? (
                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Bloqueo Preventivo Activo</span>
                  </div>
                  <p>
                    Se detectaron demasiados intentos erróneos consecutivos. El sistema ha bloqueado los accesos temporalmente por 5 minutos para salvaguardar la confidencialidad médica.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                          </label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={8}
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-lg tracking-widest text-center font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Intentos disponibles: {authStatus.attemptsRemaining}/4</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Auto-cierre: 15 min
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Desbloquear Portal Seguro</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Logged-in Specialist Dashboard */
            <div className="p-6 space-y-6">
              {/* Secondary Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'agenda'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agenda de Consultas ({appointments.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('auditoria')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'auditoria'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Auditoría de Seguridad ({securityLogs.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isSupabaseConfigured ? 'Supabase Sync Activo' : 'Caché Cifrada Local'}
                  </span>
                  <button
                    onClick={loadClinicalData}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    title="Actualizar datos"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Agenda Tab */}
              {activeTab === 'agenda' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Filtrar por Estado:
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="TODAS">Todas las Citas</option>
                        <option value="CONFIRMADAS">Confirmadas</option>
                        <option value="PENDIENTES">En Validación</option>
                      </select>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Mostrando <strong>{filteredAppointments.length}</strong> de {appointments.length} registros
                    </div>
                  </div>

                  {/* Appointments Table / List */}
                  {filteredAppointments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                      No hay citas registradas que coincidan con los filtros seleccionados.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                      {filteredAppointments.map((app) => {
                        const service = SERVICES_DATA.find((s) => s.id === app.serviceId);
                        return (
                          <div
                            key={app.id}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                  {app.code}
                                </span>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                  {app.nombre} {app.apellido}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    app.status === 'confirmada'
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  }`}
                                >
                                  {app.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  {service?.title || app.serviceId}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {app.fecha}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {app.hora}
                                </span>
                                <span>📞 {app.telefono}</span>
                              </div>

                              {app.motivoConsulta && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                  "{app.motivoConsulta}"
                                </p>
                              )}
                            </div>

                            {/* Status Change Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {app.status === 'pendiente_validacion' ? (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'confirmada')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Validar Cita</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'pendiente_validacion')}
                                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                                >
                                  Marcar Pendiente
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

              {/* Security Audit Tab */}
              {activeTab === 'auditoria' && (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {securityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.severity === 'CRITICAL'
                                ? 'bg-red-500'
                                : log.severity === 'WARNING'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{log.details}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Acción: {log.action} • Dispositivo: {log.fingerprintHash}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Sesión protegida con protección contra manipulación
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
