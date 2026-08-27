import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  FileText,
  Calendar,
  User,
  Tag,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { MedicalRecordDocument, PatientRecord } from '../../types';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MedicalRecordDocument | null;
  patient: PatientRecord | null;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  patient
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !doc) return null;

  const handleDownload = () => {
    try {
      const link = window.document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (e) {
      console.error('Error al descargar el PDF:', e);
      window.open(doc.fileData, '_blank');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open(doc.fileData, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleOpenExternal = () => {
    try {
      if (doc.fileData.startsWith('data:application/pdf;base64,')) {
        const base64Data = doc.fileData.replace('data:application/pdf;base64,', '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        window.open(doc.fileData, '_blank');
      }
    } catch {
      window.open(doc.fileData, '_blank');
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'informe':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'resonancia':
      case 'radiografia':
      case 'tomografia':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
      case 'laboratorio':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'receta':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'informe': return 'Informe Médico / Evolución';
      case 'resonancia': return 'Resonancia Magnética (RM)';
      case 'radiografia': return 'Radiografía (RX)';
      case 'laboratorio': return 'Laboratorio Clínico';
      case 'receta': return 'Receta / Indicación';
      case 'consentimiento': return 'Consentimiento Informado';
      default: return 'Documento Clínico';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        className={`w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
          isFullscreen
            ? 'fixed inset-2 max-w-none max-h-none h-[calc(100vh-1rem)]'
            : 'max-w-5xl h-[88vh] my-auto'
        }`}
      >
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                  {doc.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeColor(
                    doc.category
                  )}`}
                >
                  {getCategoryLabel(doc.category)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-2">
                <span>{patient ? `${patient.nombre} ${patient.apellido}` : 'Paciente'}</span>
                <span>•</span>
                <span>{doc.fileName}</span>
                <span>•</span>
                <span>{doc.fileSize}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleOpenExternal}
              title="Abrir en pestaña nueva"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Nueva Pestaña</span>
            </button>

            <button
              onClick={handlePrint}
              title="Imprimir documento"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Imprimir</span>
            </button>

            <button
              onClick={handleDownload}
              title="Descargar archivo original"
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              title="Cerrar visor"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Banner */}
        <div className="px-6 py-2.5 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <strong>Fecha:</strong> {doc.uploadedAt}
            </span>
            {doc.uploadedBy && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <strong>Especialista:</strong> {doc.uploadedBy}
              </span>
            )}
            {doc.specialistNotes && (
              <span className="text-slate-600 dark:text-slate-400 italic">
                "{doc.specialistNotes}"
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Expediente Clínico Protegido
          </span>
        </div>

        {/* PDF Embedded View Container */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex flex-col">
          {doc.fileData ? (
            <div className="w-full h-full flex flex-col relative">
              <object
                data={`${doc.fileData}#toolbar=1&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full flex-1 border-0 rounded-b-3xl"
              >
                <iframe
                  src={`${doc.fileData}#toolbar=1&navpanes=0&scrollbar=1`}
                  title={doc.title}
                  className="w-full flex-1 border-0 rounded-b-3xl"
                />
              </object>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                No se pudo cargar la vista previa del documento
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Puedes descargar el archivo directamente para visualizarlo en tu lector de PDF local.
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Descargar Documento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
