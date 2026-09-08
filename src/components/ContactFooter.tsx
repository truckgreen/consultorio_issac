import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Phone,
  Clock,
  Calendar,
  Mail,
  Activity,
  ArrowUp,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Code2,
  ShieldCheck,
  Lock,
  Search,
  KeyRound,
  Smartphone,
  Instagram,
  Sparkles,
} from 'lucide-react';
import { CLINIC_INFO } from '../data/featuresData';
import { saveContactMessageToDatabase } from '../utils/bookingUtils';
import {
  sanitizeString,
  validateAndSanitizeName,
  validateAndSanitizeEmail,
  validateAndSanitizePhone,
  checkRateLimit,
  verifyHumanInteraction,
} from '../utils/security';

interface ContactFooterProps {
  onOpenBooking: () => void;
  onOpenPrivacyModal?: () => void;
  onOpenPatientPortal?: () => void;
  onOpenSpecialistAccess?: () => void;
  onOpenDeveloperSupport?: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  onOpenBooking,
  onOpenPrivacyModal,
  onOpenPatientPortal,
  onOpenSpecialistAccess,
  onOpenDeveloperSupport,
}) => {
  const formRenderTimestampRef = useRef<number>(Date.now());

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [botTrap, setBotTrap] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    // 1. Anti-Bot Honeypot check
    const humanCheck = verifyHumanInteraction(botTrap, formRenderTimestampRef.current);
    if (!humanCheck.isHuman) {
      setContactError(humanCheck.reason || 'Envío automatizado bloqueado por seguridad.');
      return;
    }

    // 2. Rate Limiting (max 5 contact messages per 10 minutes)
    const rateCheck = checkRateLimit('contact_form', 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setContactError(rateCheck.message || 'Límite de mensajes alcanzado temporalmente.');
      return;
    }

    // 3. Validation and sanitization
    const nameVal = validateAndSanitizeName(contactName);
    if (!nameVal.isValid) {
      setContactError(nameVal.errorMessage || 'Ingresa un nombre válido.');
      return;
    }

    const emailVal = validateAndSanitizeEmail(contactEmail);
    if (!emailVal.isValid) {
      setContactError(emailVal.errorMessage || 'Ingresa un correo electrónico válido.');
      return;
    }

    if (contactPhone.trim()) {
      const phoneVal = validateAndSanitizePhone(contactPhone);
      if (!phoneVal.isValid) {
        setContactError(phoneVal.errorMessage || 'Ingresa un teléfono válido.');
        return;
      }
    }

    const cleanMsg = sanitizeString(contactMessage, 800);
    if (!cleanMsg || cleanMsg.length < 5) {
      setContactError('Por favor describe tu consulta en al menos 5 caracteres.');
      return;
    }

    setContactSending(true);

    const res = await saveContactMessageToDatabase({
      nombre: nameVal.sanitizedValue,
      email: emailVal.sanitizedValue,
      telefono: contactPhone.trim() ? sanitizeString(contactPhone, 30) : undefined,
      mensaje: cleanMsg,
    });

    setContactSending(false);
    if (res.success) {
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
      setBotTrap('');
      formRenderTimestampRef.current = Date.now();
      setTimeout(() => setContactSuccess(false), 5000);
    } else {
      setContactError(res.error || 'No se pudo enviar el mensaje. Intenta de nuevo.');
    }
  };

  return (
    <footer id="contacto" className="relative bg-[#0b0f17] text-white pt-16 pb-12 overflow-hidden">
      {/* Top Wave SVG Separator from previous section */}
      <div className="absolute top-0 inset-x-0 overflow-hidden leading-none pointer-events-none opacity-40">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-8 sm:h-12 text-amber-500/20 fill-current"
        >
          <path d="M0,0 C150,60 350,-40 500,40 C650,120 900,10 1200,30 L1200,0 L0,0 Z" />
        </svg>
      </div>

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top CTA Banner matching the flyer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 p-8 sm:p-12 text-slate-950 shadow-2xl shadow-amber-500/15 flex flex-col md:flex-row items-center justify-between gap-8 border border-amber-300/60">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/20 blur-2xl pointer-events-none" />

          <div className="max-w-xl text-center md:text-left relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/15 text-slate-950 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Atención Inmediata
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-heading">
              Reserva tu cita ¡Ahora!
            </h2>
            <p className="text-sm sm:text-base font-semibold text-slate-900/90 mt-2">
              Comienza tu proceso de rehabilitación activa, fisioterapia o entrenamiento en Sabana Grande, Caracas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto relative z-10">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 py-4 text-base font-black text-white bg-slate-950 hover:bg-slate-900 active:scale-95 rounded-full shadow-2xl shadow-slate-950/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Agendar en Línea</span>
            </button>

            <a
              href={`tel:${CLINIC_INFO.phoneRaw}`}
              className="w-full sm:w-auto px-6 py-4 text-base font-extrabold text-slate-950 bg-white/80 hover:bg-white active:scale-95 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-slate-950/15 shadow-md"
            >
              <Phone className="w-5 h-5" />
              <span>{CLINIC_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Information Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-slate-800/80">
          {/* Brand Info & Address (Col 1-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-400/20">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-widest uppercase font-heading text-white">
                  {CLINIC_INFO.name}
                </span>
                <span className="text-xs text-amber-400 font-bold tracking-wider uppercase -mt-0.5">
                  Centro de Fisioterapia & Bienestar
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              “{CLINIC_INFO.motto}”
            </p>

            {/* Address box */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                  Ubicación de la Clínica:
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-snug">
                  {CLINIC_INFO.address.country}, {CLINIC_INFO.address.city}, {CLINIC_INFO.address.zone}, {CLINIC_INFO.address.building}, {CLINIC_INFO.address.floor}.
                </p>
              </div>
            </div>

            {/* Direct Phone & Social Icons */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Teléfono de Citas:</div>
                  <div className="text-sm sm:text-base font-bold text-white">{CLINIC_INFO.phoneDisplay}</div>
                </div>
              </div>

              {/* Social Media Badges */}
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Equilibra"
                  className="w-9 h-9 rounded-xl bg-slate-700/60 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-pink-500 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/584242724617"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp de Equilibra"
                  className="w-9 h-9 rounded-xl bg-slate-700/60 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Direct Form (Col 5-8) */}
          <div className="lg:col-span-5 bg-slate-800/50 p-6 sm:p-7 rounded-3xl border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold uppercase tracking-wider text-xs">
                <Mail className="w-4 h-4" />
                <span>Mensaje Directo al Equipo Médico</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                SSL Seguro
              </span>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3.5">
              {/* Invisible Honeypot */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="footer_honeypot_trap"
                  tabIndex={-1}
                  value={botTrap}
                  onChange={(e) => setBotTrap(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    maxLength={25}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Ej. 0412-1234567"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  maxLength={100}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mensaje o Consulta Clínica
                </label>
                <textarea
                  rows={2}
                  required
                  maxLength={800}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="¿En qué motivo clínico o evaluación podemos orientarte?"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all shadow-inner resize-none"
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
                  <span>¡Mensaje protegido y recibido! Nos comunicaremos contigo pronto.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={contactSending}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-98 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-400/20"
              >
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>{contactSending ? 'Cifrando y Enviando...' : 'Enviar Consulta Segura'}</span>
              </button>
            </form>
          </div>

          {/* Opening Hours & Direct Portals (Col 9-12) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold uppercase tracking-wider text-xs">
              <Clock className="w-4 h-4" />
              <span>Horarios del Centro</span>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 space-y-2">
              {CLINIC_INFO.hours.map((h, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs py-1 border-b border-slate-700/40 last:border-0"
                >
                  <span className="text-slate-300 font-medium">{h.day}:</span>
                  <span className="text-amber-300 font-black">{h.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Security Portals */}
            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenBooking}
                className="w-full py-3 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                <span>Agendar Cita en Línea</span>
              </button>

              {onOpenPatientPortal && (
                <button
                  onClick={onOpenPatientPortal}
                  className="w-full py-2.5 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Portal de Validación de Citas</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                {onOpenPrivacyModal && (
                  <button
                    onClick={onOpenPrivacyModal}
                    className="flex-1 py-2 text-[11px] font-bold text-slate-300 hover:text-amber-400 bg-slate-800/60 rounded-xl border border-slate-700/60 transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Privacidad ARCO</span>
                  </button>
                )}

                {onOpenSpecialistAccess && (
                  <button
                    onClick={onOpenSpecialistAccess}
                    className="flex-1 py-2 text-[11px] font-bold text-slate-300 hover:text-amber-400 bg-slate-800/60 rounded-xl border border-slate-700/60 transition-colors flex items-center justify-center gap-1"
                  >
                    <KeyRound className="w-3 h-3 text-indigo-400" />
                    <span>Especialistas</span>
                  </button>
                )}
              </div>

              {onOpenDeveloperSupport && (
                <button
                  onClick={onOpenDeveloperSupport}
                  className="w-full py-2 text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Soporte Técnico / Contacto Desarrollador</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright and compliance */}
        <div className="pt-8 flex flex-col gap-4 text-xs text-slate-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
              <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Contacto Directo & Asistencia</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/584242724617"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-300 hover:text-green-200 transition-all text-[11px] font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat Oficial · +58 424 272 4617</span>
              </a>

              {onOpenDeveloperSupport && (
                <button
                  onClick={onOpenDeveloperSupport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-medium transition-colors"
                >
                  <Code2 className="w-3 h-3 text-indigo-400" />
                  <span>Dudas / Soporte Desarrollador</span>
                </button>
              )}

              {onOpenPrivacyModal && (
                <button
                  onClick={onOpenPrivacyModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Seguridad Certificada</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 font-medium">
            <div>
              © {new Date().getFullYear()} EQUILIBRA C.A. Todos los derechos reservados. Sabana Grande, Caracas, Venezuela.
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 text-slate-300 font-bold transition-all"
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
