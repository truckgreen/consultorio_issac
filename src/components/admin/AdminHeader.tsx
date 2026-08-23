import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Activity, 
  Database, 
  Moon, 
  Sun, 
  Plus, 
  Bell, 
  Eye, 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { SupabaseConfig, AdminNotification } from '../../types';
import { CLINIC_INFO } from '../../data/equilibraData';

interface AdminHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onOpenNewAppointmentModal: () => void;
  notifications: AdminNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onNavigateToTab: (tabId: string) => void;
  activeTab: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  supabaseConfig,
  onOpenSupabaseModal,
  onOpenNewAppointmentModal,
  notifications,
  onMarkNotificationAsRead,
  onNavigateToTab,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Clinic Admin Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 font-black text-xl tracking-tighter">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-950 dark:text-white">
                  EQUILIBRA
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-200 dark:border-amber-900/60">
                  Panel Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Sabana Grande, Torre Financiera, Piso 4, Ofic 46</span>
              </p>
            </div>
          </div>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSupabaseModal}
              title="Estado de conexión con Supabase Cloud"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {supabaseConfig.isConnected ? 'Supabase Conectado' : 'Modo Híbrido Local'}
              </span>
              <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Notificaciones de la Clínica
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      {unreadCount} nuevas
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No hay notificaciones</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationAsRead(n.id);
                            if (n.linkTab) onNavigateToTab(n.linkTab);
                            setShowNotifications(false);
                          }}
                          className={`p-3 rounded-xl cursor-pointer transition-all border ${
                            !n.read 
                              ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50' 
                              : 'bg-slate-50 dark:bg-slate-800/40 border-transparent hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Primary Action Button: + Nueva Cita */}
            <button
              onClick={onOpenNewAppointmentModal}
              className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Cita</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
