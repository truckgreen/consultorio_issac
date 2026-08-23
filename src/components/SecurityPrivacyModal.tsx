import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  X,
  Lock,
  FileCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Server,
  KeyRound,
  EyeOff,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getSecurityLogs,
  purgeLocalPatientData,
  getClientFingerprint,
} from '../utils/security';
import { getSavedAppointments } from '../utils/bookingUtils';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface SecurityPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityPrivacyModal: React.FC<SecurityPrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'policy' | 'controls' | 'audit'>('policy');
  const [purgedMessage, setPurgedMessage] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const logs = getSecurityLogs().slice(0, 15);
  const localAppointments = getSavedAppointments();
  const fingerprint = getClientFingerprint();

  const handleExportData = () => {
    const dataToExport = {
      clinica: 'EQUILIBRA - Fisioterapia & Bienestar Integral',
      fechaExportacion: new Date().toISOString(),
      huellaSesionSegura: fingerprint,
      citasRegistradas: localAppointments,
      declaracionPrivacidad:
        'Datos clínicos e individuales exportados a solicitud del titular conforme al derecho de acceso ARCO y normativas de confidencialidad médica.',
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Equilibra-Datos-Clinicos-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handlePurgeData = () => {
    if (
      window.confirm(
        '¿Deseas purgar y borrar todo el historial y copias locales de tus citas y mensajes en este navegador? Esta acción es irreversible.'
      )
    ) {
      const ok = purgeLocalPatientData();
      if (ok) {
        setPurgedMessage('Todos los registros temporales y datos personales locales han sido purgados exitosamente.');
        setTimeout(() => setPurgedMessage(null), 5000);
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        id="security-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-heading">
                    Centro de Seguridad & Privacidad Médica
                  </h2>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Estándar Clínico
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Protección de datos de salud, cifrado en tránsito y estricta confidencialidad médica
                </p>
              </div>
            </div>

            <button
              id="security-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={() => setActiveTab('policy')}
              className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'policy'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Garantías de Protección</span>
            </button>

            <button
              onClick={() => setActiveTab('controls')}
              className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'controls'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Tus Derechos de Datos (ARCO)</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Auditoría de Sesión</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
            {activeTab === 'policy' && (
              <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300">
                {/* Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
                        Cifrado SSL / TLS
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                        Transmisión 256-bit protegida contra intercepciones.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                        Anti-Bot & Rate Limit
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-0.5">
                        Escudo activo contra ataques de saturación y spam.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                        Secreto Profesional
                      </h4>
                      <p className="text-xs text-indigo-700 dark:text-indigo-400/90 mt-0.5">
                        Datos de salud confidenciales sin comercialización.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      1. Protección de Datos de Salud y Confidencialidad
                    </h3>
                    <p className="leading-relaxed text-xs sm:text-sm">
                      En <strong>EQUILIBRA</strong> tratamos toda información relacionada con tu historial clínico, motivo de consulta y citas bajo los más rigurosos principios del Secreto Profesional Médico y las normativas internacionales de protección de datos de salud (principios HIPAA / RGPD / Legislación Médica Venezolana).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4 text-amber-500" />
                      2. Saneamiento contra Inyecciones y Criptografía
                    </h3>
                    <p className="leading-relaxed text-xs sm:text-sm">
                      Todos los formularios procesan saneamiento estricto contra ataques de Cross-Site Scripting (XSS), manipulación de parámetros y saturación automatizada. Los códigos de cita se generan mediante generadores pseudoaleatorios criptográficos para evitar la predicción de identificadores de consulta.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      3. Acceso Exclusivo y Restricción a Especialistas
                    </h3>
                    <p className="leading-relaxed text-xs sm:text-sm">
                      Solo el personal clínico autorizado (médicos tratantes, fisioterapeutas y personal asistencial acreditado) tiene acceso a los expedientes para la debida atención terapéutica. No compartimos ni vendemos datos a terceros ni agencias de publicidad.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'controls' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200">
                  <h3 className="text-base font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Como paciente tienes el control absoluto de tus registros. Puedes exportar una copia estructurada de tus citas o purgar los datos almacenados en este dispositivo en cualquier momento.
                  </p>
                </div>

                {purgedMessage && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{purgedMessage}</span>
                  </div>
                )}

                {downloadSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Archivo descargado correctamente en formato JSON seguro.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export Button */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                        <Download className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Exportar Mis Datos Clínicos
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Descarga un archivo seguro con el historial de citas registradas desde este navegador.
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar Copia JSON</span>
                    </button>
                  </div>

                  {/* Purge Button */}
                  <div className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-red-950 dark:text-red-200 text-sm">
                        Purgar Registros Locales
                      </h4>
                      <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
                        Elimina permanentemente de la memoria del navegador las citas y mensajes en caché.
                      </p>
                    </div>
                    <button
                      onClick={handlePurgeData}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Borrar Memoria Local</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Identificador de Sesión Seguro:</span>
                    <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200">
                      {fingerprint}
                    </code>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ● Enlace Cifrado Activo
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Registro de Seguridad Reciente
                  </h4>

                  {logs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      No hay eventos anómalos o bloqueos registrados en esta sesión. Todo opera con normalidad.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            {log.severity === 'CRITICAL' ? (
                              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            ) : log.severity === 'WARNING' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {log.details}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Acción: {log.action} • Huella: {log.fingerprintHash}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>EQUILIBRA Security Shield v2.4</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
