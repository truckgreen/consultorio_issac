import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';
import { CLINIC_INFO } from '../data/featuresData';
import { BookingFormData, ConfirmedAppointment } from '../types';
import { BookingCalendar } from './BookingCalendar';
import {
  getSavedAppointments,
  saveAppointmentToDatabase,
  generateIcsCalendar,
  getSlotsForDate,
} from '../utils/bookingUtils';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface BookingSectionProps {
  preselectedServiceId?: string;
  onServiceSelect?: (serviceId: string) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  preselectedServiceId,
}) => {
  // Today formatted as YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    // If today is Sunday (day 0), advance to Monday
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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedTime, setSelectedTime] = useState<string>('09:00 AM - 10:00 AM');

  // Form Fields
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [motivoConsulta, setMotivoConsulta] = useState<string>('');
  const [primeraVisita, setPrimeraVisita] = useState<boolean>(true);

  // Errors & Feedback
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [latestAppointment, setLatestAppointment] = useState<ConfirmedAppointment | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Saved appointments list for quick access
  const [savedAppointments, setSavedAppointments] = useState<ConfirmedAppointment[]>([]);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);

  useEffect(() => {
    setSavedAppointments(getSavedAppointments());
  }, []);

  // If preselectedServiceId changes from parent
  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceId(preselectedServiceId);
    }
  }, [preselectedServiceId]);

  // When date changes, check if the currently selected time is valid for the new date
  useEffect(() => {
    if (selectedDate) {
      const slots = getSlotsForDate(selectedDate, selectedServiceId);
      const availableSlots = slots.filter((s) => s.status !== 'ocupado');
      if (availableSlots.length > 0) {
        const stillValid = availableSlots.some((s) => s.time === selectedTime);
        if (!stillValid) {
          // Set to the first available slot
          setSelectedTime(availableSlots[0].time);
        }
      } else {
        setSelectedTime('');
      }
    }
  }, [selectedDate, selectedServiceId]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (nombre.trim().length < 2) {
      errors.nombre = 'Ingresa un nombre válido.';
    }

    if (!apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio.';
    } else if (apellido.trim().length < 2) {
      errors.apellido = 'Ingresa un apellido válido.';
    }

    if (!telefono.trim()) {
      errors.telefono = 'El número de teléfono es obligatorio.';
    } else if (telefono.trim().length < 7) {
      errors.telefono = 'Ingresa un número de contacto válido.';
    }

    if (!email.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Ingresa un correo electrónico con formato válido (ej. nombre@correo.com).';
    }

    if (!selectedDate) {
      errors.fecha = 'Por favor selecciona un día en el calendario.';
    }

    if (!selectedTime) {
      errors.hora = 'Por favor selecciona una hora disponible.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedService = SERVICES_DATA.find((s) => s.id === selectedServiceId);
      const randomCode = `EQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const newAppointment: ConfirmedAppointment = {
        id: `app-${Date.now()}`,
        code: randomCode,
        serviceId: selectedServiceId,
        servicePrice: selectedService ? `${selectedService.priceFormatted} USD` : undefined,
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

      // Save to Supabase and sync local storage
      await saveAppointmentToDatabase(newAppointment);
      setLatestAppointment(newAppointment);
      setSavedAppointments(getSavedAppointments());
      setIsSubmitting(false);
      setActiveStep('confirmed');
    } catch (error) {
      console.error('Error booking appointment:', error);
      setIsSubmitting(false);
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
    setActiveStep('selection');
    setNombre('');
    setApellido('');
    setTelefono('');
    setEmail('');
    setMotivoConsulta('');
    setFormErrors({});
    setLatestAppointment(null);
  };

  const selectedServiceObj =
    SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  return (
    <section
      id="agendar-cita"
      className="py-20 lg:py-28 bg-[#f5f2eb] dark:bg-[#0b0e14] relative overflow-hidden transition-colors"
    >
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <CalendarCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Reserva Directa en Línea</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
            Agenda tu cita directamente aquí
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Selecciona tu especialidad, consulta el calendario interactivo con horarios en tiempo real (disponibles, por confirmar u ocupados) y registra tus datos de contacto para asegurar tu consulta.
          </p>

          {/* If there are previously saved appointments */}
          {savedAppointments.length > 0 && activeStep === 'selection' && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                id="toggle-my-appointments-btn"
                onClick={() => setShowSavedList(!showSavedList)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {showSavedList
                    ? 'Ocultar mis citas registradas'
                    : `Ver mis citas agendadas (${savedAppointments.length})`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Previously Saved Appointments Viewer */}
        <AnimatePresence>
          {showSavedList && savedAppointments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 overflow-hidden"
            >
              <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-amber-600" />
                    Citas registradas en este navegador
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {savedAppointments.length} cita(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedAppointments.map((app) => {
                    const serv = SERVICES_DATA.find((s) => s.id === app.serviceId);
                    return (
                      <div
                        key={app.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                              {app.code}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                              Confirmada {app.servicePrice ? `• ${app.servicePrice}` : ''}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {serv ? serv.title : 'Consulta Médica'}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            Paciente: {app.nombre} {app.apellido}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span>{app.fecha}</span>
                            <Clock className="w-3.5 h-3.5 text-amber-600 ml-1" />
                            <span>{app.hora}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              generateIcsCalendar(
                                app,
                                serv ? serv.title : 'Consulta',
                                CLINIC_INFO.address.fullAddress,
                                CLINIC_INFO.phoneDisplay
                              )
                            }
                            className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium"
                          >
                            Descargar .ics
                          </button>
                          <span className="text-[10px] text-slate-400">Sabana Grande, Piso 4</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Booking Engine */}
        {activeStep === 'selection' ? (
          <form onSubmit={handleBookAppointment} className="space-y-8">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {SERVICES_DATA.map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      id={`service-select-${service.id}`}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/40 shadow-sm'
                          : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
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
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                          {service.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
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
            </div>

            {/* Step 2: Interactive Calendar with 3 states (Disponible, Por confirmar, Ocupado) */}
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
                      Revisa el estado de cada horario para saber si está disponible, por confirmar u ocupado
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Calendar Widget */}
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

            {/* Step 3: Required Patient Data (Nombre, Apellido, Teléfono, Correo) */}
            <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                      Datos del Paciente
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Por favor completa tus datos para el registro y confirmación de la cita
                    </p>
                  </div>
                </div>
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

                {/* Motivo de Consulta (Opcional) */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-motivo"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Motivo de consulta o síntomas (Opcional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      id="booking-motivo"
                      rows={3}
                      value={motivoConsulta}
                      onChange={(e) => setMotivoConsulta(e.target.value)}
                      placeholder="Describe brevemente tu molestia, diagnóstico previo o metas deportivas..."
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
                          ? 'Incluiremos una evaluación clínica inicial completa.'
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
                    <span>Reserva segura y confirmación inmediata</span>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                      {selectedServiceObj.priceFormatted} USD
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedServiceObj.title} • {selectedDate} ({selectedTime || 'Selecciona hora'})
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
                    <span>Confirmando tu reserva...</span>
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
                  ¡Cita Agendada Exitosamente!
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
                  Tu consulta ha sido confirmada
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-md mx-auto">
                  Hemos guardado tu cita en el sistema de EQUILIBRA y te esperamos en la clínica.
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
                      Duración aprox: {selectedServiceObj.duration}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="inline-block text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        {latestAppointment.primeraVisita ? 'Primera Evaluación' : 'Sesión de Seguimiento'}
                      </span>
                      {selectedServiceObj.packageOption && (
                        <span className="inline-block text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {selectedServiceObj.packageOption}
                        </span>
                      )}
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
                      Sede & Atención
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

                {/* Important Clinical Notice */}
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
                  <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-0.5">
                      Instrucciones para tu llegada
                    </p>
                    <p>
                      Recomendamos asistir 10 minutos antes de la hora acordada y traer ropa cómoda para la sesión de evaluación física y funcional. Si presentas estudios de imagen recientes (resonancias, rayos X), no dudes en traerlos.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      generateIcsCalendar(
                        latestAppointment,
                        selectedServiceObj.title,
                        CLINIC_INFO.address.fullAddress,
                        CLIC_PHONE_CALL
                      )
                    }
                    className="flex-1 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Descargar Recordatorio (.ics)</span>
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

const CLIC_PHONE_CALL = CLINIC_INFO.phoneDisplay;
