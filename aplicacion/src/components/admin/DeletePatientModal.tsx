import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, UserX, ShieldAlert } from 'lucide-react';
import { PatientRecord } from '../../types';

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord | null;
  onConfirmDelete: (patientId: string) => Promise<void> | void;
}

export const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onConfirmDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !patient) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onConfirmDelete(patient.id);
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-auto">
        
        {/* Warning Icon & Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Trash2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              ¿Eliminar Paciente del Sistema?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Esta acción eliminará el expediente clínico de:
            </p>
          </div>
        </div>

        {/* Patient card summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <p className="font-bold text-slate-900 dark:text-white text-sm">
            {patient.nombre} {patient.apellido} {patient.cedula ? `(${patient.cedula})` : ''}
          </p>
          <p className="text-slate-500">📞 {patient.telefono}</p>
          <p className="text-slate-500">✉️ {patient.email}</p>
          {patient.documents && patient.documents.length > 0 && (
            <p className="text-amber-600 dark:text-amber-400 font-semibold pt-1">
              ⚠️ Contiene {patient.documents.length} registro(s) PDF adjuntos.
            </p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>
            Esta acción no se puede deshacer. Se removerán los datos de contacto y el historial de documentos clínicos asociados a este paciente.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs shadow-md shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
