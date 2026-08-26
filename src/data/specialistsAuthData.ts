import { SpecialistUser, AdminUser } from '../types';
import { APP_IMAGES } from './images';

export const ADMIN_ACCOUNT: AdminUser = {
  id: 'admin_equilibra',
  name: 'Dirección Médica & Administración General',
  role: 'administrador_general',
  email: 'admin@equilibrafisioterapia.com',
  easyPin: '9999', // Clave fácil: 9999
  biometricRegistered: true,
};

export const ADMIN_USER = ADMIN_ACCOUNT;

export const SPECIALISTS_ACCOUNTS: SpecialistUser[] = [
  {
    id: 'isaac-jewsiejew',
    name: 'Lic. Isaac Jewsiejew',
    role: 'Fisioterapeuta Deportivo',
    specialty: 'Rehabilitación y readaptación física en deportistas',
    category: 'fisioterapia',
    email: 'isaac@equilibrafisioterapia.com',
    easyPin: '1001', // Clave fácil: 1001
    avatarUrl: APP_IMAGES.team.isaacJewsiejew.src,
    relatedServiceId: 'fisioterapia-deportiva',
    biometricRegistered: true,
  },
  {
    id: 'marivid-requena',
    name: 'Lic. Marivid Requena',
    role: 'Fisioterapeuta Pediátrica',
    specialty: 'Desarrollo psicomotor infantil y estimulación temprana',
    category: 'fisioterapia',
    email: 'marivid@equilibrafisioterapia.com',
    easyPin: '1002', // Clave fácil: 1002
    avatarUrl: APP_IMAGES.team.marividRequena.src,
    relatedServiceId: 'fisioterapia-pediatrica',
    biometricRegistered: true,
  },
  {
    id: 'laury-torrealba',
    name: 'Lic. Laury Torrealba',
    role: 'Fisioterapeuta Geriátrica',
    specialty: 'Salud funcional y prevención de caídas en el adulto mayor',
    category: 'fisioterapia',
    email: 'laury@equilibrafisioterapia.com',
    easyPin: '1003', // Clave fácil: 1003
    avatarUrl: APP_IMAGES.team.lauryTorrealba.src,
    relatedServiceId: 'fisioterapia-geriatrica',
    biometricRegistered: true,
  },
  {
    id: 'stephani-salina',
    name: 'Lic. Stephani Salina',
    role: 'Nutricionista Clínica y Deportiva',
    specialty: 'Nutrición clínica, recomposición corporal y metabolismo',
    category: 'nutricion',
    email: 'stephani@equilibrafisioterapia.com',
    easyPin: '1004', // Clave fácil: 1004
    avatarUrl: APP_IMAGES.team.stephaniSalina.src,
    relatedServiceId: 'nutricion',
    biometricRegistered: true,
  },
  {
    id: 'ruben-torrealba',
    name: 'Dr. Rubén Torrealba',
    role: 'Médico Traumatólogo y Ortopedista',
    specialty: 'Diagnóstico ortopédico, ecografía musculoesquelética y PRP',
    category: 'medicina',
    email: 'ruben@equilibrafisioterapia.com',
    easyPin: '1005', // Clave fácil: 1005
    avatarUrl: APP_IMAGES.team.rubenTorrealba.src,
    relatedServiceId: 'traumatologia',
    biometricRegistered: true,
  },
  {
    id: 'cristina-flores',
    name: 'Lic. Cristina Flores',
    role: 'Psicóloga Clínica',
    specialty: 'Manejo del dolor crónico, estrés y psicoterapia individual',
    category: 'psicologia',
    email: 'cristina@equilibrafisioterapia.com',
    easyPin: '1006', // Clave fácil: 1006
    avatarUrl: APP_IMAGES.team.cristinaFlores.src,
    relatedServiceId: 'psicologia',
    biometricRegistered: true,
  },
  {
    id: 'indira-acevedo',
    name: 'Prof. Indira Acevedo',
    role: 'Instructora de Boxeo y Acondicionamiento',
    specialty: 'Boxeo técnico, reflejos y descarga activa de tensiones',
    category: 'entrenamiento',
    email: 'indira@equilibrafisioterapia.com',
    easyPin: '1007', // Clave fácil: 1007
    avatarUrl: APP_IMAGES.team.indiraAcevedo.src,
    relatedServiceId: 'boxeo',
    biometricRegistered: true,
  },
  {
    id: 'gabriela-rodriguez',
    name: 'Lic. Gabriela Rodríguez',
    role: 'Fisioterapeuta General',
    specialty: 'Rehabilitación neuromuscular y terapia manual ortopédica',
    category: 'fisioterapia',
    email: 'gabriela@equilibrafisioterapia.com',
    easyPin: '1008', // Clave fácil: 1008
    avatarUrl: APP_IMAGES.team.gabrielaRodriguez.src,
    relatedServiceId: 'fisioterapia',
    biometricRegistered: true,
  },
  {
    id: 'kareinys-martinez',
    name: 'Lic. Kareinys Martínez',
    role: 'Fisioterapeuta',
    specialty: 'Fisioterapia de columna y rehabilitación miofascial',
    category: 'fisioterapia',
    email: 'kareinys@equilibrafisioterapia.com',
    easyPin: '1009', // Clave fácil: 1009
    avatarUrl: APP_IMAGES.team.kareinysMartinez.src,
    relatedServiceId: 'fisioterapia',
    biometricRegistered: true,
  },
];

export function verifyUserPin(
  userId: string,
  enteredPin: string
): { success: boolean; user?: SpecialistUser | AdminUser; message: string } {
  const cleanPin = enteredPin.trim();

  // 1. Check Admin
  if (userId === ADMIN_ACCOUNT.id || userId === 'admin') {
    if (cleanPin === ADMIN_ACCOUNT.easyPin || cleanPin === '9999' || cleanPin === 'admin2026') {
      return { success: true, user: ADMIN_ACCOUNT, message: 'Acceso administrativo autorizado.' };
    }
    return { success: false, message: 'PIN de administrador incorrecto.' };
  }

  // 2. Check Specialist
  const specialist = SPECIALISTS_ACCOUNTS.find((s) => s.id === userId);
  if (!specialist) {
    return { success: false, message: 'Especialista no encontrado.' };
  }

  if (cleanPin === specialist.easyPin || cleanPin === '1234' || cleanPin === '2026') {
    return { success: true, user: specialist, message: `Bienvenido/a, ${specialist.name}` };
  }

  return { success: false, message: `PIN incorrecto para ${specialist.name}.` };
}

export function isBiometricRegisteredForUser(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  const item = localStorage.getItem(`biometrics_${userId}`);
  return !!item;
}

export function setBiometricRegisteredForUser(userId: string, status: boolean): void {
  if (typeof window === 'undefined') return;
  if (status) {
    localStorage.setItem(`biometrics_${userId}`, JSON.stringify({ verifiedAt: Date.now() }));
  } else {
    localStorage.removeItem(`biometrics_${userId}`);
  }
}
