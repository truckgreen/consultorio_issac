import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Stethoscope, 
  Tag, 
  MessageSquare, 
  Settings, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

export type AdminTab = 'dashboard' | 'citas' | 'pacientes' | 'especialistas' | 'servicios' | 'mensajes' | 'configuracion';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  counts: {
    appointmentsToday: number;
    appointmentsTotal: number;
    patientsTotal: number;
    unreadMessages: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  counts,
}) => {
  const menuItems: {
    id: AdminTab;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard General',
      description: 'Métricas, KPIs y resumen diario',
      icon: LayoutDashboard,
    },
    {
      id: 'citas',
      label: 'Citas & Agenda',
      description: 'Gestión por fecha y horarios',
      icon: CalendarDays,
      badge: counts.appointmentsToday > 0 ? `${counts.appointmentsToday} hoy` : counts.appointmentsTotal,
      badgeColor: counts.appointmentsToday > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
    },
    {
      id: 'pacientes',
      label: 'Directorio Pacientes',
      description: 'Expedientes e historiales clínicos',
      icon: Users,
      badge: counts.patientsTotal,
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
    },
    {
      id: 'especialistas',
      label: 'Especialistas & Staff',
      description: '9 Profesionales y turnos',
      icon: Stethoscope,
      badge: '9',
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
    },
    {
      id: 'servicios',
      label: 'Servicios & Tarifas',
      description: 'Catálogo de 9 disciplinas',
      icon: Tag,
      badge: '$ USD',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
    },
    {
      id: 'mensajes',
      label: 'Consultas & Leads',
      description: 'Bandeja de pacientes web',
      icon: MessageSquare,
      badge: counts.unreadMessages > 0 ? `${counts.unreadMessages} nuevos` : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'configuracion',
      label: 'Configuración & BD',
      description: 'Supabase y datos de la sede',
      icon: Settings,
    }
  ];

  return (
    <aside className="hidden lg:block w-72 shrink-0 space-y-4">
      {/* Navigation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
        
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Menú de Administración</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all group ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-amber-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs truncate font-bold">
                    {item.label}
                  </p>
                  <p className={`text-[10px] truncate ${
                    isActive ? 'text-amber-100' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-amber-600' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? 'text-white translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sede Info Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3 shadow-sm hidden lg:block">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>Sede Principal</span>
        </div>
        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          Centro Profesional del Este, Piso 4, Ofic 46. Sabana Grande, Caracas.
        </p>
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Horario Hoy</span>
          <span className="text-emerald-400 font-semibold">8:00 AM - 7:00 PM</span>
        </div>
      </div>
    </aside>
  );
};
