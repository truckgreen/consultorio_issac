import React from 'react';
import { motion } from 'motion/react';
import { Home, Calendar, MessageCircle, ArrowLeft, Activity, Search } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface NotFoundPageProps {
  onGoHome: () => void;
  onOpenBooking: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome, onOpenBooking }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#faf9f6] dark:bg-[#0c1017] text-slate-800 dark:text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white dark:bg-[#111823] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/10 text-center relative z-10"
      >
        {/* Visual 404 Graphic with Caduceus / Activity Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
          <Activity className="w-10 h-10 animate-pulse" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
          Error 404 · Ruta no encontrada
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight mb-3">
          Equilibra perdió el equilibrio
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
          La página que buscas no existe o ha sido reubicada. En EQUILIBRA te ayudamos a recuperar el equilibrio de tu bienestar.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              trackEvent('404_go_home', 'navigation');
              onGoHome();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>

          <button
            onClick={() => {
              trackEvent('404_open_booking', 'cta');
              onOpenBooking();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Agendar Cita</span>
          </button>
        </div>

        {/* WhatsApp Direct Help Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>¿Necesitas orientación clínica inmediata?</span>
          <a
            href="https://wa.me/584242724617"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Escríbenos</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
