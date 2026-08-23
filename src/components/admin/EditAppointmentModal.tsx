import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Stethoscope, 
  DollarSign, 
  CheckCircle2, 
  Trash2,
  PhoneCall
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { SERVICES, TEAM_MEMBERS, STANDARD_WEEKDAY_SLOTS } from '../../data/equilibraData';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSaveUpdates: (id: string, updates: Partial<Appointment>) => void;
  onDeleteAppointment: (id: string) => void;
}

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSaveUpdates,
  onDeleteAppointment,
}) => {
  if (!isOpen || !appointment) return null;

  const [fecha, setFecha] = useState(appointment.fecha);
  const [hora, setHora] = useState(appointment.hora);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [specialistName, setSpecialistName] = useState(appointment.specialist_name || TEAM_MEMBERS[0].name);
  const [serviceId, setServiceId] = useState(appointment.service_id);
  const [amount, setAmount] = useState(appointment.amount || 35);
  const [paymentStatus, setPaymentStatus] = useState(appointment.payment_status || 'PENDIENTE');
  const [notes, setNotes] = useState(appointment.notes || '');
  const [motivo, setMotivo] = useState(appointment.motivo || '');

  useEffect(() => {
    if (appointment) {
      setFecha(appointment.fecha);
      setHora(appointment.hora);
      setStatus(appointment.status);
      setSpecialistName(appointment.specialist_name || TEAM_MEMBERS[0].name);
      setServiceId(appointment.service_id);
      setAmount(appointment.amount || 35);
      setPaymentStatus(appointment.payment_status || 'PENDIENTE');
      setNotes(appointment.notes || '');
      setMotivo(appointment.motivo || '');
    }
  }, [appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const service = SERVICES.find(s => s.id === serviceId);
    const specialist = TEAM_MEMBERS.find(t => t.name === specialistName);

    onSaveUpdates(appointment.id, {
      fecha,
      hora,
      status,
      specialist_id: specialist?.id || appointment.specialist_id,
      specialist_name: specialistName,
      service_id: serviceId,
      service_title: service?.title || appointment.service_title,
      amount,
      payment_status: paymentStatus as any,
      notes,
      motivo
    });
    onClose();
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = appointment.telefono.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `¡Hola ${appointment.nombre}! Te escribimos desde EQUILIBRA en Sabana Grande sobre tu cita (${appointment.code}) de ${appointment.service_title} programada para el ${fecha} a las ${hora}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                {appointment.code}
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Ficha de Cita: {appointment.nombre} {appointment.apellido}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Registrada el {new Date(appointment.created_at).toLocaleDateString('es-VE')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick patient contacts */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400 block text-[10px]">Contacto:</span>
            <span className="font-bold text-slate-900 dark:text-white">{appointment.telefono}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Status & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Estado de la Cita</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="CONFIRMADA">🟢 Confirmada</option>
                <option value="COMPLETADA">🔵 Atendida / Pagada</option>
                <option value="PENDIENTE">🟡 Pendiente</option>
                <option value="CANCELADA">🔴 Cancelada</option>
                <option value="NO_ASISTIO">⚪ No Asistió</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Servicio Clínico</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {SERVICES.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Specialist & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Especialista Asignado</label>
              <select
                value={specialistName}
                onChange={(e) => setSpecialistName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {TEAM_MEMBERS.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.role})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Monto Cobrado ($ USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Horario</label>
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
          </div>

          {/* Clinical Evolution / Reception Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Notas de Evolución Clínica y Seguimiento:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Paciente refiere mejoría del 40% en amplitud articular. Continuar ejercicios propioceptivos..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (confirm(`¿Eliminar la cita ${appointment.code}?`)) {
                  onDeleteAppointment(appointment.id);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-colors"
              >
                Guardar Actualización
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
