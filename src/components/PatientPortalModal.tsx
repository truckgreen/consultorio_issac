import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  CalendarCheck,
  ShieldCheck,
  MapPin,
  Lock,
  ArrowRight,
  FileText,
  AlertTriangle,
  RefreshCw,
  Ban,
  CalendarDays,
  Check,
  DollarSign,
  Package,
  ChevronRight,
  ListFilter,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { ConfirmedAppointment } from '../types';
import {
  getAppointmentsFromDatabase,
  getSavedAppointments,
  saveAppointmentToDatabase,
  generateIcsCalendar,
  rescheduleAppointmentInDatabase,
  cancelAppointmentInDatabase,
  getPatientCancellationCount,
} from '../utils/bookingUtils';
import { SERVICES_DATA } from '../data/servicesData';
import { CLINIC_INFO } from '../data/featuresData';
import { BookingCalendar } from './BookingCalendar';
import {
  sanitizeString,
  checkRateLimit,
  recordSecurityEvent,
  maskSensitiveData,
} from '../utils/security';

const getPackageTotalSessions = (appointment: ConfirmedAppointment): number => {
  const packageName = String(appointment.selectedPackageName || '').replace(/\s+/g, ' ').trim();
  const nameTotal = Number(packageName.match(/(\d+)\s*sesiones?/i)?.[1] || 0);
  return Math.max(appointment.packageTotalSessions || 0, nameTotal, /paquete/i.test(packageName) ? 10 : 1);
};

const getPackageAccessCode = (appointment: ConfirmedAppointment): string => {
  return appointment.packageCode || appointment.code;
};

interface PatientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking?: (serviceId?: string) => void;
  initialCode?: string;
}

export const PatientPortalModal: React.FC<PatientPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
  initialCode,
}) => {
  // Tabs: 'email_phone' or 'code'
  const [searchTab, setSearchTab] = useState<'email_phone' | 'code'>(initialCode ? 'code' : 'code');

  // Input states
  const [searchEmailOrPhone, setSearchEmailOrPhone] = useState('');
  const [searchCode, setSearchCode] = useState(initialCode || '');
  const [searchValidatorOptional, setSearchValidatorOptional] = useState('');

  // Results & status
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [appointmentsList, setAppointmentsList] = useState<ConfirmedAppointment[]>([]);
  const [foundAppointment, setFoundAppointment] = useState<ConfirmedAppointment | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<ConfirmedAppointment[]>([]);
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [isProcessingReschedule, setIsProcessingReschedule] = useState(false);
  const [rescheduleSuccessMessage, setRescheduleSuccessMessage] = useState<string | null>(null);

  // Cancellation state
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<{
    success: boolean;
    penaltyFee?: number;
    message: string;
    isSecondOrMore?: boolean;
  } | null>(null);

  const [packageDate, setPackageDate] = useState('');
  const [packageTime, setPackageTime] = useState('');
  const [selectedPackageDays, setSelectedPackageDays] = useState<Array<{ date: string; time: string }>>([]);
  const [isAddingPackageDay, setIsAddingPackageDay] = useState(false);

  // Robust Normalization & Matching Helpers
  const cleanAlphaNum = useCallback((s: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), []);

  const matchesAppointmentCode = useCallback((app: ConfirmedAppointment, query: string): boolean => {
    if (!query) return false;
    const rawQ = query.trim().toUpperCase();
    const cleanQ = cleanAlphaNum(rawQ);
    const cleanQWithoutEq = cleanQ.replace(/^EQ/, '');

    const rawCode = (app.code || '').trim().toUpperCase();
    const cleanCode = cleanAlphaNum(rawCode);
    const cleanCodeWithoutEq = cleanCode.replace(/^EQ/, '');

    const rawId = (app.id || '').trim().toUpperCase();
    const cleanId = cleanAlphaNum(rawId);

    // 1. Exact raw match
    if (rawCode === rawQ || rawId === rawQ) return true;

    // 2. Exact clean alphanumeric match (e.g. "EQ8K3N7P2W" === "EQ8K3N7P2W")
    if (cleanCode && cleanCode === cleanQ) return true;

    // 3. Match without EQ prefix (e.g. user typed "8K3N-7P2W" without "EQ-", or vice versa)
    if (cleanCodeWithoutEq.length >= 4 && cleanQWithoutEq.length >= 4) {
      if (cleanCodeWithoutEq === cleanQWithoutEq) return true;
      if (cleanCodeWithoutEq.includes(cleanQWithoutEq) || cleanQWithoutEq.includes(cleanCodeWithoutEq)) return true;
    }

    // 4. Clean code contains query
    if (cleanCode.length >= 4 && cleanQ.length >= 4) {
      if (cleanCode.includes(cleanQ) || cleanQ.includes(cleanCode)) return true;
    }

    // 5. App ID contains clean code
    if (cleanId && (cleanId === cleanQ || cleanId.includes(cleanQ) || cleanId.includes(cleanQWithoutEq))) return true;

    return false;
  }, [cleanAlphaNum]);

  const matchesAppointmentPhone = useCallback((app: ConfirmedAppointment, query: string): boolean => {
    const qDigits = (query || '').replace(/[^\d]/g, '');
    const appDigits = (app.telefono || '').replace(/[^\d]/g, '');
    if (qDigits.length < 4 || appDigits.length < 4) return false;

    // Direct includes
    if (appDigits.includes(qDigits) || qDigits.includes(appDigits)) return true;

    // Compare last 7 significant digits (immune to country code prefixes like +58, 0412, etc.)
    const qLast7 = qDigits.slice(-7);
    const appLast7 = appDigits.slice(-7);
    if (qLast7.length === 7 && appLast7.length === 7 && qLast7 === appLast7) return true;

    return false;
  }, []);

  const matchesAppointmentText = useCallback((app: ConfirmedAppointment, query: string): boolean => {
    const normQ = (query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (normQ.length < 3) return false;

    const appEmail = (app.email || '').toLowerCase().trim();
    if (normQ.includes('@') && appEmail.includes(normQ)) return true;
    if (appEmail && (appEmail === normQ || (appEmail.length >= 3 && appEmail.includes(normQ)))) return true;

    const fullName = `${app.nombre || ''} ${app.apellido || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (fullName.includes(normQ) || normQ.includes(fullName)) return true;

    return false;
  }, []);

  const performSearch = useCallback(async (queryParam?: string, validatorParam?: string) => {
    const rawQuery = (queryParam !== undefined ? queryParam : (searchTab === 'code' ? searchCode : searchEmailOrPhone)).trim();
    const rawValidator = (validatorParam !== undefined ? validatorParam : searchValidatorOptional).trim();

    if (!rawQuery) {
      setSearchError(
        searchTab === 'code'
          ? 'Por favor ingresa tu código de cita (ej. EQ-8K3N-7P2W).'
          : 'Por favor ingresa tu correo, teléfono o código de cita.'
      );
      return;
    }

    setSearchError(null);
    setFoundAppointment(null);
    setAppointmentsList([]);
    setSelectedPackageDays([]);
    setIsRescheduling(false);
    setIsCanceling(false);
    setCancellationResult(null);
    setRescheduleSuccessMessage(null);
    setIsSearching(true);

    try {
      const all = await getAppointmentsFromDatabase();
      const fallbackLocal = getSavedAppointments();

      // Consolidate pool deduplicated by id & code
      const map = new Map<string, ConfirmedAppointment>();
      for (const item of [...fallbackLocal, ...all]) {
        const key = item.id || item.code;
        if (key && !map.has(key)) {
          map.set(key, item);
        }
      }
      const pool = Array.from(map.values());

      let matches = pool.filter((app) => {
        return matchesAppointmentCode(app, rawQuery);
      });

      const packageAccessMatch = matches.find((app) => getPackageTotalSessions(app) > 1);
      if (packageAccessMatch) {
        matches = pool.filter((app) => getPackageAccessCode(app) === getPackageAccessCode(packageAccessMatch));
      }

      // If optional validator is provided AND multiple matches exist, narrow down safely
      if (rawValidator && matches.length > 1) {
        const filteredByValidator = matches.filter(
          (app) => matchesAppointmentPhone(app, rawValidator) || matchesAppointmentText(app, rawValidator)
        );
        if (filteredByValidator.length > 0) {
          matches = filteredByValidator;
        }
      }

      if (matches.length === 0) {
        setSearchError('No encontramos ninguna cita con esos datos. Verifica tu código (ej. EQ-XXXX-XXXX), correo o teléfono e intenta nuevamente.');
        recordSecurityEvent({
          action: 'AUTH_FAILED',
          severity: 'INFO',
          details: `Búsqueda sin resultados en portal: "${maskSensitiveData('name', rawQuery)}"`,
        });
      } else if (matches.length === 1) {
        const single = matches[0];
        setAppointmentsList(matches);
        setFoundAppointment(single);
        setPackageDate(single.fecha);
        setPackageTime(single.hora);
        setRescheduleDate(single.fecha);
        setRescheduleTime(single.hora);
        recordSecurityEvent({
          action: 'BOOKING_SUCCESS',
          severity: 'INFO',
          details: `Consulta autorizada en portal para [${single.code}].`,
        });
      } else {
        matches.sort((a, b) => new Date(b.createdAt || b.fecha).getTime() - new Date(a.createdAt || a.fecha).getTime());
        const exactCodeMatches = matches.filter((app) => matchesAppointmentCode(app, rawQuery));
        const isPackageSearch = exactCodeMatches.length > 0 && exactCodeMatches.some((app) => getPackageTotalSessions(app) > 1);
        setAppointmentsList(matches);
        if (isPackageSearch) {
          setFoundAppointment(matches[0]);
          setPackageDate(matches[0].fecha);
          setPackageTime(matches[0].hora);
        }
        recordSecurityEvent({
          action: 'BOOKING_SUCCESS',
          severity: 'INFO',
          details: `Consulta múltiple (${matches.length} citas) autorizada en portal.`,
        });
      }
    } catch (err) {
      console.error('Portal search error:', err);
      setSearchError('Error temporal al consultar los registros. Por favor intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  }, [searchTab, searchCode, searchEmailOrPhone, searchValidatorOptional, matchesAppointmentCode, matchesAppointmentPhone, matchesAppointmentText]);

  // Load saved appointments & handle initialCode on modal open
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedAppointments();
      setRecentAppointments(saved);

      const lastCode = typeof window !== 'undefined' ? localStorage.getItem('equilibra_last_booked_code') : null;
      if (lastCode) {
        setSuggestedCode(lastCode);
      }

      if (initialCode && initialCode.trim()) {
        const cleanCode = initialCode.trim().toUpperCase();
        setSearchCode(cleanCode);
        setSearchTab('code');
        void performSearch(cleanCode);
      }
    } else {
      setSearchError(null);
      setFoundAppointment(null);
      setAppointmentsList([]);
      setSelectedPackageDays([]);
      setIsRescheduling(false);
      setIsCanceling(false);
    }
  }, [isOpen, initialCode, performSearch]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void performSearch();
  };

  const handleSelectAppointmentFromList = (appointment: ConfirmedAppointment) => {
    setFoundAppointment(appointment);
    setRescheduleDate(appointment.fecha);
    setRescheduleTime(appointment.hora);
    setIsRescheduling(false);
    setIsCanceling(false);
    setCancellationResult(null);
    setRescheduleSuccessMessage(null);
    setPackageDate(appointment.fecha);
    setPackageTime(appointment.hora);
  };

  const handleAddPackageDay = async () => {
    if (!foundAppointment || !packageDate || !packageTime) return;
    const totalSessions = getPackageTotalSessions(foundAppointment);
    const packageAppointments = appointmentsList.filter(
      (appointment) => getPackageAccessCode(appointment) === getPackageAccessCode(foundAppointment)
    );
    const activeAppointments = packageAppointments.filter((appointment) => appointment.status !== 'cancelada' && appointment.status !== 'CANCELADA');
    if (totalSessions <= 1 || activeAppointments.length >= totalSessions) return;
    if (activeAppointments.some((appointment) => appointment.fecha === packageDate && appointment.hora === packageTime) || selectedPackageDays.some((day) => day.date === packageDate && day.time === packageTime)) {
      setSearchError('Ese día y horario ya forman parte de tu paquete. Elige otro horario.');
      return;
    }
    if (selectedPackageDays.length >= totalSessions - activeAppointments.length) {
      setSearchError('Ya seleccionaste todos los días disponibles para guardar.');
      return;
    }
    setSelectedPackageDays((previous) => [...previous, { date: packageDate, time: packageTime }]);
    setSearchError(null);
    setRescheduleSuccessMessage('Día añadido a tu selección. Puedes elegir más días antes de confirmar.');
  };

  const handleConfirmPackageDays = async () => {
    if (!foundAppointment || selectedPackageDays.length === 0) return;
    const totalSessions = getPackageTotalSessions(foundAppointment);
    const packageAppointments = appointmentsList.filter(
      (appointment) => getPackageAccessCode(appointment) === getPackageAccessCode(foundAppointment)
    );
    const activeAppointments = packageAppointments.filter((appointment) => appointment.status !== 'cancelada' && appointment.status !== 'CANCELADA');
    setIsAddingPackageDay(true);
    setSearchError(null);
    try {
      const newAppointments: ConfirmedAppointment[] = [];
      for (const [index, day] of selectedPackageDays.entries()) {
        const sessionNumber = activeAppointments.length + index + 1;
        const newAppointment: ConfirmedAppointment = {
          ...foundAppointment,
          id: `app_${Date.now()}_${sessionNumber}_${Math.random().toString(36).slice(2, 8)}`,
          fecha: day.date,
          hora: day.time,
          code: `${foundAppointment.code}-${sessionNumber}`,
          packageCode: getPackageAccessCode(foundAppointment),
          packageSessionNumber: sessionNumber,
          createdAt: new Date().toISOString(),
          status: 'confirmada',
        };
        await saveAppointmentToDatabase(newAppointment);
        newAppointments.push(newAppointment);
      }
      setAppointmentsList((previous) => [...previous, ...newAppointments]);
      setSelectedPackageDays([]);
      setRescheduleSuccessMessage(`${newAppointments.length} día(s) de tu paquete guardado(s) correctamente.`);
    } catch (error) {
      console.error('Error saving package days:', error);
      setSearchError('No se pudieron guardar todos los días seleccionados. Intenta nuevamente.');
    } finally {
      setIsAddingPackageDay(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!foundAppointment) return;
    const service = SERVICES_DATA.find((s) => s.id === foundAppointment.serviceId);
    generateIcsCalendar(
      foundAppointment,
      foundAppointment.selectedPackageName || service?.title || 'Cita Terapéutica',
      CLINIC_INFO.address.fullAddress,
      CLINIC_INFO.phoneDisplay
    );
  };

  const handleConfirmReschedule = async () => {
    if (!foundAppointment || !rescheduleDate || !rescheduleTime) return;
    setIsProcessingReschedule(true);
    setRescheduleSuccessMessage(null);

    try {
      const res = await rescheduleAppointmentInDatabase(
        foundAppointment.id,
        rescheduleDate,
        rescheduleTime
      );
      if (res.success && res.updatedAppointment) {
        const updated = res.updatedAppointment;
        setFoundAppointment(updated);
        // Also update in list if present
        setAppointmentsList((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setRescheduleSuccessMessage(
          `¡Cita reprogramada exitosamente para el ${rescheduleDate} a las ${rescheduleTime}!`
        );
        setIsRescheduling(false);
      } else {
        setSearchError(res.error || 'Error al reprogramar la cita.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Error al reprogramar la cita. Por favor intenta de nuevo.');
    } finally {
      setIsProcessingReschedule(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!foundAppointment) return;
    setIsProcessingCancel(true);

    try {
      const result = await cancelAppointmentInDatabase(
        foundAppointment.id,
        cancellationReason || 'Cancelación solicitada por el paciente vía Portal'
      );
      if (result.success && result.updatedAppointment) {
        const updated = result.updatedAppointment;
        setFoundAppointment(updated);
        setAppointmentsList((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setCancellationResult({
          success: true,
          penaltyFee: result.penaltyAmount,
          message: result.isSecondOrMore
            ? 'Cita cancelada con recargo administrativo del 20% aplicado.'
            : 'Cita cancelada exitosamente (1ra cancelación 100% gratuita).',
          isSecondOrMore: result.isSecondOrMore,
        });
        setIsCanceling(false);
      } else {
        setSearchError(result.error || 'No se pudo cancelar la cita.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Error al procesar la cancelación.');
    } finally {
      setIsProcessingCancel(false);
    }
  };

  const service = foundAppointment
    ? SERVICES_DATA.find((s) => s.id === foundAppointment.serviceId)
    : null;

  const pastCancellations = foundAppointment
    ? getPatientCancellationCount(foundAppointment.email || foundAppointment.telefono)
    : 0;
  const packageAppointments = foundAppointment
    ? appointmentsList.filter(
        (appointment) => getPackageAccessCode(appointment) === getPackageAccessCode(foundAppointment)
      )
    : [];
  const packageTotalSessions = foundAppointment ? getPackageTotalSessions(foundAppointment) : 1;
  const isPackageAppointment = Boolean(foundAppointment && getPackageTotalSessions(foundAppointment) > 1);
  const packageUsedSessions = packageAppointments.filter(
    (appointment) => appointment.status !== 'cancelada' && appointment.status !== 'CANCELADA'
  ).length;
  const packageRemainingSessions = Math.max(packageTotalSessions - packageUsedSessions, 0);

  return (
    <AnimatePresence>
      <div
        id="patient-portal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[calc(100vh-1.5rem)] flex flex-col bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-3"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Search className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold font-heading">
                    Portal de Gestión de Citas
                  </h2>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Acceso Seguro
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Introduce el código que recibiste al agendar tu paquete
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 min-h-0 overscroll-contain">
            {/* Search Box */}
            <form
              onSubmit={handleSearch}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Código de acceso del paquete *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej. EQ-8K3N-7P2W"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  El código es tu acceso para consultar y elegir los días pendientes.
                </p>
              </div>
              {false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Código de Cita *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. EQ-8K3N-7P2W"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Correo / Teléfono (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Opcional para mayor seguridad"
                      value={searchValidatorOptional}
                      onChange={(e) => setSearchValidatorOptional(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Búsqueda cifrada y protegida para tu privacidad médica</span>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSearching ? (
                    <span>Buscando...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Entrar al paquete</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Helper for recent appointments on this device */}
            {!foundAppointment && appointmentsList.length === 0 && recentAppointments.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Citas recientes guardadas en este dispositivo:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentAppointments.slice(0, 3).map((app) => (
                    <button
                      key={app.id || app.code}
                      type="button"
                      onClick={() => {
                        setSearchCode(app.code);
                        setSearchTab('code');
                        void performSearch(app.code);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/50 hover:bg-amber-50 dark:hover:bg-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-all shadow-sm group"
                    >
                      <span className="text-amber-600 dark:text-amber-400">{app.code}</span>
                      <span className="text-[11px] font-sans font-normal text-slate-500 dark:text-slate-400">
                        ({app.fecha})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">No se encontraron resultados</p>
                  <p className="text-slate-600 dark:text-slate-300">{searchError}</p>
                  {suggestedCode && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchCode(suggestedCode);
                          setSearchTab('code');
                          void performSearch(suggestedCode);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        <span>¿Intentar con tu último código agendado ({suggestedCode})?</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Reschedule Alert */}
            {rescheduleSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="font-semibold">{rescheduleSuccessMessage}</p>
              </div>
            )}

            {/* Cancellation Result Banner */}
            {cancellationResult && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                  cancellationResult.penaltyFee && cancellationResult.penaltyFee > 0
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-800 dark:text-slate-200'
                }`}
              >
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{cancellationResult.message}</p>
                  {cancellationResult.penaltyFee ? (
                    <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                      <strong>Recargo del 20% aplicado:</strong> {cancellationResult.penaltyFee.toFixed(2)}€ por política de 2da cancelación de cupo reservado.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                      Esta cancelación fue sin penalización (1ra cancelación 100% gratuita).
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Multiple Appointments List (When searched by Email/Phone) */}
            {appointmentsList.length > 0 && !foundAppointment && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-amber-500" />
                    <span>Citas Encontradas ({appointmentsList.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">Selecciona una para gestionarla</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {appointmentsList.map((app) => {
                    const sItem = SERVICES_DATA.find((s) => s.id === app.serviceId);
                    return (
                      <button
                        key={app.id || app.code}
                        onClick={() => handleSelectAppointmentFromList(app)}
                        className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                              {app.code}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                app.status === 'confirmada'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : app.status === 'cancelada'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {app.status || 'Confirmada'}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {app.selectedPackageName || sItem?.title || app.serviceId}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {app.fecha}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {app.hora}
                            </span>
                            {app.specialistName && (
                              <span className="hidden sm:inline text-slate-400">
                                · Dr(a). {app.specialistName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Found Appointment Card (Single or Selected) */}
            {foundAppointment && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-50 to-amber-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/10 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-lg space-y-5"
              >
                {/* Return button if user came from multiple results list */}
                {appointmentsList.length > 1 && (
                  <button
                    onClick={() => setFoundAppointment(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Ver todas mis citas ({appointmentsList.length})</span>
                  </button>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                      Pase Oficial de Atención Clínica · {getPackageAccessCode(foundAppointment)}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                      {foundAppointment.selectedPackageName || service?.title || foundAppointment.serviceId}
                    </h3>
                    {isPackageAppointment && (
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                        Sesión {foundAppointment.packageSessionNumber || 1}/{packageTotalSessions}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        foundAppointment.status === 'confirmada'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          : foundAppointment.status === 'cancelada'
                          ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-300'
                          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {foundAppointment.status === 'confirmada'
                        ? 'Cita Confirmada'
                        : foundAppointment.status === 'cancelada'
                        ? 'Cita Cancelada'
                        : 'En Proceso'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <User className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Paciente:</strong> {foundAppointment.nombre} {foundAppointment.apellido}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Fecha:</strong> {foundAppointment.fecha}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Horario:</strong> {foundAppointment.hora}
                      </span>
                    </div>

                    {foundAppointment.specialistName && (
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <User className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Especialista:</strong> {foundAppointment.specialistName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Package className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Paquete/Tarifa:</strong> {foundAppointment.selectedPackageName || 'Sesión'} ({foundAppointment.selectedPackagePrice || foundAppointment.servicePrice || '35€'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Teléfono:</strong> {maskSensitiveData('phone', foundAppointment.telefono)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Correo:</strong> {maskSensitiveData('email', foundAppointment.email)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Sede:</strong> Sabana Grande, Caracas
                      </span>
                    </div>
                  </div>
                </div>

                {isPackageAppointment && (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-3">
                        <p className="text-2xl font-black text-emerald-300">{packageUsedSessions}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-300">Días elegidos</p>
                      </div>
                      <div className="rounded-xl bg-amber-500/15 border border-amber-400/30 p-3">
                        <p className="text-2xl font-black text-amber-300">{packageRemainingSessions}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-300">Días disponibles</p>
                      </div>
                    </div>

                    {packageRemainingSessions > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Elige uno o varios días
                        </h4>
                        <BookingCalendar
                          selectedDate={packageDate}
                          selectedTime={packageTime}
                          onSelectDate={setPackageDate}
                          onSelectTime={setPackageTime}
                          serviceId={foundAppointment.serviceId}
                        />
                        <button
                          type="button"
                          onClick={() => void handleAddPackageDay()}
                          disabled={isAddingPackageDay || !packageDate || !packageTime || selectedPackageDays.length >= packageRemainingSessions}
                          className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          Añadir día a la selección
                        </button>
                        {selectedPackageDays.length > 0 && (
                          <div className="space-y-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
                            <p className="text-xs font-bold text-amber-200">Días seleccionados: {selectedPackageDays.length}</p>
                            {selectedPackageDays.map((day, index) => (
                              <div key={`${day.date}-${day.time}`} className="flex items-center justify-between gap-2 text-xs text-slate-200">
                                <span>{index + 1}. {day.date} · {day.time}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPackageDays((previous) => previous.filter((_, dayIndex) => dayIndex !== index))}
                                  className="text-red-300 hover:text-red-200 font-bold"
                                >
                                  Quitar
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => void handleConfirmPackageDays()}
                              disabled={isAddingPackageDay}
                              className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isAddingPackageDay ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              {isAddingPackageDay ? 'Guardando días...' : `Confirmar ${selectedPackageDays.length} día(s)`}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-sm font-semibold text-emerald-300">
                        Ya elegiste todos los días de tu paquete.
                      </p>
                    )}
                  </div>
                )}

                {/* Policy Notice Box */}
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200">
                  📌 <strong>Política de Cancelación:</strong> La 1ra cancelación es 100% gratuita. A partir de la 2da cancelación, se aplicará un recargo del 20% del valor del servicio.
                </div>

                {/* Reschedule Subsection */}
                {isRescheduling && foundAppointment.status !== 'cancelada' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 space-y-3"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-amber-600" />
                      <span>Elige Nueva Fecha y Horario para Reprogramar:</span>
                    </h4>

                    <BookingCalendar
                      selectedDate={rescheduleDate}
                      selectedTime={rescheduleTime}
                      onSelectDate={(d) => setRescheduleDate(d)}
                      onSelectTime={(t) => setRescheduleTime(t)}
                      serviceId={foundAppointment.serviceId}
                    />

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
                      >
                        Cancelar Reprogramación
                      </button>

                      <button
                        type="button"
                        disabled={isProcessingReschedule || !rescheduleTime}
                        onClick={handleConfirmReschedule}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                      >
                        {isProcessingReschedule ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Guardar Nuevo Horario</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Cancellation Subsection */}
                {isCanceling && foundAppointment.status !== 'cancelada' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 space-y-3"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-red-200 flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-600" />
                      <span>Confirmación de Cancelación de Cita:</span>
                    </h4>

                    <div className="text-xs text-red-800 dark:text-red-300 space-y-1">
                      <p>
                        ¿Estás seguro de que deseas cancelar la cita <strong>{foundAppointment.code}</strong> programada para el {foundAppointment.fecha}?
                      </p>
                      {pastCancellations >= 1 ? (
                        <p className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 p-2 rounded-lg border border-amber-300">
                          ⚠️ Aviso: Ya cuentas con cancelaciones previas registradas. Por política de reservación, esta 2da cancelación generará un recargo administrativo del 20% del servicio ({((parseFloat(foundAppointment.selectedPackagePrice?.replace(/[^\d.]/g, '') || '35') * 0.20)).toFixed(2)}€).
                        </p>
                      ) : (
                        <p className="text-emerald-700 dark:text-emerald-400">
                          ✓ Esta es tu 1ra cancelación y es 100% gratuita.
                        </p>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Motivo de la cancelación (opcional)..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCanceling(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
                      >
                        No cancelar
                      </button>

                      <button
                        type="button"
                        disabled={isProcessingCancel}
                        onClick={handleConfirmCancellation}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                      >
                        {isProcessingCancel ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Ban className="w-3.5 h-3.5" />
                        )}
                        <span>Confirmar Cancelación</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleDownloadIcs}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Calendario (.ICS)</span>
                    </button>

                    <a
                      href={`https://wa.me/584126388484?text=${encodeURIComponent(
                        `Hola EQUILIBRA, consulto sobre mi cita médica con código ${foundAppointment.code} (${foundAppointment.fecha} - ${foundAppointment.hora}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {foundAppointment.status !== 'cancelada' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRescheduling(!isRescheduling);
                          setIsCanceling(false);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Reprogramar Cita</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCanceling(!isCanceling);
                          setIsRescheduling(false);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancelar Cita</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Protección activa contra accesos no autorizados
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
