import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Clock, Calendar, Mail, Activity, ArrowUp, Send, CheckCircle2, AlertCircle, MessageCircle, Code2 } from 'lucide-react';
import { CLINIC_INFO } from '../data/featuresData';
import { APP_IMAGES } from '../data/images';
import { saveContactMessageToDatabase } from '../utils/bookingUtils';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface ContactFooterProps {
  onOpenBooking: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({ onOpenBooking }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError('Por favor completa tu nombre, correo y mensaje.');
      return;
    }

    setContactSending(true);
    setContactError(null);

    const res = await saveContactMessageToDatabase({
      nombre: contactName.trim(),
      email: contactEmail.trim(),
      telefono: contactPhone.trim(),
      mensaje: contactMessage.trim(),
    });

    setContactSending(false);
    if (res.success) {
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
      setTimeout(() => setContactSuccess(false), 5000);
    } else {
      setContactError(res.error || 'No se pudo enviar el mensaje. Intenta de nuevo.');
    }
  };

  return (
    <footer id="contacto" className="relative bg-slate-900 text-white pt-20 pb-12 overflow-hidden">
      
      {/* Top CTA Banner matching the flyer ("Reserva tu cita ¡Ahora!") */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 p-8 sm:p-12 text-slate-950 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/15 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-3">
              Atención Inmediata
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-heading">
              Reserva tu cita ¡Ahora!
            </h2>
            <p className="text-sm sm:text-base font-medium text-slate-900/90 mt-2">
              Comienza tu proceso de rehabilitación activa, fisioterapia o entrenamiento en Sabana Grande, Caracas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white bg-slate-950 hover:bg-slate-900 active:scale-95 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Agendar en Línea</span>
            </button>

            <a
              href={`tel:${CLINIC_INFO.phoneRaw}`}
              className="w-full sm:w-auto px-6 py-4 text-base font-bold text-slate-950 bg-white/70 hover:bg-white active:scale-95 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-slate-950/20"
            >
              <Phone className="w-5 h-5" />
              <span>{CLINIC_INFO.phoneDisplay}</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main Footer Information Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-slate-800">
          
          {/* Brand Info & Address (Col 1-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 shadow-md">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-widest uppercase font-heading text-white">
                  {CLINIC_INFO.name}
                </span>
                <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase -mt-1">
                  Centro de Fisioterapia & Bienestar
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              “{CLINIC_INFO.motto}”
            </p>

            {/* Address box from flyer */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                  Ubicación de la Clínica:
                </h4>
                <p className="text-sm text-slate-300 leading-snug">
                  {CLINIC_INFO.address.country}, {CLINIC_INFO.address.city}, {CLINIC_INFO.address.zone}, {CLINIC_INFO.address.building}, {CLINIC_INFO.address.floor}.
                </p>
              </div>
            </div>

            {/* Direct Phone */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Teléfono de Citas:</div>
                  <div className="text-base font-bold text-white">{CLINIC_INFO.phoneDisplay}</div>
                </div>
              </div>
              <a
                href={`tel:${CLINIC_INFO.phoneRaw}`}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-full transition-colors"
              >
                Llamar
              </a>
            </div>
          </div>

          {/* Quick Contact / Message Form (Col 5-8) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Mail className="w-4 h-4" />
              <span>Envíanos una Consulta o Mensaje</span>
            </div>

            <form onSubmit={handleSendMessage} className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ej. Ana Pérez"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Tu Correo
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="ana@ejemplo.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+58 412 0000000"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Mensaje o Consulta
                </label>
                <textarea
                  rows={2}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="¿En qué podemos orientarte?"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {contactError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}

              {contactSuccess && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>¡Mensaje recibido! Nos comunicaremos pronto.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={contactSending}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{contactSending ? 'Enviando...' : 'Enviar Consulta'}</span>
              </button>
            </form>
          </div>

          {/* Opening Hours & Direct Links (Col 9-12) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Clock className="w-4 h-4" />
              <span>Horarios del Centro</span>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/80 space-y-2">
              {CLINIC_INFO.hours.map((h, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs py-1 border-b border-slate-700/50 last:border-0"
                >
                  <span className="text-slate-300 font-medium">{h.day}:</span>
                  <span className="text-amber-300 font-bold">{h.time}</span>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md"
              >
                Agendar Cita en Línea
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright and back-to-top */}
        <div className="pt-8 flex flex-col gap-5 text-xs text-slate-400">
          {/* Contact links row — more prominent */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span>Contacto Directo</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Admin WhatsApp */}
              <a
                href="https://wa.me/584242724617"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-green-600/25 hover:bg-green-600/40 border border-green-500/50 text-green-300 hover:text-green-200 transition-all text-sm font-bold shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Admin · +58 424-2724617</span>
              </a>
              {/* Developer WhatsApp — destacado */}
              <a
                href="https://wa.me/gr/ZVOTHXPPR7DJ1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-500/25 hover:bg-blue-500/40 border border-blue-400/60 text-blue-300 hover:text-blue-200 transition-all text-sm font-bold shadow-sm"
              >
                <Code2 className="w-4 h-4" />
                <span>Soporte Técnico · Desarrollador</span>
              </a>
            </div>
          </div>

          {/* Copyright & back-to-top */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © {new Date().getFullYear()} EQUILIBRA C.A. Todos los derechos reservados. Sabana Grande, Caracas, Venezuela.
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <span>Volver arriba</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>


      </div>
    </footer>
  );
};
