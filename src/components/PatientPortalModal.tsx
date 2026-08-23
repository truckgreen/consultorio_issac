import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  CalendarCheck,
  ShieldCheck,
  MapPin,
  Lock,
  ArrowRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmedAppointment } from '../types';
import {
  getAppointmentsFromDatabase,
  getSavedAppointments,
  generateIcsCalendar,
} from '../utils/bookingUtils';
import { SERVICES_DATA } from '../data/servicesData';
import { CLINIC_INFO } from '../data/featuresData';
import {
  sanitizeString,
  checkRateLimit,
  recordSecurityEvent,
  maskSensitiveData,
} from '../utils/security';

interface PatientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: (serviceId?: string) => void;
}

export const PatientPortalModal: React.FC<PatientPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchPhoneOrEmail, setSearchPhoneOrEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [foundAppointment, setFoundAppointment] = useState<ConfirmedAppointment | null>(null);
  const [cancelStatus, setCancelStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeString(searchCode).toUpperCase().trim();
    const cleanValidator = sanitizeString(searchPhoneOrEmail).toLowerCase().trim();

    if (!cleanCode) {
      setSearchError('Por favor ingresa tu código de cita (ej. EQ-XXXX-XXXX).');
      return;
    }

    if (!cleanValidator) {
      setSearchError('Por favor ingresa tu correo o los últimos dígitos de tu teléfono registrado para validar tu identidad.');
      return;
    }

    // Rate limit check: prevent enumeration attacks
    const rateCheck = checkRateLimit('portal_lookup', 6, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      setSearchError(rateCheck.message || 'Límite de consultas excedido por seguridad.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setFoundAppointment(null);
    setCancelStatus(null);

    try {
      const all = await getAppointmentsFromDatabase();
      const fallbackLocal = getSavedAppointments();
      const pool = [...all, ...fallbackLocal];

      const match = pool.find((app) => {
        const codeMatches = app.code.toUpperCase() === cleanCode || app.id === cleanCode;
        if (!codeMatches) return false;

        // Security Validation Check: Match phone or email
        const emailMatches = app.email.toLowerCase().includes(cleanValidator);
        const cleanPhoneApp = app.telefono.replace(/[^\d]/g, '');
        const cleanPhoneInput = cleanValidator.replace(/[^\d]/g, '');
        const phoneMatches =
          cleanPhoneInput.length >= 4 && cleanPhoneApp.includes(cleanPhoneInput);

        return emailMatches || phoneMatches;
      });

      if (match) {
        setFoundAppointment(match);
        recordSecurityEvent({
          action: 'BOOKING_SUCCESS',
          severity: 'INFO',
          details: `Consulta autorizada en portal de citas para código [${match.code}].`,
        });
      } else {
        setSearchError('No encontramos una cita que coincida con el código y los datos de validación ingresados. Verifica el código e intenta nuevamente.');
        recordSecurityEvent({
          action: 'AUTH_FAILED',
          severity: 'WARNING',
          details: `Búsqueda fallida en portal de pacientes para código '${cleanCode}'.`,
        });
      }
    } catch {
      setSearchError('Error temporal al consultar los registros. Por favor intenta más tarde.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!foundAppointment) return;
    const service = SERVICES_DATA.find((s) => s.id === foundAppointment.serviceId);
    generateIcsCalendar(
      foundAppointment,
      service?.title || 'Cita Terapéutica',
      CLINIC_INFO.address.fullAddress,
      CLINIC_INFO.phoneDisplay
    );
  };

  const service = foundAppointment
    ? SERVICES_DATA.find((s) => s.id === foundAppointment.serviceId)
    : null;

  return (
    <AnimatePresence>
      <div
        id="patient-portal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Search className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-heading">
                    Portal de Verificación de Citas
                  </h2>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Acceso Seguro
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Consulta el estado de tu cita médica y descarga tu pase de atención con verificación de identidad
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Search Box */}
            <form onSubmit={handleSearch} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Código de Cita *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. EQ-8K3N-7P2W"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Correo o Teléfono de Validación *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. tu@correo.com o últimos 4 dígitos"
                    value={searchPhoneOrEmail}
                    onChange={(e) => setSearchPhoneOrEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Validación cifrada de identidad para proteger tu expediente</span>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSearching ? (
                    <span>Verificando...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Consultar Cita</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {searchError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">No se pudo autenticar la consulta</p>
                  <p className="mt-0.5">{searchError}</p>
                </div>
              </div>
            )}

            {/* Found Appointment Pass Card */}
            {foundAppointment && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-50 to-amber-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/10 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-lg space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                      Pase Oficial de Atención Clínica
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                      {service?.title || foundAppointment.serviceId}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        foundAppointment.status === 'confirmada'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {foundAppointment.status === 'confirmada'
                        ? 'Cita Confirmada'
                        : 'En Validación'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>Paciente:</strong> {foundAppointment.nombre} {foundAppointment.apellido}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>Fecha:</strong> {foundAppointment.fecha}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>Horario:</strong> {foundAppointment.hora}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>Teléfono:</strong> {maskSensitiveData('phone', foundAppointment.telefono)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>Correo:</strong> {maskSensitiveData('email', foundAppointment.email)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>Sede:</strong> Sabana Grande, Caracas
                      </span>
                    </div>
                  </div>
                </div>

                {foundAppointment.motivoConsulta && (
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <strong>Motivo o Síntoma Clínico:</strong> {foundAppointment.motivoConsulta}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleDownloadIcs}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Agregar al Calendario (.ICS)</span>
                  </button>

                  <a
                    href={`https://wa.me/584126388484?text=${encodeURIComponent(
                      `Hola EQUILIBRA, consulto sobre mi cita médica con código ${foundAppointment.code} (${foundAppointment.fecha} - ${foundAppointment.hora}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Atención por WhatsApp</span>
                  </a>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Protección Activa contra accesos no autorizados
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
