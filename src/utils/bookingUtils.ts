import { SlotStatus, TimeSlotInfo, ConfirmedAppointment } from '../types';

export const STANDARD_WEEKDAY_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
];

export const SATURDAY_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
];

const LOCAL_STORAGE_APPOINTMENTS_KEY = 'equilibra_saved_appointments';

export function getSavedAppointments(): ConfirmedAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APPOINTMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved appointments:', e);
    return [];
  }
}

export function saveAppointmentToStorage(appointment: ConfirmedAppointment): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedAppointments();
    const updated = [appointment, ...current];
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving appointment:', e);
  }
}

/**
 * Returns the slots and their availability for a specific date (YYYY-MM-DD)
 */
export function getSlotsForDate(dateStr: string, serviceId?: string): TimeSlotInfo[] {
  if (!dateStr) return [];
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

  if (dayOfWeek === 0) {
    // Sunday: Clinic is closed
    return [];
  }

  const baseSlots = dayOfWeek === 6 ? SATURDAY_SLOTS : STANDARD_WEEKDAY_SLOTS;
  const userAppointments = getSavedAppointments();

  return baseSlots.map((time, index) => {
    // Check if the user already booked this exact slot in local storage
    const userBooked = userAppointments.some(
      (app) => app.fecha === dateStr && app.hora === time
    );

    if (userBooked) {
      return {
        time,
        status: 'ocupado' as SlotStatus,
        notes: 'Reservado recientemente por ti',
      };
    }

    // Deterministic simulation based on date and time index to create realistic real-time clinic statuses
    // (some busy, some pending confirmation, some available)
    const seed = (day * 7 + index * 13 + (month * 3)) % 10;
    
    let status: SlotStatus = 'disponible';
    let notes = 'Disponible para agendar inmediatamente';

    if (seed === 1 || seed === 6) {
      status = 'ocupado';
      notes = 'Horario reservado por otro paciente';
    } else if (seed === 3 || seed === 8) {
      status = 'por_confirmar';
      notes = 'En proceso de confirmación clínica';
    }

    return {
      time,
      status,
      notes,
    };
  });
}

/**
 * Generates ICS calendar file content
 */
export function generateIcsCalendar(
  appointment: ConfirmedAppointment,
  serviceTitle: string,
  clinicAddress: string,
  clinicPhone: string
): void {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Equilibra//Cita Medica//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Cita: ${serviceTitle} - Equilibra (${appointment.code})
DESCRIPTION:Consulta para ${appointment.nombre} ${appointment.apellido}\\nServicio: ${serviceTitle}\\nFecha: ${appointment.fecha} - ${appointment.hora}\\nTeléfono de contacto: ${appointment.telefono}\\nUbicación: ${clinicAddress}\\nTeléfono Clínica: ${clinicPhone}
LOCATION:${clinicAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Cita-Equilibra-${appointment.code}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
