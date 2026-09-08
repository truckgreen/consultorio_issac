import { ConfirmedAppointment, Appointment, SpecialistUser, AdminUser } from '../types';
import { SPECIALISTS_ACCOUNTS, ADMIN_ACCOUNT } from '../data/specialistsAuthData';

/**
 * Normalizes text for robust accent-insensitive and case-insensitive comparison
 */
export function normalizeText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Checks if a user object corresponds to an administrator (Superadmin / Medical Director).
 */
export function isUserAdmin(
  user: SpecialistUser | AdminUser | { id?: string; role?: string } | null | undefined
): boolean {
  if (!user) return false;
  const id = (user.id || '').toLowerCase().trim();
  const role = (user.role || '').toLowerCase().trim();

  return (
    id === ADMIN_ACCOUNT.id.toLowerCase() ||
    id === 'admin' ||
    id === 'admin_equilibra' ||
    role === 'admin' ||
    role === 'administrador_general' ||
    role === 'superadmin' ||
    role === 'direccion_medica'
  );
}

/**
 * Checks whether an appointment is specifically assigned to a given specialist.
 * Uses strict specialist ID matching first, then distinct normalized specialist name tokens.
 * NEVER uses generic service category matching, guaranteeing that individual physiotherapists
 * (e.g., Isaac, Gabriela, Kareinys, Laury, Rebecca, Marivid) only see appointments booked for them.
 */
export function isAppointmentAssignedToSpecialist(
  app: ConfirmedAppointment | Appointment | any,
  specialist: SpecialistUser | { id: string; name: string }
): boolean {
  if (!app || !specialist) return false;

  const specId = (specialist.id || '').toLowerCase().trim();
  const appSpecId = (app.specialistId || app.specialist_id || '').toLowerCase().trim();
  const appSpecName = (app.specialistName || app.specialist_name || '').toLowerCase().trim();

  // 1. Direct ID match
  if (appSpecId) {
    if (appSpecId === specId) return true;
    const cleanSpecId = specId.replace(/[-_]/g, '');
    const cleanAppSpecId = appSpecId.replace(/[-_]/g, '');
    if (cleanAppSpecId === cleanSpecId) return true;
  }

  // 2. Distinctive name matching (no generic service fallbacks)
  if (!appSpecName) return false;

  const cleanAppSpecName = normalizeText(appSpecName);

  switch (specId) {
    case 'isaac-jewsiejew':
      return cleanAppSpecName.includes('isaac') || cleanAppSpecName.includes('jewsiejew');
    case 'marivid-requena':
      return cleanAppSpecName.includes('marivid') || cleanAppSpecName.includes('requena');
    case 'laury-torrealba':
      return cleanAppSpecName.includes('laury'); // Disambiguated from Ruben
    case 'ruben-torrealba':
      return cleanAppSpecName.includes('ruben'); // Disambiguated from Laury
    case 'stephani-salina':
      return cleanAppSpecName.includes('stephani') || cleanAppSpecName.includes('salina');
    case 'cristina-flores':
      return cleanAppSpecName.includes('cristina') || cleanAppSpecName.includes('flores');
    case 'indira-acevedo':
      return cleanAppSpecName.includes('indira') || cleanAppSpecName.includes('acevedo');
    case 'gabriela-rodriguez':
      return cleanAppSpecName.includes('gabriela'); // Distinct physiotherapist
    case 'kareinys-martinez':
      return cleanAppSpecName.includes('kareinys'); // Distinct physiotherapist
    case 'rebecca-triana':
      return cleanAppSpecName.includes('rebecca') || cleanAppSpecName.includes('triana');
    default: {
      const cleanSpecName = normalizeText(specialist.name)
        .replace(/^(lic\.|dr\.|dra\.|prof\.)\s*/i, '')
        .trim();
      const parts = cleanSpecName.split(/\s+/).filter((p) => p.length >= 3);
      if (parts.length === 0) return false;
      return parts.some((part) => cleanAppSpecName.includes(part));
    }
  }
}

/**
 * Checks if an appointment matches a filter ID (e.g. 'TODOS' or a specialist ID).
 */
export function matchesSpecialistFilter(
  app: ConfirmedAppointment | Appointment | any,
  filterId: string
): boolean {
  if (!filterId || filterId === 'TODOS') return true;

  const target = SPECIALISTS_ACCOUNTS.find((s) => s.id === filterId);
  if (target) {
    return isAppointmentAssignedToSpecialist(app, target);
  }

  const appSpecId = (app.specialistId || app.specialist_id || '').toLowerCase().trim();
  return appSpecId === filterId.toLowerCase().trim();
}
