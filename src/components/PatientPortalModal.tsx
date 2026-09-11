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
  ExternalLink,
  Activity,
  HeartPulse,
  Dumbbell,
  FileCheck,
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
  updateAppointmentClinicalEvolution,
} from '../utils/bookingUtils';
import {
  generateGoogleCalendarUrl,
  downloadAppointmentVoucherPdf,
  generateWhatsAppReminderMessage,
} from '../utils/calendarExportUtils';
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

  // Clinical Evolution & Pain Scale (EVA 1-10) State
  const [patientPainScore, setPatientPainScore] = useState<number | null>(null);
  const [painSavedFeedback, setPainSavedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (foundAppointment && foundAppointment.painScore !== undefined) {
      setPatientPainScore(foundAppointment.painScore);
    } else {
      setPatientPainScore(null);
    }
  }, [foundAppointment]);

  const handleUpdatePainScore = async (score: number) => {
    if (!foundAppointment) return;
    setPatientPainScore(score);
    const codeOrId = foundAppointment.code || foundAppointment.id;
    const res = await updateAppointmentClinicalEvolution(codeOrId, score);
    if (res.success && res.updatedAppointment) {
      setFoundAppointment(res.updatedAppointment);
      setPainSavedFeedback(`Nivel de dolor registrado: ${score}/10. Tu fisioterapeuta podrá ver tu evolución.`);
      setTimeout(() => setPainSavedFeedback(null), 4000);
    }
  };

  const handleDownloadVoucher = () => {
    if (foundAppointment) {
      downloadAppointmentVoucherPdf(foundAppointment);
    }
  };

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

  const handleTogglePackageSlot = (slot: { date: string; time: string }) => {
    if (!foundAppointment) return;
    const currentCode = getPackageAccessCode(foundAppointment);
    const existingConfirmed = appointmentsList.filter(
      (app) =>
        getPackageAccessCode(app) === currentCode &&
        app.status !== 'cancelada' &&
        app.status !== 'CANCELADA' &&
        app.fecha &&
        !app.fecha.toLowerCase().includes('por programar')
    );

    // Check if slot already exists in confirmed appointments
    const isAlreadyConfirmed = existingConfirmed.some(
      (app) => app.fecha === slot.date && app.hora === slot.time
    );
    if (isAlreadyConfirmed) {
      setSearchError(`El día ${slot.date} a las ${slot.time} ya está confirmado en tu horario.`);
      return;
    }

    // Check if slot is in selectedPackageDays
    const existingIndex = selectedPackageDays.findIndex(
      (d) => d.date === slot.date && d.time === slot.time
    );

    if (existingIndex >= 0) {
      // Toggle off
      setSelectedPackageDays((prev) => prev.filter((_, i) => i !== existingIndex));
      setSearchError(null);
      setRescheduleSuccessMessage(`Has quitado el día ${slot.date} (${slot.time}) de tu horario.`);
    } else {
      // Check 10 limit
      const currentTotal = existingConfirmed.length + selectedPackageDays.length;
      if (currentTotal >= 10) {
        setSearchError('Has alcanzado el límite máximo de 10 días para este paquete.');
        return;
      }
      setSelectedPackageDays((prev) => [...prev, { date: slot.date, time: slot.time }]);
      setSearchError(null);
      setRescheduleSuccessMessage(`Día añadido a tu horario (${currentTotal + 1} de 10). Puedes seleccionar más días o confirmar.`);
    }
  };

  const handleAddPackageDay = async () => {
    if (!foundAppointment || !packageDate || !packageTime) return;
    handleTogglePackageSlot({ date: packageDate, time: packageTime });
  };

  const handleConfirmPackageDays = async () => {
    if (!foundAppointment || selectedPackageDays.length === 0) return;
    setIsAddingPackageDay(true);
    setSearchError(null);
    try {
      const currentCode = getPackageAccessCode(foundAppointment);
      const existingConfirmed = appointmentsList.filter(
        (app) =>
          getPackageAccessCode(app) === currentCode &&
          app.status !== 'cancelada' &&
          app.status !== 'CANCELADA' &&
          app.fecha &&
          !app.fecha.toLowerCase().includes('por programar')
      );

      const placeholderRecord = appointmentsList.find(
        (app) =>
          getPackageAccessCode(app) === currentCode &&
          (!app.fecha || app.fecha.toLowerCase().includes('por programar') || app.fecha.toLowerCase().includes('por definir'))
      );

      const newAppointments: ConfirmedAppointment[] = [];
      let updatedPlaceholder = false;

      for (let index = 0; index < selectedPackageDays.length; index++) {
        const day = selectedPackageDays[index];

        if (!updatedPlaceholder && placeholderRecord) {
          const updated: ConfirmedAppointment = {
            ...placeholderRecord,
            fecha: day.date,
            hora: day.time,
            code: currentCode, // STRICTLY ONE CODE
            packageCode: currentCode,
            packageTotalSessions: 10,
            packageSessionNumber: 1,
            status: 'confirmada',
          };
          await saveAppointmentToDatabase(updated);
          newAppointments.push(updated);
          updatedPlaceholder = true;
        } else {
          const sessionNumber = existingConfirmed.length + (updatedPlaceholder ? index : index + 1);
          const newAppointment: ConfirmedAppointment = {
            ...foundAppointment,
            id: `app_${Date.now()}_${sessionNumber}_${Math.random().toString(36).slice(2, 8)}`,
            fecha: day.date,
            hora: day.time,
            code: currentCode, // STRICTLY ONE SINGLE CODE FOR ALL SESSIONS
            packageCode: currentCode,
            packageTotalSessions: 10,
            packageSessionNumber: sessionNumber,
            createdAt: new Date().toISOString(),
            status: 'confirmada',
          };
          await saveAppointmentToDatabase(newAppointment);
          newAppointments.push(newAppointment);
        }
      }

      setAppointmentsList((previous) => {
        const withoutPlaceholder = placeholderRecord && updatedPlaceholder
          ? previous.filter((app) => app.id !== placeholderRecord.id)
          : previous;
        return [...withoutPlaceholder, ...newAppointments];
      });

      if (newAppointments.length > 0) {
        setFoundAppointment(newAppointments[0]);
      }
      setSelectedPackageDays([]);
      setRescheduleSuccessMessage(
        `¡Horario guardado con éxito! Se han registrado ${newAppointments.length} día(s) con tu código único ${currentCode}.`
      );
    } catch (error) {
      console.error('Error saving package days:', error);
      setSearchError('No se pudieron guardar los días seleccionados. Intenta nuevamente.');
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
  const isSessionScheduled = (appointment: ConfirmedAppointment): boolean => {
    const f = String(appointment.fecha || '').toLowerCase();
    return Boolean(f && !f.includes('por programar') && !f.includes('por definir'));
  };

  const isPackageAppointment = Boolean(foundAppointment && getPackageTotalSessions(foundAppointment) > 1);
  const packageCode = foundAppointment ? getPackageAccessCode(foundAppointment) : '';
  const packageLimit = 10;

  const packageAppointments = foundAppointment
    ? appointmentsList.filter(
        (appointment) =>
          getPackageAccessCode(appointment) === packageCode &&
          appointment.status !== 'cancelada' &&
          appointment.status !== 'CANCELADA'
      )
    : [];

  const confirmedScheduledSessions = packageAppointments.filter(isSessionScheduled);
  const alreadySavedDaysCount = confirmedScheduledSessions.length;
  const newlySelectedDaysCount = selectedPackageDays.length;
  const totalDaysChosen = alreadySavedDaysCount + newlySelectedDaysCount;
  const daysRemainingToChoose = Math.max(0, packageLimit - totalDaysChosen);
  const packageTotalSessions = isPackageAppointment ? packageLimit : 1;
  const packageUsedSessions = totalDaysChosen;
  const packageRemainingSessions = daysRemainingToChoose;

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
                  <div className="space-y-5 p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-700 shadow-xl">
                    {/* Header with single package code reminder */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-amber-400" />
                          <h4 className="text-base font-extrabold text-white font-heading">
                            Gestión de Paquete (Límite 10 Sesiones)
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Un solo código para todas tus sesiones: <strong className="font-mono text-amber-400">{packageCode}</strong>
                        </p>
                      </div>

                      <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {totalDaysChosen === packageLimit ? 'Paquete Completo' : 'Multiselección Activa'}
                      </span>
                    </div>

                    {/* Counter of Days Chosen vs Remaining */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 p-3 sm:p-4 shadow-inner">
                          <p className="text-2xl sm:text-3xl font-black text-emerald-300">
                            {totalDaysChosen} <span className="text-sm font-semibold text-emerald-400/80">/ {packageLimit}</span>
                          </p>
                          <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-200 mt-0.5">
                            Días Elegidos
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            ({alreadySavedDaysCount} guardados + {newlySelectedDaysCount} seleccionados)
                          </span>
                        </div>

                        <div className="rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 p-3 sm:p-4 shadow-inner">
                          <p className="text-2xl sm:text-3xl font-black text-amber-300">
                            {daysRemainingToChoose}
                          </p>
                          <p className="text-[11px] uppercase tracking-wider font-bold text-amber-200 mt-0.5">
                            Días que te quedan por elegir
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {daysRemainingToChoose === 0 ? '¡Límite alcanzado!' : `Cupos disponibles: ${daysRemainingToChoose}`}
                          </span>
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (totalDaysChosen / packageLimit) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Calendar for Multi-selection & Real-Time Schedule Visualization */}
                    <div className="space-y-3">
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                            <CalendarCheck className="w-4 h-4 text-amber-400" />
                            <span>Multiselección de días en el calendario</span>
                          </h5>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {daysRemainingToChoose > 0
                              ? `Haz clic directamente en los horarios disponibles para seleccionar varios días a la vez (puedes elegir hasta ${daysRemainingToChoose} día(s) más). Los días se resaltarán automáticamente en el calendario.`
                              : 'Has alcanzado los 10 días de tu paquete. Todos tus días aparecen resaltados en verde en el calendario. Puedes hacer clic en un día para deseleccionarlo y cambiarlo.'}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-black text-amber-300 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 shrink-0 self-start sm:self-auto">
                          {totalDaysChosen} de {packageLimit} días
                        </span>
                      </div>

                      {daysRemainingToChoose === 0 && (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div className="text-xs">
                            <p className="font-bold text-emerald-200">
                              ¡Límite máximo de 10 días completado!
                            </p>
                            <p className="text-emerald-300/80 text-[11px]">
                              Tus 10 sesiones se encuentran resaltadas en verde en el calendario inferior bajo tu código único {packageCode}.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-950 p-2 sm:p-4 rounded-2xl border border-slate-800">
                        <BookingCalendar
                          selectedDate={packageDate}
                          selectedTime={packageTime}
                          onSelectDate={setPackageDate}
                          onSelectTime={setPackageTime}
                          serviceId={foundAppointment.serviceId}
                          multiSelectedDays={selectedPackageDays}
                          packageSavedDays={confirmedScheduledSessions.map((s, idx) => ({
                            date: s.fecha,
                            time: s.hora,
                            sessionNumber: s.packageSessionNumber || idx + 1,
                          }))}
                          packageTotalLimit={packageLimit}
                          packageChosenCount={totalDaysChosen}
                          packageCode={packageCode}
                          onToggleSlotMultiSelect={handleTogglePackageSlot}
                          isMultiSelectMode={true}
                          appointments={appointmentsList}
                        />
                      </div>

                      {/* Fallback button if user selected via dropdown */}
                      {daysRemainingToChoose > 0 && (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleAddPackageDay()}
                            disabled={isAddingPackageDay || !packageDate || !packageTime || totalDaysChosen >= packageLimit}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
                          >
                            <CalendarCheck className="w-4 h-4 text-amber-400" />
                            <span>Añadir fecha/hora seleccionada ({packageDate} {packageTime || ''})</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Timetable / Horario Completo del Paquete */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Tu Horario de Sesiones ({totalDaysChosen} de {packageLimit})</span>
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Código: {packageCode}
                        </span>
                      </div>

                      {totalDaysChosen === 0 ? (
                        <div className="p-4 rounded-2xl bg-slate-800/60 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                          Aún no has elegido días en tu horario. Selecciona tus días arriba en el calendario (hasta 10 sesiones).
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {/* 1. Confirmed / Saved appointments */}
                          {confirmedScheduledSessions.map((session, idx) => (
                            <div
                              key={session.id || `${session.fecha}-${session.hora}`}
                              className="p-3 rounded-2xl bg-slate-800/90 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="font-bold text-white flex items-center gap-2">
                                    <span>{session.fecha}</span>
                                    <span className="text-amber-400">· {session.hora}</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    {session.specialistName ? `Dr(a). ${session.specialistName}` : 'Especialista asignado'}
                                  </p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Confirmada</span>
                              </span>
                            </div>
                          ))}

                          {/* 2. Newly multi-selected days (pending confirmation) */}
                          {selectedPackageDays.map((day, idx) => (
                            <div
                              key={`pending-${day.date}-${day.time}`}
                              className="p-3 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-200 font-bold flex items-center justify-center text-[11px] shrink-0">
                                  {alreadySavedDaysCount + idx + 1}
                                </span>
                                <div>
                                  <p className="font-bold text-amber-200 flex items-center gap-2">
                                    <span>{day.date}</span>
                                    <span className="text-white">· {day.time}</span>
                                  </p>
                                  <p className="text-[10px] text-amber-300/70">
                                    ★ En tu selección (Por guardar en tu horario)
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePackageSlot(day)}
                                className="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/40 font-bold text-[11px] shrink-0 transition-colors"
                              >
                                Quitar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Confirmation CTA button when multi-selected days exist */}
                      {selectedPackageDays.length > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => void handleConfirmPackageDays()}
                            disabled={isAddingPackageDay}
                            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50"
                          >
                            {isAddingPackageDay ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Guardando horario del paquete...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Confirmar y Guardar {selectedPackageDays.length} Día(s) en tu Horario</span>
                              </>
                            )}
                          </button>
                          <p className="text-[11px] text-slate-400 text-center mt-2">
                            Se guardarán bajo tu único código de paquete <strong className="text-amber-300 font-mono">{packageCode}</strong> (sin generar códigos adicionales).
                          </p>
                        </div>
                      )}
                    </div>
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

                {/* Clinical Evolution & Pain Scale (EVA) Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Seguimiento Clínico y Escala de Dolor (EVA 0 - 10)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Registra cómo te sientes hoy para que tu fisioterapeuta monitoree tu progreso
                        </p>
                      </div>
                    </div>
                    {patientPainScore !== null && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        patientPainScore === 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : patientPainScore <= 3
                          ? 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300'
                          : patientPainScore <= 6
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        EVA actual: {patientPainScore} / 10
                      </span>
                    )}
                  </div>

                  {/* EVA Interactive Scale 0 to 10 */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">0 = Sin dolor</span>
                      <span className="text-amber-500 font-bold">5 = Moderado</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">10 = Severo</span>
                    </div>
                    <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = patientPainScore === num;
                        let colorClass = 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                        if (isSelected) {
                          if (num === 0) colorClass = 'bg-emerald-600 text-white font-black border-emerald-600 ring-2 ring-emerald-400 shadow-sm';
                          else if (num <= 3) colorClass = 'bg-lime-600 text-white font-black border-lime-600 ring-2 ring-lime-400 shadow-sm';
                          else if (num <= 6) colorClass = 'bg-amber-500 text-slate-950 font-black border-amber-500 ring-2 ring-amber-400 shadow-sm';
                          else colorClass = 'bg-rose-600 text-white font-black border-rose-600 ring-2 ring-rose-400 shadow-sm';
                        }
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleUpdatePainScore(num)}
                            className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${colorClass}`}
                            title={`Seleccionar nivel ${num}`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {painSavedFeedback && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{painSavedFeedback}</span>
                    </div>
                  )}

                  {/* Home Recovery Guidelines */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Recomendaciones Fisioterapéuticas Domiciliarias:</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                      <li>Aplica crioterapia local (hielo envuelto en paño) por 15 min si hay inflamación activa tras tu sesión.</li>
                      <li>Mantén pausas activas y realiza los estiramientos lumbares o cervicales indicados por tu fisioterapeuta.</li>
                      <li>Registra tu nivel de dolor (EVA) antes de cada cita para calibrar la intensidad de tu terapia manual o tecarterapia.</li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadVoucher}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Comprobante PDF</span>
                    </button>

                    <a
                      href={generateGoogleCalendarUrl(foundAppointment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Calendar</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleDownloadIcs}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-500" />
                      <span>(.ICS)</span>
                    </button>

                    <a
                      href={`https://wa.me/584126388484?text=${encodeURIComponent(
                        generateWhatsAppReminderMessage(foundAppointment)
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
