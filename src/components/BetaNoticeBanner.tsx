import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Megaphone,
  AlertTriangle,
  Bug,
  X,
  Send,
  CheckCircle2,
  Phone,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  Smartphone,
  ExternalLink,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import { recordSecurityEvent, sanitizeString } from '../utils/security';
import { CLINIC_INFO } from '../data/featuresData';

export const BetaNoticeBanner: React.FC = () => {
  // Pop-up modal state - automatically open on load
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(() => {
    // Show pop-up if not dismissed in this session
    const seen = sessionStorage.getItem('equilibra_popup_dismissed');
    return !seen;
  });

  const [activeTab, setActiveTab] = useState<'announcement' | 'report'>('announcement');
  const [errorDescription, setErrorDescription] = useState<string>('');
  const [reporterContact, setReporterContact] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [dontShowAgainSession, setDontShowAgainSession] = useState<boolean>(false);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    if (dontShowAgainSession) {
      sessionStorage.setItem('equilibra_popup_dismissed', 'true');
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorDescription.trim()) return;

    recordSecurityEvent({
      action: 'SUPPORT_TICKET_SENT',
      severity: 'WARNING',
      details: `Reporte de error beta enviado: "${sanitizeString(errorDescription, 200)}" por [${sanitizeString(reporterContact, 50) || 'Anónimo'}].`,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setErrorDescription('');
      setReporterContact('');
      setActiveTab('announcement');
      setIsPopupOpen(false);
    }, 2200);
  };

  return (
    <>
      {/* 1. Floating Quick-Trigger Pill to re-open pop-up anytime */}
      <div className="fixed bottom-20 left-4 z-40">
        <button
          type="button"
          onClick={() => {
            setActiveTab('announcement');
            setIsPopupOpen(true);
          }}
          className="group flex items-center gap-2 py-2 px-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xl hover:shadow-2xl border-2 border-white dark:border-slate-800 transition-all duration-200 hover:scale-105 active:scale-95"
          title="Ver Anuncio Oficial de Fase de Pruebas"
          aria-label="Abrir anuncio oficial de fase de pruebas"
        >
          <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
            <Megaphone className="w-3 h-3" />
          </div>
          <span className="font-bold tracking-tight">Anuncio: Fase de Pruebas</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-900 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
          </span>
        </button>
      </div>

      {/* 2. Main Pop-Up Announcement Modal */}
      <AnimatePresence>
        {isPopupOpen && (
          <div
            id="beta-announcement-popup"
            className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
            onClick={handleClosePopup}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            >
              {/* Header with warm gradient */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-5 sm:p-6 text-slate-950 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                <div className="flex items-start justify-between relative z-10 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg shrink-0">
                      <Megaphone className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                          COMUNICADO OFICIAL
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/30 text-slate-950 text-[10px] font-bold uppercase">
                          Beta Activa
                        </span>
                      </div>
                      <h2 className="font-extrabold font-heading text-lg sm:text-xl text-slate-950 leading-tight">
                        Fase de Pruebas & Calidad
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClosePopup}
                    className="p-2 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition-colors shrink-0"
                    aria-label="Cerrar anuncio"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Subheader tab selector if user wants to report */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-950/10 relative z-10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcement')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'announcement'
                        ? 'bg-slate-950 text-amber-400 shadow-md'
                        : 'bg-slate-950/15 text-slate-950 hover:bg-slate-950/25'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Comunicado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('report')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'report'
                        ? 'bg-slate-950 text-amber-400 shadow-md'
                        : 'bg-slate-950/15 text-slate-950 hover:bg-slate-950/25'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Reportar Detalle o Error</span>
                  </button>
                </div>
              </div>

              {/* Pop-up Body: Announcement Tab */}
              {activeTab === 'announcement' && (
                <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                      ¡Bienvenido a <strong>EQUILIBRA Fisioterapia & Bienestar Integral</strong>!
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                      Actualmente nos encontramos en <strong>fase de pruebas y optimización digital</strong> para garantizar la máxima precisión clínica, seguridad y comodidad en tu experiencia.
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2.5">
                      <CalendarCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">Citas en Tiempo Real</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Agendamiento interactivo inmediato</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">Gestión y Validación</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Por correo, teléfono o código</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Si experimentas algún detalle visual o función que desees reportar, puedes usar la pestaña <strong>Reportar Error</strong> o contactarnos directamente por WhatsApp.
                    </span>
                  </div>

                  {/* Session preference */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="dont-show-again"
                      checked={dontShowAgainSession}
                      onChange={(e) => setDontShowAgainSession(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                    />
                    <label
                      htmlFor="dont-show-again"
                      className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none"
                    >
                      No volver a mostrar este aviso durante esta sesión
                    </label>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <a
                      href={`https://wa.me/584126388484?text=${encodeURIComponent(
                        'Hola equipo EQUILIBRA, estoy visitando la web y tengo una consulta o sugerencia durante la fase beta.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>WhatsApp Oficial</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleClosePopup}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span>¡Entendido, Continuar!</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Pop-up Body: Report Tab */}
              {activeTab === 'report' && (
                <div className="p-5 sm:p-6 space-y-4">
                  {isSubmitted ? (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                        ¡Reporte Registrado!
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Muchísimas gracias por ayudarnos a perfeccionar la plataforma clínica.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendReport} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          ¿Qué detalle o error encontraste? *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={errorDescription}
                          onChange={(e) => setErrorDescription(e.target.value)}
                          placeholder="Describe qué ocurrió, en qué botón o sección falló..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Tu Contacto (Teléfono o Correo - Opcional)
                        </label>
                        <input
                          type="text"
                          value={reporterContact}
                          onChange={(e) => setReporterContact(e.target.value)}
                          placeholder="Ej. 04126388484 o tu@correo.com"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveTab('announcement')}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          Volver
                        </button>

                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Reporte</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
