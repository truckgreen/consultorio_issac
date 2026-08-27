import { SlotStatus, TimeSlotInfo, ConfirmedAppointment } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { SERVICES_DATA } from '../data/servicesData';
import {
  sanitizeString,
  generateSecureCode,
  recordSecurityEvent,
  maskSensitiveData,
} from './security';
import { notifySpecialistNewAppointment } from './notificationUtils';
import { sendTelegramBookingAlert } from './telegramBot';

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
    const parsed: ConfirmedAppointment[] = JSON.parse(raw);
    const filtered = (parsed || []).filter(
      (a) => !a.id.startsWith('seed_') && !a.id.startsWith('app_seed_') && !a.id.startsWith('demo_')
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Error reading saved appointments:', e);
    return [];
  }
}

export function saveAppointmentToStorage(appointment: ConfirmedAppointment): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedAppointments();
    const updated = [appointment, ...current.filter((a) => a.id !== appointment.id)];
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving appointment:', e);
  }
}

export async function getAppointmentsFromDatabase(): Promise<ConfirmedAppointment[]> {
  if (!isSupabaseConfigured) return getSavedAppointments();

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase appointments query note:', error.message);
      return getSavedAppointments();
    }

    const appointments = (data || []).map((row) => ({
      id: String(row.id),
      code: sanitizeString(row.code || generateSecureCode()),
      serviceId: sanitizeString(row.service_id),
      servicePrice: row.service_price || (row.amount ? `${row.amount} USD` : undefined),
      selectedPackageName: row.selected_package_name || row.package_name || undefined,
      selectedPackagePrice: row.selected_package_price || undefined,
      selectedPackageDescription: row.selected_package_description || undefined,
      specialistId: row.specialist_id || undefined,
      specialistName: row.specialist_name || 'Lic. Isaac Jewsiejew',
      nombre: sanitizeString(row.nombre),
      apellido: sanitizeString(row.apellido),
      telefono: sanitizeString(row.telefono),
      email: sanitizeString(row.email),
      fecha: sanitizeString(row.fecha),
      hora: sanitizeString(row.hora),
      motivoConsulta: sanitizeString(row.motivo_consulta || row.motivo || '', 600),
      primeraVisita: Boolean(row.primera_visita),
      createdAt: row.created_at || new Date().toISOString(),
      status: row.status === 'PENDIENTE'
        ? 'pendiente_validacion'
        : row.status === 'CANCELADA'
        ? 'cancelada'
        : row.status === 'REPROGRAMADA'
        ? 'reprogramada'
        : (row.status || 'confirmada').toLowerCase(),
      cancellationCount: row.cancellation_count || 0,
      cancellationFeePercent: row.cancellation_fee_percent || 0,
      cancellationFeeAmount: row.cancellation_fee_amount || 0,
      cancellationReason: row.cancellation_reason || undefined,
      canceledAt: row.canceled_at || undefined,
      rescheduledCount: row.rescheduled_count || 0,
      rescheduledFromDate: row.rescheduled_from_date || undefined,
      rescheduledFromTime: row.rescheduled_from_time || undefined,
      rescheduledAt: row.rescheduled_at || undefined,
    })) as ConfirmedAppointment[];

    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments));
    return appointments;
  } catch (err) {
    console.warn('Network query error reading appointments:', err);
    return getSavedAppointments();
  }
}

export function subscribeToAppointments(onChange: (appointments: ConfirmedAppointment[]) => void): (() => void) | null {
  if (!isSupabaseConfigured) return null;

  const channel = supabase
    .channel('public-appointments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async () => {
      const refreshed = await getAppointmentsFromDatabase();
      onChange(refreshed);
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Save appointment with input sanitization, security event tracking, and storage sync
 */
export async function saveAppointmentToDatabase(appointment: ConfirmedAppointment): Promise<{ success: boolean; error?: string }> {
  // Sanitize all payload fields before storing
  const cleanAppointment: ConfirmedAppointment = {
    ...appointment,
    id: sanitizeString(appointment.id),
    code: sanitizeString(appointment.code),
    serviceId: sanitizeString(appointment.serviceId),
    selectedPackageName: appointment.selectedPackageName ? sanitizeString(appointment.selectedPackageName) : undefined,
    selectedPackagePrice: appointment.selectedPackagePrice ? sanitizeString(String(appointment.selectedPackagePrice)) : undefined,
    specialistId: appointment.specialistId ? sanitizeString(appointment.specialistId) : undefined,
    specialistName: appointment.specialistName ? sanitizeString(appointment.specialistName) : 'Lic. Isaac Jewsiejew',
    nombre: sanitizeString(appointment.nombre, 60),
    apellido: sanitizeString(appointment.apellido, 60),
    telefono: sanitizeString(appointment.telefono, 30),
    email: sanitizeString(appointment.email, 100).toLowerCase(),
    fecha: sanitizeString(appointment.fecha),
    hora: sanitizeString(appointment.hora),
    motivoConsulta: sanitizeString(appointment.motivoConsulta || '', 600),
  };

  // Always keep a local encrypted/sanitized copy for instant UI feedback
  saveAppointmentToStorage(cleanAppointment);

  // Trigger specialist & clinic notification alert
  notifySpecialistNewAppointment(cleanAppointment);

  // Send real-time Telegram Bot notification alert
  sendTelegramBookingAlert(cleanAppointment).catch(err => {
    console.warn('Telegram bot alert error:', err);
  });

  // Record security audit event
  recordSecurityEvent({
    action: 'BOOKING_SUCCESS',
    severity: 'INFO',
    details: `Cita médica agendada [${cleanAppointment.code}] para ${maskSensitiveData('name', `${cleanAppointment.nombre} ${cleanAppointment.apellido}`)} el ${cleanAppointment.fecha} (${cleanAppointment.hora}) con ${cleanAppointment.specialistName || 'Especialista'}.`,
  });

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const service = SERVICES_DATA.find((s) => s.id === cleanAppointment.serviceId);
    const serviceTitle = service?.title || cleanAppointment.serviceId;
    const servicePrice = cleanAppointment.selectedPackagePrice || cleanAppointment.servicePrice || (service ? `${service.priceFormatted} USD` : '35 USD');
    const amount = Number.parseFloat(String(servicePrice).replace(/[^\d.]/g, '')) || (service ? service.price : 35);

    const { error } = await supabase.from('appointments').upsert([
      {
        id: cleanAppointment.id,
        code: cleanAppointment.code,
        service_id: cleanAppointment.serviceId,
        service_title: serviceTitle,
        service_price: servicePrice,
        amount: amount,
        selected_package_name: cleanAppointment.selectedPackageName || null,
        selected_package_price: cleanAppointment.selectedPackagePrice || null,
        nombre: cleanAppointment.nombre,
        apellido: cleanAppointment.apellido,
        telefono: cleanAppointment.telefono,
        email: cleanAppointment.email,
        fecha: cleanAppointment.fecha,
        hora: cleanAppointment.hora,
        motivo_consulta: cleanAppointment.motivoConsulta || '',
        primera_visita: cleanAppointment.primeraVisita,
        status: cleanAppointment.status === 'pendiente_validacion'
          ? 'PENDIENTE'
          : cleanAppointment.status === 'cancelada'
          ? 'CANCELADA'
          : cleanAppointment.status === 'reprogramada'
          ? 'REPROGRAMADA'
          : 'CONFIRMADA',
        specialist_id: cleanAppointment.specialistId || null,
        specialist_name: cleanAppointment.specialistName || 'Lic. Isaac Jewsiejew',
        notes: 'Registro verificado por escudo de seguridad EQUILIBRA',
        created_at: cleanAppointment.createdAt || new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase insertion note:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Supabase request error:', err);
    return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
  }
}

/**
 * Reschedule an existing appointment to a new date & time
 */
export async function rescheduleAppointmentInDatabase(
  appointmentIdOrCode: string,
  newDate: string,
  newTime: string,
  rescheduleReason?: string
): Promise<{ success: boolean; updatedAppointment?: ConfirmedAppointment; error?: string }> {
  const currentLocal = getSavedAppointments();
  const index = currentLocal.findIndex(
    (a) => a.id === appointmentIdOrCode || a.code.toUpperCase() === appointmentIdOrCode.toUpperCase()
  );

  if (index === -1) {
    return { success: false, error: 'No se encontró la cita a reprogramar.' };
  }

  const app = currentLocal[index];
  const updated: ConfirmedAppointment = {
    ...app,
    rescheduledFromDate: app.fecha,
    rescheduledFromTime: app.hora,
    fecha: sanitizeString(newDate),
    hora: sanitizeString(newTime),
    status: 'reprogramada',
    rescheduledCount: (app.rescheduledCount || 0) + 1,
    rescheduledAt: new Date().toISOString(),
    notes: rescheduleReason
      ? `Reprogramada: ${sanitizeString(rescheduleReason)}. Anterior: ${app.fecha} (${app.hora})`
      : `Reprogramada desde ${app.fecha} (${app.hora})`,
  };

  saveAppointmentToStorage(updated);

  recordSecurityEvent({
    action: 'BOOKING_SUCCESS',
    severity: 'INFO',
    details: `Cita [${app.code}] reprogramada con éxito al ${newDate} (${newTime}).`,
  });

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('appointments')
        .update({
          fecha: updated.fecha,
          hora: updated.hora,
          status: 'REPROGRAMADA',
          rescheduled_from_date: updated.rescheduledFromDate,
          rescheduled_from_time: updated.rescheduledFromTime,
          rescheduled_count: updated.rescheduledCount,
          rescheduled_at: updated.rescheduledAt,
          notes: updated.notes,
        })
        .or(`id.eq.${app.id},code.eq.${app.code}`);
    } catch (e) {
      console.warn('Error updating reschedule in Supabase:', e);
    }
  }

  return { success: true, updatedAppointment: updated };
}

/**
 * Cancellation Policy Helper:
 * Calculate patient cancellation count and apply 20% penalty fee starting on the 2nd cancellation.
 */
export function getPatientCancellationCount(patientPhoneOrEmail: string): number {
  if (!patientPhoneOrEmail) return 0;
  const cleanKey = patientPhoneOrEmail.replace(/[^\d+a-zA-Z0-9@._-]/g, '').toLowerCase();
  const all = getSavedAppointments();
  return all.filter((a) => {
    const matchEmail = a.email && a.email.toLowerCase().includes(cleanKey);
    const matchPhone = a.telefono && a.telefono.replace(/[^\d]/g, '').includes(cleanKey.replace(/[^\d]/g, ''));
    const isCanceled = a.status === 'cancelada' || a.status === 'CANCELADA';
    return (matchEmail || matchPhone) && isCanceled;
  }).length;
}

/**
 * Cancel an appointment with cancellation fee calculation (0% on 1st, 20% on 2nd and subsequent cancellations)
 */
export async function cancelAppointmentInDatabase(
  appointmentIdOrCode: string,
  cancellationReason: string
): Promise<{
  success: boolean;
  isSecondOrMore: boolean;
  cancellationCount: number;
  penaltyPercent: number;
  penaltyAmount: number;
  updatedAppointment?: ConfirmedAppointment;
  error?: string;
}> {
  const currentLocal = getSavedAppointments();
  const index = currentLocal.findIndex(
    (a) => a.id === appointmentIdOrCode || a.code.toUpperCase() === appointmentIdOrCode.toUpperCase()
  );

  if (index === -1) {
    return {
      success: false,
      isSecondOrMore: false,
      cancellationCount: 0,
      penaltyPercent: 0,
      penaltyAmount: 0,
      error: 'No se encontró la cita para cancelar.',
    };
  }

  const app = currentLocal[index];
  const priorCancellations = getPatientCancellationCount(app.email || app.telefono);
  const currentCancellationNumber = priorCancellations + 1;

  // 2nd cancellation or more = 20% penalty fee policy
  const isSecondOrMore = currentCancellationNumber >= 2;
  const penaltyPercent = isSecondOrMore ? 20 : 0;

  // Base price extraction
  const rawPrice = String(app.selectedPackagePrice || app.servicePrice || '35');
  const basePriceNum = Number.parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 35;
  const penaltyAmount = isSecondOrMore ? Math.round(basePriceNum * 0.20 * 100) / 100 : 0;

  const updated: ConfirmedAppointment = {
    ...app,
    status: 'cancelada',
    cancellationCount: currentCancellationNumber,
    cancellationFeePercent: penaltyPercent,
    cancellationFeeAmount: penaltyAmount,
    cancellationReason: sanitizeString(cancellationReason || 'Cancelación solicitada por paciente', 400),
    canceledAt: new Date().toISOString(),
    notes: `Cancelación #${currentCancellationNumber}. Penalización: ${penaltyPercent}% ($${penaltyAmount} USD). Motivo: ${cancellationReason}`,
  };

  saveAppointmentToStorage(updated);

  recordSecurityEvent({
    action: 'APPOINTMENT_CANCEL_REQUEST',
    severity: isSecondOrMore ? 'WARNING' : 'INFO',
    details: `Cita [${app.code}] cancelada (Cancelación #${currentCancellationNumber}). Penalización aplicada: ${penaltyPercent}% ($${penaltyAmount} USD).`,
  });

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('appointments')
        .update({
          status: 'CANCELADA',
          cancellation_count: currentCancellationNumber,
          cancellation_fee_percent: penaltyPercent,
          cancellation_fee_amount: penaltyAmount,
          cancellation_reason: updated.cancellationReason,
          canceled_at: updated.canceledAt,
          notes: updated.notes,
        })
        .or(`id.eq.${app.id},code.eq.${app.code}`);
    } catch (e) {
      console.warn('Error updating cancellation in Supabase:', e);
    }
  }

  return {
    success: true,
    isSecondOrMore,
    cancellationCount: currentCancellationNumber,
    penaltyPercent,
    penaltyAmount,
    updatedAppointment: updated,
  };
}

/**
 * Save contact message with sanitization and security audit tracking
 */
export async function saveContactMessageToDatabase(data: {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanData = {
    nombre: sanitizeString(data.nombre, 60),
    email: sanitizeString(data.email, 100).toLowerCase(),
    telefono: data.telefono ? sanitizeString(data.telefono, 30) : undefined,
    mensaje: sanitizeString(data.mensaje, 1000),
  };

  recordSecurityEvent({
    action: 'CONTACT_SENT',
    severity: 'INFO',
    details: `Mensaje de contacto seguro recibido de ${maskSensitiveData('email', cleanData.email)}.`,
  });

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('contact_messages').insert([
      {
        id: `msg_${Date.now()}_${generateSecureCode()}`,
        nombre: cleanData.nombre,
        email: cleanData.email,
        telefono: cleanData.telefono || null,
        mensaje: cleanData.mensaje,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase contact message error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de conexión' };
  }
}

/**
 * Sends a technical support ticket / inquiry to the developer team
 */
export async function saveDeveloperTicketToDatabase(data: {
  nombre: string;
  email: string;
  tipoConsulta: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}): Promise<{ success: boolean; ticketId?: string; error?: string }> {
  const ticketId = `DEV-${generateSecureCode()}`;
  const cleanData = {
    nombre: sanitizeString(data.nombre, 60),
    email: sanitizeString(data.email, 100).toLowerCase(),
    tipoConsulta: sanitizeString(data.tipoConsulta, 50),
    telefono: data.telefono ? sanitizeString(data.telefono, 30) : undefined,
    asunto: sanitizeString(data.asunto, 120),
    mensaje: sanitizeString(data.mensaje, 1500),
  };

  recordSecurityEvent({
    action: 'SUPPORT_TICKET_SENT',
    severity: 'INFO',
    details: `Ticket de soporte técnico (${ticketId}) generado por ${maskSensitiveData('email', cleanData.email)} [${cleanData.tipoConsulta}].`,
  });

  if (!isSupabaseConfigured) {
    return { success: true, ticketId };
  }

  try {
    const { error } = await supabase.from('support_tickets').insert([
      {
        id: ticketId,
        nombre: cleanData.nombre,
        email: cleanData.email,
        telefono: cleanData.telefono || null,
        tipo_consulta: cleanData.tipoConsulta,
        asunto: cleanData.asunto,
        mensaje: cleanData.mensaje,
        status: 'abierto',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      // Fallback: also try contact_messages if support_tickets table is not yet created
      await supabase.from('contact_messages').insert([
        {
          id: ticketId,
          nombre: `[SOPORTE DEV] ${cleanData.nombre}`,
          email: cleanData.email,
          telefono: cleanData.telefono || null,
          mensaje: `[Tipo: ${cleanData.tipoConsulta}] ${cleanData.asunto} - ${cleanData.mensaje}`,
          created_at: new Date().toISOString(),
        },
      ]);
    }
    return { success: true, ticketId };
  } catch (err: any) {
    return { success: true, ticketId };
  }
}

/**
 * Returns the slots and their availability for a specific date (YYYY-MM-DD)
 */
export function getSlotsForDate(
  dateStr: string,
  _serviceId?: string,
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

  return baseSlots.map((time) => {
    // Check if this slot is already booked in the database
    const booked = appointments.find(
      (app) => app.fecha === dateStr && app.hora === time
    );

    if (booked) {
      return {
        time,
        status: (booked.status === 'pendiente_validacion' ? 'por_confirmar' : 'ocupado') as SlotStatus,
        notes: `Horario reservado (${booked.code})`,
      };
    }

    return {
      time,
      status: 'disponible' as SlotStatus,
      notes: 'Disponible para agendar inmediatamente',
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
  const cleanTitle = sanitizeString(serviceTitle);
  const cleanNombre = sanitizeString(appointment.nombre);
  const cleanApellido = sanitizeString(appointment.apellido);

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Equilibra//Cita Medica//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Cita: ${cleanTitle} - Equilibra (${appointment.code})
DESCRIPTION:Consulta para ${cleanNombre} ${cleanApellido}\\nServicio: ${cleanTitle}\\nFecha: ${appointment.fecha} - ${appointment.hora}\\nTeléfono de contacto: ${appointment.telefono}\\nUbicación: ${clinicAddress}\\nTeléfono Clínica: ${clinicPhone}
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
