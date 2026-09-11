import { ConfirmedAppointment } from '../types';
import { generateMedicalReportPdfDataUrl } from './pdfUtils';

/**
 * Parses appointment date and time string into start and end Date objects
 * Handles formats like:
 * fecha: "2026-09-15", hora: "09:00 AM - 10:00 AM" or "09:00 AM"
 */
export function parseAppointmentDateTime(fecha: string, hora: string): { start: Date; end: Date } {
  const fallbackStart = new Date();
  const fallbackEnd = new Date(fallbackStart.getTime() + 60 * 60 * 1000);

  if (!fecha || fecha.toLowerCase().includes('por programar')) {
    return { start: fallbackStart, end: fallbackEnd };
  }

  try {
    const [yearStr, monthStr, dayStr] = fecha.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    // Extract time, e.g. "09:00 AM" or "09:00"
    const startTimeMatch = hora.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    let hours = 9;
    let minutes = 0;

    if (startTimeMatch) {
      hours = parseInt(startTimeMatch[1], 10);
      minutes = parseInt(startTimeMatch[2], 10);
      const period = startTimeMatch[3]?.toUpperCase();
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }

    const start = new Date(year, month, day, hours, minutes, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour session

    return { start, end };
  } catch (e) {
    console.error('Error parsing appointment date time:', e);
    return { start: fallbackStart, end: fallbackEnd };
  }
}

/**
 * Format a Date to iCal / Google Calendar format (YYYYMMDDTHHmmssZ)
 */
function toUtcCompact(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates a direct 1-click Google Calendar Event URL
 */
export function generateGoogleCalendarUrl(appointment: ConfirmedAppointment): string {
  const { start, end } = parseAppointmentDateTime(appointment.fecha, appointment.hora);
  const title = `Cita EQUILIBRA: ${appointment.selectedPackageName || appointment.serviceTitle || 'Sesión Clínica'}`;
  const code = appointment.packageCode || appointment.code;
  const specialist = appointment.specialistName || 'Especialista EQUILIBRA';

  const details = [
    `Centro de Fisioterapia & Bienestar EQUILIBRA`,
    `Código de Reserva: ${code}`,
    `Paciente: ${appointment.nombre} ${appointment.apellido}`,
    `Especialista Asignado: ${specialist}`,
    `Servicio: ${appointment.selectedPackageName || appointment.serviceTitle || 'Fisioterapia Especializada'}`,
    `Fecha: ${appointment.fecha} | Hora: ${appointment.hora}`,
    `Ubicación: Sabana Grande, Caracas - Venezuela (Telf: +58 412 638-8484)`,
    `Recomendación: Llevar ropa cómoda deportiva y presentarse 10 minutos antes.`
  ].join('\n');

  const location = 'EQUILIBRA Centro de Fisioterapia, Sabana Grande, Caracas';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toUtcCompact(start)}/${toUtcCompact(end)}`,
    details: details,
    location: location,
    add: appointment.email || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and downloads a standard RFC 5545 iCalendar (.ics) file
 * Compatible with Apple Calendar (iOS/macOS), Microsoft Outlook, and Android
 */
export function downloadIcsCalendarFile(appointment: ConfirmedAppointment): void {
  const { start, end } = parseAppointmentDateTime(appointment.fecha, appointment.hora);
  const code = appointment.packageCode || appointment.code;
  const title = `Cita EQUILIBRA: ${appointment.selectedPackageName || 'Fisioterapia'}`;
  const specialist = appointment.specialistName || 'Especialista EQUILIBRA';

  const description = `Centro de Fisioterapia & Bienestar EQUILIBRA\\n` +
    `Código de Reserva: ${code}\\n` +
    `Paciente: ${appointment.nombre} ${appointment.apellido}\\n` +
    `Especialista: ${specialist}\\n` +
    `Fecha: ${appointment.fecha} | Horario: ${appointment.hora}\\n` +
    `Recomendaciones: Llevar ropa deportiva cómoda y estudios de imagen previos.`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EQUILIBRA Fisioterapia//Citas Clinicas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:equilibra-${appointment.code}-${Date.now()}@equilibra.com`,
    `DTSTAMP:${toUtcCompact(new Date())}`,
    `DTSTART:${toUtcCompact(start)}`,
    `DTEND:${toUtcCompact(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:EQUILIBRA - Sabana Grande\\, Caracas\\, Venezuela`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de Cita Médica en EQUILIBRA en 2 horas',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Cita_EQUILIBRA_${code}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Prepares a pre-formatted WhatsApp message for patient or clinic contact
 */
export function generateWhatsAppReminderMessage(appointment: ConfirmedAppointment): string {
  const code = appointment.packageCode || appointment.code;
  const specialist = appointment.specialistName ? ` con ${appointment.specialistName}` : '';
  const packageNotice = appointment.packageTotalSessions && appointment.packageTotalSessions > 1
    ? ` (Paquete de ${appointment.packageTotalSessions} sesiones)`
    : '';

  return `Hola EQUILIBRA 👋! Te contacto por mi cita médica:%0A%0A` +
    `📌 *Código:* ${code}%0A` +
    `👤 *Paciente:* ${appointment.nombre} ${appointment.apellido}%0A` +
    `🩺 *Servicio:* ${appointment.selectedPackageName || appointment.serviceTitle || 'Fisioterapia'}${packageNotice}%0A` +
    `📅 *Fecha:* ${appointment.fecha}%0A` +
    `⏰ *Horario:* ${appointment.hora}%0A` +
    `👨‍⚕️ *Especialista:* ${specialist || 'Asignado en clínica'}%0A%0A` +
    `Agradezco me confirmen los detalles para mi llegada. ¡Muchas gracias!`;
}

/**
 * Downloads official Printable/PDF Appointment Voucher
 */
export function downloadAppointmentVoucherPdf(appointment: ConfirmedAppointment): void {
  const code = appointment.packageCode || appointment.code;
  const specialist = appointment.specialistName || 'Lic. Isaac Jewsiejew';
  const serviceTitle = appointment.selectedPackageName || appointment.serviceTitle || 'Fisioterapia & Readaptación';

  const pdfDataUrl = generateMedicalReportPdfDataUrl({
    clinicName: 'CENTRO DE FISIOTERAPIA & BIENESTAR EQUILIBRA',
    patientName: `${appointment.nombre} ${appointment.apellido}`,
    patientIdDoc: appointment.telefono || 'Verificado',
    doctorName: specialist,
    doctorSpecialty: 'Fisioterapeuta / Especialista Clínico',
    reportTitle: 'COMPROBANTE OFICIAL DE RESERVA Y CITA CLINICA',
    date: appointment.fecha || new Date().toISOString().split('T')[0],
    category: 'Comprobante y Pase de Atención',
    diagnosis: `Servicio Reservado: ${serviceTitle} | Código Oficial: ${code}`,
    evolutionNotes: `Horario reservado: ${appointment.hora}. Estado: ${appointment.status.toUpperCase()}. ` +
      `Sede principal: Sabana Grande, Caracas - Venezuela. Tarifa: ${appointment.selectedPackagePrice || '35€'}. ` +
      `Valide su estatus en el Portal del Paciente con su código ${code}.`,
    recommendations: [
      'Llegar 10 minutos antes de la hora programada a la sede.',
      'Asistir con ropa deportiva holgada o cómoda para evaluación física.',
      'Traer radiografías, resonancias o informes médicos previos si los tiene.',
      'En caso de reprogramar, realizarlo con más de 2 horas de anticipación desde el portal.'
    ]
  });

  const link = document.createElement('a');
  link.href = pdfDataUrl;
  link.download = `Comprobante_EQUILIBRA_${code}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
