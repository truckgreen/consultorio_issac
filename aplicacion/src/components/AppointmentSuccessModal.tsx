import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Calendar, Clock, MapPin, Sparkles, X, User } from 'lucide-react';
import { Appointment } from '../types';
import { CLINIC_INFO } from '../data/equilibraData';

interface AppointmentSuccessModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const AppointmentSuccessModal: React.FC<AppointmentSuccessModalProps> = ({
  appointment,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!appointment) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appointment.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white text-amber-500 flex items-center justify-center mx-auto shadow-lg mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black">¡Cita Confirmada!</h2>
          <p className="text-xs text-amber-100 mt-1">
            Tu reserva ha sido registrada y sincronizada con éxito en EQUILIBRA
          </p>
        </div>

        {/* Voucher Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Reservation Code Card */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Código de Reserva
              </span>
              <p className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-0.5">
                {appointment.code}
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Details Summary */}
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Servicio</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{appointment.service_title}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Paciente</span>
              <span className="font-semibold text-slate-900 dark:text-white">{appointment.nombre} {appointment.apellido}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Fecha y Hora</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{appointment.fecha} • {appointment.hora}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Ubicación</span>
              <span className="font-medium text-right text-slate-900 dark:text-white">Sabana Grande, Piso 4, Ofic 46</span>
            </div>
          </div>

          {/* Tips */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              📌 Recomendaciones para tu visita:
            </p>
            <p>• Asiste con ropa cómoda deportiva 10 minutos antes de tu hora.</p>
            <p>• Si posees radiografías o resonancias previas, tráelas contigo.</p>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all"
          >
            Entendido, Guardar Comprobante
          </button>

        </div>

      </div>
    </div>
  );
};
