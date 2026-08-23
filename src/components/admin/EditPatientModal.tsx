import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  MapPin,
  HeartPulse,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { PatientRecord } from '../../types';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord | null;
  onSaveUpdates: (patientId: string, updates: Partial<PatientRecord>) => Promise<void> | void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSaveUpdates
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState<'M' | 'F' | 'OTRO'>('M');
  const [direccion, setDireccion] = useState('');

  // Emergency Contact
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoParentesco, setContactoParentesco] = useState('');

  // Clinical Profile
  const [medicalConditions, setMedicalConditions] = useState('');
  const [alergias, setAlergias] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [medicamentosActuales, setMedicamentosActuales] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setNombre(patient.nombre || '');
      setApellido(patient.apellido || '');
      setCedula(patient.cedula || '');
      setTelefono(patient.telefono || '');
      setEmail(patient.email || '');
      setFechaNacimiento(patient.fechaNacimiento || '');
      setGenero(patient.genero || 'M');
      setDireccion(patient.direccion || '');
      setContactoNombre(patient.contactoEmergencia?.nombre || '');
      setContactoTelefono(patient.contactoEmergencia?.telefono || '');
      setContactoParentesco(patient.contactoEmergencia?.parentesco || '');
      setMedicalConditions(patient.medicalConditions || '');
      setAlergias(patient.alergias || '');
      setAntecedentes(patient.antecedentes || '');
      setMedicamentosActuales(patient.medicamentosActuales || '');
      setClinicalNotes(patient.clinicalNotes || '');
      setErrorMsg(null);
    }
  }, [patient, isOpen]);

  if (!isOpen || !patient) return null;

  const calculateAge = (dob: string) => {
    if (!dob) return patient.edad;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      setErrorMsg('El nombre y apellido son obligatorios.');
      return;
    }
    if (!telefono.trim()) {
      setErrorMsg('Ingresa un número de teléfono de contacto.');
      return;
    }

    const updates: Partial<PatientRecord> = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      cedula: cedula.trim() || undefined,
      telefono: telefono.trim(),
      email: email.trim(),
      fechaNacimiento: fechaNacimiento || undefined,
      edad: calculateAge(fechaNacimiento),
      genero,
      direccion: direccion.trim() || undefined,
      contactoEmergencia: contactoNombre ? {
        nombre: contactoNombre.trim(),
        telefono: contactoTelefono.trim(),
        parentesco: contactoParentesco.trim() || 'Familiar'
      } : undefined,
      medicalConditions: medicalConditions.trim(),
      alergias: alergias.trim(),
      antecedentes: antecedentes.trim(),
      medicamentosActuales: medicamentosActuales.trim(),
      clinicalNotes: clinicalNotes.trim()
    };

    setIsSubmitting(true);
    await onSaveUpdates(patient.id, updates);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xl flex items-center justify-center">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Editar Expediente de Paciente
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actualizar ficha clínica de <strong>{patient.nombre} {patient.apellido}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs max-h-[72vh] overflow-y-auto pr-1">
          
          {/* Personal Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <User className="w-4 h-4 text-amber-500" />
              <span>1. Datos Personales & Contacto</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cédula / Documento</label>
                <input
                  type="text"
                  placeholder="V-00.000.000"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono Móvil *</label>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha Nac.</label>
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px] focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Género</label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value as any)}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dirección / Residencia</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>2. Contacto de Emergencia</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={contactoTelefono}
                  onChange={(e) => setContactoTelefono(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parentesco</label>
                <input
                  type="text"
                  value={contactoParentesco}
                  onChange={(e) => setContactoParentesco(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Clinical Profile */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <HeartPulse className="w-4 h-4 text-amber-500" />
              <span>3. Diagnóstico Clínico & Fisioterapia</span>
            </h3>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Diagnóstico / Motivo de Consulta *
              </label>
              <textarea
                rows={2}
                required
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alergias</label>
                <input
                  type="text"
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medicamentos Actuales</label>
                <input
                  type="text"
                  value={medicamentosActuales}
                  onChange={(e) => setMedicamentosActuales(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Antecedentes Quirúrgicos / Traumatológicos
              </label>
              <input
                type="text"
                value={antecedentes}
                onChange={(e) => setAntecedentes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notas de Evolución & Fisioterapia
              </label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
