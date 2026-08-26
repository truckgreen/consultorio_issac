import React from 'react';
import { 
  CalendarDays, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight, 
  MessageSquare, 
  Plus, 
  Download, 
  Phone, 
  Stethoscope, 
  ChevronRight,
  Activity,
  UserCheck,
  Calendar
} from 'lucide-react';
import { Appointment, ContactMessage, ServiceItem, AuthUser } from '../../types';
import { SERVICES, TEAM_MEMBERS } from '../../data/equilibraData';

interface DashboardViewProps {
  appointments: Appointment[];
  messages: ContactMessage[];
  onOpenNewAppointmentModal: () => void;
  onNavigateToTab: (tab: any) => void;
  onSelectAppointmentForEdit: (appointment: Appointment) => void;
  onQuickUpdateStatus: (id: string, newStatus: any) => void;
  onExportCsv: () => void;
  currentUser: AuthUser;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appointments,
  messages,
  onOpenNewAppointmentModal,
  onNavigateToTab,
  onSelectAppointmentForEdit,
  onQuickUpdateStatus,
  onExportCsv,
  currentUser,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Appointments stats
  const todayAppointments = appointments.filter(a => a.fecha === todayStr);
  const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMADA');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETADA');
  const pendingAppointments = appointments.filter(a => a.status === 'PENDIENTE');

  // Revenue estimation
  const totalRevenue = appointments
    .filter(a => a.status !== 'CANCELADA')
    .reduce((sum, a) => sum + (a.amount || 35), 0);

  const todayRevenue = todayAppointments
    .filter(a => a.status !== 'CANCELADA')
    .reduce((sum, a) => sum + (a.amount || 35), 0);

  // Unread messages
  const unreadMessages = messages.filter(m => m.status === 'NUEVO');

  // Unique patients
  const uniquePatients = new Set(appointments.map(a => `${a.nombre.toLowerCase()}_${a.apellido.toLowerCase()}`));

  // Services distribution
  const serviceCounts: { [key: string]: number } = {};
  appointments.forEach(a => {
    serviceCounts[a.service_title] = (serviceCounts[a.service_title] || 0) + 1;
  });

  const sortedServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleSendWhatsAppReminder = (app: Appointment) => {
    const cleanPhone = app.telefono.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `¡Hola ${app.nombre}! 👋 Te escribimos desde el Centro Clínico EQUILIBRA (Sabana Grande, Caracas) para confirmar tu cita de *${app.service_title}* programada para hoy/próximamente: ${app.fecha} en el horario de *${app.hora}*. Código de cita: *${app.code}*. ¿Nos confirmas tu asistencia? ¡Te esperamos!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-xl shadow-amber-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
            <Activity className="w-3.5 h-3.5" />
            <span>Centro Clínico Operativo • Sabana Grande</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Panel de {currentUser.role === 'SUPERADMIN' ? 'Control' : 'Especialista'} EQUILIBRA
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
            {currentUser.role === 'SUPERADMIN'
              ? 'Gestión en tiempo real de citas, especialistas, pacientes y consultas en Caracas.'
              : `Bienvenido/a, ${currentUser.name}. Visualizando tu agenda y pacientes asignados.`
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {currentUser.role === 'SUPERADMIN' && (
            <button
              onClick={onExportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          )}

          <button
            onClick={onOpenNewAppointmentModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-amber-600 hover:bg-amber-50 active:scale-95 text-xs sm:text-sm font-bold shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita</span>
          </button>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Citas Hoy */}
        <div 
          onClick={() => onNavigateToTab('citas')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500 dark:hover:border-amber-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Citas para Hoy
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {todayAppointments.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              de {appointments.length} totales
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            <span>Ver agenda del día</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Ingresos Estimados */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ingresos Registrados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ${totalRevenue}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              USD
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Hoy estimado:</span>
            <span className="font-bold text-slate-900 dark:text-white">${todayRevenue} USD</span>
          </div>
        </div>

        {/* Card 3: Pacientes Únicos */}
        <div 
          onClick={() => onNavigateToTab('pacientes')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pacientes Activos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {uniquePatients.size}
            </span>
            <span className="text-xs text-slate-500">expedientes</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            <span>Directorio de pacientes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Consultas Web */}
        <div 
          onClick={() => onNavigateToTab('mensajes')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mensajes & Leads
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {unreadMessages.length}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
              pendientes
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
            <span>Bandeja de consultas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Schedule & Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Appointments Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Agenda de Hoy en Clínica</span>
              </h2>
              <p className="text-xs text-slate-500">
                {todayAppointments.length} citas programadas para el día de hoy
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('citas')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todas las citas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500">No hay citas programadas para hoy todavía.</p>
              <button
                onClick={onOpenNewAppointmentModal}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20"
              >
                + Agendar Cita para Hoy
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-500/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                        {app.hora}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {app.nombre} {app.apellido}
                      </span>
                      {app.primera_visita && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          1ra Visita
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{app.service_title}</span>
                      <span>•</span>
                      <span>Esp: <strong className="text-slate-700 dark:text-slate-300">{app.specialist_name || 'Asignado en recepción'}</strong></span>
                      <span>•</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">${app.amount || 35} USD</span>
                    </div>

                    {app.motivo && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                        "{app.motivo}"
                      </p>
                    )}
                  </div>

                  {/* Quick Status and Actions */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                    
                    {/* Status badge / selector */}
                    <select
                      value={app.status}
                      onChange={(e) => onQuickUpdateStatus(app.id, e.target.value)}
                      className={`text-[11px] font-bold py-1.5 px-2.5 rounded-xl border focus:outline-none cursor-pointer ${
                        app.status === 'CONFIRMADA'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                          : app.status === 'COMPLETADA'
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
                          : app.status === 'PENDIENTE'
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                      }`}
                    >
                      <option value="CONFIRMADA">Confirmada</option>
                      <option value="COMPLETADA">Atendida / Pagada</option>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>

                    {/* WhatsApp button */}
                    <button
                      onClick={() => handleSendWhatsAppReminder(app)}
                      title="Enviar recordatorio por WhatsApp"
                      className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => onSelectAppointmentForEdit(app)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Services Breakdown & Clinic Info */}
        <div className="space-y-6">
          
          {/* Most requested services */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Servicios Más Solicitados
            </h3>

            <div className="space-y-3">
              {sortedServices.map(([title, count]) => {
                const percentage = Math.round((count / (appointments.length || 1)) * 100);
                return (
                  <div key={title} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 dark:text-slate-200 truncate pr-2">{title}</span>
                      <span className="text-slate-500 font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Staff overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Especialistas de Guardia
              </h3>
              <button
                onClick={() => onNavigateToTab('especialistas')}
                className="text-xs text-amber-500 font-bold hover:underline"
              >
                Ver todos (9)
              </button>
            </div>

            <div className="space-y-2.5">
              {TEAM_MEMBERS.slice(0, 4).map(member => (
                <div key={member.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Disponible hoy" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
