export type AppointmentStatus = 'CONFIRMADA' | 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO';

export interface ServiceItem {
  id: string;
  title: string;
  category: 'fisioterapia' | 'medicina' | 'movimiento' | 'bienestar';
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  benefits: string[];
  duration: string;
  price: number;
  priceFormatted: string;
  packageOption?: string;
  priceNote?: string;
  targetAudience: string[];
  methodology: string;
  isActive?: boolean;
}

export interface SpecialtyItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  highlights: string[];
  subSpecialties: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  category: 'fisioterapia' | 'medicina' | 'nutricion' | 'psicologia' | 'entrenamiento' | 'asistencia';
  imageUrl: string;
  credentials: string;
  bio: string;
  relatedServiceId?: string;
  status?: 'disponible' | 'en_consulta' | 'de_guardia' | 'descanso';
  assignedAppointmentsCount?: number;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  review: string;
  rating: number;
  serviceReceived: string;
  avatarUrl: string;
  date: string;
}

export interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export interface WhyUsItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  iconName: string;
}

export type SlotStatus = 'DISPONIBLE' | 'POR_CONFIRMAR' | 'OCUPADO';

export interface TimeSlotInfo {
  time: string;
  status: SlotStatus;
  notes: string;
}

export interface Appointment {
  id: string;
  code: string;
  service_id: string;
  service_title: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // e.g. "09:00 AM - 10:00 AM"
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  motivo?: string;
  primera_visita: boolean;
  created_at: string;
  status: AppointmentStatus;
  specialist_id?: string;
  specialist_name?: string;
  notes?: string;
  payment_status?: 'PAGADO' | 'PENDIENTE' | 'EXONERADO';
  amount?: number;
}

export interface PatientRecord {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  totalAppointments: number;
  completedAppointments: number;
  lastVisit: string;
  totalSpent: number;
  firstVisitDate: string;
  clinicalNotes?: string;
  medicalConditions?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at: string;
  status?: 'NUEVO' | 'RESPONDIDO' | 'ARCHIVADO';
  adminNotes?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'appointment' | 'message' | 'system' | 'payment';
  read: boolean;
  linkTab?: 'citas' | 'mensajes' | 'pacientes' | 'dashboard';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  source: 'env' | 'custom' | 'demo';
}

