import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Stethoscope, 
  Tag, 
  FileText, 
  DollarSign,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { SERVICES_DATA } from '../../data/servicesData';
import { TEAM_MEMBERS } from '../../data/teamData';
import { STANDARD_WEEKDAY_SLOTS } from '../../utils/bookingUtils';
import { getAutoSelectedSpecialistForService } from '../../utils/specialistAvailability';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAppointment: (appointment: Appointment) => void;
  defaultSpecialistName?: string;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSaveAppointment,
  defaultSpecialistName,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [serviceId, setServiceId] = useState(SERVICES_DATA[0].id);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [specialistName, setSpecialistName] = useState(
    defaultSpecialistName || getAutoSelectedSpecialistForService(SERVICES_DATA[0].id, fecha)?.specialist.name || TEAM_MEMBERS[0].name
  );
  const [hora, setHora] = useState(STANDARD_WEEKDAY_SLOTS[0]);
  const [motivo, setMotivo] = useState('');
  const [primeraVisita, setPrimeraVisita] = useState(true);
  const [status, setStatus] = useState<AppointmentStatus>('CONFIRMADA');
  const [amount, setAmount] = useState<number>(SERVICES_DATA[0].price);
  const [paymentStatus, setPaymentStatus] = useState<'PENDIENTE' | 'PAGADO' | 'EXONERADO'>('PENDIENTE');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleServiceChange = (sId: string) => {
    setServiceId(sId);
    const s = SERVICES_DATA.find(srv => srv.id === sId);
    if (s) {
      setAmount(s.price);
    }
    // Auto-select specialist for the chosen service & date
    const autoSpec = getAutoSelectedSpecialistForService(sId, fecha);
    if (autoSpec) {
      setSpecialistName(autoSpec.specialist.name);
    }
  };

  const handleDateChange = (newDate: string) => {
    setFecha(newDate);
    const autoSpec = getAutoSelectedSpecialistForService(serviceId, newDate);
    if (autoSpec) {
      setSpecialistName(autoSpec.specialist.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = SERVICES_DATA.find(s => s.id === serviceId) || SERVICES_DATA[0];
    const selectedSpecialist = TEAM_MEMBERS.find(t => t.name === specialistName);

    const randomCode = `EQ-${Math.floor(10000 + Math.random() * 90000)}`;

    const newApp: Appointment = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: randomCode,
      service_id: selectedService.id,
      service_title: selectedService.title,
      fecha,
      hora,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim(),
      email: email.trim() || `${nombre.toLowerCase()}.${apellido.toLowerCase()}@paciente.equilibra.ve`,
      motivo: motivo.trim(),
      primera_visita: primeraVisita,
      status,
      specialist_id: selectedSpecialist?.id || '',
      specialist_name: specialistName,
      amount,
      payment_status: paymentStatus,
      notes: notes.trim(),
      created_at: new Date().toISOString()
    };

    onSaveAppointment(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Nueva Cita / Admisión Manual
              </h2>
              <p className="text-xs text-slate-500">
                Registro directo de paciente para la sede de Sabana Grande
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Patient Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>Datos del Paciente</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mendoza"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Teléfono WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+58 414 123.45.67"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Email (Opcional)</label>
                <input
                  type="email"
                  placeholder="carlos.mendoza@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={primeraVisita}
                onChange={(e) => setPrimeraVisita(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Es la primera consulta del paciente en EQUILIBRA
              </span>
            </label>
          </div>

          {/* Service & Specialist Assignment */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-amber-500" />
                <span>Servicio & Especialista Asignado</span>
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-asignación inteligente
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Disciplina / Servicio *</label>
                <select
                  value={serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {SERVICES_DATA.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.priceFormatted || `$${s.price} USD`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Especialista Asignado *</label>
                <select
                  value={specialistName}
                  onChange={(e) => setSpecialistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {TEAM_MEMBERS.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date, Time & Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Fecha de la Cita *</span>
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Horario / Turno *</span>
              </label>
              <select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {STANDARD_WEEKDAY_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Monto a Cobrar ($ USD)</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Estado de Pago</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="PENDIENTE">Pendiente por Cobrar</option>
                <option value="PAGADO">Pagado / Cancelado</option>
                <option value="EXONERADO">Cortesía / Exonerado</option>
              </select>
            </div>
          </div>

          {/* Motive & Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Motivo de Consulta / Síntomas del Paciente:
            </label>
            <input
              type="text"
              placeholder="Ej: Dolor lumbar irradiado, rehabilitación post-quirúrgica..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Notas Internas de Recepción / Evolución:
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Paciente prefiere camilla 2. Traerá radiografía..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all"
            >
              Guardar y Programar Cita
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
