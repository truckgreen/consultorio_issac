import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck, Check, Settings2, X, ExternalLink } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  decided: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'equilibra_cookies_consent';

export const CookieBanner: React.FC<{
  onOpenPrivacyPolicy: () => void;
  onOpenLegalNotice: () => void;
}> = ({ onOpenPrivacyPolicy, onOpenLegalNotice }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Show after a brief 1.2s delay for seamless entrance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Could not read cookie consent:', e);
    }
  }, []);

  // Listen for custom trigger to reopen preferences from the footer
  useEffect(() => {
    const handleReopen = () => {
      setShowPreferences(true);
      setIsVisible(true);
    };
    window.addEventListener('equilibra_open_cookie_settings', handleReopen);
    return () => window.removeEventListener('equilibra_open_cookie_settings', handleReopen);
  }, []);

  const savePreferences = (prefs: { essential: boolean; analytics: boolean }) => {
    const fullPrefs: CookiePreferences = {
      essential: true,
      analytics: prefs.analytics,
      decided: true,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullPrefs));
    } catch (err) {
      console.warn('Could not save cookie preferences:', err);
    }
    trackEvent('cookie_consent_saved', 'engagement', prefs.analytics ? 'all_accepted' : 'essential_only');
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, analytics: true });
  };

  const handleAcceptEssential = () => {
    savePreferences({ essential: true, analytics: false });
  };

  const handleSaveCustom = () => {
    savePreferences({ essential: true, analytics: analyticsEnabled });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 pointer-events-auto"
        role="region"
        aria-label="Aviso de Cookies y Privacidad"
      >
        <div className="bg-white/95 dark:bg-[#111823]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-slate-900/20 text-slate-900 dark:text-slate-100">
          {!showPreferences ? (
            <div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Cookie className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Aviso de Privacidad y Cookies</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Utilizamos cookies técnicas obligatorias para el agendamiento y guardado de citas, y cookies de métricas anónimas para optimizar la experiencia clínica.{' '}
                    <button
                      type="button"
                      onClick={onOpenPrivacyPolicy}
                      className="text-amber-600 dark:text-amber-400 underline font-medium hover:text-amber-700 dark:hover:text-amber-300"
                    >
                      Política de Privacidad
                    </button>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shadow-sm transition-all text-center"
                >
                  Aceptar todas
                </button>
                <button
                  type="button"
                  onClick={handleAcceptEssential}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors text-center"
                >
                  Solo necesarias
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreferences(true)}
                  className="py-2 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Configurar opciones de cookies"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Ajustes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Preferencias de Cookies</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Essential Cookies */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Cookies Técnicas & Esenciales
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Garantizan la reserva de citas, sesión médica y modo visual.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0">
                    Siempre activas
                  </span>
                </div>

                {/* Analytical Cookies */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Cookies Analíticas Clínicas
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Medición estadística de navegación y velocidad de carga sin recolectar datos personales.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <button type="button" onClick={onOpenLegalNotice} className="hover:underline">
                    Aviso Legal
                  </button>
                  <span>·</span>
                  <button type="button" onClick={onOpenPrivacyPolicy} className="hover:underline">
                    Privacidad
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="py-1.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  Guardar selección
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
