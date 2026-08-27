import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Stethoscope, 
  Grid2X2,
  Plus
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface MobileBottomNavProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onOpenMoreMenu: () => void;
  onOpenNewAppointment: () => void;
  counts: {
    appointmentsToday: number;
    appointmentsTotal: number;
    patientsTotal: number;
    unreadMessages: number;
  };
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMoreMenu,
  onOpenNewAppointment,
  counts,
}) => {
  const isMoreActive = ['servicios', 'mensajes', 'configuracion', 'especialistas'].includes(activeTab);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* 1. Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-amber-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${activeTab === 'dashboard' ? 'scale-110 bg-amber-100/60 dark:bg-amber-950/60' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Inicio</span>
        </button>

        {/* 2. Citas */}
        <button
          onClick={() => onSelectTab('citas')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'citas'
              ? 'text-amber-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg relative transition-transform ${activeTab === 'citas' ? 'scale-110 bg-amber-100/60 dark:bg-amber-950/60' : ''}`}>
            <CalendarDays className="w-5 h-5" />
            {counts.appointmentsToday > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                {counts.appointmentsToday}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Citas</span>
        </button>

        {/* 3. Center FAB / New Appointment */}
        <button
          onClick={onOpenNewAppointment}
          className="flex flex-col items-center justify-center -mt-5 group"
          title="Agendar Nueva Cita"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 group-active:scale-95 transition-transform border-2 border-white dark:border-slate-900">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">Agendar</span>
        </button>

        {/* 4. Pacientes */}
        <button
          onClick={() => onSelectTab('pacientes')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'pacientes'
              ? 'text-amber-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg relative transition-transform ${activeTab === 'pacientes' ? 'scale-110 bg-amber-100/60 dark:bg-amber-950/60' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Pacientes</span>
        </button>

        {/* 5. Más Menu */}
        <button
          onClick={onOpenMoreMenu}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isMoreActive
              ? 'text-amber-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg relative transition-transform ${isMoreActive ? 'scale-110 bg-amber-100/60 dark:bg-amber-950/60' : ''}`}>
            <Grid2X2 className="w-5 h-5" />
            {counts.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">
            {isMoreActive ? (activeTab === 'especialistas' ? 'Staff' : activeTab === 'servicios' ? 'Tarifas' : activeTab === 'mensajes' ? 'Leads' : 'Ajustes') : 'Más'}
          </span>
        </button>

      </div>
    </div>
  );
};
