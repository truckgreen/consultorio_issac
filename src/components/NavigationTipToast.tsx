import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, X, ArrowUp, Sparkles } from 'lucide-react';

interface NavigationTipToastProps {
  durationMs?: number;
  delayMs?: number;
}

export const NavigationTipToast: React.FC<NavigationTipToastProps> = ({
  durationMs = 7000,
  delayMs = 1500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check if user already dismissed it this session
    const alreadyDismissed = sessionStorage.getItem('equilibra_nav_tip_dismissed');
    if (alreadyDismissed) return;

    // Show after slight delay so page loads first
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(showTimer);
  }, [delayMs]);

  useEffect(() => {
    if (!isVisible || isPaused) return;

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, durationMs);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isPaused, durationMs]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('equilibra_nav_tip_dismissed', 'true');
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          role="status"
          aria-live="polite"
          aria-label="Consejo de navegación"
          initial={{ opacity: 0, y: -25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.92 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="fixed top-20 sm:top-24 right-4 sm:right-8 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-white/95 dark:bg-[#121824]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-400/40 dark:border-amber-500/30 p-4 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Header indicator & close */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-400">
                <Compass className="w-4 h-4 animate-spin [animation-duration:12s]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Guía de navegación
              </span>
            </div>
            
            <button
              onClick={handleDismiss}
              aria-label="Cerrar aviso de navegación"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main message */}
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-snug mb-3 font-medium">
            💡 Recuerda que también puedes <strong className="text-amber-700 dark:text-amber-300 font-semibold">desplazarte cómodamente</strong> entre todas las secciones, servicios, equipo médico y citas utilizando el <strong className="text-slate-900 dark:text-white">menú superior</strong>.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleScrollToTop}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Ver menú arriba</span>
            </button>

            <button
              onClick={handleDismiss}
              className="text-xs font-medium px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Entendido
            </button>
          </div>

          {/* Auto-dismiss animated progress bar */}
          {!isPaused && (
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: durationMs / 1000, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 origin-left"
            />
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
