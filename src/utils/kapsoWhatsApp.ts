import { ConfirmedAppointment, KapsoConfig } from '../types';
import { getStaffAuthHeaders } from './security';

const KAPSO_CONFIG_STORAGE_KEY = 'equilibra_kapso_config';

export const DEFAULT_KAPSO_CONFIG: KapsoConfig = {
  apiKey: '98be8174ebf8098a4c92bc540537c4c1de5dcd61d2643659b30cc0434a0ecdd5',
  phoneNumberId: '1325569650648320',
  adminPhone: '',
  enabled: true,
  notifyPatient: true,
  notifyAdmin: true,
};

/**
 * Formats a phone number for the WhatsApp API:
 * - Removes non-digits
 * - Handles Venezuelan prefixes (0412, 0414, 0424, 0416, 0426) -> replaces leading 0 with country code 58
 * - Handles 10-digit formats (412, 414, 424) -> prepends 58
 */
export function formatPhoneForWhatsApp(rawPhone: string): string {
  if (!rawPhone) return '';
  let digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return '';

  // Venezuelan local numbers: e.g. 04241234567 (11 digits)
  if (digits.startsWith('0') && (digits.length === 11 || digits.length === 10)) {
    digits = '58' + digits.substring(1);
  } else if (
    (digits.startsWith('412') || digits.startsWith('414') || digits.startsWith('424') || digits.startsWith('416') || digits.startsWith('426')) &&
    digits.length === 10
  ) {
    digits = '58' + digits;
  }
  return digits;
}

export function getStoredKapsoConfig(): KapsoConfig {
  if (typeof window === 'undefined') return DEFAULT_KAPSO_CONFIG;
  try {
    const raw = localStorage.getItem(KAPSO_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_KAPSO_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_KAPSO_CONFIG,
      ...parsed,
      apiKey: (parsed.apiKey && parsed.apiKey.trim()) || DEFAULT_KAPSO_CONFIG.apiKey,
      phoneNumberId: (parsed.phoneNumberId && parsed.phoneNumberId.trim()) || DEFAULT_KAPSO_CONFIG.phoneNumberId,
    };
  } catch (e) {
    console.error('Error reading kapso config from storage:', e);
    return DEFAULT_KAPSO_CONFIG;
  }
}

export function saveKapsoConfig(config: Partial<KapsoConfig>): KapsoConfig {
  if (typeof window === 'undefined') return DEFAULT_KAPSO_CONFIG;
  try {
    const current = getStoredKapsoConfig();
    const updated: KapsoConfig = {
      ...current,
      ...config,
      apiKey: config.apiKey !== undefined ? config.apiKey.trim() : current.apiKey,
      phoneNumberId: config.phoneNumberId !== undefined ? config.phoneNumberId.trim() : current.phoneNumberId,
      adminPhone: config.adminPhone !== undefined ? formatPhoneForWhatsApp(config.adminPhone) : current.adminPhone,
    };

    localStorage.setItem(KAPSO_CONFIG_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('equilibra_kapso_config_updated', { detail: updated }));
    }

    // Sync to backend server configuration
    fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getStaffAuthHeaders(),
      },
      body: JSON.stringify({
        kapsoApiKey: updated.apiKey,
        kapsoPhoneNumberId: updated.phoneNumberId,
        kapsoAdminPhone: updated.adminPhone,
        kapsoEnabled: updated.enabled,
        kapsoNotifyPatient: updated.notifyPatient,
        kapsoNotifyAdmin: updated.notifyAdmin,
      }),
    }).catch((err) => console.warn('[saveKapsoConfig] Server sync notice:', err));

    return updated;
  } catch (e) {
    console.error('Error saving kapso config:', e);
    return DEFAULT_KAPSO_CONFIG;
  }
}

/**
 * Test Kapso WhatsApp configuration by sending a test ping message
 */
export async function testKapsoNotification(
  apiKey: string,
  phoneNumberId: string,
  targetPhone: string
): Promise<{ success: boolean; message: string; messageId?: string }> {
  const cleanKey = apiKey.trim();
  const cleanPhoneId = phoneNumberId.trim();
  const cleanTarget = formatPhoneForWhatsApp(targetPhone);

  if (!cleanKey) {
    return { success: false, message: 'Falta la API Key de Kapso.' };
  }
  if (!cleanPhoneId) {
    return { success: false, message: 'Falta el Phone Number ID de WhatsApp en Kapso.' };
  }
  if (!cleanTarget || cleanTarget.length < 8) {
    return { success: false, message: 'Número de WhatsApp de destino inválido o incompleto.' };
  }

  try {
    const res = await fetch('/api/kapso/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getStaffAuthHeaders(),
      },
      body: JSON.stringify({
        apiKey: cleanKey,
        phoneNumberId: cleanPhoneId,
        targetPhone: cleanTarget,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      saveKapsoConfig({ lastTestedAt: new Date().toISOString() });
      return {
        success: true,
        message: `¡Mensaje enviado con éxito al número +${cleanTarget}! Revisa tu WhatsApp.`,
        messageId: data.messageId,
      };
    }

    return {
      success: false,
      message: data.error || 'Error al conectar con la API de Kapso WhatsApp.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error de conexión de red al probar Kapso WhatsApp.',
    };
  }
}
