import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Code2,
  Terminal,
  MessageSquare,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  Cpu,
  RefreshCw,
  Layers,
  Activity,
  Bug,
  Lightbulb,
} from 'lucide-react';
import { DEVELOPER_SUPPORT_INFO, CLINIC_INFO } from '../data/featuresData';
import { saveDeveloperTicketToDatabase } from '../utils/bookingUtils';
import {
  validateAndSanitizeName,
  validateAndSanitizeEmail,
  validateAndSanitizePhone,
  sanitizeString,
  checkRateLimit,
  verifyHumanInteraction,
} from '../utils/security';

interface DeveloperSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperSupportModal: React.FC<DeveloperSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const formRenderTimestampRef = useRef<number>(Date.now());

  const [activeTab, setActiveTab] = useState<'contact' | 'ticket' | 'faq' | 'system'>('contact');

  // Form State
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState('duda_general');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [botTrap, setBotTrap] = useState('');

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(DEVELOPER_SUPPORT_INFO.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleCopyTicket = (ticket: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticket);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2500);
    }
  };

  const validateTicketForm = () => {
    const errors: { [key: string]: string } = {};

    const nameVal = validateAndSanitizeName(nombre);
    if (!nameVal.isValid) errors.nombre = nameVal.errorMessage || 'Ingresa tu nombre.';

    const emailVal = validateAndSanitizeEmail(email);
    if (!emailVal.isValid) errors.email = emailVal.errorMessage || 'Ingresa un correo electrónico válido.';

    if (telefono.trim()) {
      const phoneVal = validateAndSanitizePhone(telefono);
      if (!phoneVal.isValid) errors.telefono = phoneVal.errorMessage || 'Número telefónico no válido.';
    }

    if (!asunto.trim() || asunto.trim().length < 4) {
      errors.asunto = 'Ingresa un asunto de al menos 4 caracteres.';
    }

    if (!mensaje.trim() || mensaje.trim().length < 10) {
      errors.mensaje = 'Describe tu consulta o reporte en al menos 10 caracteres.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    // 1. Anti-Bot check
    const humanCheck = verifyHumanInteraction(botTrap, formRenderTimestampRef.current);
    if (!humanCheck.isHuman) {
      setFeedbackError(humanCheck.reason || 'Envío bloqueado por el escudo de seguridad.');
      return;
    }

    // 2. Rate limit
    const rateCheck = checkRateLimit('dev_support_ticket', 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setFeedbackError(rateCheck.message || 'Límite de tickets alcanzado temporalmente.');
      return;
    }

    if (!validateTicketForm()) return;

    setIsSubmitting(true);
    try {
      const res = await saveDeveloperTicketToDatabase({
        nombre,
        email,
        telefono: telefono.trim() || undefined,
        tipoConsulta,
        asunto,
        mensaje,
      });

      setIsSubmitting(false);
      if (res.success && res.ticketId) {
        setCreatedTicketId(res.ticketId);
        setNombre('');
        setEmail('');
        setTelefono('');
        setAsunto('');
        setMensaje('');
        setBotTrap('');
      } else {
        setFeedbackError(res.error || 'Ocurrió un error al enviar el ticket. Intenta por WhatsApp.');
      }
    } catch {
      setIsSubmitting(false);
      setFeedbackError('Error inesperado al conectar con el servidor.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-[#121824] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-3xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                      Canal Técnico Directo
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {DEVELOPER_SUPPORT_INFO.status}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading mt-1">
                    Contacto con el Desarrollador & Soporte Técnico
                  </h3>
                  <p className="text-xs text-slate-300">
                    Atención técnica, resolución de dudas, reporte de incidencias y soporte sobre la plataforma web.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mt-5 pt-3 border-t border-slate-800/80 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'contact'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Canales de Contacto</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ticket')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'ticket'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Enviar Ticket / Consulta</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'faq'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Preguntas Técnicas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('system')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'system'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Estado del Sistema</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Direct Contact Channels */}
          {activeTab === 'contact' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp Direct Dev */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                        Respuesta Inmediata
                      </span>
                      <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      WhatsApp con el Desarrollador
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Chatea directamente con el encargado técnico de la web para asistencia rápida con reservas, consultas de código o soporte.
                    </p>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                      Horario: {DEVELOPER_SUPPORT_INFO.supportHours}
                    </p>
                  </div>

                  <a
                    href={DEVELOPER_SUPPORT_INFO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Abrir Chat de WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>

                {/* Email Support */}
                <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                        Correo Oficial
                      </span>
                      <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      Correo de Soporte & Desarrollo
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Envía capturas de pantalla, sugerencias de nuevas características o reportes formales por correo electrónico.
                    </p>
                    <div className="mt-2 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 break-all">
                      {DEVELOPER_SUPPORT_INFO.email}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <a
                      href={`mailto:${DEVELOPER_SUPPORT_INFO.email}?subject=Consulta%20T%C3%A9cnica%20-%20EQUILIBRA`}
                      className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Escribir Email</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 text-xs font-semibold"
                      title="Copiar correo"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Info Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Tiempo de respuesta promedio: <strong className="text-slate-900 dark:text-white">{DEVELOPER_SUPPORT_INFO.responseTime}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('ticket')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>¿Prefieres enviar un formulario en la web?</span>
                  <span>→</span>
                </button>
              </div>

              {/* Developer Team Credits & Standards */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                <div>
                  Desarrollado para <strong className="text-slate-700 dark:text-slate-300">EQUILIBRA C.A.</strong> • Versión {DEVELOPER_SUPPORT_INFO.version}
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Seguridad & Privacidad Auditada</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Send Support Ticket Form */}
          {activeTab === 'ticket' && (
            <div className="p-6 sm:p-8 space-y-5">
              {createdTicketId ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                      ¡Ticket de Soporte Recibido!
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      El equipo técnico ha recibido tu consulta. Nos pondremos en contacto a través de tu correo electrónico.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">ID de Ticket:</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                      {createdTicketId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTicket(createdTicketId)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title="Copiar Ticket ID"
                    >
                      {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setCreatedTicketId(null)}
                      className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-colors"
                    >
                      Crear otra consulta
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  {/* Invisible Honeypot */}
                  <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                    <input
                      type="text"
                      name="ticket_bot_trap"
                      tabIndex={-1}
                      value={botTrap}
                      onChange={(e) => setBotTrap(e.target.value)}
                    />
                  </div>

                  {feedbackError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{feedbackError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Tu Nombre *
                      </label>
                      <input
                        type="text"
                        maxLength={60}
                        value={nombre}
                        onChange={(e) => {
                          setNombre(e.target.value);
                          if (formErrors.nombre) {
                            const err = { ...formErrors };
                            delete err.nombre;
                            setFormErrors(err);
                          }
                        }}
                        placeholder="Ej. Carlos Mendoza"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      {formErrors.nombre && (
                        <p className="text-[11px] text-rose-500 mt-1">{formErrors.nombre}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Correo de Respuesta *
                      </label>
                      <input
                        type="email"
                        maxLength={100}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (formErrors.email) {
                            const err = { ...formErrors };
                            delete err.email;
                            setFormErrors(err);
                          }
                        }}
                        placeholder="tu@correo.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-rose-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tipo de Consulta */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Tipo de Consulta
                      </label>
                      <select
                        value={tipoConsulta}
                        onChange={(e) => setTipoConsulta(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="duda_general">Duda sobre la plataforma</option>
                        <option value="reporte_error">Reportar un error o bug</option>
                        <option value="problema_reserva">Problema con reserva o calendario</option>
                        <option value="validacion_cita">Ayuda validando mi código de cita</option>
                        <option value="sugerencia_mejora">Sugerencia o nueva función</option>
                        <option value="otro">Otro motivo técnico</option>
                      </select>
                    </div>

                    {/* Teléfono opcional */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Teléfono / WhatsApp (Opcional)
                      </label>
                      <input
                        type="tel"
                        maxLength={25}
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej. +58 412 1234567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Asunto */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={asunto}
                      onChange={(e) => {
                        setAsunto(e.target.value);
                        if (formErrors.asunto) {
                          const err = { ...formErrors };
                          delete err.asunto;
                          setFormErrors(err);
                        }
                      }}
                      placeholder="Ej. No pude descargar el archivo de calendario .ICS"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    {formErrors.asunto && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.asunto}</p>
                    )}
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Detalle de la Consulta o Incidencia *
                    </label>
                    <textarea
                      rows={3}
                      maxLength={1500}
                      value={mensaje}
                      onChange={(e) => {
                        setMensaje(e.target.value);
                        if (formErrors.mensaje) {
                          const err = { ...formErrors };
                          delete err.mensaje;
                          setFormErrors(err);
                        }
                      }}
                      placeholder="Indícanos los pasos que realizaste, dispositivo o navegador utilizado y cualquier detalle relevante..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                    />
                    {formErrors.mensaje && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.mensaje}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Enviando Ticket Seguro...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar Ticket al Desarrollador</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab 3: Technical FAQs */}
          {activeTab === 'faq' && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>¿Qué hago si olvidé mi código de cita?</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Puedes abrir el <strong>Portal de Validación de Citas</strong> e ingresar el número de teléfono con el que te registraste, o escribirnos directamente al WhatsApp de soporte para que el administrador verifique tu reserva en la agenda.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>¿Mis datos médicos y personales están protegidos?</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Sí. La plataforma utiliza cifrado SSL de 256 bits, sanitización estricta de entradas y enmascaramiento de PII para evitar la exposición no autorizada de correos o teléfonos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bug className="w-4 h-4 text-rose-500" />
                  <span>¿Cómo reportar un fallo en el calendario o en la web?</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Usa la pestaña <strong>"Enviar Ticket / Consulta"</strong> o escríbenos directamente a <code>{DEVELOPER_SUPPORT_INFO.email}</code>. Resolveremos cualquier anomalía con alta prioridad.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: System Status & Diagnostic Info */}
          {activeTab === 'system' && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Versión de Software:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{DEVELOPER_SUPPORT_INFO.version}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Estado de Servidores:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    100% Operacional (99.9% Uptime)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Tecnologías Empleadas:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] block mt-1">
                    {DEVELOPER_SUPPORT_INFO.techStack}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Soporte Técnico de EQUILIBRA C.A.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
