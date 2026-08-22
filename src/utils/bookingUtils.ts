import { SlotStatus, TimeSlotInfo, ConfirmedAppointment } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { SERVICES_DATA } from '../data/servicesData';

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
    const updated = [appointment, ...current.filter(a => a.id !== appointment.id)];
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving appointment:', e);
  }
}

export async function getAppointmentsFromDatabase(): Promise<ConfirmedAppointment[]> {
  if (!isSupabaseConfigured) return getSavedAppointments();

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase appointments query error:', error.message);
    return getSavedAppointments();
  }

  const appointments = (data || []).map((row) => ({
    id: row.id,
    code: row.code,
    serviceId: row.service_id,
    servicePrice: row.amount ? `${row.amount} USD` : undefined,
    nombre: row.nombre,
    apellido: row.apellido,
    telefono: row.telefono,
    email: row.email,
    fecha: row.fecha,
    hora: row.hora,
    motivoConsulta: row.motivo || '',
    primeraVisita: row.primera_visita,
    createdAt: row.created_at,
    status: row.status === 'PENDIENTE' ? 'pendiente_validacion' : 'confirmada',
  })) as ConfirmedAppointment[];

  localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments));
  return appointments;
}

export function subscribeToAppointments(onChange: (appointments: ConfirmedAppointment[]) => void): (() => void) | null {
  if (!isSupabaseConfigured) return null;

  const channel = supabase
    .channel('public-appointments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async () => {
      onChange(await getAppointmentsFromDatabase());
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Save appointment to Supabase and fallback/sync with local storage
 */
export async function saveAppointmentToDatabase(appointment: ConfirmedAppointment): Promise<{ success: boolean; error?: string }> {
  // Always keep a local copy for instant UI feedback and offline resilience
  saveAppointmentToStorage(appointment);

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('appointments').insert([
      {
        id: appointment.id,
        code: appointment.code,
        service_id: appointment.serviceId,
        service_title: SERVICES_DATA.find((service) => service.id === appointment.serviceId)?.title || appointment.serviceId,
        amount: Number.parseFloat(appointment.servicePrice || '') || 35,
        nombre: appointment.nombre,
        apellido: appointment.apellido,
        telefono: appointment.telefono,
        email: appointment.email,
        fecha: appointment.fecha,
        hora: appointment.hora,
        motivo: appointment.motivoConsulta || null,
        primera_visita: appointment.primeraVisita,
        status: appointment.status === 'pendiente_validacion' ? 'PENDIENTE' : 'CONFIRMADA',
        created_at: appointment.createdAt || new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase insertion note:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Supabase request error:', err);
    return { success: false, error: err?.message || 'Error al conectar con Supabase' };
  }
}

/**
 * Save contact message to Supabase
 */
export async function saveContactMessageToDatabase(data: {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('contact_messages').insert([
      {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || null,
        mensaje: data.mensaje,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase contact message error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al conectar con Supabase' };
  }
}

/**
 * Returns the slots and their availability for a specific date (YYYY-MM-DD)
 */
export function getSlotsForDate(
  dateStr: string,
  serviceId?: string,
  appointments: ConfirmedAppointment[] = getSavedAppointments()
): TimeSlotInfo[] {
  if (!dateStr) return [];
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

  if (dayOfWeek === 0) {
    // Sunday: Clinic is closed
    return [];
  }

  const baseSlots = dayOfWeek === 6 ? SATURDAY_SLOTS : STANDARD_WEEKDAY_SLOTS;
  const userAppointments = appointments;

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
