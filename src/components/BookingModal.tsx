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
} from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';
import { CLINIC_INFO } from '../data/featuresData';
import { ConfirmedAppointment } from '../types';
import { BookingCalendar } from './BookingCalendar';
import {
  saveAppointmentToDatabase,
  generateIcsCalendar,
  getSlotsForDate,
  getSavedAppointments,
} from '../utils/bookingUtils';
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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedTime, setSelectedTime] = useState<string>('09:00 AM - 10:00 AM');

  // Fields
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

  const handleNext = async () => {
    setSecurityError(null);

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // 1. Anti-bot honeypot check
      const humanCheck = verifyHumanInteraction(botTrap, formRenderTimestampRef.current);
      if (!humanCheck.isHuman) {
        setSecurityError(humanCheck.reason || 'Acción bloqueada por el escudo de seguridad.');
        return;
      }

      // 2. Rate limit check
      const rateCheck = checkRateLimit('modal_booking', 4, 10 * 60 * 1000);
      if (!rateCheck.allowed) {
        setSecurityError(rateCheck.message || 'Límite de solicitudes alcanzado.');
        return;
      }

      if (validateStep2()) {
        setIsSubmitting(true);
        try {
          const secureCode = generateSecureCode();
          setBookingCode(secureCode);

          const newApp: ConfirmedAppointment = {
            id: `app_${Date.now()}_${secureCode.replace(/[^a-zA-Z0-9]/g, '')}`,
            code: secureCode,
            serviceId: sanitizeString(selectedServiceId),
            servicePrice: selectedServiceObj ? `${selectedServiceObj.priceFormatted} USD` : undefined,
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

          await saveAppointmentToDatabase(newApp);
          setCreatedAppointment(newApp);
          setIsSubmitting(false);
          setStep(3);
        } catch {
          setIsSubmitting(false);
          setSecurityError('Error al registrar la cita. Por favor intenta de nuevo.');
        }
      }
    }
  };

  const selectedServiceObj =
    SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative bg-white dark:bg-[#151c28] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Reserva Médica Protegida SSL 256-Bit</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading mt-0.5">
                {step === 3 ? '¡Cita Confirmada con Éxito!' : 'Agenda tu Consulta en EQUILIBRA'}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`flex-1 h-1.5 rounded-full ${
                  step >= 1 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
              <div
                className={`flex-1 h-1.5 rounded-full ${
                  step >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            </div>
          )}

          {securityError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{securityError}</span>
            </div>
          )}

          {/* Hidden Honeypot */}
          <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
            <input
              type="text"
              name="modal_bot_honeypot"
              tabIndex={-1}
              value={botTrap}
              onChange={(e) => setBotTrap(e.target.value)}
            />
          </div>

          {/* STEP 1: Choose Service */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  1. Selecciona el servicio o especialidad
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {SERVICES_DATA.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-3 rounded-2xl text-left border transition-all text-xs sm:text-sm font-semibold flex items-center justify-between ${
                        selectedServiceId === service.id
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-300 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{service.title}</span>
                        <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400">
                          {service.priceFormatted} USD • {service.duration}
                        </span>
                      </div>
                      {selectedServiceId === service.id && (
                        <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md transition-all"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Date, Time & Sanitized Patient Data */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <BookingCalendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelectDate={(d) => {
                    setSelectedDate(d);
                    const e = { ...formErrors };
                    delete e.fecha;
                    setFormErrors(e);
                  }}
                  onSelectTime={(t) => {
                    setSelectedTime(t);
                    const e = { ...formErrors };
                    delete e.hora;
                    setFormErrors(e);
                  }}
                  serviceId={selectedServiceId}
                  appointments={getSavedAppointments()}
                />
                {formErrors.fecha && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.fecha}
                  </p>
                )}
                {formErrors.hora && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.hora}
                  </p>
                )}
              </div>

              {/* Patient Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {formErrors.nombre && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {formErrors.apellido && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.apellido}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    maxLength={25}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+58 412 1234567"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {formErrors.telefono && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.telefono}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correo *
                  </label>
                  <input
                    type="email"
                    maxLength={100}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@correo.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.email}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Motivo de consulta (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={600}
                    value={motivoConsulta}
                    onChange={(e) => setMotivoConsulta(e.target.value)}
                    placeholder="Molestias, lesiones o metas..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={privacyConsent}
                      onChange={(e) => setPrivacyConsent(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>Acepto la confidencialidad y resguardo médico de mis datos.</span>
                  </label>
                  {formErrors.privacy && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.privacy}</p>
                  )}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold"
                >
                  ← Volver
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Cita</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmed Voucher */}
          {step === 3 && createdAppointment && (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  ¡Reserva Registrada Exitosamente!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Guarda tu código para cualquier gestión o consulta en recepción.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                <span className="text-xs text-amber-800 dark:text-amber-300 block font-semibold">
                  Código de Identificación:
                </span>
                <span className="text-2xl font-mono font-extrabold text-amber-950 dark:text-amber-200">
                  {createdAppointment.code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block">Servicio:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedServiceObj.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Fecha y Hora:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {createdAppointment.fecha} • {createdAppointment.hora}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() =>
                    generateIcsCalendar(
                      createdAppointment,
                      selectedServiceObj.title,
                      CLINIC_INFO.address.fullAddress,
                      CLINIC_INFO.phoneDisplay
                    )
                  }
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Descargar Calendario (.ICS)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-6 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
