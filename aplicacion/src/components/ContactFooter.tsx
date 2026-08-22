import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { CLINIC_INFO } from '../data/equilibraData';
import { sendContactMessageToSupabase } from '../lib/supabase';

export const ContactFooter: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);
    try {
      await sendContactMessageToSupabase({
        name,
        email,
        phone,
        message
      });
      setSentSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setTimeout(() => setSentSuccess(false), 5000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <footer id="contacto" className="bg-slate-900 text-white pt-20 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-column contact & info section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-800">
          
          {/* Left Column: Clinic Contact Cards */}
          <div className="lg:col-span-6 space-y-8">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                <MapPin className="w-3.5 h-3.5" />
                <span>Ubicación & Contacto</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Estamos listos para atenderte en Caracas
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Visítanos en nuestras instalaciones o contáctanos por WhatsApp para resolver dudas sobre tratamientos o agendar directamente.
              </p>
            </div>

            {/* Direct Action Cards */}
            <div className="space-y-4">
              
              {/* Address card */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">Dirección de la Clínica</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {CLINIC_INFO.addressFull}
                  </p>
                  <a
                    href={CLINIC_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 mt-2"
                  >
                    <span>Ver en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Phone and WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center gap-3 text-amber-400 mb-2">
                    <Phone className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Teléfono Directo</span>
                  </div>
                  <a
                    href={`tel:${CLINIC_INFO.phoneRaw}`}
                    className="text-base font-bold text-white hover:text-amber-400 transition-colors"
                  >
                    {CLINIC_INFO.phoneDisplay}
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center gap-3 text-emerald-400 mb-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">WhatsApp Oficial</span>
                  </div>
                  <a
                    href={CLINIC_INFO.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <span>Chat en Vivo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Hours Card */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Horarios de Atención</span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  {CLINIC_INFO.hours.map((h, i) => (
                    <p key={i} className="flex items-center justify-between">
                      <span>{h.split(':')[0]}</span>
                      <span className="font-semibold text-white">{h.substring(h.indexOf(':') + 1)}</span>
                    </p>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-6">
            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl">
              
              <h3 className="text-xl font-black text-white">
                Envíanos un Mensaje Directo
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ¿Tienes una consulta específica o solicitud corporativa? Responderemos en menos de 24 horas.
              </p>

              {sentSuccess ? (
                <div className="mt-6 p-6 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-center space-y-2 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">¡Mensaje Enviado con Éxito!</h4>
                  <p className="text-xs text-emerald-200">
                    Tu consulta ha sido guardada en nuestra base de datos Supabase. Nos comunicaremos contigo a la brevedad.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="+58 412..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mensaje o Consulta *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="¿En qué podemos ayudarte?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando mensaje...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Consulta</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-wider">{CLINIC_INFO.name}</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/equilibrave"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>{CLINIC_INFO.instagram}</span>
            </a>
            <span>•</span>
            <a
              href={`mailto:${CLINIC_INFO.email}`}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{CLINIC_INFO.email}</span>
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};
