import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  CalendarCheck,
  Copy,
  Check,
  RefreshCw,
  Info,
  MapPin,
  Lock,
  FileCheck,
  ShieldAlert,
  Package,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';
import { CLINIC_INFO } from '../data/featuresData';
import { SPECIALISTS_ACCOUNTS, getAssignedSpecialistForService } from '../data/specialistsAuthData';
import { ConfirmedAppointment, ServicePricingTier } from '../types';
import { BookingCalendar } from './BookingCalendar';
import {
  getSavedAppointments,
  saveAppointmentToDatabase,
  generateIcsCalendar,
  getSlotsForDate,
  getAppointmentsFromDatabase,
  subscribeToAppointments,
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
  recordSecurityEvent,
} from '../utils/security';

interface BookingSectionProps {
  preselectedServiceId?: string;
  onServiceSelect?: (serviceId: string) => void;
  onOpenPrivacyModal?: () => void;
  onOpenPatientPortal?: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  preselectedServiceId,
  onOpenPrivacyModal,
  onOpenPatientPortal,
}) => {
  const formRenderTimestampRef = useRef<number>(Date.now());

  const getTodayString = () => {
    const d = new Date();
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeStep, setActiveStep] = useState<'selection' | 'confirmed'>('selection');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || 'fisioterapia'
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

  // Invisible Honeypot Anti-Bot Field
  const [botTrap, setBotTrap] = useState<string>('');

  // Errors & Feedback
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [securityBlockMessage, setSecurityBlockMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [latestAppointment, setLatestAppointment] = useState<ConfirmedAppointment | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Saved appointments list for live slot collision checks
  const [savedAppointments, setSavedAppointments] = useState<ConfirmedAppointment[]>([]);

  useEffect(() => {
    let mounted = true;
    getAppointmentsFromDatabase().then((appointments) => {
      if (mounted) setSavedAppointments(appointments);
    });
    const unsubscribe = subscribeToAppointments((appointments) => {
      if (mounted) setSavedAppointments(appointments);
    });
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    setSavedAppointments(getSavedAppointments());
  }, []);

  const currentServiceObj =
    SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceId(preselectedServiceId);
    }
  }, [preselectedServiceId]);

  useEffect(() => {
    if (currentServiceObj.pricingTiers && currentServiceObj.pricingTiers.length > 0) {
      const defaultTier =
        currentServiceObj.pricingTiers.find((t) => t.highlight) || currentServiceObj.pricingTiers[0];
      setSelectedPackage(defaultTier);
    } else {
      setSelectedPackage({
        name: currentServiceObj.title,
        description: currentServiceObj.shortDescription,
        price: `${currentServiceObj.priceFormatted} USD`,
      });
    }

    // Automatically match specialist for selected service
    const assignedSpec = getAssignedSpecialistForService(selectedServiceId);
    if (assignedSpec) {
      setSelectedSpecialistId(assignedSpec.id);
    }
  }, [selectedServiceId, currentServiceObj]);

  useEffect(() => {
    if (selectedDate) {
      const slots = getSlotsForDate(selectedDate, selectedServiceId, savedAppointments);
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
  }, [selectedDate, selectedServiceId, savedAppointments]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    const nameValidation = validateAndSanitizeName(nombre);
    if (!nameValidation.isValid) {
      errors.nombre = nameValidation.errorMessage || 'Ingresa un nombre válido.';
    }

    const apellidoValidation = validateAndSanitizeName(apellido);
    if (!apellidoValidation.isValid) {
      errors.apellido = apellidoValidation.errorMessage || 'Ingresa un apellido válido.';
    }

    const phoneValidation = validateAndSanitizePhone(telefono);
    if (!phoneValidation.isValid) {
      errors.telefono = phoneValidation.errorMessage || 'Ingresa un número telefónico válido.';
    }

    const emailValidation = validateAndSanitizeEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errorMessage || 'Ingresa un correo electrónico válido.';
    }

    if (!selectedDate) {
      errors.fecha = 'Por favor selecciona un día en el calendario.';
    }

    if (!selectedTime) {
      errors.hora = 'Por favor selecciona un horario disponible.';
    }

    if (!privacyConsent) {
      errors.privacy = 'Debes aceptar los términos de confidencialidad y política de cancelación.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityBlockMessage(null);

    // 1. Anti-Bot Honeypot & Submission Timing Check
    const humanCheck = verifyHumanInteraction(botTrap, formRenderTimestampRef.current);
    if (!humanCheck.isHuman) {
      setSecurityBlockMessage(humanCheck.reason || 'Envío bloqueado por el escudo de seguridad.');
      return;
    }

    // 2. Rate-Limiting Check (Anti-DoS / Anti-Flooding)
    const rateCheck = checkRateLimit('booking_submission', 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setSecurityBlockMessage(rateCheck.message || 'Límite de solicitudes de cita alcanzado temporalmente.');
      return;
    }

    // 3. Form Sanitization & Validation
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedService = SERVICES_DATA.find((s) => s.id === selectedServiceId);
      const chosenSpecialist = SPECIALISTS_ACCOUNTS.find((s) => s.id === selectedSpecialistId);
      const secureCode = generateSecureCode();

      const newAppointment: ConfirmedAppointment = {
        id: `app_${Date.now()}_${secureCode.replace(/[^a-zA-Z0-9]/g, '')}`,
        code: secureCode,
        serviceId: sanitizeString(selectedServiceId),
        servicePrice: selectedPackage.price || (selectedService ? `${selectedService.priceFormatted} USD` : undefined),
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

      // Save to database & encrypted local state
      await saveAppointmentToDatabase(newAppointment);
      setLatestAppointment(newAppointment);
      setSavedAppointments(getSavedAppointments());
      setIsSubmitting(false);
      setActiveStep('confirmed');
    } catch (error) {
      console.error('Error booking appointment:', error);
      setIsSubmitting(false);
      setSecurityBlockMessage('Ocurrió un error inesperado al procesar la reserva. Por favor intenta de nuevo.');
    }
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResetForNewBooking = () => {
    formRenderTimestampRef.current = Date.now();
    setActiveStep('selection');
    setNombre('');
    setApellido('');
    setTelefono('');
    setEmail('');
    setMotivoConsulta('');
    setBotTrap('');
    setFormErrors({});
    setSecurityBlockMessage(null);
    setLatestAppointment(null);
  };

  const selectedServiceObj =
    SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  return (
    <section
      id="agendar-cita"
      className="py-20 lg:py-28 bg-[#f5f2eb] dark:bg-[#0b0e14] relative overflow-hidden transition-colors"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <CalendarCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Reserva Clínica Directa & Segura</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
            Agenda tu cita directamente aquí
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Selecciona tu especialidad médica, consulta los horarios en tiempo real y reserva tu espacio con protección de datos clínicos y confirmación inmediata.
          </p>

          {/* Security & Verification Fast Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cifrado SSL 256-bit & Privacidad Médica</span>
            </button>

            {onOpenPatientPortal && (
              <button
                type="button"
                onClick={onOpenPatientPortal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-all"
              >
                <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>¿Ya tienes una cita? Consultar o Validar</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Warning Message */}
        {securityBlockMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Advertencia del Escudo de Seguridad</p>
              <p className="mt-0.5">{securityBlockMessage}</p>
            </div>
          </div>
        )}

        {/* Main Booking Engine */}
        {activeStep === 'selection' ? (
          <form onSubmit={handleBookAppointment} className="space-y-8">
            {/* INVISIBLE HONEYPOT FIELD (BOT TRAP) */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="website_url_honeypot">Website (do not fill)</label>
              <input
                type="text"
                id="website_url_honeypot"
                name="website_url_honeypot"
                tabIndex={-1}
                autoComplete="off"
                value={botTrap}
                onChange={(e) => setBotTrap(e.target.value)}
              />
            </div>

            {/* Step 1: Service Selector */}
            <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                      Selecciona el Servicio o Especialidad
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Elige el área clínica o deportiva a la que deseas asistir
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 hidden sm:inline-block">
                  {SERVICES_DATA.length} Servicios disponibles
                </span>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SERVICES_DATA.map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      id={`service-select-${service.id}`}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[140px] sm:min-h-[150px] ${
                        isSelected
                          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/40 shadow-sm'
                          : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {service.category}
                          </span>
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                            {service.priceFormatted} USD
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2">
                          {service.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                          {service.shortDescription}
                        </p>
                        {service.packageOption && (
                          <span className="inline-block mt-1 text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                            {service.packageOption}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className={isSelected ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-500'}>
                          {isSelected ? `✓ ${service.priceFormatted} USD` : `${service.duration}`}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Specialist Automatically Assigned Subsection */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <span>Especialista Clínico Responsable (Asignado Automáticamente)</span>
                  </h4>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Vinculación directa
                  </span>
                </div>

                {(() => {
                  const assignedSpec = getAssignedSpecialistForService(selectedServiceId);
                  return (
                    <div className="p-4 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 dark:to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={assignedSpec.avatarUrl}
                          alt={assignedSpec.name}
                          className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-amber-500/60 shadow-md aspect-square"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                              {assignedSpec.name}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                              Especialista Titular
                            </span>
                          </div>
                          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium block leading-tight mt-1">
                            {assignedSpec.role}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                            {assignedSpec.specialty}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 self-stretch sm:self-auto justify-center">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span>Selección Automática</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Package / Pricing Tiers Subsection */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-500" />
                    <span>Selecciona el Paquete o Modalidad de Atención</span>
                  </h4>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                    Tarifas transparentes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(currentServiceObj.pricingTiers || [
                    { name: 'Sesión Estándar', price: `${currentServiceObj.priceFormatted} USD`, description: 'Evaluación y tratamiento' }
                  ]).map((tier, idx) => {
                    const isSel = selectedPackage.name === tier.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPackage(tier)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[110px] ${
                          isSel
                            ? 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/40 ring-2 ring-amber-500/30 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/70 dark:bg-slate-900/40'
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-baseline justify-between gap-1.5 mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                              {tier.name}
                            </span>
                            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
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
            </div>

            {/* Step 2: Interactive Calendar with Slot Statuses */}
            <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                      Selecciona el Día y la Hora
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Horarios verificados en tiempo real contra la agenda clínica
                    </p>
                  </div>
                </div>
              </div>

              <BookingCalendar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={(dateStr) => {
                  setSelectedDate(dateStr);
                  if (formErrors.fecha) {
                    const newErr = { ...formErrors };
                    delete newErr.fecha;
                    setFormErrors(newErr);
                  }
                }}
                onSelectTime={(timeStr) => {
                  setSelectedTime(timeStr);
                  if (formErrors.hora) {
                    const newErr = { ...formErrors };
                    delete newErr.hora;
                    setFormErrors(newErr);
                  }
                }}
                serviceId={selectedServiceId}
                appointments={savedAppointments}
              />

              {formErrors.fecha && (
                <p className="text-xs font-semibold text-rose-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.fecha}
                </p>
              )}
              {formErrors.hora && (
                <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.hora}
                </p>
              )}
            </div>

            {/* Step 3: Required Patient Data */}
            <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                      Datos del Paciente & Confidencialidad
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Información protegida bajo secreto profesional y protocolos de seguridad
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Cifrado Activo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="booking-nombre"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="booking-nombre"
                      value={nombre}
                      maxLength={60}
                      onChange={(e) => {
                        setNombre(e.target.value);
                        if (formErrors.nombre) {
                          const n = { ...formErrors };
                          delete n.nombre;
                          setFormErrors(n);
                        }
                      }}
                      placeholder="Ej. María"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        formErrors.nombre
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  {formErrors.nombre && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.nombre}
                    </p>
                  )}
                </div>

                {/* Apellido */}
                <div>
                  <label
                    htmlFor="booking-apellido"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Apellido <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="booking-apellido"
                      value={apellido}
                      maxLength={60}
                      onChange={(e) => {
                        setApellido(e.target.value);
                        if (formErrors.apellido) {
                          const n = { ...formErrors };
                          delete n.apellido;
                          setFormErrors(n);
                        }
                      }}
                      placeholder="Ej. Fernández"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        formErrors.apellido
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  {formErrors.apellido && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.apellido}
                    </p>
                  )}
                </div>

                {/* Número de Teléfono */}
                <div>
                  <label
                    htmlFor="booking-telefono"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Número de Teléfono <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      id="booking-telefono"
                      value={telefono}
                      maxLength={25}
                      onChange={(e) => {
                        setTelefono(e.target.value);
                        if (formErrors.telefono) {
                          const n = { ...formErrors };
                          delete n.telefono;
                          setFormErrors(n);
                        }
                      }}
                      placeholder="Ej. +58 412 1234567"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        formErrors.telefono
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  {formErrors.telefono && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.telefono}
                    </p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="booking-email"
                      value={email}
                      maxLength={100}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) {
                          const n = { ...formErrors };
                          delete n.email;
                          setFormErrors(n);
                        }
                      }}
                      placeholder="Ej. paciente@correo.com"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        formErrors.email
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Motivo de Consulta */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-motivo"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Motivo de consulta o síntomas clínicos (Opcional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      id="booking-motivo"
                      rows={3}
                      maxLength={600}
                      value={motivoConsulta}
                      onChange={(e) => setMotivoConsulta(e.target.value)}
                      placeholder="Describe brevemente tu molestia, lesión, antecedente médico o metas funcionales..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Primera Visita Toggle */}
                <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                        ¿Es tu primera vez en EQUILIBRA?
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {primeraVisita
                          ? 'Incluiremos una evaluación física y funcional inicial completa.'
                          : 'Continuaremos con tu plan y ficha clínica establecida.'}
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={primeraVisita}
                      onChange={(e) => setPrimeraVisita(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Medical Privacy & HIPAA Consent Checkbox */}
                <div className="sm:col-span-2 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={privacyConsent}
                      onChange={(e) => {
                        setPrivacyConsent(e.target.checked);
                        if (formErrors.privacy) {
                          const err = { ...formErrors };
                          delete err.privacy;
                          setFormErrors(err);
                        }
                      }}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <div>
                      <span>
                        Acepto el tratamiento seguro de mis datos de contacto y motivos de consulta con estricto apego al secreto profesional médico y la{' '}
                      </span>
                      <button
                        type="button"
                        onClick={onOpenPrivacyModal}
                        className="text-amber-700 dark:text-amber-400 underline font-bold hover:text-amber-800 inline"
                      >
                        Política de Privacidad y Seguridad Clínica
                      </button>
                      <span>.</span>
                    </div>
                  </label>
                  {formErrors.privacy && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.privacy}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submission Action Bar */}
            <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Reserva Segura con Validación Criptográfica</span>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                      {selectedPackage.price || `${selectedServiceObj.priceFormatted} USD`}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedServiceObj.title} • {selectedPackage.name} • {selectedDate} ({selectedTime || 'Selecciona hora'})
                  </p>
                </div>
              </div>

              <button
                type="submit"
                id="submit-booking-btn"
                disabled={isSubmitting || !selectedTime}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  !selectedTime
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cifrando y Confirmando Reserva...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar y Agendar Cita</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Success Voucher View */
          latestAppointment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto bg-white dark:bg-[#151c28] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
            >
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 sm:p-8 text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <span className="text-xs uppercase tracking-widest font-bold bg-white/20 px-3 py-1 rounded-full inline-block mb-2">
                  ¡Cita Registrada & Verificada!
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
                  Tu consulta ha sido confirmada
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-md mx-auto">
                  Tu pase de atención ha sido generado con código único de verificación.
                </p>
              </div>

              {/* Voucher Details Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Booking Code Card */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 block">
                      Código de reserva / comprobante:
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-950 dark:text-amber-200">
                      {latestAppointment.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(latestAppointment.code)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-700/60 transition-all flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-amber-600" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Appointment Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Paciente
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {latestAppointment.nombre} {latestAppointment.apellido}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{latestAppointment.telefono}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{latestAppointment.email}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Servicio Seleccionado
                    </span>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {selectedServiceObj.title}
                      </p>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {selectedServiceObj.priceFormatted} USD
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Duración: {selectedServiceObj.duration}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="inline-block text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        {latestAppointment.primeraVisita ? 'Primera Evaluación' : 'Sesión de Seguimiento'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Fecha y Horario
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      {latestAppointment.fecha}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-1 font-semibold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      {latestAppointment.hora}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Sede & Ubicación
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      Sabana Grande, Caracas
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Centro Profesional del Este, Piso 4, Ofic 46.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={generateWhatsAppAlertUrl(latestAppointment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Notificar al Especialista por WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      generateIcsCalendar(
                        latestAppointment,
                        selectedServiceObj.title,
                        CLINIC_INFO.address.fullAddress,
                        CLINIC_INFO.phoneDisplay
                      )
                    }
                    className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Descargar (.ICS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForNewBooking}
                    className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Agendar otra cita</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>
    </section>
  );
};
