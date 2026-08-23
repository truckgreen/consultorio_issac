export * from './types/index';
import { Appointment, SlotStatus as AdminSlotStatus } from './types/index';

export type ConfirmedAppointment = Appointment;

// Compatibility aliases
export interface LegacyServiceItem {
  id: string;
  title: string;
  category: 'fisioterapia' | 'medicina' | 'movimiento' | 'bienestar';
  shortDescription: string;
  fullDescription: string;
  image?: string;
  imageUrl: string;
  imageKey?: string;
  benefits: string[];
  duration: string;
  price: number;
  priceFormatted: string;
  packageOption?: string;
  priceNote?: string;
  targetAudience: string[];
  methodology: string;
}
