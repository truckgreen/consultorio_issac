import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ServiceCategory } from '../types';
import { StorageService } from '../services/storageService';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  MessageCircle, 
  Sparkles,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

interface BookingAndContactSectionProps {
  preselectedService?: string;
  onBookingSuccess: (accessCode: string) => void;
}

export const BookingAndContactSection: React.FC<BookingAndContactSectionProps> = ({
  preselectedService,
  onBookingSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    documentId: '',
    email: '',
    phone: '',
    emergencyContactPhone: '',
    emergencyContactName: '',
    address: '',
    service: (preselectedService || 'Fisioterapia General') as ServiceCategory,
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredTime: '10:00 AM',
    notes: '',
    isFirstTime: true
  });

  const [confirmedBooking, setConfirmedBooking] = useState<{
    accessCode: string;
    date: string;
    time: string;
    service: string;
    name: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const servicesList: ServiceCategory[] = [
    'Fisioterapia General',
    'Fisioterapia Deportiva',
    'Fisioterapia Pediátrica',
    'Fisioterapia Geriátrica',
    'Traumatología',
    'Psicología',
    'Nutrición',
    'Entrenamiento Funcional',
    'Boxeo'
  ];

  const timeSlots = [
    '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const result = StorageService.createAppointment({
        patientName: formData.name,
        documentId: formData.documentId || undefined,
        email: formData.email,
        phone: formData.phone,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        address: formData.address || undefined,
        service: formData.service,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        notes: formData.notes,
        isFirstTime: formData.isFirstTime
      });

      setConfirmedBooking({
        accessCode: result.accessCode,
        date: formData.preferredDate,
        time: formData.preferredTime,
        service: formData.service,
        name: formData.name
      });

      StorageService.setActivePatientCode(result.accessCode);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <section id="contacto" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Atención Inmediata & Citas Online
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
            Reserva tu cita ¡Ahora!
          </h2>
          <p className="text-base text-slate-600">
            Completa tus datos para agendar tu consulta médica o sesión de fisioterapia. 
            El sistema registrará tu ficha clínica de forma instantánea y se notificará 
            a nuestro equipo de especialistas y administradores.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Interactive Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200"
          >
            {confirmedBooking ? (
              <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    ¡Cita Registrada Exitosamente!
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 font-heading">
                    {confirmedBooking.name}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Tu cita para <strong className="text-slate-900">{confirmedBooking.service}</strong> ha sido agendada para el <strong className="text-slate-900">{confirmedBooking.date}</strong> a las <strong className="text-slate-900">{confirmedBooking.time}</strong>.
                  </p>
                </div>

                {/* Patient Access Code Card */}
                <div className="bg-indigo-50/60 border-2 border-dashed border-indigo-300 rounded-2xl p-5 max-w-md mx-auto text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Código de Paciente y Cita Generado:
                  </span>
                  <div className="text-3xl font-extrabold text-indigo-700 tracking-widest font-heading select-all">
                    {confirmedBooking.accessCode}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    La solicitud ha sido recibida en la <strong>App de Administradores y Especialistas de EQUILIBRA</strong>. Tu expediente y canal de chat interno están activos.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onBookingSuccess(confirmedBooking.accessCode)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Ver en App de Gestión & Chat</span>
                  </button>

                  <button
                    onClick={() => setConfirmedBooking(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-xs cursor-pointer transition-all"
                  >
                    <span>Agendar otra cita</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 font-heading">
                    Formulario de Registro y Cita
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tus datos se almacenan de forma segura y automatizada en nuestra base de datos clínica.
                  </p>
                </div>

                {/* Full Name & Document ID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sofía Hernández"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Cédula / DNI (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="V-19.482.102"
                      value={formData.documentId}
                      onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                </div>

                {/* Phone and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Teléfono Móvil Principal *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+58 412-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sofia@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Emergency Contact & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Teléfono de Emergencia / Familiar
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Mamá +58 414-0000000"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Zona / Dirección (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Altamira / Sabana Grande"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Servicio o Especialidad Solicitada *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value as ServiceCategory })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-white font-medium text-slate-800"
                  >
                    {servicesList.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Fecha preferida
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Horario disponible
                    </label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-white"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes or Symptoms */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Motivo de consulta / Lesión o dolor actual (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Dolor lumbar hace 3 semanas al estar sentado, o recuperación postquirúrgica..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                {/* Checkbox first time */}
                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.isFirstTime}
                    onChange={(e) => setFormData({ ...formData, isFirstTime: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    Es mi primera vez asistiendo a EQUILIBRA (Requiere evaluación inicial 360°)
                  </span>
                </label>

                {/* Submit button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <span>Registrando en base de datos...</span>
                    ) : (
                      <>
                        <span>Confirmar Reserva de Cita</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </motion.div>

          {/* Right Column: Physical Location, Hours, & Contact Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Location Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    Sede Principal
                  </span>
                  <h4 className="text-lg font-bold font-heading">
                    Centro EQUILIBRA Caracas
                  </h4>
                </div>
              </div>

              {/* Exact Location */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  Venezuela, Caracas, Sabana Grande, Centro Profesional del Este, piso 4, oficina 46.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/10">
                  <span>Acceso cómodo · Estacionamiento privado</span>
                </div>
              </div>

              {/* Telephone */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Teléfono Central & Recepción</div>
                    <a href="tel:+584127471858" className="text-sm font-bold text-white hover:text-indigo-300 transition-colors">
                      +58.412.747.18.58
                    </a>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  Línea Activa
                </span>
              </div>

              {/* Opening Hours */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Horario de nuestro centro</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Lunes</span>
                    <span className="font-semibold text-white">8:00 AM a 7:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Martes</span>
                    <span className="font-semibold text-white">8:00 AM a 7:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Miércoles</span>
                    <span className="font-semibold text-white">8:00 AM a 7:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Jueves</span>
                    <span className="font-semibold text-white">8:00 AM a 7:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Viernes</span>
                    <span className="font-semibold text-white">8:00 AM a 7:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1 text-indigo-300">
                    <span>Sábados (Citas programadas)</span>
                    <span className="font-semibold">8:30 AM a 2:00 PM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick trust guarantee card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-3.5">
              <UserCheck className="w-8 h-8 text-indigo-600 shrink-0" />
              <div className="text-xs text-slate-600">
                <strong className="text-slate-900 block font-semibold">Atención puntual y garantizada</strong>
                Sin tiempos de espera prolongados. Protocolo de atención con cita previa estricta.
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};
