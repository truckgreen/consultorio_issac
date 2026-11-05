import { PatientRecord, Appointment, PatientAppointmentStats, ClinicalTimelineEvent } from '../types';

const PATIENTS_STORAGE_KEY = 'equilibra_registered_patients';

export const INITIAL_REGISTERED_PATIENTS: PatientRecord[] = [];

/**
 * Generates a clean, professional, clinic-standard Patient ID (e.g., PAC-8392)
 */
export function generatePatientId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PAC-${randomSuffix}`;
}

/**
 * Formats any raw internal ID (e.g. pat_1730..._abc or legacy ID)
 * into a standard, clean display ID: PAC-XXXX
 */
export function formatPatientDisplayId(id?: string): string {
  if (!id) return 'PAC-0000';
  if (id.startsWith('PAC-')) return id;
  
  // Extract digits or hash letters from the id
  const clean = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const token = clean.slice(-4).padStart(4, '0');
  return `PAC-${token}`;
}

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
    // Guarantee patient has a clean ID
    const guaranteedPatient: PatientRecord = {
      ...patient,
      id: patient.id && patient.id.trim() ? patient.id : generatePatientId(),
    };

    const existingIndex = current.findIndex((p) => p.id === guaranteedPatient.id);
    let updated: PatientRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...guaranteedPatient };
    } else {
      updated = [guaranteedPatient, ...current];
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
    const updated = current.map((p) => p.id === patientId ? { ...p, archived: true } : p);
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('equilibra_patients_updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Error deleting patient:', e);
    return getStoredPatients();
  }
}

/**
 * Intelligently determines if an appointment belongs to a patient
 * Supports explicit patientId / patient_id, cedula, phone digits, email, or exact full name.
 */
export function isAppointmentOfPatient(app: Appointment, patient: PatientRecord): boolean {
  if (!app || !patient) return false;

  // 1. Direct ID match
  if (app.patientId && app.patientId === patient.id) return true;
  if (app.patient_id && app.patient_id === patient.id) return true;

  // 2. Cedula match (if both present)
  if (patient.cedula && (app as any).cedula) {
    const c1 = patient.cedula.replace(/[^0-9]/g, '');
    const c2 = String((app as any).cedula).replace(/[^0-9]/g, '');
    if (c1 && c2 && c1 === c2) return true;
  }

  // 3. Clean phone match (compare last 7-10 digits)
  if (app.telefono && patient.telefono) {
    const p1 = app.telefono.replace(/[^0-9]/g, '');
    const p2 = patient.telefono.replace(/[^0-9]/g, '');
    if (p1.length >= 7 && p2.length >= 7) {
      if (p1 === p2 || p1.endsWith(p2) || p2.endsWith(p1)) return true;
    }
  }

  // 4. Email match
  if (app.email && patient.email) {
    const e1 = app.email.trim().toLowerCase();
    const e2 = patient.email.trim().toLowerCase();
    if (e1 && e2 && e1 === e2 && !e1.includes('paciente.com')) return true;
  }

  // 5. Full name match
  const appFullName = `${app.nombre || ''} ${app.apellido || ''}`.trim().toLowerCase();
  const patientFullName = `${patient.nombre || ''} ${patient.apellido || ''}`.trim().toLowerCase();
  if (appFullName && patientFullName && appFullName === patientFullName) {
    return true;
  }

  return false;
}

/**
 * Filter all appointments for a patient and guarantee they have patientId populated
 */
export function filterAppointmentsForPatient(patient: PatientRecord, appointments: Appointment[]): Appointment[] {
  if (!patient || !Array.isArray(appointments)) return [];
  return appointments
    .filter((app) => isAppointmentOfPatient(app, patient))
    .map((app) => ({
      ...app,
      patientId: app.patientId || patient.id,
      patient_id: app.patient_id || patient.id,
    }));
}

/**
 * Calculates complete appointment metrics for a patient
 * (total booked, completed, confirmed, cancellations, rescheduled, attendance rate)
 */
export function calculatePatientAppointmentStats(
  patient: PatientRecord,
  appointments: Appointment[]
): PatientAppointmentStats {
  const patientApps = filterAppointmentsForPatient(patient, appointments);

  let completed = 0;
  let confirmed = 0;
  let pending = 0;
  let canceled = 0;
  let rescheduled = 0;
  let noShow = 0;
  let totalSpent = 0;

  for (const app of patientApps) {
    const status = (app.status || '').toLowerCase();
    
    // Check if rescheduled
    if (status === 'reprogramada' || (app.rescheduledCount && app.rescheduledCount > 0)) {
      rescheduled++;
    }

    if (status === 'completada') {
      completed++;
      const cost = typeof app.amount === 'number' ? app.amount : 35;
      totalSpent += cost;
    } else if (status === 'confirmada') {
      confirmed++;
    } else if (status === 'cancelada') {
      canceled++;
    } else if (status === 'no_asistio') {
      noShow++;
    } else {
      pending++;
    }

    // Account for explicit cancellation count on appointment
    if (app.cancellationCount && app.cancellationCount > 0 && status !== 'cancelada') {
      canceled += app.cancellationCount;
    }
  }

  // Also include cancellations stored directly on patient profile
  if (patient.cancellationCount && patient.cancellationCount > canceled) {
    canceled = patient.cancellationCount;
  }

  const attendedOrMissed = completed + canceled + noShow;
  const attendanceRate = attendedOrMissed > 0 ? Math.round((completed / attendedOrMissed) * 100) : 100;

  return {
    totalBooked: patientApps.length,
    completed,
    confirmed,
    pending,
    canceled,
    rescheduled,
    noShow,
    attendanceRate,
    totalSpent: totalSpent > 0 ? totalSpent : (patient.totalSpent || 0),
  };
}

/**
 * Enriches a patient record with up-to-date computed appointment statistics
 */
export function enrichPatientWithStats(patient: PatientRecord, appointments: Appointment[]): PatientRecord {
  const stats = calculatePatientAppointmentStats(patient, appointments);
  return {
    ...patient,
    totalAppointments: stats.totalBooked,
    completedAppointments: stats.completed,
    canceledAppointments: stats.canceled,
    rescheduledAppointments: stats.rescheduled,
    pendingAppointments: stats.pending,
    confirmedAppointments: stats.confirmed,
    attendanceRate: stats.attendanceRate,
    totalSpent: stats.totalSpent,
  };
}

/**
 * Extracts a unified, chronologically sorted timeline of all clinical events:
 * initial evaluation notes, session evolutions, EVA pain scores, and home exercises.
 */
export function extractClinicalTimeline(
  patient: PatientRecord,
  appointments: Appointment[],
  sortOrder: 'desc' | 'asc' = 'desc'
): ClinicalTimelineEvent[] {
  const patientApps = filterAppointmentsForPatient(patient, appointments);
  const events: ClinicalTimelineEvent[] = [];

  // 1. Initial Clinical Dossier Entry (if clinicalNotes or medicalConditions exist)
  if (patient.clinicalNotes || patient.medicalConditions) {
    events.push({
      id: `initial_${patient.id}`,
      date: patient.firstVisitDate || (patient.createdAt ? patient.createdAt.split('T')[0] : '2026-01-01'),
      time: '08:00 AM',
      type: 'evaluacion_inicial',
      title: 'Evaluación Inicial & Ficha Diagnóstica',
      specialistName: 'Equipo Clínico EQUILIBRA',
      serviceName: 'Fisioterapia & Diagnóstico Integral',
      evolutionNotes: patient.clinicalNotes || `Condición registrada: ${patient.medicalConditions || 'Sin observaciones'}. Antecedentes: ${patient.antecedentes || 'Ninguno'}.`,
      painScore: undefined,
      status: 'COMPLETADA',
      createdAt: patient.createdAt,
    });
  }

  // 2. Appointment Sessions & Evolutions
  for (const app of patientApps) {
    const statusLower = (app.status || '').toLowerCase();
    let eventType: ClinicalTimelineEvent['type'] = 'sesion';
    let title = app.service_title || app.serviceTitle || 'Sesión de Fisioterapia';

    if (statusLower === 'cancelada') {
      eventType = 'cancelacion';
      title = `Cita Cancelada: ${title}`;
    } else if (statusLower === 'reprogramada') {
      eventType = 'reprogramacion';
      title = `Cita Reprogramada: ${title}`;
    } else if (app.evolutionNotes) {
      eventType = 'evolucion';
      title = `Evolución Clínica: ${title}`;
    }

    const noteText = app.evolutionNotes || app.notes || (app.motivoConsulta ? `Motivo: ${app.motivoConsulta}` : undefined);

    events.push({
      id: `app_${app.id}`,
      date: app.fecha || '2026-01-01',
      time: app.hora || '09:00 AM',
      type: eventType,
      title,
      specialistName: app.specialist_name || app.specialistName || 'Lic. Isaac Jewsiejew',
      serviceName: app.service_title || app.serviceTitle || 'Fisioterapia Personalizada',
      painScore: app.painScore,
      evolutionNotes: noteText,
      homeExercises: app.homeExercises,
      status: app.status,
      appointmentCode: app.code,
      appointmentId: app.id,
      createdAt: app.createdAt || app.created_at,
    });
  }

  // Sort events chronologically
  events.sort((a, b) => {
    const timeA = new Date(`${a.date} ${a.time ? a.time.split('-')[0].trim() : '00:00'}`).getTime() || 0;
    const timeB = new Date(`${b.date} ${b.time ? b.time.split('-')[0].trim() : '00:00'}`).getTime() || 0;
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  return events;
}
