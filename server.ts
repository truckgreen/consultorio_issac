import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables from .env file if present
dotenv.config();

const PORT = 3000;
const CONFIG_FILE = path.join(process.cwd(), 'app_config.json');

// Interface for persistent config
interface StoredAppConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  telegramToken?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  specialistTags?: Record<string, string>;
  updatedAt?: string;
}

// Read saved config from disk if exists
function readDiskConfig(): StoredAppConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Config] Error reading app_config.json:', err);
  }
  return {
    supabaseUrl: 'https://lzszxtxddlamplzsoihx.supabase.co',
    telegramEnabled: true,
  };
}

// Write config to disk
function writeDiskConfig(newConfig: Partial<StoredAppConfig>): StoredAppConfig {
  try {
    const existing = readDiskConfig();
    const merged: StoredAppConfig = {
      ...existing,
      ...newConfig,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  } catch (err) {
    console.error('[Config] Error writing app_config.json:', err);
    return readDiskConfig();
  }
}

// Helper to get environment credentials across multiple sources and storage
function getEnvCredentials() {
  const disk = readDiskConfig();

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    disk.supabaseUrl ||
    'https://lzszxtxddlamplzsoihx.supabase.co';

  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLIC_KEY ||
    process.env.VITE_SUPABASE_KEY ||
    disk.supabaseAnonKey ||
    '';

  const telegramToken =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.VITE_TELEGRAM_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    process.env.TELEGRAM_TOKEN ||
    process.env.VITE_BOT_TOKEN ||
    disk.telegramToken ||
    '';

  const telegramChatId =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.VITE_TELEGRAM_CHAT_ID ||
    process.env.CHAT_ID ||
    process.env.TELEGRAM_GROUP_ID ||
    process.env.VITE_CHAT_ID ||
    disk.telegramChatId ||
    '';

  const telegramEnabled = disk.telegramEnabled ?? true;
  const specialistTags = disk.specialistTags || {};

  return {
    supabaseUrl: supabaseUrl.trim(),
    supabaseKey: supabaseKey.trim(),
    telegramToken: telegramToken.trim(),
    telegramChatId: telegramChatId.trim(),
    telegramEnabled,
    specialistTags,
  };
}

let serverSupabaseClient: SupabaseClient | null = null;
let currentClientUrl = '';
let currentClientKey = '';

function getServerSupabaseClient(): SupabaseClient | null {
  const { supabaseUrl, supabaseKey } = getEnvCredentials();
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
    if (!serverSupabaseClient || currentClientUrl !== supabaseUrl || currentClientKey !== supabaseKey) {
      try {
        serverSupabaseClient = createClient(supabaseUrl, supabaseKey);
        currentClientUrl = supabaseUrl;
        currentClientKey = supabaseKey;
        console.log('[Server Supabase] Connected to project:', supabaseUrl);
      } catch (err) {
        console.error('[Server Supabase] Client init error:', err);
        return null;
      }
    }
    return serverSupabaseClient;
  }
  return null;
}

// Helper to sanitize telegram token
function sanitizeTelegramToken(rawToken: string): string {
  if (!rawToken) return '';
  let token = rawToken.trim().replace(/^["']|["']$/g, '').trim();
  // Strip "bot" prefix if user entered "bot123456:ABC..."
  if (token.toLowerCase().startsWith('bot') && token.length > 4 && !token.includes('/')) {
    token = token.substring(3).trim();
  }
  return token;
}

// Telegram messaging function on server
async function sendTelegramMessage(token: string, chatId: string, text: string) {
  const cleanToken = sanitizeTelegramToken(token);
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    throw new Error('Telegram Bot Token o Chat ID no configurados.');
  }

  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
  
  // Try sending with Markdown first
  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: cleanChatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });

  let data = await response.json().catch(() => ({ ok: false, description: 'Respuesta no válida del servidor de Telegram' }));

  // If Markdown parsing fails, retry with plain text
  if (!data.ok && typeof data.description === 'string' && data.description.toLowerCase().includes("can't parse entities")) {
    const plainText = text.replace(/[*_`~[\]()]/g, '');
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: plainText,
        disable_web_page_preview: true,
      }),
    });
    data = await response.json().catch(() => ({ ok: false, description: 'Respuesta no válida del servidor de Telegram' }));
  }

  if (!data.ok) {
    const desc = data.description || '';
    if (desc === 'Not Found' || desc.toLowerCase().includes('not found')) {
      throw new Error('El Token del bot no es válido en Telegram (Not Found). Verifica que hayas copiado el token exacto entregado por @BotFather (ejemplo: 789123456:AAH...) sin espacios ni caracteres extra.');
    }
    if (desc.toLowerCase().includes('unauthorized')) {
      throw new Error('Token no autorizado. El token de @BotFather parece haber sido revocado o es inválido.');
    }
    if (desc.toLowerCase().includes('chat not found')) {
      throw new Error('El Chat ID no fue encontrado. Si es un grupo, agrega el bot al grupo primero. Si es chat privado, abre el bot y presiona /start.');
    }
    if (desc.toLowerCase().includes('bot was kicked') || desc.toLowerCase().includes('not a member')) {
      throw new Error('El bot fue expulsado o no es miembro del grupo de Telegram. Agrégalo nuevamente y dale permisos.');
    }
    throw new Error(desc || 'Error al enviar mensaje a Telegram');
  }
  return data;
}

// In-memory sliding window rate limiter
interface RateLimitBucket {
  timestamps: number[];
}
const rateLimits = new Map<string, RateLimitBucket>();

function createRateLimiter(windowMs: number, maxRequests: number, actionName: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'ip-client';
    const clientIp = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(',')[0].trim();
    const key = `${actionName}:${clientIp}`;
    const now = Date.now();

    let bucket = rateLimits.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      rateLimits.set(key, bucket);
    }

    bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

    if (bucket.timestamps.length >= maxRequests) {
      const oldest = bucket.timestamps[0];
      const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: `Límite de solicitudes de seguridad alcanzado para '${actionName}'. Reintenta en ${retryAfterSec} segundos.`,
      });
    }

    bucket.timestamps.push(now);
    next();
  };
}

async function startServer() {
  const app = express();

  // Web Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  app.use(express.json({ limit: '15mb' }));

  // 1. Health check
  app.get('/api/health', (req, res) => {
    const env = getEnvCredentials();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabaseConfigured: Boolean(env.supabaseUrl && env.supabaseKey),
      telegramConfigured: Boolean(env.telegramToken && env.telegramChatId),
    });
  });

  // 2. Global configuration endpoint (Syncs credentials across all devices)
  app.get('/api/config', (req, res) => {
    const { supabaseUrl, supabaseKey, telegramToken, telegramChatId, telegramEnabled, specialistTags } = getEnvCredentials();
    res.json({
      success: true,
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseKey,
        isConfigured: Boolean(supabaseUrl && supabaseKey),
      },
      telegram: {
        botToken: telegramToken,
        chatId: telegramChatId,
        enabled: telegramEnabled,
        specialistTags: specialistTags || {},
        isConfigured: Boolean(telegramToken && telegramChatId),
        hasToken: Boolean(telegramToken),
      },
    });
  });

  // 2b. Update Global Configuration (Saves across all devices and server runtime)
  app.post('/api/config', createRateLimiter(60 * 1000, 15, 'config_update'), (req, res) => {
    try {
      const {
        supabaseUrl,
        supabaseAnonKey,
        supabaseKey,
        telegramToken,
        botToken,
        telegramChatId,
        chatId,
        telegramEnabled,
        enabled,
        specialistTags,
      } = req.body;

      const updatePayload: Partial<StoredAppConfig> = {};

      if (typeof supabaseUrl === 'string') updatePayload.supabaseUrl = supabaseUrl.trim();
      if (typeof supabaseAnonKey === 'string') updatePayload.supabaseAnonKey = supabaseAnonKey.trim();
      else if (typeof supabaseKey === 'string') updatePayload.supabaseAnonKey = supabaseKey.trim();

      if (typeof telegramToken === 'string') updatePayload.telegramToken = telegramToken.trim();
      else if (typeof botToken === 'string') updatePayload.telegramToken = botToken.trim();

      if (typeof telegramChatId === 'string') updatePayload.telegramChatId = telegramChatId.trim();
      else if (typeof chatId === 'string') updatePayload.telegramChatId = chatId.trim();

      if (typeof telegramEnabled === 'boolean') updatePayload.telegramEnabled = telegramEnabled;
      else if (typeof enabled === 'boolean') updatePayload.telegramEnabled = enabled;

      if (specialistTags && typeof specialistTags === 'object') {
        updatePayload.specialistTags = specialistTags;
      }

      const updated = writeDiskConfig(updatePayload);

      // Re-initialize Supabase client if keys changed
      if (updatePayload.supabaseUrl || updatePayload.supabaseAnonKey) {
        getServerSupabaseClient();
      }

      // Sync to Supabase clinic_settings table if client available
      const client = getServerSupabaseClient();
      if (client) {
        if (updatePayload.telegramToken || updatePayload.telegramChatId || updatePayload.specialistTags) {
          client.from('clinic_settings').upsert({
            id: 'telegram_config',
            value: {
              botToken: updated.telegramToken,
              chatId: updated.telegramChatId,
              enabled: updated.telegramEnabled ?? true,
              specialistTags: updated.specialistTags || {},
            },
            updated_at: new Date().toISOString(),
          }).then(() => {}).catch(err => console.warn('[Server] Supabase clinic_settings upsert error:', err));
        }
        if (updatePayload.supabaseUrl || updatePayload.supabaseAnonKey) {
          client.from('clinic_settings').upsert({
            id: 'supabase_config',
            value: {
              url: updated.supabaseUrl,
              anonKey: updated.supabaseAnonKey,
            },
            updated_at: new Date().toISOString(),
          }).then(() => {}).catch(err => console.warn('[Server] Supabase clinic_settings upsert error:', err));
        }
      }

      const env = getEnvCredentials();

      res.json({
        success: true,
        message: 'Configuración guardada persistentemente y sincronizada con todos los dispositivos.',
        config: {
          supabase: {
            url: env.supabaseUrl,
            anonKey: env.supabaseKey,
            isConfigured: Boolean(env.supabaseUrl && env.supabaseKey),
          },
          telegram: {
            botToken: env.telegramToken,
            chatId: env.telegramChatId,
            enabled: env.telegramEnabled,
            specialistTags: env.specialistTags,
            isConfigured: Boolean(env.telegramToken && env.telegramChatId),
          },
        },
      });
    } catch (err: any) {
      console.error('[API POST /api/config] Error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Error al guardar configuración global' });
    }
  });

  // 3. Telegram notification endpoint
  app.post('/api/telegram/notify', createRateLimiter(60 * 1000, 20, 'telegram_notify'), async (req, res) => {
    try {
      const { appointment, customToken, customChatId } = req.body;
      const env = getEnvCredentials();

      const botToken = (customToken || env.telegramToken || '').trim();
      const chatId = (customChatId || env.telegramChatId || '').trim();

      if (!botToken || !chatId) {
        return res.status(400).json({
          success: false,
          error: 'Faltan credenciales de Telegram (Bot Token o Chat ID no configurados en Secrets ni en solicitud).',
        });
      }

      if (!appointment) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos de la cita médica.',
        });
      }

      const serviceName =
        appointment.service_title ||
        appointment.serviceTitle ||
        appointment.serviceId ||
        'Fisioterapia y Rehabilitación';

      const packageName =
        appointment.selectedPackageName ||
        appointment.selected_package_name ||
        (appointment.primeraVisita || appointment.primera_visita
          ? 'Evaluación Inicial & Diagnóstico'
          : 'Sesión Clínica');

      const price =
        appointment.selectedPackagePrice ||
        appointment.selected_package_price ||
        appointment.servicePrice ||
        appointment.service_price ||
        'Tarifa oficial';

      const specialist =
        appointment.specialistName ||
        appointment.specialist_name ||
        'Lic. Isaac Jewsiejew';

      const patientName = `${appointment.nombre || ''} ${appointment.apellido || ''}`.trim();
      const phone = appointment.telefono || 'Sin teléfono';
      const email = appointment.email || 'Sin email';
      const date = appointment.fecha || 'Fecha por confirmar';
      const time = appointment.hora || 'Horario por confirmar';
      const code = appointment.code || 'EQUILIBRA';
      const motivo = (appointment.motivoConsulta || appointment.motivo || 'Consulta general')
        .replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');

      const telegramText =
`🚨 *¡NUEVA CITA AGENDADA EN EQUILIBRA!* 🚨
━━━━━━━━━━━━━━━━━━━━━━
👤 *Paciente:* ${patientName}
📞 *Teléfono:* \`${phone}\`
📧 *Email:* \`${email}\`
🏷️ *Reserva:* *${packageName}*
🩺 *Área:* ${serviceName}
💵 *Tarifa:* ${price}
👨‍⚕️ *Especialista Asignado:* ${specialist}
📅 *Fecha:* ${date}
⏰ *Horario:* ${time}
🔖 *Código de Cita:* \`${code}\`
📍 *Sede:* Sabana Grande, Centro Profesional del Este
📝 *Motivo / Síntomas:* _${motivo}_
━━━━━━━━━━━━━━━━━━━━━━
⏱️ _Registrada en tiempo real desde la Plataforma Web EQUILIBRA._`;

      const result = await sendTelegramMessage(botToken, chatId, telegramText);
      res.json({ success: true, result });
    } catch (err: any) {
      console.error('[API Telegram Notify] Error:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Error al enviar alerta a Telegram',
      });
    }
  });

  // 4. Telegram test endpoint
  app.post('/api/telegram/test', createRateLimiter(60 * 1000, 10, 'telegram_test'), async (req, res) => {
    try {
      const { token, chatId } = req.body;
      const env = getEnvCredentials();

      const botToken = (token || env.telegramToken || '').trim();
      const targetChatId = (chatId || env.telegramChatId || '').trim();

      if (!botToken || !targetChatId) {
        return res.status(400).json({
          success: false,
          error: 'Debes proporcionar o tener configurado el Bot Token y el Chat ID de Telegram.',
        });
      }

      const testMessage =
`✅ *¡CONEXIÓN DE TELEGRAM EXITOSA CON EQUILIBRA!*
━━━━━━━━━━━━━━━━━━━━━━
🤖 *Bot:* Activo y vinculado correctamente
🏥 *Clínica:* EQUILIBRA Centro de Fisioterapia & Salud Integral
⏰ *Fecha y Hora:* ${new Date().toLocaleString('es-VE')}
━━━━━━━━━━━━━━━━━━━━━━
_A partir de este momento recibirás en tiempo real todas las citas agendadas con datos completos del paciente, especialidad, tarifa y horarios._`;

      const result = await sendTelegramMessage(botToken, targetChatId, testMessage);
      res.json({ success: true, message: '¡Mensaje de prueba recibido exitosamente en Telegram!', result });
    } catch (err: any) {
      console.error('[API Telegram Test] Error:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Error al conectar con Telegram',
      });
    }
  });

  // 5. Appointments API (Save to Supabase & Auto-notify Telegram)
  app.get('/api/appointments', async (req, res) => {
    const supabaseClient = getServerSupabaseClient();
    if (!supabaseClient) {
      return res.json({ success: true, data: [], source: 'local' });
    }

    try {
      const { data, error } = await supabaseClient
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      res.json({ success: true, data: data || [], source: 'supabase' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.post('/api/appointments', createRateLimiter(10 * 60 * 1000, 30, 'appointments_create'), async (req, res) => {
    const appointment = req.body;
    if (!appointment || !appointment.id) {
      return res.status(400).json({ success: false, error: 'Datos de cita inválidos' });
    }

    let supabaseSaved = false;
    let supabaseError: string | null = null;

    const supabaseClient = getServerSupabaseClient();
    if (supabaseClient) {
      try {
        // Attempt full insert with flexible columns
        const payload: Record<string, any> = {
          id: appointment.id,
          code: appointment.code || `EQ-${Date.now().toString(36).toUpperCase()}`,
          service_id: appointment.service_id || appointment.serviceId || 'fisioterapia',
          service_title: appointment.service_title || appointment.serviceTitle || 'Fisioterapia',
          service_price: appointment.service_price || appointment.servicePrice || '35 USD',
          amount: Number(appointment.amount) || 35,
          fecha: appointment.fecha,
          hora: appointment.hora,
          nombre: appointment.nombre,
          apellido: appointment.apellido,
          telefono: appointment.telefono,
          email: appointment.email,
          motivo_consulta: appointment.motivoConsulta || appointment.motivo || '',
          motivo: appointment.motivoConsulta || appointment.motivo || '',
          primera_visita: appointment.primera_visita ?? appointment.primeraVisita ?? true,
          status: (appointment.status || 'CONFIRMADA').toUpperCase(),
          specialist_id: appointment.specialist_id || appointment.specialistId || 'isaac-jewsiejew',
          specialist_name: appointment.specialist_name || appointment.specialistName || 'Lic. Isaac Jewsiejew',
          notes: appointment.notes || 'Registro verificado por EQUILIBRA',
          payment_status: appointment.payment_status || 'PENDIENTE',
          created_at: appointment.created_at || appointment.createdAt || new Date().toISOString(),
        };

        if (appointment.selectedPackageName || appointment.selected_package_name) {
          payload.selected_package_name = appointment.selectedPackageName || appointment.selected_package_name;
        }
        if (appointment.selectedPackagePrice || appointment.selected_package_price) {
          payload.selected_package_price = appointment.selectedPackagePrice || appointment.selected_package_price;
        }

        const { data, error } = await supabaseClient.from('appointments').upsert([payload]).select();

        if (error) {
          console.warn('[Server Supabase Upsert] Warning with full payload:', error.message);
          // Retry with standard minimal columns if schema has fewer columns
          const minimalPayload = {
            id: appointment.id,
            code: payload.code,
            service_id: payload.service_id,
            service_title: payload.service_title,
            fecha: payload.fecha,
            hora: payload.hora,
            nombre: payload.nombre,
            apellido: payload.apellido,
            telefono: payload.telefono,
            email: payload.email,
            status: payload.status,
            amount: payload.amount,
            specialist_name: payload.specialist_name,
            created_at: payload.created_at,
          };
          const retryRes = await supabaseClient.from('appointments').upsert([minimalPayload]).select();
          if (retryRes.error) {
            supabaseError = retryRes.error.message;
            console.error('[Server Supabase Upsert] Minimal retry also failed:', retryRes.error.message);
          } else {
            supabaseSaved = true;
          }
        } else {
          supabaseSaved = true;
        }
      } catch (err: any) {
        supabaseError = err?.message || 'Error con Supabase';
        console.error('[Server Supabase] Exception saving appointment:', err);
      }
    }

    // Always attempt Telegram notification automatically
    const env = getEnvCredentials();
    let telegramSent = false;
    let telegramError: string | null = null;

    if (env.telegramToken && env.telegramChatId) {
      try {
        const serviceName = appointment.service_title || appointment.serviceTitle || appointment.service_id || 'Fisioterapia';
        const packageName = appointment.selectedPackageName || appointment.selected_package_name || (appointment.primeraVisita ? 'Evaluación Inicial' : 'Sesión Estándar');
        const price = appointment.selectedPackagePrice || appointment.servicePrice || '35 USD';
        const specialist = appointment.specialistName || appointment.specialist_name || 'Lic. Isaac Jewsiejew';
        const patientName = `${appointment.nombre} ${appointment.apellido}`;
        const motivo = (appointment.motivoConsulta || appointment.motivo || 'Sin especificar').replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');

        const telegramText =
`🚨 *¡NUEVA CITA AGENDADA EN EQUILIBRA!* 🚨
━━━━━━━━━━━━━━━━━━━━━━
👤 *Paciente:* ${patientName}
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
📝 *Motivo / Síntomas:* _${motivo}_
━━━━━━━━━━━━━━━━━━━━━━
⏱️ _Registrada en tiempo real desde la Plataforma Web EQUILIBRA._`;

        await sendTelegramMessage(env.telegramToken, env.telegramChatId, telegramText);
        telegramSent = true;
      } catch (tgErr: any) {
        telegramError = tgErr?.message || 'Error al despachar notificación de Telegram';
        console.warn('[Server Telegram Auto-Alert] Advertencia:', telegramError);
      }
    }

    res.json({
      success: true,
      supabaseSaved,
      supabaseError,
      telegramSent,
      telegramError,
      appointment,
    });
  });

  // 6. Patients API
  app.get('/api/patients', async (req, res) => {
    const supabaseClient = getServerSupabaseClient();
    if (!supabaseClient) {
      return res.json({ success: true, data: [], source: 'local' });
    }
    try {
      const { data, error } = await supabaseClient.from('patients').select('*').order('created_at', { ascending: false });
      if (error) return res.status(400).json({ success: false, error: error.message });
      res.json({ success: true, data: data || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.post('/api/patients', async (req, res) => {
    const patient = req.body;
    if (!patient || !patient.id) {
      return res.status(400).json({ success: false, error: 'Datos de paciente requeridos' });
    }

    const supabaseClient = getServerSupabaseClient();
    if (!supabaseClient) {
      return res.json({ success: true, data: patient, savedToDb: false });
    }

    try {
      const { data, error } = await supabaseClient.from('patients').upsert([patient]).select();
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      res.json({ success: true, data: data && data[0] ? data[0] : patient, savedToDb: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 7. Contact Messages API
  app.post('/api/contact', createRateLimiter(10 * 60 * 1000, 10, 'contact_message'), async (req, res) => {
    const msg = req.body;
    const env = getEnvCredentials();

    const supabaseClient = getServerSupabaseClient();
    if (supabaseClient) {
      try {
        await supabaseClient.from('contact_messages').insert([
          {
            id: `msg_${Date.now()}`,
            name: msg.name,
            email: msg.email,
            phone: msg.phone || '',
            message: msg.message,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.warn('[Contact Message] Supabase note:', err);
      }
    }

    if (env.telegramToken && env.telegramChatId) {
      try {
        const text =
`📬 *¡NUEVO MENSAJE DE CONTACTO EN EQUILIBRA!*
━━━━━━━━━━━━━━━━━━━━━━
👤 *Nombre:* ${msg.name}
📧 *Email:* \`${msg.email}\`
📞 *Teléfono:* \`${msg.phone || 'No especificado'}\`
💬 *Mensaje:*
_${(msg.message || '').replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&')}_
━━━━━━━━━━━━━━━━━━━━━━`;
        await sendTelegramMessage(env.telegramToken, env.telegramChatId, text);
      } catch (tgErr) {
        console.warn('[Contact Message] Telegram note:', tgErr);
      }
    }

    res.json({ success: true });
  });

  // 8. Vite Middleware for Development / Static Serve for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EQUILIBRA Server] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
