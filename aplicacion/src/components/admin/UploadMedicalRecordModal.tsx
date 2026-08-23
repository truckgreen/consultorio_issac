import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Calendar,
  Tag,
  Loader2,
  FileCheck
} from 'lucide-react';
import { MedicalRecordDocument, PatientRecord } from '../../types';
import { fileToDataUrl, formatBytes } from '../../utils/pdfUtils';

interface UploadMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord | null;
  onSaveDocument: (newDocument: MedicalRecordDocument) => Promise<void> | void;
}

export const UploadMedicalRecordModal: React.FC<UploadMedicalRecordModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSaveDocument
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MedicalRecordDocument['category']>('informe');
  const [uploadedBy, setUploadedBy] = useState('Lic. Isaac Jewsiejew');
  const [specialistNotes, setSpecialistNotes] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !patient) return null;

  const handleFileChange = async (file: File) => {
    setErrorMsg(null);

    // Validate type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Por favor selecciona un archivo en formato PDF (.pdf).');
      return;
    }

    // Size limit check (e.g. 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('El archivo excede el tamaño máximo permitido de 15 MB.');
      return;
    }

    try {
      setIsProcessing(true);
      const dataUrl = await fileToDataUrl(file);
      setSelectedFile(file);
      setFileDataUrl(dataUrl);

      // Auto fill title if empty
      if (!title) {
        const cleanName = file.name
          .replace(/\.pdf$/i, '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        setTitle(cleanName);
      }
    } catch (e) {
      setErrorMsg('Error al leer el archivo PDF. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileDataUrl) {
      setErrorMsg('Debes adjuntar un archivo PDF.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Ingresa un título para el documento.');
      return;
    }

    const newDoc: MedicalRecordDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      patientId: patient.id,
      title: title.trim(),
      category,
      fileName: selectedFile.name,
      fileSize: formatBytes(selectedFile.size),
      fileType: 'application/pdf',
      fileData: fileDataUrl,
      uploadedAt: documentDate,
      uploadedBy: uploadedBy.trim(),
      specialistNotes: specialistNotes.trim()
    };

    setIsProcessing(true);
    await onSaveDocument(newDoc);
    setIsProcessing(false);
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setSelectedFile(null);
    setFileDataUrl('');
    setTitle('');
    setCategory('informe');
    setSpecialistNotes('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Subir Registro Médico PDF
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anexar expediente para <strong>{patient.nombre} {patient.apellido}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Drag and drop zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Archivo Clínico (Formato PDF) *
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                  isDragOver
                    ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-amber-500/80 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Haz clic para seleccionar o arrastra tu PDF aquí
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Informes traumatológicos, resonancias, radiografías, analíticas o recetas (Máx. 15MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatBytes(selectedFile.size)} • PDF Listo para guardar
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileDataUrl('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-semibold text-xs transition-colors"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Título / Nombre del Estudio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Resonancia Magnética de Rodilla Derecha"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Categoría Médica
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="informe">Informe Médico / Evolución</option>
                <option value="resonancia">Resonancia Magnética (RM)</option>
                <option value="radiografia">Radiografía (RX)</option>
                <option value="laboratorio">Laboratorio / Analítica</option>
                <option value="receta">Receta / Indicación</option>
                <option value="consentimiento">Consentimiento Informado</option>
                <option value="otro">Otro Estudio / Anexo</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fecha del Estudio / Emisión
              </label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Doctor / Specialist in Charge */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Especialista / Médico Emisor
            </label>
            <input
              type="text"
              placeholder="Ej: Lic. Isaac Jewsiejew o Dr. Rubén Torrealba"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Specialist Clinical Notes on this Document */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observaciones Clínicas / Hallazgos Clave
            </label>
            <textarea
              rows={2}
              placeholder="Resumen de hallazgos del PDF, indicaciones específicas o notas de seguimiento..."
              value={specialistNotes}
              onChange={(e) => setSpecialistNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando PDF...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar en Expediente</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
