import { PatientRecord } from '../types';

const PATIENTS_STORAGE_KEY = 'equilibra_registered_patients';

export const INITIAL_REGISTERED_PATIENTS: PatientRecord[] = [];

export function getStoredPatients(): PatientRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: PatientRecord[] = JSON.parse(raw);
    // Filter out legacy demo/seed patients if any exist in cache
    const filtered = (parsed || []).filter(
      (p) => !p.id.startsWith('pat_00') && !p.id.startsWith('pat_seed_') && !p.id.startsWith('seed_')
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Error reading patients from localStorage:', e);
    return [];
  }
}

export function saveStoredPatient(patient: PatientRecord): PatientRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredPatients();
    const existingIndex = current.findIndex((p) => p.id === patient.id);
    let updated: PatientRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...patient };
    } else {
      updated = [patient, ...current];
    }
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('equilibra_patients_updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Error saving patient:', e);
    return getStoredPatients();
  }
}

export function deleteStoredPatient(patientId: string): PatientRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredPatients();
    const updated = current.filter((p) => p.id !== patientId);
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('equilibra_patients_updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Error deleting patient:', e);
    return getStoredPatients();
  }
}
