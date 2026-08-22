import React from 'react';
import { 
  X, 
  Stethoscope, 
  Tag, 
  MessageSquare, 
  Settings, 
  Database, 
  Download, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';
import { SupabaseConfig } from '../../types';

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onExportCsv: () => void;
  onExportJsonBackup: () => void;
  onLoadDemoData: () => void;
  unreadMessagesCount: number;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  supabaseConfig,
  onOpenSupabaseModal,
  isDarkMode,
  onToggleDarkMode,
  onExportCsv,
  onExportJsonBackup,
  onLoadDemoData,
  unreadMessagesCount,
}) => {
  if (!isOpen) return null;

  const handleNavigate = (tab: AdminTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5">
        
        {/* Header with Grab Handle */}
        <div>
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm">
                E
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Módulos de Administración
                </h3>
                <p className="text-[11px] text-slate-500">
                  EQUILIBRA • Sede Sabana Grande
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
        </div>

        {/* Modules Grid */}
        <div className="space-y-2">
          
          {/* Especialistas & Staff */}
          <button
            onClick={() => handleNavigate('especialistas')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
              activeTab === 'especialistas'
                ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'especialistas' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'}`}>
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Especialistas & Staff Médico</p>
                <p className={`text-[10px] ${activeTab === 'especialistas' ? 'text-amber-100' : 'text-slate-400'}`}>
                  9 Profesionales y turnos clínicos
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'especialistas' ? 'bg-white text-amber-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              9
            </span>
          </button>

          {/* Servicios & Tarifas */}
          <button
            onClick={() => handleNavigate('servicios')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
              activeTab === 'servicios'
                ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'servicios' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'}`}>
                <Tag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Catálogo de Servicios & Tarifas</p>
                <p className={`text-[10px] ${activeTab === 'servicios' ? 'text-amber-100' : 'text-slate-400'}`}>
                  Precios en $ USD de las 9 disciplinas
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeTab === 'servicios' ? 'text-white' : 'text-slate-400'}`} />
          </button>

          {/* Consultas & Leads */}
          <button
            onClick={() => handleNavigate('mensajes')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
              activeTab === 'mensajes'
                ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'mensajes' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-600'}`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Consultas & Leads de Pacientes</p>
                <p className={`text-[10px] ${activeTab === 'mensajes' ? 'text-amber-100' : 'text-slate-400'}`}>
                  Bandeja de entrada con respuesta WhatsApp
                </p>
              </div>
            </div>
            {unreadMessagesCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {unreadMessagesCount} nuevos
              </span>
            ) : (
              <ChevronRight className={`w-4 h-4 ${activeTab === 'mensajes' ? 'text-white' : 'text-slate-400'}`} />
            )}
          </button>

          {/* Configuración & Supabase Cloud */}
          <button
            onClick={() => handleNavigate('configuracion')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
              activeTab === 'configuracion'
                ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'configuracion' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-600'}`}>
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Configuración & Supabase Cloud</p>
                <p className={`text-[10px] ${activeTab === 'configuracion' ? 'text-amber-100' : 'text-slate-400'}`}>
                  Base de datos, respaldos y credenciales
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeTab === 'configuracion' ? 'text-white' : 'text-slate-400'}`} />
          </button>

        </div>

        {/* Quick Operations Strip */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Base de Datos:</span>
            <button
              onClick={() => {
                onClose();
                onOpenSupabaseModal();
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
              }`}
            >
              {supabaseConfig.isConnected ? '● Supabase Conectado' : '● Modo Híbrido Local'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300">Tema Visual:</span>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
          </div>
        </div>

        {/* Sede Contact Info */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Sede Sabana Grande, Centro Profesional del Este, Piso 4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-500" />
            <span>+58 414 239.88.99 • Lun a Sáb</span>
          </div>
        </div>

      </div>
    </div>
  );
};
