import { AdminNotification, ConfirmedAppointment } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'equilibra_admin_notifications';

export function getStoredNotifications(): AdminNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading notifications:', e);
    return [];
  }
}

export function saveStoredNotifications(notifications: AdminNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('equilibra_notifications_updated'));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // ignore
  }
}

export function notifySpecialistNewAppointment(appointment: ConfirmedAppointment): void {
  const specialistName = appointment.specialistName || 'Especialista';
  const newNotif: AdminNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: `🩺 Nueva Cita: ${appointment.nombre} ${appointment.apellido}`,
    message: `${appointment.nombre} ${appointment.apellido} agendó ${appointment.selectedPackageName || appointment.serviceId} para el ${appointment.fecha} a las ${appointment.hora}. Especialista: ${specialistName}.`,
    timestamp: new Date().toISOString(),
    type: 'appointment',
    read: false,
    linkTab: 'citas',
  };

  const current = getStoredNotifications();
  const updated = [newNotif, ...current.slice(0, 49)];
  saveStoredNotifications(updated);

  playNotificationChime();

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('EQUILIBRA - Nueva Cita Asignada', {
        body: `${appointment.nombre} ${appointment.apellido} • ${appointment.fecha} (${appointment.hora})\n${specialistName}`,
        icon: '/imagenes/logos/Equilibra logo transparente.png',
      });
    } catch (err) {
      console.warn('Native notification trigger:', err);
    }
  }
}

export function generateWhatsAppAlertUrl(appointment: ConfirmedAppointment, specialistPhone = '584126388484'): string {
  const text = `🔔 *NUEVA CITA AGENDADA - EQUILIBRA* 🔔\n\n` +
    `👤 *Paciente:* ${appointment.nombre} ${appointment.apellido}\n` +
    `📅 *Fecha:* ${appointment.fecha}\n` +
    `⏰ *Horario:* ${appointment.hora}\n` +
    `🩺 *Servicio / Paquete:* ${appointment.selectedPackageName || appointment.serviceId} (${appointment.selectedPackagePrice || appointment.servicePrice || 'Tarifa estándar'})\n` +
    `👨‍⚕️ *Especialista:* ${appointment.specialistName || 'Asignado'}\n` +
    `📞 *Teléfono Paciente:* ${appointment.telefono}\n` +
    `🔑 *Código de Cita:* ${appointment.code}\n` +
    (appointment.motivoConsulta ? `📝 *Motivo:* ${appointment.motivoConsulta}\n` : '') +
    `\n✅ _Cita registrada en tiempo real en la plataforma EQUILIBRA._`;

  const cleanPhone = specialistPhone.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
