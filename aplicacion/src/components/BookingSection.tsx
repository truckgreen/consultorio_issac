import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  Sparkles,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { SERVICES, getSlotsForDate } from '../data/equilibraData';
import { Appointment, SupabaseConfig, TimeSlotInfo } from '../types';

interface BookingSectionProps {
  selectedServiceId: string;
  onSelectServiceId: (id: string) => void;
  userBookedAppointments: Appointment[];
  onSubmitBooking: (appointmentData: Omit<Appointment, 'id' | 'code' | 'created_at'>) => Promise<boolean>;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  selectedServiceId,
  onSelectServiceId,
  userBookedAppointments,
  onSubmitBooking,
  supabaseConfig,
  onOpenSupabaseModal,
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedTime, setSelectedTime] = useState<string>('09:00 AM - 10:00 AM');
  
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [primeraVisita, setPrimeraVisita] = useState<boolean>(true);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableSlots: TimeSlotInfo[] = getSlotsForDate(selectedDate, userBookedAppointments);
  const currentService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nombre.trim()) newErrors.nombre = 'Ingresa tu nombre';
    if (!apellido.trim()) newErrors.apellido = 'Ingresa tu apellido';
    if (!telefono.trim()) {
      newErrors.telefono = 'Ingresa tu número telefónico';
    } else if (telefono.trim().length < 7) {
      newErrors.telefono = 'Número telefónico inválido';
    }
    if (!email.trim()) {
      newErrors.email = 'Ingresa tu correo electrónico';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de correo inválido';
    }
    if (!selectedDate) newErrors.date = 'Selecciona una fecha';
    if (!selectedTime) newErrors.time = 'Selecciona un horario';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmitBooking({
        service_id: currentService.id,
        service_title: currentService.title,
        fecha: selectedDate,
        hora: selectedTime,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        motivo: motivo.trim(),
        primera_visita: primeraVisita,
        status: 'CONFIRMADA'
      });

      if (success) {
        // Reset inputs
        setMotivo('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reserva" className="py-20 bg-gradient-to-b from-slate-50 to-amber-500/5 dark:from-slate-950 dark:to-amber-950/20 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Sistema de Reservas en Línea</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Agenda tu Consulta o Terapia
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Selecciona tu servicio, fecha y horario ideal en tiempo real. Tu cita se registrará de inmediato en nuestro sistema clínico.
          </p>

          {/* Supabase status banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Base de datos:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {supabaseConfig.isConnected ? 'Supabase Conectado' : 'Almacenamiento Local & Supabase'}
            </span>
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="text-amber-600 dark:text-amber-400 underline font-semibold ml-1 hover:text-amber-700"
            >
              Configurar
            </button>
          </div>
        </div>

        {/* Booking Form Layout */}
        <div className="mt-12 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden">
          
          {/* Form Header info bar */}
          <div className="bg-amber-500 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-100">
                Paso a Paso
              </span>
              <h3 className="text-2xl font-black mt-1">
                {currentService.title}
              </h3>
              <p className="text-xs text-amber-100 mt-1">
                {currentService.duration} • {currentService.priceNote || 'Atención 1 a 1'}
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <span className="text-xs text-amber-100">Tarifa Consulta</span>
              <p className="text-2xl font-black text-white">{currentService.priceFormatted} USD</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            
            {/* 1. Service Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                1. Selecciona el Servicio o Especialidad
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectServiceId(s.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-left border transition-all ${
                      selectedServiceId === s.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-semibold">{s.title}</span>
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">{s.priceFormatted}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Date and Time Slots */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    2. Fecha de tu Cita
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
                </div>

                {/* Quick note on schedule */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Horarios de Atención Clínica</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Lunes a Viernes: 8:00 AM - 7:00 PM | Sábados: 8:00 AM - 2:00 PM
                  </p>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                  3. Horario Disponible para {selectedDate}
                </label>

                {availableSlots.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-center text-amber-800 dark:text-amber-300 text-sm">
                    Los domingos permanecemos cerrados. Por favor selecciona un día de lunes a sábado.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {availableSlots.map((slot, idx) => {
                      const isSelected = selectedTime === slot.time;
                      const isOccupied = slot.status === 'OCUPADO';

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isOccupied
                              ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'border-amber-500 bg-amber-500 text-white font-bold shadow-md shadow-amber-500/25 scale-[1.02]'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold">{slot.time}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : isOccupied
                                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                  : slot.status === 'POR_CONFIRMAR'
                                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {slot.status === 'DISPONIBLE'
                                ? 'Disponible'
                                : slot.status === 'POR_CONFIRMAR'
                                ? 'Por Confirmar'
                                : 'Ocupado'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.time && <p className="text-xs text-rose-500 mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* 3. Patient Information */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                4. Datos del Paciente
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Ej. Andrés"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border ${
                        errors.nombre ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                  </div>
                  {errors.nombre && <p className="text-xs text-rose-500 mt-1">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Apellido *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Ej. Mendoza"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border ${
                        errors.apellido ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                  </div>
                  {errors.apellido && <p className="text-xs text-rose-500 mt-1">{errors.apellido}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      placeholder="+58 412 1234567"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border ${
                        errors.telefono ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                  </div>
                  {errors.telefono && <p className="text-xs text-rose-500 mt-1">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      placeholder="andres@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border ${
                        errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Motivo de Consulta o Lesión Principal (Opcional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <textarea
                    rows={2}
                    placeholder="Describe brevemente tu dolor, molestia o antecedentes..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* First Visit Switch */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="primera-visita"
                  checked={primeraVisita}
                  onChange={(e) => setPrimeraVisita(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="primera-visita" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Es mi primera vez asistiendo a EQUILIBRA (Se incluirá ficha biomecánica inicial)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] disabled:opacity-70 text-white font-black text-base shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registrando y Conectando con Supabase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmar Reserva para {currentService.title}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Atención 1 a 1 sin esperas
                </span>
                <span>•</span>
                <span>Comprobante instantáneo</span>
                <span>•</span>
                <span>Cancelación flexible</span>
              </div>
            </div>

          </form>

        </div>

      </div>
    </section>
  );
};
