import { ConfirmedAppointment, TelegramConfig } from '../types';
import { TEAM_MEMBERS } from '../data/teamData';

const TELEGRAM_CONFIG_STORAGE_KEY = 'equilibra_telegram_config';

// Default / fallback configurations with default specialist tags
export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_BOT_TOKEN) || '',
  chatId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_CHAT_ID) || '',
  enabled: true,
  notifyOnBooking: true,
  notifyOnCancellation: true,
  specialistTags: {
    'isaac-jewsiejew': '',
    'marivid-requena': '',
    'laury-torrealba': '',
    'stephani-salina': '',
    'ruben-torrealba': '',
    'rebecca-triana': '',
    'marianna-morales': '',
    'gabriel-gonzalez': '',
  },
};

export function getStoredTelegramConfig(): TelegramConfig {
  const envToken = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_BOT_TOKEN) || '';
  const envChatId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_CHAT_ID) || '';

  if (typeof window === 'undefined') return DEFAULT_TELEGRAM_CONFIG;
  try {
    const raw = localStorage.getItem(TELEGRAM_CONFIG_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_TELEGRAM_CONFIG,
        botToken: envToken || DEFAULT_TELEGRAM_CONFIG.botToken,
        chatId: envChatId || DEFAULT_TELEGRAM_CONFIG.chatId,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TELEGRAM_CONFIG,
      ...parsed,
      botToken: parsed.botToken || envToken || DEFAULT_TELEGRAM_CONFIG.botToken,
      chatId: parsed.chatId || envChatId || DEFAULT_TELEGRAM_CONFIG.chatId,
      specialistTags: {
        ...DEFAULT_TELEGRAM_CONFIG.specialistTags,
        ...(parsed.specialistTags || {}),
      },
    };
  } catch (e) {
    console.error('Error reading telegram config:', e);
    return DEFAULT_TELEGRAM_CONFIG;
  }
}

export function saveTelegramConfig(config: Partial<TelegramConfig>): TelegramConfig {
  if (typeof window === 'undefined') return DEFAULT_TELEGRAM_CONFIG;
  try {
    const current = getStoredTelegramConfig();
    const updated: TelegramConfig = {
      ...current,
      ...config,
      specialistTags: {
        ...(current.specialistTags || {}),
        ...(config.specialistTags || {}),
      },
    };
    localStorage.setItem(TELEGRAM_CONFIG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('equilibra_telegram_config_updated', { detail: updated }));

    // Persist to server config for all devices
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramToken: updated.botToken,
        telegramChatId: updated.chatId,
        telegramEnabled: updated.enabled,
        specialistTags: updated.specialistTags,
      }),
    }).catch(err => console.warn('[saveTelegramConfig] Server sync note:', err));

    return updated;
  } catch (e) {
    console.error('Error saving telegram config:', e);
    return DEFAULT_TELEGRAM_CONFIG;
  }
}

/**
 * Finds the Telegram @tag for a given specialist name or ID
 */
export function getSpecialistTelegramTag(
  specialistIdOrName: string,
  config?: TelegramConfig
): string | null {
  const currentConfig = config || getStoredTelegramConfig();
  const tags = currentConfig.specialistTags || {};

  if (!specialistIdOrName) return null;

  // 1. Direct ID match
  if (tags[specialistIdOrName] && tags[specialistIdOrName].trim()) {
    const tag = tags[specialistIdOrName].trim();
    return tag.startsWith('@') ? tag : `@${tag}`;
  }

  // 2. Name search in TEAM_MEMBERS
  const member = TEAM_MEMBERS.find(
    (m) =>
      m.id === specialistIdOrName ||
      m.name.toLowerCase().includes(specialistIdOrName.toLowerCase()) ||
      specialistIdOrName.toLowerCase().includes(m.name.toLowerCase())
  );

  if (member && tags[member.id] && tags[member.id].trim()) {
    const tag = tags[member.id].trim();
    return tag.startsWith('@') ? tag : `@${tag}`;
  }

  return null;
}

/**
 * Formats and sends a real-time booking alert to the configured Telegram Bot & Channel/Chat.
 * Includes: Nombre, Apellido, Teléfono, Qué reservó (Evaluación, Sesión o Paquete), Especialista, Etiqueta (@tag), Fecha, Hora, Código y Motivo.
 */
export async function sendTelegramBookingAlert(
  appointment: ConfirmedAppointment,
  overrideConfig?: Partial<TelegramConfig>
): Promise<{ success: boolean; message: string; data?: any }> {
  const config = { ...getStoredTelegramConfig(), ...overrideConfig };

  if (config.enabled === false) {
    return { success: false, message: 'Notificaciones de Telegram desactivadas en la configuración.' };
  }

  // 1. Try sending via full-stack server endpoint first (has access to server Secrets)
  try {
    const res = await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointment,
        customToken: config.botToken || undefined,
        customChatId: config.chatId || undefined,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        saveTelegramConfig({ lastTestedAt: new Date().toISOString() });
        return { success: true, message: 'Alerta enviada a Telegram con éxito desde el servidor.', data };
      }
    }
  } catch (apiErr) {
    console.warn('[Telegram Alert] Server API not reachable or failed, attempting direct client fallback:', apiErr);
  }

  // 2. Direct client fallback if botToken & chatId are provided in client or localStorage
  const botToken = config.botToken || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_BOT_TOKEN) || '';
  const chatId = config.chatId || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_CHAT_ID) || '';

  if (!botToken || !chatId) {
    console.warn('Telegram Bot Token o Chat ID no configurados aún en el panel de administración ni en variables de entorno.');
    return {
      success: false,
      message: 'Token o Chat ID de Telegram no configurados. Configúralos en Secrets o en Panel Admin > Configuración.',
    };
  }

  // Determine what was booked (Evaluación, Sesión o Paquete)
  const serviceName = appointment.service_title || appointment.serviceTitle || appointment.serviceId || 'Servicio General';
  const packageName = appointment.selectedPackageName || (appointment.primeraVisita ? 'Evaluación Inicial' : 'Sesión Estándar');
  const price = appointment.selectedPackagePrice || appointment.servicePrice || appointment.service_price || 'Tarifa estándar';
  const specialist = appointment.specialistName || appointment.specialist_name || 'Especialista Asignado';
  const specialistId = appointment.specialistId || appointment.specialist_id || '';
  const visitType = appointment.primeraVisita ? '✨ Primera Vez (Evaluación)' : '🔄 Paciente Recurrente';

  // Specialist Telegram Tag
  const specialistTag = getSpecialistTelegramTag(specialistId || specialist, config);
  const tagMentionLine = specialistTag ? `🔔 *Atención Especialista:* ${specialistTag}` : '';

  const telegramMessage = 
`🚨 *¡NUEVA CITA AGENDADA EN EQUILIBRA!* 🚨
━━━━━━━━━━━━━━━━━━━━━━
👤 *Paciente:* ${appointment.nombre} ${appointment.apellido}
📞 *Teléfono:* \`${appointment.telefono}\`
📧 *Email:* \`${appointment.email}\`
🏷️ *Reserva:* *${packageName}*
🩺 *Área:* ${serviceName}
💵 *Tarifa:* ${price}
👨‍⚕️ *Especialista Asignado:* ${specialist} ${specialistTag ? `(${specialistTag})` : ''}
📅 *Fecha:* ${appointment.fecha}
⏰ *Horario:* ${appointment.hora}
🔖 *Código de Cita:* \`${appointment.code}\`
📍 *Sede:* Sabana Grande, Centro Profesional del Este
📋 *Modalidad:* ${visitType}
${appointment.motivoConsulta || appointment.motivo ? `📝 *Motivo / Síntomas:* _${(appointment.motivoConsulta || appointment.motivo || '').replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&')}_` : '📝 *Motivo:* Sin especificar'}
${tagMentionLine ? `━━━━━━━━━━━━━━━━━━━━━━\n${tagMentionLine}` : ''}
━━━━━━━━━━━━━━━━━━━━━━
⏱️ _Registrada en tiempo real desde la Plataforma Web EQUILIBRA._`;

  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: telegramMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();

    if (result.ok) {
      saveTelegramConfig({ lastTestedAt: new Date().toISOString() });
      return { success: true, message: 'Alerta enviada a Telegram con éxito.', data: result };
    } else {
      console.error('Telegram API Error:', result);
      return { success: false, message: `Error de Telegram: ${result.description || 'Token o Chat ID inválidos'}` };
    }
  } catch (err: any) {
    console.error('Error sending Telegram alert directly:', err);
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
  // 1. Try server API test first
  try {
    const res = await fetch('/api/telegram/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim(), chatId: chatId.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        saveTelegramConfig({ botToken: token.trim(), chatId: chatId.trim(), enabled: true, lastTestedAt: new Date().toISOString() });
        return { success: true, message: '¡Mensaje de prueba recibido exitosamente en Telegram!' };
      } else if (data.error) {
        return { success: false, message: `Error devuelto: ${data.error}` };
      }
    }
  } catch (serverErr) {
    console.warn('[Telegram Test] Server route unavailable, trying direct fetch:', serverErr);
  }

  // 2. Direct browser test
  if (!token.trim() || !chatId.trim()) {
    return { success: false, message: 'Debes ingresar tanto el Telegram Bot Token como el Chat ID (ej: -1001234567890 o tu ID personal).' };
  }

  const testMessage = 
`✅ *¡CONEXIÓN DE TELEGRAM EXITOSA CON EQUILIBRA!*
━━━━━━━━━━━━━━━━━━━━━━
🤖 *Bot:* Activo y vinculado correctamente
🏥 *Clínica:* EQUILIBRA Centro de Fisioterapia & Salud Integral
⏰ *Fecha y Hora:* ${new Date().toLocaleString('es-VE')}
━━━━━━━━━━━━━━━━━━━━━━
_A partir de este momento recibirás en tiempo real todas las citas que se agenden en la página web con todos los datos del paciente (nombre, apellido, teléfono, qué reservó si evaluación/sesión/paquete, especialista asignado y sus etiquetas @usuario)._`;

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
      return { success: true, message: '¡Mensaje de prueba recibido exitosamente en Telegram!' };
    } else {
      return { success: false, message: `Telegram rechazó la solicitud: ${result.description || 'Verifica que el bot pertenezca al chat/grupo y tenga permisos de administrador'}` };
    }
  } catch (err: any) {
    return { success: false, message: `Error al conectar con la API de Telegram: ${err?.message || err}` };
  }
}

/**
 * Tests tagging a specific specialist with @tag in Telegram group
 */
export async function testTelegramSpecialistTagging(
  token: string,
  chatId: string,
  specialistName: string,
  specialistTag: string,
  specialty: string
): Promise<{ success: boolean; message: string }> {
  if (!token.trim() || !chatId.trim()) {
    return { success: false, message: 'Ingresa el Bot Token y el Chat ID primero.' };
  }

  const formattedTag = specialistTag.trim().startsWith('@') ? specialistTag.trim() : `@${specialistTag.trim()}`;

  const demoMessage = 
`🧪 *PRUEBA DE ETIQUETADO DE ESPECIALISTA* 🏷️
━━━━━━━━━━━━━━━━━━━━━━
👨‍⚕️ *Especialista:* ${specialistName}
🩺 *Especialidad:* ${specialty}
🏷️ *Usuario Telegram:* ${formattedTag}
━━━━━━━━━━━━━━━━━━━━━━
🔔 *Llamado de atención:* ${formattedTag} ¡Esta es una mención de prueba desde el sistema EQUILIBRA! Cuando un paciente reserve en tu área de ${specialty}, recibirás la notificación con tu etiqueta en este grupo.`;

  try {
    const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: demoMessage,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    if (result.ok) {
      return { success: true, message: `¡Mención de prueba enviada a ${formattedTag} en Telegram!` };
    } else {
      return { success: false, message: `Error de Telegram: ${result.description}` };
    }
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}` };
  }
}
