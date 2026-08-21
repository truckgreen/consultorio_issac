export type ServiceCategory = 
  | 'Fisioterapia General'
  | 'Fisioterapia Deportiva'
  | 'Fisioterapia Pediátrica'
  | 'Fisioterapia Geriátrica'
  | 'Traumatología'
  | 'Psicología'
  | 'Nutrición'
  | 'Entrenamiento Funcional'
  | 'Boxeo';

export interface ClinicalNote {
  id: string;
  date: string;
  author: string;
  role: string;
  note: string;
  painScore?: number;
  mobilityScore?: number;
}

export interface PrescribedExercise {
  id: string;
  title: string;
  sets: string;
  reps: string;
  frequency: string;
  instructions: string;
  completedToday: boolean;
  videoThumb?: string;
}

export interface PatientRecord {
  id: string;
  accessCode: string; // e.g. EQ-8421
  fullName: string;
  documentId?: string; // Cédula / DNI e.g. V-19.482.102
  email: string;
  phone: string;
  secondaryPhone?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  address?: string;
  city?: string;
  preferredContactMethod?: 'Llamada Telefónica' | 'Chat App' | 'Correo Electrónico';
  bloodType?: string;
  allergies?: string;
  insuranceCompany?: string;
  age: number;
  service: ServiceCategory;
  specialist: string;
  specialistRole: string;
  diagnosis: string;
  status: 'active' | 'in_progress' | 'completed' | 'scheduled';
  painInitial: number; // 1-10
  painCurrent: number; // 1-10
  mobilityProgress: number; // 0-100%
  completedSessions: number;
  totalSessions: number;
  nextAppointmentDate: string;
  nextAppointmentTime: string;
  registeredAt: string;
  treatmentGoal: string;
  notes: ClinicalNote[];
  exercises: PrescribedExercise[];
  painHistory: { date: string; score: number }[];
  chatMessages: {
    id: string;
    sender: 'patient' | 'specialist';
    text: string;
    timestamp: string;
  }[];
}

export interface AppointmentBooking {
  id: string;
  patientName: string;
  documentId?: string;
  email: string;
  phone: string;
  emergencyContactPhone?: string;
  emergencyContactName?: string;
  address?: string;
  service: ServiceCategory;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  isFirstTime: boolean;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  generatedAccessCode?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  treatment: string;
  comment: string;
  rating: number;
  date: string;
  avatarUrl: string;
  verified: boolean;
}

export interface ServiceVideoData {
  title: string;
  duration: string;
  presenter: string;
  presenterRole: string;
  synopsis: string;
  videoPoster: string;
  videoType?: 'physio' | 'sports' | 'pediatric' | 'geriatric' | 'medical' | 'mental' | 'nutrition' | 'active' | 'boxing';
  customVideoUrl?: string;
  chapters: Array<{ time: string; title: string; description: string }>;
  keyPoints: string[];
  techniquesShown: string[];
  equipmentUsed: string[];
}

export interface ClinicSettings {
  clinicName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  emergencyPhone: string;
  email: string;
  address: string;
  floorSuite: string;
  city: string;
  workingHoursWeekdays: string;
  workingHoursSaturdays: string;
  announcementBanner: string;
  announcementActive: boolean;
  instagramHandle: string;
  facebookUrl: string;
}

export interface ServiceDetail {
  id: string;
  title: string;
  categoryName: string;
  tagline: string;
  description: string;
  image: string;
  badge: string;
  priceUSD: number;
  priceLabel: string;
  duration: string;
  includedItems: string[];
  packageOptions?: Array<{
    name: string;
    price: string;
    sessions: string;
    savings?: string;
    popular?: boolean;
  }>;
  benefits: string[];
  conditions: string[];
  methodology: string;
  specialists: string[];
  videoData: ServiceVideoData;
}
