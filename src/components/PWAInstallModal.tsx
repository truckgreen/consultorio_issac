import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Monitor, 
  Share2, 
  CheckCircle2, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  Info,
  Apple,
  Sparkles
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Auto-detect OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setActiveDeviceTab('ios');
    } else if (/android/i.test(userAgent)) {
      setActiveDeviceTab('android');
    } else {
      setActiveDeviceTab('desktop');
    }

    // Listen for install prompt event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    // Check online status
    setIsOnline(StorageService.isOnline());
    const unsub = StorageService.onDatabaseChange(() => {
      setIsOnline(StorageService.isOnline());
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      unsub();
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar en este navegador, abre el menú de opciones (3 puntos en Chrome o botón Compartir en Safari) y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".');
    }
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto text-slate-900 flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 rounded-2xl bg-indigo-600/40 border border-indigo-400/40 text-indigo-300">
              <Download className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                Instalación PWA & App Móvil
              </span>
              <h3 className="text-xl font-bold text-white font-heading">
                Descargar & Probar App EQUILIBRA
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Instala la aplicación nativa en tu teléfono Android, iPhone o Computadora para gestionar citas, pacientes y consultas en tiempo real por internet.
          </p>

          {/* Real-time Internet Status Badge */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-200 font-medium">
                {isOnline ? '🟢 Conectado al Servidor (Sincronización en Tiempo Real)' : '🟡 Modo Local Activo'}
              </span>
            </div>
            <span className="text-[11px] text-indigo-300 font-mono">
              v1.2.0 PWA
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* 1-Click Install Button if supported by browser */}
          {deferredPrompt && !isInstalled && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">Instalación Rápida con 1 Clic</h4>
                  <p className="text-xs text-indigo-700">Tu navegador permite instalar la app directamente.</p>
                </div>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Ahora</span>
              </button>
            </div>
          )}

          {/* Device Tabs Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Selecciona tu dispositivo para ver los pasos de instalación:
            </label>

            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setActiveDeviceTab('android')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeDeviceTab === 'android'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Android</span>
              </button>

              <button
                onClick={() => setActiveDeviceTab('ios')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeDeviceTab === 'ios'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Apple className="w-4 h-4 text-slate-800" />
                <span>iPhone / iPad</span>
              </button>

              <button
                onClick={() => setActiveDeviceTab('desktop')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeDeviceTab === 'desktop'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4 text-indigo-600" />
                <span>PC / Mac</span>
              </button>
            </div>
          </div>

          {/* Instructions per device */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {activeDeviceTab === 'android' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">1</span>
                  <p>Abre este sitio web en <strong>Google Chrome</strong> o <strong>Brave</strong> desde tu teléfono.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">2</span>
                  <p>Toca el menú de los <strong>3 puntos verticales (⋮)</strong> en la esquina superior derecha.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">3</span>
                  <p>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla principal"</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">4</span>
                  <p>¡Listo! Se creará el icono de <strong>EQUILIBRA</strong> en tu pantalla de inicio como una app nativa.</p>
                </div>
              </div>
            )}

            {activeDeviceTab === 'ios' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">1</span>
                  <p>Abre la página web en el navegador <strong>Safari</strong> de tu iPhone o iPad.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">2</span>
                  <p>Toca el botón <strong>Compartir</strong> (icono de cuadro con flecha hacia arriba en la barra inferior).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">3</span>
                  <p>Baja en el menú y selecciona <strong>"Añadir a la pantalla de inicio" (Add to Home Screen)</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">4</span>
                  <p>Pulsa <strong>"Añadir"</strong> en la esquina superior derecha.</p>
                </div>
              </div>
            )}

            {activeDeviceTab === 'desktop' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">1</span>
                  <p>En Google Chrome o Microsoft Edge, busca el <strong>icono de pantalla con flecha (📥)</strong> al final de la barra de direcciones.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">2</span>
                  <p>Haz clic en <strong>"Instalar EQUILIBRA"</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">3</span>
                  <p>La aplicación se abrirá en su propia ventana sin marcos de navegador para una experiencia de escritorio ultrarrápida.</p>
                </div>
              </div>
            )}
          </div>

          {/* Copy link to open on phone */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">¿Quieres probarla en tu teléfono ahora mismo?</p>
              <p className="text-[11px] text-slate-400">Copia el enlace y ábrelo en tu navegador móvil.</p>
            </div>

            <button
              onClick={handleCopyAppUrl}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Cifrado HTTPS & Sincronización en la Nube
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
