import { ConfirmedAppointment, TelegramConfig } from '../types';

const TELEGRAM_CONFIG_STORAGE_KEY = 'equilibra_telegram_config';

// Default / fallback configurations
export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabled: true,
  notifyOnBooking: true,
  notifyOnCancellation: true,
};

export function getStoredTelegramConfig(): TelegramConfig {
  if (typeof window === 'undefined') return DEFAULT_TELEGRAM_CONFIG;
  try {
    const raw = localStorage.getItem(TELEGRAM_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_TELEGRAM_CONFIG;
    return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading telegram config:', e);
    return DEFAULT_TELEGRAM_CONFIG;
  }
}

export function saveTelegramConfig(config: Partial<TelegramConfig>): TelegramConfig {
  if (typeof window === 'undefined') return DEFAULT_TELEGRAM_CONFIG;
  try {
    const current = getStoredTelegramConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(TELEGRAM_CONFIG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('equilibra_telegram_config_updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Error saving telegram config:', e);
    return DEFAULT_TELEGRAM_CONFIG;
  }
}

/**
 * Formats and sends a real-time booking alert to the configured Telegram Bot & Channel/Chat.
 * Includes: Nombre, Apellido, Teléfono, Qué reservó (Evaluación, Sesión o Paquete), Especialista, Fecha, Hora, Código y Motivo.
 */
export async function sendTelegramBookingAlert(
  appointment: ConfirmedAppointment,
  overrideConfig?: Partial<TelegramConfig>
): Promise<{ success: boolean; message: string; data?: any }> {
  const config = { ...getStoredTelegramConfig(), ...overrideConfig };

  if (!config.enabled) {
    return { success: false, message: 'Notificaciones de Telegram desactivadas en la configuración.' };
  }

  const botToken = config.botToken || (typeof process !== 'undefined' ? process.env?.TELEGRAM_BOT_TOKEN : '') || '';
  const chatId = config.chatId || (typeof process !== 'undefined' ? process.env?.TELEGRAM_CHAT_ID : '') || '';

  if (!botToken || !chatId) {
    // If no token/chatId is configured yet, record notice but don't crash
    console.warn('Telegram Bot Token o Chat ID no configurados aún en el panel de administración.');
    return {
      success: false,
      message: 'Token o Chat ID de Telegram no configurados. Configúralos en el Panel de Administración > Ajustes.',
    };
  }

  // Determine what was booked (Evaluación, Sesión o Paquete)
  const serviceName = appointment.service_title || appointment.serviceTitle || appointment.serviceId || 'Servicio General';
  const packageName = appointment.selectedPackageName || (appointment.primeraVisita ? 'Evaluación Inicial' : 'Sesión Estándar');
  const price = appointment.selectedPackagePrice || appointment.servicePrice || appointment.service_price || 'Tarifa estándar';
  const specialist = appointment.specialistName || appointment.specialist_name || 'Especialista Asignado';
  const visitType = appointment.primeraVisita ? '✨ Primera Vez (Evaluación)' : '🔄 Paciente Recurrente';

  const telegramMessage = 
`🚨 *¡NUEVA CITA AGENDADA EN EQUILIBRA!* 🚨
━━━━━━━━━━━━━━━━━━━━━━
👤 *Paciente:* ${appointment.nombre} ${appointment.apellido}
📞 *Teléfono:* \`${appointment.telefono}\`
📧 *Email:* \`${appointment.email}\`
🏷️ *Reserva:* *${packageName}*
🩺 *Área:* ${serviceName}
💵 *Tarifa:* ${price}
👨‍⚕️ *Especialista Asignado:* ${specialist}
📅 *Fecha:* ${appointment.fecha}
⏰ *Horario:* ${appointment.hora}
🔖 *Código de Cita:* \`${appointment.code}\`
📍 *Sede:* Sabana Grande, Centro Profesional del Este
📋 *Modalidad:* ${visitType}
${appointment.motivoConsulta || appointment.motivo ? `📝 *Motivo / Síntomas:* _${(appointment.motivoConsulta || appointment.motivo || '').replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&')}_` : '📝 *Motivo:* Sin especificar'}
━━━━━━━━━━━━━━━━━━━━━━
⏱️ _Registrada en tiempo real desde la Plataforma Web EQUILIBRA._`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();

    if (result.ok) {
      // Save audit timestamp
      saveTelegramConfig({ lastTestedAt: new Date().toISOString() });
      return { success: true, message: 'Alerta enviada a Telegram con éxito.', data: result };
    } else {
      console.error('Telegram API Error:', result);
      return { success: false, message: `Error de Telegram: ${result.description || 'Token o Chat ID inválidos'}` };
    }
  } catch (err: any) {
    console.error('Error sending Telegram alert:', err);
    return { success: false, message: `Error de conexión con Telegram: ${err?.message || err}` };
  }
}

/**
 * Sends a test notification to verify that the Telegram Bot Token and Chat ID work correctly.
 */
export async function testTelegramNotification(
  token: string,
  chatId: string
): Promise<{ success: boolean; message: string }> {
  if (!token.trim() || !chatId.trim()) {
    return { success: false, message: 'Ingresa tanto el Token del Bot como el Chat ID para realizar la prueba.' };
  }

  const testMessage = 
`✅ *¡CONEXIÓN DE TELEGRAM EXITOSA CON EQUILIBRA!*
━━━━━━━━━━━━━━━━━━━━━━
🤖 *Bot:* Activo y vinculado
🏥 *Clínica:* EQUILIBRA Centro de Fisioterapia & Salud Integral
⏰ *Fecha y Hora:* ${new Date().toLocaleString('es-VE')}
━━━━━━━━━━━━━━━━━━━━━━
_A partir de este momento recibirás en tiempo real todas las citas que se agenden en la página web con todos los datos del paciente (nombre, apellido, teléfono, qué reservó si evaluación/sesión/paquete, especialista y horario)._`;

  try {
    const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: testMessage,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    if (result.ok) {
      saveTelegramConfig({ botToken: token.trim(), chatId: chatId.trim(), enabled: true, lastTestedAt: new Date().toISOString() });
      return { success: true, message: '¡Mensaje de prueba enviado exitosamente al canal/chat de Telegram!' };
    } else {
      return { success: false, message: `Telegram rechazó la solicitud: ${result.description}` };
    }
  } catch (err: any) {
    return { success: false, message: `Error al conectar con la API de Telegram: ${err?.message || err}` };
  }
}
