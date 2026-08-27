import { SpecialistAbsence, SpecialistUser, TeamMember } from '../types';
import { SPECIALISTS_ACCOUNTS } from '../data/specialistsAuthData';
import { TEAM_MEMBERS } from '../data/teamData';

const AVAILABILITY_STORAGE_KEY = 'equilibra_specialists_availability';

export const SERVICE_DEFAULT_SPECIALIST_MAP: Record<string, string> = {
  'fisioterapia': 'isaac-jewsiejew',
  'fisioterapia-deportiva': 'isaac-jewsiejew',
  'fisioterapia-pediatrica': 'marivid-requena',
  'fisioterapia-geriatrica': 'laury-torrealba',
  'traumatologia': 'ruben-torrealba',
  'psicologia': 'cristina-flores',
  'nutricion': 'stephani-salina',
  'entrenamiento-funcional': 'gabriela-rodriguez',
  'boxeo': 'indira-acevedo',
};

// Category fallbacks in case primary specialist is on medical leave
export const CATEGORY_FALLBACK_SPECIALISTS: Record<string, string[]> = {
  fisioterapia: ['gabriela-rodriguez', 'kareinys-martinez', 'rebecca-triana', 'isaac-jewsiejew'],
  medicina: ['ruben-torrealba'],
  psicologia: ['cristina-flores'],
  nutricion: ['stephani-salina'],
  entrenamiento: ['indira-acevedo', 'gabriela-rodriguez'],
  movimiento: ['indira-acevedo', 'gabriela-rodriguez'],
};

export function getStoredSpecialistsAvailability(): Record<string, SpecialistAbsence> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading specialist availability:', e);
    return {};
  }
}

export function saveSpecialistAvailability(specialistId: string, absence: SpecialistAbsence): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredSpecialistsAvailability();
    current[specialistId] = absence;
    localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('equilibra_specialist_availability_changed', { detail: { specialistId, absence } }));
  } catch (e) {
    console.error('Error saving specialist availability:', e);
  }
}

export function isSpecialistInactiveOnDate(specialistId: string, dateStr?: string): boolean {
  const availability = getStoredSpecialistsAvailability();
  const specAbsence = availability[specialistId];
  if (!specAbsence || !specAbsence.isInactive) return false;

  if (!dateStr || !specAbsence.inactiveFrom || !specAbsence.inactiveUntil) {
    return specAbsence.isInactive;
  }

  // Check if dateStr falls between inactiveFrom and inactiveUntil (inclusive)
  return dateStr >= specAbsence.inactiveFrom && dateStr <= specAbsence.inactiveUntil;
}

export function getSpecialistAbsenceInfo(specialistId: string, dateStr?: string): {
  isInactive: boolean;
  reason?: string;
  reasonDetails?: string;
  inactiveFrom?: string;
  inactiveUntil?: string;
  substituteSpecialistId?: string;
  substituteSpecialistName?: string;
} | null {
  const availability = getStoredSpecialistsAvailability();
  const specAbsence = availability[specialistId];
  if (!specAbsence || !specAbsence.isInactive) return null;

  if (dateStr && specAbsence.inactiveFrom && specAbsence.inactiveUntil) {
    if (dateStr < specAbsence.inactiveFrom || dateStr > specAbsence.inactiveUntil) {
      return null;
    }
  }

  return {
    isInactive: true,
    reason: specAbsence.reason,
    reasonDetails: specAbsence.reasonDetails,
    inactiveFrom: specAbsence.inactiveFrom,
    inactiveUntil: specAbsence.inactiveUntil,
    substituteSpecialistId: specAbsence.substituteSpecialistId,
    substituteSpecialistName: specAbsence.substituteSpecialistName,
  };
}

/**
 * Automatically selects the dedicated specialist based on the selected service ID.
 * If the primary specialist is in medical rest or inactive on the chosen date,
 * provides notice and selects an available substitute specialist.
 */
export function getAutoSelectedSpecialistForService(serviceId: string, dateStr?: string): {
  specialist: SpecialistUser;
  isPrimary: boolean;
  inactivePrimaryNotice?: {
    primaryName: string;
    reason: string;
    until: string;
  };
} {
  const primaryId = SERVICE_DEFAULT_SPECIALIST_MAP[serviceId] || 'isaac-jewsiejew';
  const primarySpec = SPECIALISTS_ACCOUNTS.find(s => s.id === primaryId) || SPECIALISTS_ACCOUNTS[0];

  const primaryAbsence = getSpecialistAbsenceInfo(primaryId, dateStr);

  if (!primaryAbsence || !primaryAbsence.isInactive) {
    return {
      specialist: primarySpec,
      isPrimary: true,
    };
  }

  // If primary specialist is inactive, look for substitute or next in category
  let substituteSpec: SpecialistUser | undefined;
  if (primaryAbsence.substituteSpecialistId) {
    substituteSpec = SPECIALISTS_ACCOUNTS.find(s => s.id === primaryAbsence.substituteSpecialistId);
  }

  if (!substituteSpec) {
    const categoryFallbacks = CATEGORY_FALLBACK_SPECIALISTS[primarySpec.category] || [];
    for (const altId of categoryFallbacks) {
      if (altId !== primaryId && !isSpecialistInactiveOnDate(altId, dateStr)) {
        substituteSpec = SPECIALISTS_ACCOUNTS.find(s => s.id === altId);
        if (substituteSpec) break;
      }
    }
  }

  const untilText = primaryAbsence.inactiveUntil ? `el ${primaryAbsence.inactiveUntil}` : 'nuevo aviso';
  const reasonText = primaryAbsence.reasonDetails || (primaryAbsence.reason === 'enfermedad' ? 'Reposo médico' : 'Permiso/Ausencia temporal');

  return {
    specialist: substituteSpec || primarySpec,
    isPrimary: false,
    inactivePrimaryNotice: {
      primaryName: primarySpec.name,
      reason: reasonText,
      until: untilText,
    },
  };
}
