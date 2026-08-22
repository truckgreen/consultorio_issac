import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';
import { CLINIC_INFO } from '../data/featuresData';
import { BookingFormData, ConfirmedAppointment } from '../types';
import { BookingCalendar } from './BookingCalendar';
import {
  saveAppointmentToStorage,
  generateIcsCalendar,
  getSlotsForDate,
} from '../utils/bookingUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialServiceId,
}) => {
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

  const [bookingCode, setBookingCode] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [createdAppointment, setCreatedAppointment] = useState<ConfirmedAppointment | null>(null);

  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
  }, [initialServiceId]);

  useEffect(() => {
    if (selectedDate) {
      const slots = getSlotsForDate(selectedDate, selectedServiceId);
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
    if (!nombre.trim()) errors.nombre = 'Ingresa tu nombre.';
    if (!apellido.trim()) errors.apellido = 'Ingresa tu apellido.';
    if (!telefono.trim()) errors.telefono = 'Ingresa tu teléfono de contacto.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!selectedDate) errors.fecha = 'Selecciona una fecha en el calendario.';
    if (!selectedTime) errors.hora = 'Selecciona un horario disponible.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        const randomCode = `EQ-${Math.floor(1000 + Math.random() * 9000)}`;
        setBookingCode(randomCode);
        const newApp: ConfirmedAppointment = {
          id: `app-${Date.now()}`,
          code: randomCode,
          serviceId: selectedServiceId,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim(),
          email: email.trim(),
          fecha: selectedDate,
          hora: selectedTime,
          motivoConsulta: motivoConsulta.trim(),
          primeraVisita,
          createdAt: new Date().toISOString(),
          status: 'confirmada',
        };
        saveAppointmentToStorage(newApp);
        setCreatedAppointment(newApp);
        setStep(3);
      }
    }
  };

  const selectedServiceObj =
    SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Content */}
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
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reserva tu Cita Médica</span>
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

          {/* STEP 1: Choose Service and Type */}
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
                      <span>{service.title}</span>
                      {selectedServiceId === service.id && (
                        <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  2. Tipo de Consulta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrimeraVisita(true)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      primeraVisita
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">Primera Evaluación</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Valoración clínica inicial
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrimeraVisita(false)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      !primeraVisita
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">Sesión de Seguimiento</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Continuación de tratamiento
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-full shadow-md transition-all"
                >
                  <span>Continuar a Calendario y Datos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Interactive Calendar + Patient Info */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Calendar with 3 statuses */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Selecciona el día y la hora disponible
                </label>
                <BookingCalendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelectDate={(d) => setSelectedDate(d)}
                  onSelectTime={(t) => setSelectedTime(t)}
                  serviceId={selectedServiceId}
                />
              </div>

              {/* Patient Fields: nombre, apellido, telefono, email */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Nombre <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. María"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {formErrors.nombre && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Apellido <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        placeholder="Ej. Gómez"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {formErrors.apellido && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.apellido}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Número de Teléfono <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej. +58 412 1234567"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {formErrors.telefono && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.telefono}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Correo Electrónico <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Motivo de consulta (opcional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={motivoConsulta}
                      onChange={(e) => setMotivoConsulta(e.target.value)}
                      placeholder="Molestias, zona afectada o detalles para el especialista..."
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Volver al servicio
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-full shadow-md transition-all"
                >
                  <span>Confirmar Reservación</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation Screen */}
          {step === 3 && createdAppointment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  ¡Gracias, {createdAppointment.nombre} {createdAppointment.apellido}!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Tu cita médica ha quedado agendada en el sistema.
                </p>
              </div>

              {/* Reference Card */}
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 text-left space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-amber-200/60 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Código de Cita:</span>
                  <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                    {bookingCode}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Paciente:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {createdAppointment.nombre} {createdAppointment.apellido}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Servicio:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedServiceObj.title}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Fecha y Horario:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {createdAppointment.fecha} ({createdAppointment.hora})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Ubicación:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Sabana Grande, Centro Profesional del Este, Piso 4, Ofic 46
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Guardar en Calendario</span>
                </button>

                <a
                  href={`tel:${CLINIC_INFO.phoneRaw}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-full transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar a la Clínica</span>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Cerrar ventana
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
