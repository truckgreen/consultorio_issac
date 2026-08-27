import { SpecialistUser, AdminUser } from '../types';
import { APP_IMAGES } from './images';

export const ADMIN_ACCOUNT: AdminUser = {
  id: 'admin_equilibra',
  name: 'Dirección Médica & Administración General',
  role: 'administrador_general',
  email: 'admin@equilibrafisioterapia.com',
  easyPin: '8421',
  biometricRegistered: true,
};

export const ADMIN_USER = ADMIN_ACCOUNT;

export const SPECIALISTS_ACCOUNTS: SpecialistUser[] = [
  {
    id: 'isaac-jewsiejew',
    name: 'Lic. Isaac Jewsiejew',
    role: 'Fisioterapeuta Deportivo y General',
    specialty: 'Rehabilitación y readaptación física en deportistas',
    category: 'fisioterapia',
    email: 'isaac@equilibrafisioterapia.com',
    easyPin: '3957',
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
    easyPin: '1208',
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
    easyPin: '7462',
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
    easyPin: '5531',
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
    easyPin: '2894',
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
    easyPin: '6109',
    avatarUrl: APP_IMAGES.team.cristinaFlores.src,
    relatedServiceId: 'psicologia',
    biometricRegistered: true,
  },
  {
    id: 'indira-acevedo',
    name: 'Prof. Indira Acevedo',
    role: 'Instructora de Boxeo y Entrenamiento Funcional',
    specialty: 'Boxeo técnico, entrenamiento funcional y acondicionamiento',
    category: 'entrenamiento',
    email: 'indira@equilibrafisioterapia.com',
    easyPin: '4376',
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
    easyPin: '9214',
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
    easyPin: '3085',
    avatarUrl: APP_IMAGES.team.kareinysMartinez.src,
    relatedServiceId: 'fisioterapia',
    biometricRegistered: true,
  },
  {
    id: 'rebecca-triana',
    name: 'Rebecca Triana',
    role: 'Asistente de Fisioterapia',
    specialty: 'Atención al paciente, apoyo clínico y logística terapéutica',
    category: 'asistente',
    email: 'rebecca@equilibrafisioterapia.com',
    easyPin: '1742',
    avatarUrl: APP_IMAGES.team.rebeccaTriana.src,
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
    if (cleanPin === ADMIN_ACCOUNT.easyPin) {
      return { success: true, user: ADMIN_ACCOUNT, message: 'Acceso administrativo autorizado.' };
    }
    return { success: false, message: 'PIN de administrador incorrecto.' };
  }

  // 2. Check Specialist
  const specialist = SPECIALISTS_ACCOUNTS.find((s) => s.id === userId);
  if (!specialist) {
    return { success: false, message: 'Especialista no encontrado.' };
  }

  if (cleanPin === specialist.easyPin) {
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

/**
 * Returns the exact clinical specialist automatically assigned to a given service ID
 */
export function getAssignedSpecialistForService(serviceId: string): SpecialistUser {
  switch (serviceId) {
    case 'fisioterapia-pediatrica':
      return SPECIALISTS_ACCOUNTS.find((s) => s.id === 'marivid-requena') || SPECIALISTS_ACCOUNTS[1];
    case 'fisioterapia-geriatrica':
      return SPECIALISTS_ACCOUNTS.find((s) => s.id === 'laury-torrealba') || SPECIALISTS_ACCOUNTS[2];
    case 'fisioterapia-deportiva':
      return SPECIALISTS_ACCOUNTS.find((s) => s.id === 'isaac-jewsiejew') || SPECIALISTS_ACCOUNTS[0];
    case 'traumatologia':
      return SPECIALISTS_ACCOUNTS.find((s) => s.id === 'ruben-torrealba') || SPECIALISTS_ACCOUNTS[4];
    case 'psicologia':
      return SPECIALISTS_ACCOUNTS.find((s) => s.id === 'cristina-flores') || SPECIALISTS_ACCOUNTS[5];
    case 'nutricion':
      return SPECIALISTS_ACCOUNTS.find((s) => s.id === 'stephani-salina') || SPECIALISTS_ACCOUNTS[3];
    case 'boxeo':
    case 'entrenamiento-funcional':
      return SPECIALISTS_ACCOUNTS.find((s) => s.id === 'indira-acevedo') || SPECIALISTS_ACCOUNTS[6];
    case 'fisioterapia':
    default:
      return SPECIALISTS_ACCOUNTS.find((s) => s.id === 'isaac-jewsiejew') || SPECIALISTS_ACCOUNTS[0];
  }
}
