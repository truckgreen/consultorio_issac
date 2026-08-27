import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Plus, 
  Download, 
  Phone, 
  Mail, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  User, 
  Stethoscope, 
  Layers,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { SERVICES_DATA } from '../../data/servicesData';
import { TEAM_MEMBERS } from '../../data/teamData';
import { STANDARD_WEEKDAY_SLOTS } from '../../utils/bookingUtils';

interface AppointmentsManagerViewProps {
  appointments: Appointment[];
  onOpenNewAppointmentModal: () => void;
  onSelectAppointmentForEdit: (appointment: Appointment) => void;
  onQuickUpdateStatus: (id: string, newStatus: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onExportCsv: () => void;
}

export const AppointmentsManagerView: React.FC<AppointmentsManagerViewProps> = ({
  appointments,
  onOpenNewAppointmentModal,
  onSelectAppointmentForEdit,
  onQuickUpdateStatus,
  onDeleteAppointment,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'WEEK'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'schedule'>('table');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Filter appointments
  const filteredAppointments = appointments.filter(app => {
    const serviceTitle = app.service_title || app.serviceTitle || '';
    const specialistName = app.specialist_name || app.specialistName || '';
    const serviceId = app.service_id || app.serviceId || '';
    const statusNormalized = (app.status || 'CONFIRMADA').toUpperCase();

    // Search matching
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      app.nombre.toLowerCase().includes(searchLower) ||
      app.apellido.toLowerCase().includes(searchLower) ||
      app.code.toLowerCase().includes(searchLower) ||
      app.telefono.includes(searchLower) ||
      serviceTitle.toLowerCase().includes(searchLower) ||
      specialistName.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'CONFIRMADA' && !['CONFIRMADA', 'confirmada'].includes(app.status)) return false;
      if (statusFilter === 'PENDIENTE' && !['PENDIENTE', 'pendiente', 'pendiente_validacion'].includes(app.status)) return false;
      if (statusFilter === 'COMPLETADA' && !['COMPLETADA', 'completada'].includes(app.status)) return false;
      if (statusFilter === 'CANCELADA' && !['CANCELADA', 'cancelada'].includes(app.status)) return false;
    }

    // Service filter
    if (serviceFilter !== 'ALL' && serviceId !== serviceFilter) return false;

    // Date filter
    if (dateFilter === 'TODAY' && app.fecha !== todayStr) return false;
    if (dateFilter === 'TOMORROW' && app.fecha !== tomorrowDate) return false;
    if (dateFilter === 'WEEK') {
      const appDate = new Date(app.fecha);
      const today = new Date();
      const diffDays = (appDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      if (diffDays < -1 || diffDays > 7) return false;
    }

    return true;
  });

  const handleSendWhatsAppReminder = (app: Appointment) => {
    const cleanPhone = app.telefono.replace(/[^0-9]/g, '');
    const serviceTitle = app.service_title || app.serviceTitle || 'Fisioterapia & Bienestar';
    const specialistName = app.specialist_name || app.specialistName || 'Especialista Asignado';
    const message = encodeURIComponent(
      `¡Hola ${app.nombre}! 👋 Te recordamos tu cita de *${serviceTitle}* en el Centro EQUILIBRA (Sabana Grande, Caracas) para el día *${app.fecha}* a las *${app.hora}*. Código: *${app.code}*. Especialista: *${specialistName}*. ¡Agradecemos confirmar tu asistencia respondiendo a este mensaje!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-amber-500" />
            <span>Gestión Integral de Citas & Agenda</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de reservas en tiempo real, pacientes, especialistas y estados de atención
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onExportCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewAppointmentModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, código EQ-XXXXX, teléfono, especialista o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Service Dropdown */}
          <div className="w-full lg:w-56">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Todos los Servicios ({SERVICES_DATA.length})</option>
              {SERVICES_DATA.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full lg:w-auto shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode('schedule')}
              className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'schedule'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Agenda Diaria
            </button>
          </div>

        </div>

        {/* Date and Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Estado:</span>
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'CONFIRMADA', label: 'Confirmadas' },
              { id: 'PENDIENTE', label: 'Pendientes' },
              { id: 'COMPLETADA', label: 'Completadas' },
              { id: 'CANCELADA', label: 'Canceladas' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setStatusFilter(pill.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  statusFilter === pill.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Date Range Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Fecha:</span>
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'TODAY', label: 'Hoy' },
              { id: 'TOMORROW', label: 'Mañana' },
              { id: 'WEEK', label: 'Esta Semana' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setDateFilter(pill.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  dateFilter === pill.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Content: Table Mode vs Schedule Mode */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No se encontraron citas con los filtros seleccionados
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Prueba cambiando los filtros o agenda una nueva cita manualmente.
              </p>
              <button
                onClick={onOpenNewAppointmentModal}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/25"
              >
                + Crear Cita Ahora
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Código / Paciente</th>
                    <th className="py-3.5 px-4">Servicio & Especialista</th>
                    <th className="py-3.5 px-4">Fecha & Hora</th>
                    <th className="py-3.5 px-4">Contacto</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Monto / Tarifa</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredAppointments.map((app) => {
                    const statusVal = (app.status || 'CONFIRMADA').toUpperCase();
                    const isConfirmed = statusVal === 'CONFIRMADA';
                    const isCompleted = statusVal === 'COMPLETADA';
                    const isPending = ['PENDIENTE', 'PENDIENTE_VALIDACION'].includes(statusVal);
                    const isCanceled = statusVal === 'CANCELADA';

                    const serviceTitle = app.service_title || app.serviceTitle || 'Fisioterapia';
                    const specialistName = app.specialist_name || app.specialistName || 'Lic. Isaac Jewsiejew';
                    const displayPrice = app.selectedPackagePrice || app.servicePrice || app.service_price || `$${app.amount || 35} USD`;

                    return (
                      <tr 
                        key={app.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Code & Patient */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                              {app.code}
                            </span>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {app.nombre} {app.apellido}
                            </p>
                            {(app.primera_visita ?? app.primeraVisita) && (
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                                Primera consulta (Evaluación)
                              </span>
                            )}
                            {app.selectedPackageName && (
                              <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                📦 {app.selectedPackageName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Service & Specialist */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {serviceTitle}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-amber-500" />
                              <span>{specialistName}</span>
                            </p>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <p className={`font-bold ${app.fecha === todayStr ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                              {app.fecha} {app.fecha === todayStr && '(Hoy)'}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              <span>{app.hora}</span>
                            </p>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {app.telefono}
                            </p>
                            <p className="text-slate-400 truncate max-w-[140px]">
                              {app.email}
                            </p>
                          </div>
                        </td>

                        {/* Status Selector */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            value={isPending ? 'PENDIENTE' : isCanceled ? 'CANCELADA' : isCompleted ? 'COMPLETADA' : 'CONFIRMADA'}
                            onChange={(e) => onQuickUpdateStatus(app.id, e.target.value as AppointmentStatus)}
                            className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-none cursor-pointer ${
                              isConfirmed
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                                : isCompleted
                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
                                : isPending
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                            }`}
                          >
                            <option value="CONFIRMADA">Confirmada</option>
                            <option value="COMPLETADA">Atendida / Pagada</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="CANCELADA">Cancelada</option>
                          </select>
                        </td>

                        {/* Price / Payment */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {displayPrice}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp */}
                            <button
                              onClick={() => handleSendWhatsAppReminder(app)}
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 transition-colors"
                              title="Enviar WhatsApp de recordatorio"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit / Detail */}
                            <button
                              onClick={() => onSelectAppointmentForEdit(app)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                              title="Editar ficha y notas clínicas"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar la cita ${app.code} de ${app.nombre} ${app.apellido}?`)) {
                                  onDeleteAppointment(app.id);
                                }
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Eliminar cita"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Schedule View (Hourly slots for Selected Date) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Bloques Horarios de Atención ({todayStr})
              </h3>
              <p className="text-xs text-slate-500">
                Visualización de turnos en Sabana Grande de 8:00 AM a 7:00 PM
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {STANDARD_WEEKDAY_SLOTS.map((slotTime) => {
              const matchingApps = appointments.filter(a => a.fecha === todayStr && a.hora === slotTime);
              const isOccupied = matchingApps.length > 0;

              return (
                <div
                  key={slotTime}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOccupied
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {slotTime}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOccupied
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {isOccupied ? `${matchingApps.length} Cita` : 'Libre'}
                    </span>
                  </div>

                  {isOccupied ? (
                    matchingApps.map(app => (
                      <div key={app.id} className="space-y-1 pt-1 border-t border-amber-200 dark:border-amber-900/40">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {app.nombre} {app.apellido}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {app.service_title || app.serviceTitle}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Esp: {app.specialist_name || app.specialistName || 'Asignado'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <button
                      onClick={onOpenNewAppointmentModal}
                      className="w-full mt-2 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-amber-500 hover:border-amber-500 text-[11px] font-semibold transition-colors"
                    >
                      + Asignar Cita
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
