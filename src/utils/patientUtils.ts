import { PatientRecord } from '../types';

const PATIENTS_STORAGE_KEY = 'equilibra_registered_patients';

export const INITIAL_REGISTERED_PATIENTS: PatientRecord[] = [
  {
    id: 'pat_001',
    cedula: 'V-24.182.903',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    telefono: '+58 412 1234567',
    email: 'carlos.mendoza@email.com',
    fechaNacimiento: '1992-05-14',
    edad: 34,
    genero: 'M',
    direccion: 'Valencia, Carabobo - El Trigal Centro',
    contactoEmergencia: {
      nombre: 'Elena Mendoza',
      telefono: '+58 414 9876543',
      parentesco: 'Hermana',
    },
    totalAppointments: 4,
    completedAppointments: 3,
    lastVisit: '2026-08-20',
    totalSpent: 140,
    firstVisitDate: '2026-06-10',
    clinicalNotes: 'Paciente con tendinopatía rotuliana rodilla derecha. Responde positivamente a terapia manual y ejercicios excéntricos.',
    medicalConditions: 'Sin condiciones crónicas diagnosticadas.',
    alergias: 'Ninguna conocida.',
    antecedentes: 'Esguince de tobillo grado II en 2022.',
    medicamentosActuales: 'Ibuprofeno ocasional post-esfuerzo.',
    createdAt: '2026-06-10T10:00:00.000Z',
  },
  {
    id: 'pat_002',
    cedula: 'V-28.450.112',
    nombre: 'Valeria',
    apellido: 'Gómez',
    telefono: '+58 424 5558899',
    email: 'valeria.gomez@email.com',
    fechaNacimiento: '2001-11-03',
    edad: 24,
    genero: 'F',
    direccion: 'Valencia - Prebo',
    contactoEmergencia: {
      nombre: 'Roberto Gómez',
      telefono: '+58 412 3332211',
      parentesco: 'Padre',
    },
    totalAppointments: 2,
    completedAppointments: 2,
    lastVisit: '2026-08-24',
    totalSpent: 70,
    firstVisitDate: '2026-08-10',
    clinicalNotes: 'Cervicalgia postural por teletrabajo. Se realizaron técnicas de liberación miofascial y pautas ergonómicas.',
    medicalConditions: 'Tensión muscular cervical frecuente.',
    alergias: 'Alergia a AINEs (Diclofenac).',
    antecedentes: 'Ninguno quirúrgico.',
    medicamentosActuales: 'Ninguno.',
    createdAt: '2026-08-10T14:30:00.000Z',
  },
];

export function getStoredPatients(): PatientRecord[] {
  if (typeof window === 'undefined') return INITIAL_REGISTERED_PATIENTS;
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_PATIENTS));
      return INITIAL_REGISTERED_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading patients from localStorage:', e);
    return INITIAL_REGISTERED_PATIENTS;
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
