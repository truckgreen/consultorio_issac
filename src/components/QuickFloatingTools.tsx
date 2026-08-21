import React, { useState, useEffect } from 'react';
import { Lock, Download, Wifi } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface QuickFloatingToolsProps {
  onOpenMobileApp: () => void;
  onOpenClinicalPortal: () => void;
  onOpenPWAInstall: () => void;
}

export const QuickFloatingTools: React.FC<QuickFloatingToolsProps> = ({
  onOpenMobileApp,
  onOpenPWAInstall
}) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(StorageService.isOnline());
    const unsub = StorageService.onDatabaseChange(() => {
      setIsOnline(StorageService.isOnline());
    });
    return unsub;
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      {/* Real-time Internet Sync Indicator & PWA Download Button */}
      <button
        id="floating-btn-download-app"
        onClick={onOpenPWAInstall}
        className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-indigo-600/95 backdrop-blur-md text-white shadow-lg hover:shadow-indigo-500/30 border border-indigo-400/40 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 text-xs font-bold cursor-pointer"
        title="Descargar e instalar App EQUILIBRA en Móvil o PC"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="text-[11px]">
          Descargar App
        </span>
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'}`} />
      </button>

      {/* Discreet Admin Lock Shortcut */}
      <button
        id="floating-btn-admin-access"
        onClick={onOpenMobileApp}
        className="group flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 backdrop-blur-md text-slate-300 shadow-md hover:shadow-lg border border-slate-700/80 hover:text-white hover:border-slate-500 transition-all hover:scale-105 active:scale-95 text-xs font-medium cursor-pointer"
        title="Acceso Exclusivo Staff y Administradores de EQUILIBRA"
      >
        <Lock className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[11px] font-semibold">
          Staff
        </span>
      </button>
    </div>
  );
};
