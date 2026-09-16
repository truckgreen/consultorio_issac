import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Sparkles, Clock, CheckCheck } from 'lucide-react';
import { trackWhatsAppClick } from '../utils/analytics';

export const WhatsAppFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Show polite tooltip invitation after 3 seconds on first visit
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowTooltip(true);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const defaultMessage = encodeURIComponent(
    '¡Hola EQUILIBRA! 👋 Me gustaría solicitar información sobre citas de fisioterapia, disponibilidad y valoración clínica.'
  );
  const whatsappUrl = `https://wa.me/584242724617?text=${defaultMessage}`;

  const handleClick = () => {
    trackWhatsAppClick('floating_quick_button');
    setShowTooltip(false);
    setHasInteracted(true);
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* Expandable Chat Invitation Bubble */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="mb-3 max-w-[280px] sm:max-w-xs bg-white dark:bg-[#151d2a] rounded-2xl p-3.5 shadow-2xl border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs relative"
          >
            {/* Close tooltip button */}
            <button
              onClick={() => {
                setShowTooltip(false);
                setHasInteracted(true);
              }}
              className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Cerrar mensaje"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5 pr-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">
                Atención Inmediata
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
              ¿Tienes dudas sobre tu lesión o deseas agendar tu consulta por chat? Estamos en línea.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chatear por WhatsApp</span>
            </a>

            {/* Bubble Tail arrow pointing down right */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-[#151d2a] border-r border-b border-slate-200/90 dark:border-slate-800 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main WhatsApp Floating Action Button */}
      <div className="flex items-center gap-3">
        {/* Quick Triage Shortcut Button */}
        <motion.a
          href="#triage-medico"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="btn-triage-flotante"
          aria-label="Abrir Asistente IA de Triage Médico"
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 font-extrabold text-xs shadow-xl border border-amber-400/50 backdrop-blur-md hover:bg-slate-800 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
          <span>Asistente IA</span>
        </motion.a>

        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          id="btn-whatsapp-flotante"
          aria-label="Escribir por WhatsApp a Consultorio Equilibra"
          className="relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/40 border-2 border-white/60 dark:border-slate-900/60 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        >
          {/* Pulsing ring indicator */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none" />

          {/* WhatsApp Icon */}
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm transition-transform group-hover:rotate-6" />

          {/* Online Status Green Dot */}
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 border-2 border-emerald-600" />
          </span>
        </motion.a>
      </div>
    </div>
  );
};
