export interface ServiceItem {
  id: string;
  title: string;
  category: 'fisioterapia' | 'medicina' | 'movimiento' | 'bienestar';
  shortDescription: string;
  fullDescription: string;
  imageKey: keyof typeof import('../data/images').APP_IMAGES.services;
  benefits: string[];
  duration: string;
  price: number;
  priceFormatted: string;
  packageOption?: string;
  priceNote?: string;
  targetAudience: string[];
  methodology: string;
}

export interface SpecialtyItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  highlights: string[];
  subSpecialties: string[];
}

export interface WhyUsItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  review: string;
  rating: number;
  serviceReceived: string;
  avatar: string;
  date: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  category: 'fisioterapia' | 'medicina' | 'nutricion' | 'psicologia' | 'entrenamiento' | 'asistencia';
  image: string;
  credentials?: string;
  bio?: string;
  relatedServiceId?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export type SlotStatus = 'disponible' | 'por_confirmar' | 'ocupado';

export interface TimeSlotInfo {
  time: string;
  status: SlotStatus;
  specialistName?: string;
  notes?: string;
}

export interface DayAvailability {
  dateString: string; // YYYY-MM-DD
  slots: TimeSlotInfo[];
}

export interface BookingFormData {
  serviceId: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fecha: string; // YYYY-MM-DD
  hora: string;
  motivoConsulta?: string;
  primeraVisita: boolean;
}

export interface ConfirmedAppointment extends BookingFormData {
  id: string;
  code: string;
  createdAt: string;
  status: 'confirmada' | 'pendiente_validacion';
  servicePrice?: string;
}
