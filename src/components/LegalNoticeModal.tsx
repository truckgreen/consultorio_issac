import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Scale,
  Building2,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Globe2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { CLINIC_INFO } from '../data/featuresData';

interface LegalNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalNoticeModal: React.FC<LegalNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#111823] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
          role="dialog"
          aria-labelledby="legal-notice-title"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 id="legal-notice-title" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
                  Aviso Legal & Términos del Servicio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Información corporativa y condiciones de uso de EQUILIBRA C.A.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar aviso legal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {/* 1. Datos Identificativos */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>1. Datos Identificativos del Titular</span>
              </h4>
              <p>
                En cumplimiento con las disposiciones de transparencia mercantil y de la sociedad de la información, se hace constar que el presente sitio web es titularidad de:
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                <p><strong>Razón Social:</strong> EQUILIBRA C.A. (Centro de Fisioterapia & Bienestar Integral)</p>
                <p><strong>Domicilio Clínico:</strong> Av. Francisco de Miranda, Edif. Centro Empresarial Sabana Grande, Piso 4, Consultorio 4-B, Caracas 1050, Venezuela.</p>
                <p><strong>Teléfono de Atención:</strong> +58 424 272 4617</p>
                <p><strong>Registro de Propiedad Intelectual:</strong>(Todos los derechos reservados)</p>
              </div>
            </div>

            {/* 2. Objeto y Ámbito */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-amber-500" />
                <span>2. Objeto de la Plataforma Web</span>
              </h4>
              <p>
                La plataforma web de EQUILIBRA tiene como finalidad informar al público sobre nuestros servicios de salud y rehabilitación (fisioterapia general, deportiva, pediátrica, geriátrica, traumatología, nutrición, psicología y entrenamiento terapéutico), facilitar la reserva y gestión de citas clínicas presenciales, y permitir a los pacientes el acceso digital seguro a sus expedientes y programas terapéuticos.
              </p>
            </div>

            {/* 3. Normativa Sanitaria y Ejercicio Profesional */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-amber-500" />
                <span>3. Normativa Sanitaria y Ejercicio Profesional</span>
              </h4>
              <p>
                Todo el personal asistencial de EQUILIBRA se encuentra debidamente graduado y acreditado ante los respectivos colegios profesionales de la República Bolivariana de Venezuela:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Colegio de Fisioterapeutas de Venezuela y Ministerio del Poder Popular para la Salud (MPPS).</li>
                <li>Federación Médica Venezolana (FMV) y Colegio de Médicos del Distrito Metropolitano de Caracas para el área de Traumatología y Ortopedia.</li>
                <li>Colegio de Psicólogos y Colegio de Nutricionistas y Dietistas de Venezuela.</li>
              </ul>
            </div>

            {/* 4. Exoneración de Responsabilidad Médica */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Exención de Responsabilidad Diagnóstica en Línea</span>
              </div>
              <p className="text-xs leading-relaxed">
                Los cuestionarios interactivos, calculadoras o informaciones explicativas de este sitio web tienen carácter estrictamente educativo y orientativo. <strong>Bajo ninguna circunstancia sustituyen la valoración clínica directa, el examen físico o el criterio diagnóstico individual emitido de forma presencial por un profesional de la salud.</strong>
              </p>
            </div>

            {/* 5. Propiedad Intelectual */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>5. Propiedad Intelectual e Industrial</span>
              </h4>
              <p>
                El nombre comercial EQUILIBRA, su logotipo, diseño gráfico, iconografía, textos médicos, código fuente y elementos multimedia son propiedad exclusiva de EQUILIBRA C.A. y se encuentran debidamente certificados y registrados en Safe Creative bajo licencia con reserva de todos los derechos. Queda expresamente prohibida su reproducción, distribución o comunicación pública sin autorización previa por escrito.
              </p>
            </div>

            {/* 6. Condiciones de Agendamiento y Cancelaciones */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-500" />
                <span>6. Condiciones de Agendamiento y Cancelaciones</span>
              </h4>
              <p>
                Las reservas de citas realizadas a través de la web están sujetas a disponibilidad clínica. Conforme a nuestras políticas de respeto al tiempo de los especialistas y otros pacientes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>La primera cancelación o reprogramación con al menos 24 horas de antelación es completamente gratuita.</li>
                <li>Cancelaciones reiteradas o inasistencias sin previo aviso pueden devengar un recargo administrativo del 20% para habilitar nuevos horarios.</li>
              </ul>
            </div>

            {/* 7. Ley Aplicable */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                El presente Aviso Legal se rige por la legislación de la República Bolivariana de Venezuela. Para cualquier controversia derivada del uso del sitio web, las partes se someten a los tribunales de la ciudad de Caracas, renunciando a cualquier otro fuero que pudiera corresponderles.
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              Entendido y de acuerdo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
