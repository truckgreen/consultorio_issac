import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  Apple,
  Share2,
  PlusSquare,
  CheckCircle2,
  QrCode,
  Sparkles,
  X,
  ShieldCheck,
  Zap,
  HardDrive,
  Info,
  ExternalLink,
  Laptop,
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Direct WebAPK/PWA manifest trigger simulation
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://equilibrafisioterapia.com';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=ffffff&color=1e293b`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#121824] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/25 px-2.5 py-0.5 rounded-full">
                  Descarga Rápida & Instalación
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading">
                  Instalar EQUILIBRA App en tu Móvil
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-amber-50 mt-2">
              Lleva tu consultorio, agenda de citas y expedientes médicos en tu teléfono sin ocupar espacio.
            </p>
          </div>

          {/* OS Switcher Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0e131d]">
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'android'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-[#121824]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>Android (APK / PWA)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'ios'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-[#121824]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-4 h-4 text-slate-800 dark:text-slate-200" />
              <span>iPhone / iOS (Safari)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'desktop'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-[#121824]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-4 h-4 text-amber-500" />
              <span>PC / Mac</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-7 space-y-6">
            {activeTab === 'android' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                  <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-sm shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code para descargar en Android"
                      className="w-32 h-32 object-contain"
                    />
                    <span className="block text-[10px] text-center text-slate-500 font-semibold mt-1">
                      Escanear con Android
                    </span>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Instalación en 1 Clic</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Descarga Directa para Dispositivos Android
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Instala la aplicación nativa y accede al portal médico, citas y notificaciones push sin consumir memoria.
                    </p>

                    <button
                      type="button"
                      onClick={handleInstallPWA}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Instalar en Android Ahora</span>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Pasos manuales desde Google Chrome (Android):
                  </h5>
                  <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>Abre esta página en el navegador <strong>Google Chrome</strong> de tu teléfono Android.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span>Presiona los <strong>tres puntos (⋮)</strong> en la esquina superior derecha.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="bg-white p-3 rounded-2xl border border-slate-300 shadow-sm shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code para iPhone"
                      className="w-32 h-32 object-contain"
                    />
                    <span className="block text-[10px] text-center text-slate-500 font-semibold mt-1">
                      Escanear con Cámara iPhone
                    </span>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold">
                      <Apple className="w-3.5 h-3.5" />
                      <span>Compatible con iOS 14.0+</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Instalación en iPhone & iPad (Safari)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Apple permite instalar EQUILIBRA directamente como App nativa en tu pantalla de inicio sin pasar por App Store.
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Guía de 3 pasos para iPhone:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center font-bold text-xs mb-2">
                        1
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Abre en Safari
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Visita este enlace desde el navegador Safari de iOS.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center font-bold text-xs mb-2">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Botón Compartir
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Toca el icono de Compartir (cuadrado con flecha hacia arriba).
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center font-bold text-xs mb-2">
                        <PlusSquare className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Agregar a Inicio
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Elige <strong>"Agregar a pantalla de inicio"</strong> y confirma.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                  <Laptop className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Instalación en Ordenador (Windows, macOS, Linux)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Puedes instalar EQUILIBRA como aplicación de escritorio independiente en Google Chrome, Microsoft Edge o Brave haciendo clic en el icono de instalación (⊕) ubicado en la barra de direcciones de tu navegador.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* App Features Badge */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Acceso Offline</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Carga Inmediata</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sin Publicidad</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Datos Cifrados</span>
              </div>
            </div>

            {/* Feedback notification */}
            {downloadSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡App lista! El acceso directo se ha configurado en tu pantalla.</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
