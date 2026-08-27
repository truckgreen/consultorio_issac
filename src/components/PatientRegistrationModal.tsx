import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserPlus,
  X,
  Check,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  FileText,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { PatientRecord } from '../types';
import { saveStoredPatient } from '../utils/patientUtils';
import { recordSecurityEvent } from '../utils/security';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientSaved: (patient: PatientRecord) => void;
  editingPatient?: PatientRecord | null;
  currentUserName?: string;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onPatientSaved,
  editingPatient,
  currentUserName = 'Especialista',
}) => {
  const [cedula, setCedula] = useState(editingPatient?.cedula || '');
  const [nombre, setNombre] = useState(editingPatient?.nombre || '');
  const [apellido, setApellido] = useState(editingPatient?.apellido || '');
  const [telefono, setTelefono] = useState(editingPatient?.telefono || '+58 ');
  const [email, setEmail] = useState(editingPatient?.email || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(editingPatient?.fechaNacimiento || '');
  const [edad, setEdad] = useState<number | string>(editingPatient?.edad || '');
  const [genero, setGenero] = useState<'M' | 'F' | 'OTRO'>(editingPatient?.genero || 'F');
  const [direccion, setDireccion] = useState(editingPatient?.direccion || '');
  
  // Emergency contact
  const [emergencyName, setEmergencyName] = useState(editingPatient?.contactoEmergencia?.nombre || '');
  const [emergencyPhone, setEmergencyPhone] = useState(editingPatient?.contactoEmergencia?.telefono || '');
  const [emergencyRelation, setEmergencyRelation] = useState(editingPatient?.contactoEmergencia?.parentesco || '');

  // Clinical history & notes
  const [clinicalNotes, setClinicalNotes] = useState(editingPatient?.clinicalNotes || '');
  const [medicalConditions, setMedicalConditions] = useState(editingPatient?.medicalConditions || '');
  const [alergias, setAlergias] = useState(editingPatient?.alergias || '');
  const [antecedentes, setAntecedentes] = useState(editingPatient?.antecedentes || '');
  const [medicamentosActuales, setMedicamentosActuales] = useState(editingPatient?.medicamentosActuales || '');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nombre.trim() || !apellido.trim()) {
      setFormError('Por favor ingresa el nombre y apellido del paciente.');
      return;
    }
    if (!telefono.trim() || telefono.trim().length < 7) {
      setFormError('Por favor ingresa un número de teléfono válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const patientId = editingPatient?.id || `pat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newRecord: PatientRecord = {
        id: patientId,
        cedula: cedula.trim() || undefined,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        email: email.trim() || `${nombre.toLowerCase().replace(/\s+/g, '')}@paciente.com`,
        fechaNacimiento: fechaNacimiento || undefined,
        edad: edad ? Number(edad) : undefined,
        genero: genero,
        direccion: direccion.trim() || undefined,
        contactoEmergencia: emergencyName.trim()
          ? {
              nombre: emergencyName.trim(),
              telefono: emergencyPhone.trim(),
              parentesco: emergencyRelation.trim(),
            }
          : undefined,
        totalAppointments: editingPatient?.totalAppointments || 0,
        completedAppointments: editingPatient?.completedAppointments || 0,
        lastVisit: editingPatient?.lastVisit || new Date().toISOString().split('T')[0],
        totalSpent: editingPatient?.totalSpent || 0,
        firstVisitDate: editingPatient?.firstVisitDate || new Date().toISOString().split('T')[0],
        clinicalNotes: clinicalNotes.trim() || undefined,
        medicalConditions: medicalConditions.trim() || undefined,
        alergias: alergias.trim() || undefined,
        antecedentes: antecedentes.trim() || undefined,
        medicamentosActuales: medicamentosActuales.trim() || undefined,
        createdAt: editingPatient?.createdAt || new Date().toISOString(),
      };

      saveStoredPatient(newRecord);
      onPatientSaved(newRecord);

      recordSecurityEvent({
        action: 'PATIENT_RECORD_CREATED',
        severity: 'INFO',
        details: `${editingPatient ? 'Ficha de paciente actualizada' : 'Nuevo paciente registrado'} [${newRecord.nombre} ${newRecord.apellido}] por [${currentUserName}].`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      setFormError('Ocurrió un error al guardar el registro del paciente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-white dark:bg-[#101726] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 px-6 py-4 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading">
                  {editingPatient ? 'Editar Historia / Expediente del Paciente' : 'Registrar Nuevo Paciente en Clínica'}
                </h3>
                <p className="text-xs text-slate-300">
                  Completa los datos personales, historial clínico y contacto del paciente (sin crear cita).
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar text-xs">
            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Section 1: Datos Personales */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
                <User className="w-4 h-4 text-amber-500" />
                <span className="uppercase tracking-wider text-[11px]">1. Identificación y Datos Personales</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cédula / Documento ID:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: V-24.123.456"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nombres <span className="text-amber-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: María Alejandra"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Apellidos <span className="text-amber-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Rodríguez Pérez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Teléfono / WhatsApp <span className="text-amber-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+58 412 1234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    placeholder="maria@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Edad:
                    </label>
                    <input
                      type="number"
                      placeholder="28"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Género:
                    </label>
                    <select
                      value={genero}
                      onChange={(e) => setGenero(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                    >
                      <option value="F">Femenino</option>
                      <option value="M">Masculino</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Dirección de Residencia:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Urb. El Viñedo, Valencia, Edo. Carabobo"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Section 2: Contacto de Emergencia */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="uppercase tracking-wider text-[11px]">2. Contacto de Emergencia / Acompañante</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nombre del Contacto:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Rodríguez"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Teléfono de Emergencia:
                  </label>
                  <input
                    type="tel"
                    placeholder="+58 414 0000000"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Parentesco / Relación:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Cónyuge / Padre / Hermano"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Antecedentes Clínicos & Anamnesis */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
                <FileText className="w-4 h-4 text-sky-500" />
                <span className="uppercase tracking-wider text-[11px]">3. Historial Clínico, Anamnesis y Alergias</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Alergias o Reacciones Farmacológicas:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Alergia a Penicilina, AINEs, látex..."
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Medicamentos Actuales:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Antihipertensivos, analgésicos, protectores..."
                    value={medicamentosActuales}
                    onChange={(e) => setMedicamentosActuales(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Patologías Crónicas / Diagnósticos Previos:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Hipertensión, diabetes, hernias discales, cirugías previas..."
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Antecedentes Quirúrgicos / Traumáticos:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Cirugía LCA rodilla derecha (2021), fractura clavícula..."
                    value={antecedentes}
                    onChange={(e) => setAntecedentes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notas Clínicas / Observaciones Iniciales:
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre evaluación postural, movilidad articular, objetivos terapéuticos, recomendaciones..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all active:scale-98 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{editingPatient ? 'Guardar Cambios' : 'Registrar y Guardar Paciente'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
