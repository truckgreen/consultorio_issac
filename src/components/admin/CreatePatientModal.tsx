import React, { useState } from 'react';
import {
  X,
  UserPlus,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  MapPin,
  HeartPulse,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { PatientRecord, MedicalRecordDocument } from '../../types';
import { fileToDataUrl, formatBytes } from '../../utils/pdfUtils';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (newPatient: PatientRecord) => Promise<void> | void;
}

export const CreatePatientModal: React.FC<CreatePatientModalProps> = ({
  isOpen,
  onClose,
  onSavePatient
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('+58 ');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState<'M' | 'F' | 'OTRO'>('M');
  const [direccion, setDireccion] = useState('');

  // Emergency contact
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoParentesco, setContactoParentesco] = useState('');

  // Clinical Profile
  const [medicalConditions, setMedicalConditions] = useState('');
  const [alergias, setAlergias] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [medicamentosActuales, setMedicamentosActuales] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Optional PDF attachment on creation
  const [initialPdfFile, setInitialPdfFile] = useState<File | null>(null);
  const [initialPdfDataUrl, setInitialPdfDataUrl] = useState<string>('');
  const [initialPdfTitle, setInitialPdfTitle] = useState('');
  const [initialPdfCategory, setInitialPdfCategory] = useState<MedicalRecordDocument['category']>('informe');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate age if birth date is entered
  const calculateAge = (dob: string) => {
    if (!dob) return undefined;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : undefined;
  };

  const handlePdfSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Solo se permiten archivos en formato PDF.');
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setInitialPdfFile(file);
        setInitialPdfDataUrl(dataUrl);
        if (!initialPdfTitle) {
          setInitialPdfTitle(file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '));
        }
      } catch {
        setErrorMsg('No se pudo leer el archivo PDF.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('Por favor ingresa al menos el nombre del paciente.');
      return;
    }

    const patientId = `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const age = calculateAge(fechaNacimiento);

    const documents: MedicalRecordDocument[] = [];
    if (initialPdfFile && initialPdfDataUrl) {
      documents.push({
        id: `doc_${Date.now()}_init`,
        patientId,
        title: initialPdfTitle.trim() || initialPdfFile.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '),
        category: initialPdfCategory,
        fileName: initialPdfFile.name,
        fileSize: formatBytes(initialPdfFile.size),
        fileType: 'application/pdf',
        fileData: initialPdfDataUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'Recepción / Admisión',
        specialistNotes: 'Documento adjuntado durante el registro inicial del paciente.'
      });
    }

    const finalApellido = apellido.trim();
    const finalTelefono = telefono.trim() && telefono.trim() !== '+58' ? telefono.trim() : '+58';
    const finalEmail = email.trim() || `${nombre.toLowerCase().trim()}${finalApellido ? '.' + finalApellido.toLowerCase().trim() : ''}@correo.com`;

    const newPatient: PatientRecord = {
      id: patientId,
      nombre: nombre.trim(),
      apellido: finalApellido,
      cedula: cedula.trim() || undefined,
      telefono: finalTelefono,
      email: finalEmail,
      fechaNacimiento: fechaNacimiento || undefined,
      edad: age,
      genero,
      direccion: direccion.trim() || undefined,
      contactoEmergencia: contactoNombre ? {
        nombre: contactoNombre.trim(),
        telefono: contactoTelefono.trim(),
        parentesco: contactoParentesco.trim() || 'Familiar'
      } : undefined,
      totalAppointments: 0,
      completedAppointments: 0,
      lastVisit: 'Sin visitas aún',
      firstVisitDate: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      medicalConditions: medicalConditions.trim() || 'Ingreso para valoración fisioterapéutica y bienestar integral.',
      alergias: alergias.trim() || 'Ninguna conocida',
      antecedentes: antecedentes.trim() || 'Sin antecedentes relevantes reportados.',
      medicamentosActuales: medicamentosActuales.trim() || 'Ninguno.',
      clinicalNotes: clinicalNotes.trim() || 'Paciente registrado en el directorio clínico de EQUILIBRA.',
      documents,
      createdAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    await onSavePatient(newPatient);
    setIsSubmitting(false);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setNombre('');
    setApellido('');
    setCedula('');
    setTelefono('+58 ');
    setEmail('');
    setFechaNacimiento('');
    setGenero('M');
    setDireccion('');
    setContactoNombre('');
    setContactoTelefono('');
    setContactoParentesco('');
    setMedicalConditions('');
    setAlergias('');
    setAntecedentes('');
    setMedicamentosActuales('');
    setClinicalNotes('');
    setInitialPdfFile(null);
    setInitialPdfDataUrl('');
    setInitialPdfTitle('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Registrar Nuevo Paciente
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Creación de expediente clínico digital en EQUILIBRA
              </p>
            </div>
          </div>

          <button
            onClick={() => { handleReset(); onClose(); }}
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
          
          {/* Section 1: Personal Information */}
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
                  placeholder="Ej: Carlos"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Apellido</label>
                <input
                  type="text"
                  placeholder="Ej: Silva"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cédula / DNI</label>
                <input
                  type="text"
                  placeholder="Ej: V-19.876.543"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono Móvil (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="+58 412 123.45.67"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
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
                placeholder="Ej: Av. Francisco de Miranda, Chacao, Caracas"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>2. Contacto de Emergencia (Opcional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: María Silva"
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="+58 414 000.11.22"
                  value={contactoTelefono}
                  onChange={(e) => setContactoTelefono(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parentesco</label>
                <input
                  type="text"
                  placeholder="Ej: Madre / Cónyuge / Hermano"
                  value={contactoParentesco}
                  onChange={(e) => setContactoParentesco(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Background & Medical Notes */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <HeartPulse className="w-4 h-4 text-amber-500" />
              <span>3. Perfil Clínico & Motivo de Consulta</span>
            </h3>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Diagnóstico / Motivo de Consulta Inicial (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Lumbalgia mecánica recurrente tras esfuerzo físico. Contractura paravertebral..."
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alergias Conocidas</label>
                <input
                  type="text"
                  placeholder="Ej: AINES, Penicilina, Ninguna..."
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medicamentos Actuales</label>
                <input
                  type="text"
                  placeholder="Ej: Relajante muscular, antiinflamatorio..."
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
                placeholder="Ej: Cirugía de meniscos en 2021, fractura de radio en la infancia..."
                value={antecedentes}
                onChange={(e) => setAntecedentes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notas Iniciales de Fisioterapia & Evolución
              </label>
              <textarea
                rows={2}
                placeholder="Observaciones de postura, rangos de movimiento, palpación o plan sugerido..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Section 4: Initial PDF Medical Record Attachment */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>4. Anexar Registro Médico en PDF (Opcional)</span>
            </h3>

            {!initialPdfFile ? (
              <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-amber-300 dark:border-amber-800 rounded-xl cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-all text-center">
                <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-amber-900 dark:text-amber-200">
                  Haz clic para adjuntar un PDF (Informe, Resonancia, Radiografía o Receta)
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handlePdfSelected}
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {initialPdfFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatBytes(initialPdfFile.size)} • PDF Adjunto
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInitialPdfFile(null);
                      setInitialPdfDataUrl('');
                      setInitialPdfTitle('');
                    }}
                    className="text-xs text-red-500 hover:underline font-bold"
                  >
                    Quitar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Título del Documento
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Resonancia de Columna"
                      value={initialPdfTitle}
                      onChange={(e) => setInitialPdfTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={initialPdfCategory}
                      onChange={(e) => setInitialPdfCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="informe">Informe Médico</option>
                      <option value="resonancia">Resonancia Magnética (RM)</option>
                      <option value="radiografia">Radiografía (RX)</option>
                      <option value="laboratorio">Laboratorio</option>
                      <option value="receta">Receta / Indicación</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { handleReset(); onClose(); }}
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
              <span>Registrar Paciente</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
