import { Appointment, AuthUser } from '../types';
import { PREDEFINED_USERS, SUPERADMIN } from '../data/predefinedUsers';

export function normalizeText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function isUserAdmin(user: AuthUser | { id?: string; role?: string } | null | undefined): boolean {
  if (!user) return false;
  const id = (user.id || '').toLowerCase().trim();
  const role = (user.role || '').toLowerCase().trim();
  return id === 'admin' || role === 'superadmin' || role === 'admin' || role === 'administrador_general';
}

export function isAppointmentAssignedToSpecialist(
  app: Appointment | any,
  specialist: AuthUser | { id: string; name: string }
): boolean {
  if (!app || !specialist) return false;

  const specId = (specialist.id || '').toLowerCase().trim();
  const appSpecId = (app.specialist_id || app.specialistId || '').toLowerCase().trim();
  const appSpecName = (app.specialist_name || app.specialistName || '').toLowerCase().trim();

  // 1. Direct ID match
  if (appSpecId) {
    if (appSpecId === specId) return true;
    const cleanSpecId = specId.replace(/[-_]/g, '');
    const cleanAppSpecId = appSpecId.replace(/[-_]/g, '');
    if (cleanAppSpecId === cleanSpecId) return true;
  }

  // 2. Distinctive name matching
  if (!appSpecName) return false;

  const cleanAppSpecName = normalizeText(appSpecName);

  switch (specId) {
    case 'isaac-jewsiejew':
      return cleanAppSpecName.includes('isaac') || cleanAppSpecName.includes('jewsiejew');
    case 'marivid-requena':
      return cleanAppSpecName.includes('marivid') || cleanAppSpecName.includes('requena');
    case 'laury-torrealba':
      return cleanAppSpecName.includes('laury');
    case 'ruben-torrealba':
      return cleanAppSpecName.includes('ruben');
    case 'stephani-salina':
      return cleanAppSpecName.includes('stephani') || cleanAppSpecName.includes('salina');
    case 'cristina-flores':
      return cleanAppSpecName.includes('cristina') || cleanAppSpecName.includes('flores');
    case 'indira-acevedo':
      return cleanAppSpecName.includes('indira') || cleanAppSpecName.includes('acevedo');
    case 'gabriela-rodriguez':
      return cleanAppSpecName.includes('gabriela');
    case 'kareinys-martinez':
      return cleanAppSpecName.includes('kareinys');
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

export function matchesSpecialistFilter(
  app: Appointment | any,
  filterId: string
): boolean {
  if (!filterId || filterId === 'TODOS' || filterId === 'ALL') return true;

  const target = PREDEFINED_USERS.find((s) => s.id === filterId);
  if (target) {
    return isAppointmentAssignedToSpecialist(app, target);
  }

  const appSpecId = (app.specialist_id || app.specialistId || '').toLowerCase().trim();
  return appSpecId === filterId.toLowerCase().trim();
}
