export type AppointmentStatus = 'CONFIRMADA' | 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO' | 'confirmada' | 'pendiente' | 'completada' | 'cancelada' | 'pendiente_validacion';

export interface ServiceItem {
  id: string;
  title: string;
  category: 'fisioterapia' | 'medicina' | 'movimiento' | 'bienestar';
  shortDescription: string;
  fullDescription: string;
  imageUrl?: string;
  imageKey?: string;
  image?: string;
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
  imageUrl?: string;
  image?: string;
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
  avatarUrl?: string;
  avatar?: string;
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

export type SlotStatus = 'DISPONIBLE' | 'POR_CONFIRMAR' | 'OCUPADO' | 'disponible' | 'por_confirmar' | 'ocupado';

export type ConfirmedAppointment = Appointment;

export interface TimeSlotInfo {
  time: string;
  status: SlotStatus;
  notes: string;
}

export interface Appointment {
  id: string;
  code: string;
  service_id?: string;
  serviceId?: string;
  service_title?: string;
  serviceTitle?: string;
  servicePrice?: number | string;
  service_price?: number | string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // e.g. "09:00 AM - 10:00 AM"
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  motivo?: string;
  motivoConsulta?: string;
  primera_visita?: boolean;
  primeraVisita?: boolean;
  created_at?: string;
  createdAt?: string;
  status: AppointmentStatus;
  specialist_id?: string;
  specialist_name?: string;
  notes?: string;
  payment_status?: 'PAGADO' | 'PENDIENTE' | 'EXONERADO';
  amount?: number;
}

export interface MedicalRecordDocument {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  category: 'informe' | 'radiografia' | 'resonancia' | 'laboratorio' | 'receta' | 'consentimiento' | 'otro';
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData: string; // Base64 Data URL or remote URL for preview & download
  uploadedAt: string; // YYYY-MM-DD or ISO string
  uploadedBy?: string;
  specialistNotes?: string;
}

export interface PatientRecord {
  id: string;
  cedula?: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaNacimiento?: string;
  edad?: number;
  genero?: 'M' | 'F' | 'OTRO';
  direccion?: string;
  contactoEmergencia?: {
    nombre: string;
    telefono: string;
    parentesco: string;
  };
  totalAppointments: number;
  completedAppointments: number;
  lastVisit: string;
  totalSpent: number;
  firstVisitDate: string;
  clinicalNotes?: string;
  medicalConditions?: string;
  alergias?: string;
  antecedentes?: string;
  medicamentosActuales?: string;
  documents?: MedicalRecordDocument[];
  createdAt?: string;
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

