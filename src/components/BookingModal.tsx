import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Check,
  Building2,
  CalendarCheck,
  ShieldCheck,
  Lock,
  RefreshCw,
  Info,
  Package,
  Layers,
  Award,
  MessageSquare,
} from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';
import { CLINIC_INFO } from '../data/featuresData';
import { SPECIALISTS_ACCOUNTS, getAssignedSpecialistForService } from '../data/specialistsAuthData';
import { ConfirmedAppointment, ServicePricingTier } from '../types';
import { BookingCalendar } from './BookingCalendar';
import {
  saveAppointmentToDatabase,
  generateIcsCalendar,
  getSlotsForDate,
  getSavedAppointments,
} from '../utils/bookingUtils';
import { generateWhatsAppAlertUrl } from '../utils/notificationUtils';
import {
  validateAndSanitizeName,
  validateAndSanitizeEmail,
  validateAndSanitizePhone,
  sanitizeString,
  generateSecureCode,
  checkRateLimit,
  verifyHumanInteraction,
} from '../utils/security';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  onOpenPrivacyModal?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialServiceId,
  onOpenPrivacyModal,
}) => {
  const formRenderTimestampRef = useRef<number>(Date.now());

  const getTodayString = () => {
    const d = new Date();
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || 'fisioterapia'
  );
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('isaac-jewsiejew');
  const [selectedPackage, setSelectedPackage] = useState<ServicePricingTier>({
    name: 'Sesión de fisioterapia',
    description: 'Evaluación + tratamiento personalizado',
    price: '35€',
    highlight: true,
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedTime, setSelectedTime] = useState<string>('09:00 AM - 10:00 AM');

  // Form Fields
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [motivoConsulta, setMotivoConsulta] = useState<string>('');
  const [primeraVisita, setPrimeraVisita] = useState<boolean>(true);
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(true);
  const [botTrap, setBotTrap] = useState<string>('');

  const [bookingCode, setBookingCode] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdAppointment, setCreatedAppointment] = useState<ConfirmedAppointment | null>(null);

  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
  }, [initialServiceId]);

  const currentService = SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  // Update default package when service changes
  useEffect(() => {
    if (currentService.pricingTiers && currentService.pricingTiers.length > 0) {
      const defaultTier = currentService.pricingTiers.find((t) => t.highlight) || currentService.pricingTiers[0];
      setSelectedPackage(defaultTier);
    } else {
      setSelectedPackage({
        name: currentService.title,
        description: currentService.shortDescription,
        price: `${currentService.priceFormatted} USD`,
      });
    }

    // Automatically match specialist for selected service
    const assignedSpec = getAssignedSpecialistForService(selectedServiceId);
    if (assignedSpec) {
      setSelectedSpecialistId(assignedSpec.id);
    }
  }, [selectedServiceId, currentService]);

  useEffect(() => {
    if (isOpen) {
      formRenderTimestampRef.current = Date.now();
      setSecurityError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      const slots = getSlotsForDate(selectedDate, selectedServiceId, getSavedAppointments());
      const availableSlots = slots.filter((s) => s.status !== 'ocupado');
      if (availableSlots.length > 0) {
        const stillValid = availableSlots.some((s) => s.time === selectedTime);
        if (!stillValid) {
          setSelectedTime(availableSlots[0].time);
        }
      } else {
        setSelectedTime('');
      }
    }
  }, [selectedDate, selectedServiceId]);

  if (!isOpen) return null;

  const validateStep2 = () => {
    const errors: { [key: string]: string } = {};

    const nameVal = validateAndSanitizeName(nombre);
    if (!nameVal.isValid) errors.nombre = nameVal.errorMessage || 'Ingresa tu nombre.';

    const apeVal = validateAndSanitizeName(apellido);
    if (!apeVal.isValid) errors.apellido = apeVal.errorMessage || 'Ingresa tu apellido.';

    const phoneVal = validateAndSanitizePhone(telefono);
    if (!phoneVal.isValid) errors.telefono = phoneVal.errorMessage || 'Ingresa tu teléfono.';

    const emailVal = validateAndSanitizeEmail(email);
    if (!emailVal.isValid) errors.email = emailVal.errorMessage || 'Ingresa un correo electrónico válido.';

    if (!selectedDate) errors.fecha = 'Selecciona una fecha en el calendario.';
    if (!selectedTime) errors.hora = 'Selecciona un horario disponible.';
    if (!privacyConsent) errors.privacy = 'Debes aceptar los términos de confidencialidad médica.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    // Bot detection
    const humanCheck = verifyHumanInteraction(botTrap, formRenderTimestampRef.current);
    if (!humanCheck.isHuman) {
      setSecurityError(humanCheck.reason || 'Envío bloqueado por el escudo de seguridad.');
      return;
    }

    // Rate limiting
    const rateCheck = checkRateLimit('booking_modal', 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setSecurityError(rateCheck.message || 'Límite de envíos alcanzado temporalmente.');
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const secureCode = generateSecureCode();
      const chosenSpecialist = SPECIALISTS_ACCOUNTS.find((sp) => sp.id === selectedSpecialistId);

      const newAppointment: ConfirmedAppointment = {
        id: `app_${Date.now()}_${secureCode.replace(/[^a-zA-Z0-9]/g, '')}`,
        code: secureCode,
        serviceId: sanitizeString(selectedServiceId),
        servicePrice: selectedPackage.price || `${currentService.priceFormatted} USD`,
        selectedPackageName: sanitizeString(selectedPackage.name),
        selectedPackagePrice: sanitizeString(selectedPackage.price),
        selectedPackageDescription: selectedPackage.description ? sanitizeString(selectedPackage.description) : undefined,
        specialistId: chosenSpecialist ? chosenSpecialist.id : undefined,
        specialistName: chosenSpecialist ? chosenSpecialist.name : 'Lic. Isaac Jewsiejew',
        nombre: sanitizeString(nombre, 60),
        apellido: sanitizeString(apellido, 60),
        telefono: sanitizeString(telefono, 30),
        email: sanitizeString(email, 100).toLowerCase(),
        fecha: sanitizeString(selectedDate),
        hora: sanitizeString(selectedTime),
        motivoConsulta: sanitizeString(motivoConsulta, 600),
        primeraVisita,
        createdAt: new Date().toISOString(),
        status: 'confirmada',
      };

      await saveAppointmentToDatabase(newAppointment);
      setBookingCode(secureCode);
      setCreatedAppointment(newAppointment);
      setIsSubmitting(false);
      setStep(3);
    } catch (err) {
      console.error('Error saving appointment:', err);
      setIsSubmitting(false);
      setSecurityError('Error al procesar la cita. Por favor intenta nuevamente.');
    }
  };

  const handleReset = () => {
    formRenderTimestampRef.current = Date.now();
    setStep(1);
    setNombre('');
    setApellido('');
    setTelefono('');
    setEmail('');
    setMotivoConsulta('');
    setBotTrap('');
    setBookingCode('');
    setFormErrors({});
    setSecurityError(null);
    setCreatedAppointment(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#121824] rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 p-4 sm:p-6 pr-12 sm:pr-14 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-colors"
            aria-label="Cerrar ventana de reserva"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
              Paso {step} de 3
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-bold font-heading leading-tight">
            {step === 1 && 'Selecciona Servicio, Especialista y Paquete'}
            {step === 2 && 'Elige Fecha, Horario y Datos Clínicos'}
            {step === 3 && '¡Cita Confirmada con Éxito!'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 leading-snug">
            {step === 1 && 'Elige el plan terapéutico adaptado a tus necesidades clínicas.'}
            {step === 2 && 'Horarios en tiempo real y protección estricta de datos de salud.'}
            {step === 3 && 'Tu comprobante con código de acceso criptográfico ha sido generado.'}
          </p>

          {/* Cancellation Notice Pill */}
          <div className="mt-2.5 sm:mt-3 p-2 sm:p-2.5 rounded-xl bg-black/25 border border-white/20 flex items-start sm:items-center gap-2 text-[11px] sm:text-xs text-amber-100 leading-snug">
            <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Aviso de Cancelación:</strong> 1ra cancelación 100% gratuita. A partir de la 2da cancelación aplica recargo del 20% del servicio.
            </span>
          </div>
        </div>

        {/* Security / Error alert */}
        {securityError && (
          <div className="m-4 sm:m-5 p-3.5 sm:p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-3 shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p>{securityError}</p>
          </div>
        )}

        {/* Step 1: Service, Specialist & Package Selection */}
        {step === 1 && (
          <div className="p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-6 overflow-y-auto flex-1 overscroll-contain">
            {/* Service selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Especialidad o Servicio Clínico:
                </label>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  {SERVICES_DATA.length} Disponibles
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 max-h-52 sm:max-h-48 overflow-y-auto p-1 pr-1.5 scrollbar-thin">
                {SERVICES_DATA.map((srv) => {
                  const isSel = selectedServiceId === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedServiceId(srv.id)}
                      title={srv.title}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[66px] sm:min-h-[70px] ${
                        isSel
                          ? 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/40 font-bold ring-2 ring-amber-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50'
                      }`}
                    >
                      <span className="block text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {srv.title}
                      </span>
                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-800/60 text-[11px]">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          Desde {srv.priceFormatted} USD
                        </span>
                        {isSel && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialist Automatically Assigned Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Especialista Asignado (Automático):
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Asignado por especialidad
                </span>
              </div>
              {(() => {
                const assignedSpec = getAssignedSpecialistForService(selectedServiceId);
                return (
                  <div className="p-3 sm:p-3.5 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 dark:to-transparent flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={assignedSpec.avatarUrl}
                        alt={assignedSpec.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-amber-500/60 shadow-sm aspect-square"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                            {assignedSpec.name}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                            Especialista Oficial
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-300 block leading-tight mt-0.5">
                          {assignedSpec.role}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          {assignedSpec.specialty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline">Asignación Directa</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Packages / Pricing Tiers selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  3. Paquete o Modalidad de Atención:
                </label>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  Tarifas transparentes
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {(currentService.pricingTiers || [
                  { name: 'Sesión Estándar', price: `${currentService.priceFormatted} USD`, description: 'Tratamiento individual' }
                ]).map((tier, idx) => {
                  const isSel = selectedPackage.name === tier.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPackage(tier)}
                      className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full min-h-[105px] sm:min-h-[112px] ${
                        isSel
                          ? 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/40 ring-2 ring-amber-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/70 dark:bg-slate-900/50'
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1.5 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {tier.name}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
                            {tier.price}
                          </span>
                        </div>
                        {tier.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                            {tier.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {tier.highlight ? '★ Recomendado' : 'Disponible'}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSel ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
              >
                <span>Continuar a Calendario</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date, Time & Patient Information */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-6 overflow-y-auto flex-1 overscroll-contain">
            {/* Honeypot */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="modal_botTrap">Trap</label>
              <input
                type="text"
                id="modal_botTrap"
                tabIndex={-1}
                value={botTrap}
                onChange={(e) => setBotTrap(e.target.value)}
              />
            </div>

            {/* Selected Summary Pill */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block truncate">
                  {currentService.title} • {selectedPackage.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block truncate">
                  Especialista: {SPECIALISTS_ACCOUNTS.find((s) => s.id === selectedSpecialistId)?.name || 'Lic. Isaac Jewsiejew'}
                </span>
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-900 self-start sm:self-auto shrink-0 shadow-sm">
                {selectedPackage.price}
              </span>
            </div>

            {/* Calendar */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Selecciona Fecha y Horario:
              </label>
              <BookingCalendar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={(d) => setSelectedDate(d)}
                onSelectTime={(t) => setSelectedTime(t)}
                serviceId={selectedServiceId}
              />
              {formErrors.fecha && <p className="text-xs text-red-500 mt-1">{formErrors.fecha}</p>}
              {formErrors.hora && <p className="text-xs text-red-500 mt-1">{formErrors.hora}</p>}
            </div>

            {/* Patient Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm sm:text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
                {formErrors.nombre && <p className="text-[11px] text-red-500 mt-1">{formErrors.nombre}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej. Pérez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm sm:text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
                {formErrors.apellido && <p className="text-[11px] text-red-500 mt-1">{formErrors.apellido}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. +58 412 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm sm:text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
                {formErrors.telefono && <p className="text-[11px] text-red-500 mt-1">{formErrors.telefono}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej. paciente@correo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm sm:text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
                {formErrors.email && <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo de Consulta (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={motivoConsulta}
                  onChange={(e) => setMotivoConsulta(e.target.value)}
                  placeholder="Describe molestias, dolor o antecedentes médicos..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none transition-all"
                />
              </div>

              {/* Policy Consent */}
              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none leading-relaxed">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 shrink-0"
                  />
                  <span>
                    Acepto los términos de confidencialidad y la <strong>política de cancelación</strong> (1ra cancelación gratuita, a partir de la 2da aplica 20% de penalización).
                  </span>
                </label>
                {formErrors.privacy && <p className="text-[11px] text-red-500 mt-1">{formErrors.privacy}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-center transition-colors"
              >
                ← Volver a Paquetes
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !selectedTime}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando Cita...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar y Guardar Cita</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Confirmation Voucher */}
        {step === 3 && createdAppointment && (
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-center overflow-y-auto flex-1 overscroll-contain">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div>
              <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-emerald-600 block mb-1">
                Comprobante Clínico Verificado
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                ¡Tu Cita ha sido Agendada!
              </h3>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-amber-200/60 dark:border-amber-800">
                <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Código de Cita:</span>
                <span className="font-mono font-bold text-base sm:text-lg text-amber-950 dark:text-amber-200">{createdAppointment.code}</span>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block text-[11px]">Paciente:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{createdAppointment.nombre} {createdAppointment.apellido}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Especialista:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{createdAppointment.specialistName || 'Lic. Isaac Jewsiejew'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Fecha y Hora:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{createdAppointment.fecha} ({createdAppointment.hora})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Paquete / Precio:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{createdAppointment.selectedPackageName} ({createdAppointment.servicePrice})</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
              <a
                href={generateWhatsAppAlertUrl(createdAppointment)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Notificar al Especialista por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() =>
                  generateIcsCalendar(
                    createdAppointment,
                    createdAppointment.selectedPackageName || 'Consulta Fisioterapia',
                    CLINIC_INFO.address.fullAddress,
                    CLINIC_INFO.phoneDisplay
                  )
                }
                className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Descargar (.ICS)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
