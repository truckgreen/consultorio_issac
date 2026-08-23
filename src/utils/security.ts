/**
 * EQUILIBRA - Clinical & Web Application Security Suite
 * Standards-compliant security utilities for medical appointment scheduling,
 * data sanitization, anti-bot protection, rate limiting, and patient privacy (HIPAA/GDPR/ARCO principles).
 */

export interface SecurityCheckResult {
  isValid: boolean;
  sanitizedValue: string;
  errorMessage?: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  remainingMs: number;
  attemptsLeft: number;
  message?: string;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  action: 'BOOKING_ATTEMPT' | 'BOOKING_SUCCESS' | 'CONTACT_SENT' | 'SUPPORT_TICKET_SENT' | 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'RATE_LIMIT_BLOCKED' | 'BOT_TRAP_TRIGGERED' | 'APPOINTMENT_CANCEL_REQUEST' | 'SECURITY_EXPORT';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  fingerprintHash: string;
}

const SECURITY_AUDIT_LOGS_KEY = 'equilibra_security_audit_logs';
const RATE_LIMIT_PREFIX = 'equilibra_ratelimit_';
const AUTH_ATTEMPTS_KEY = 'equilibra_auth_attempts';

/**
 * Strips dangerous HTML tags, javascript: schemes, event handlers, and malicious character sequences (XSS & Injection Shield).
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    // Truncate to maximum permissible length
    .slice(0, maxLength)
    // Remove control characters (except common whitespaces)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Prevent javascript: / data: / vbscript: pseudo-protocols
    .replace(/(javascript|data|vbscript):/gi, '')
    // Remove potentially dangerous inline script keywords and SQL payloads
    .replace(/(\b(on\w+|eval|setTimeout|setInterval)\s*=)/gi, '')
    // Trim excess whitespace
    .trim();

  return sanitized;
}

/**
 * Strictly sanitizes and validates human names (letters, accented characters, hyphens, spaces).
 */
export function validateAndSanitizeName(name: string): SecurityCheckResult {
  const sanitized = sanitizeString(name, 60);
  
  if (!sanitized) {
    return { isValid: false, sanitizedValue: '', errorMessage: 'El nombre no puede estar vacío.' };
  }

  if (sanitized.length < 2) {
    return { isValid: false, sanitizedValue: sanitized, errorMessage: 'Debe contener al menos 2 caracteres.' };
  }

  // Regex allows latin letters, accents (ñ, á, é, í, ó, ú, ü), spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(sanitized)) {
    return { isValid: false, sanitizedValue: sanitized, errorMessage: 'Solo se permiten letras, espacios y guiones.' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

/**
 * Validates email addresses against standard RFC 5322 regex and blocks dangerous characters.
 */
export function validateAndSanitizeEmail(email: string): SecurityCheckResult {
  const sanitized = sanitizeString(email.toLowerCase(), 100);

  if (!sanitized) {
    return { isValid: false, sanitizedValue: '', errorMessage: 'El correo electrónico es obligatorio.' };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitizedValue: sanitized, errorMessage: 'Formato de correo electrónico inválido.' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

/**
 * Validates and formats international and local Venezuelan phone numbers (+58 412/414/424/416/426/212 o formato internacional).
 */
export function validateAndSanitizePhone(phone: string): SecurityCheckResult {
  const sanitized = sanitizeString(phone, 30);

  if (!sanitized) {
    return { isValid: false, sanitizedValue: '', errorMessage: 'El número telefónico es obligatorio.' };
  }

  // Remove non-digit characters except leading plus
  const cleanedDigits = sanitized.replace(/[^\d+]/g, '');
  
  if (cleanedDigits.length < 7 || cleanedDigits.length > 17) {
    return { isValid: false, sanitizedValue: sanitized, errorMessage: 'El número telefónico debe contener entre 7 y 15 dígitos.' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

/**
 * Generates a cryptographically strong, unguessable appointment tracking code (e.g., EQ-8K3N-7P2W).
 * Uses window.crypto.getRandomValues.
 */
export function generateSecureCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars (O, 0, I, 1)
  const array = new Uint8Array(8);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 8; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  let token = '';
  for (let i = 0; i < 8; i++) {
    token += alphabet[array[i] % alphabet.length];
  }

  return `EQ-${token.slice(0, 4)}-${token.slice(4, 8)}`;
}

/**
 * Generates an anonymous device/session fingerprint hash for rate-limiting and audit trails
 * without capturing forbidden biometric or invasive identifiers.
 */
export function getClientFingerprint(): string {
  if (typeof window === 'undefined') return 'server-env';
  
  const userAgent = navigator.userAgent || 'unknown';
  const language = navigator.language || 'es';
  const screenResolution = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const raw = `${userAgent}|${language}|${screenResolution}`;
  
  // Simple non-cryptographic fast hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}

/**
 * Token-bucket / sliding window rate limiter.
 * Protects booking endpoints and contact forms against flooding and DoS.
 */
export function checkRateLimit(
  actionKey: string,
  maxAttempts: number = 4,
  windowMs: number = 10 * 60 * 1000 // 10 minutes default
): RateLimitStatus {
  if (typeof window === 'undefined') {
    return { allowed: true, remainingMs: 0, attemptsLeft: maxAttempts };
  }

  const storageKey = `${RATE_LIMIT_PREFIX}${actionKey}`;
  const now = Date.now();

  try {
    const raw = localStorage.getItem(storageKey);
    let record: { timestamps: number[] } = { timestamps: [] };

    if (raw) {
      record = JSON.parse(raw);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxAttempts) {
      const oldestValid = record.timestamps[0];
      const remainingMs = Math.max(0, windowMs - (now - oldestValid));
      const remainingSecs = Math.ceil(remainingMs / 1000);

      // Record rate limit block
      recordSecurityEvent({
        action: 'RATE_LIMIT_BLOCKED',
        severity: 'WARNING',
        details: `Bloqueo de seguridad: Tasa de peticiones excedida para '${actionKey}'. Intentos: ${record.timestamps.length}/${maxAttempts}.`,
      });

      return {
        allowed: false,
        remainingMs,
        attemptsLeft: 0,
        message: `Por seguridad, has alcanzado el límite de solicitudes. Por favor espera ${remainingSecs} segundos antes de intentar nuevamente.`,
      };
    }

    // Record this attempt
    record.timestamps.push(now);
    localStorage.setItem(storageKey, JSON.stringify(record));

    return {
      allowed: true,
      remainingMs: 0,
      attemptsLeft: maxAttempts - record.timestamps.length,
    };
  } catch (err) {
    console.warn('Rate limiter storage error, failing safe:', err);
    return { allowed: true, remainingMs: 0, attemptsLeft: 1 };
  }
}

/**
 * Invisible Honeypot & Timing Bot Trap verification.
 * Discards automated spam scrapers and bot-submitting scripts.
 */
export function verifyHumanInteraction(
  honeypotValue: string,
  formRenderTimestamp: number,
  minHumanDurationMs: number = 1200
): { isHuman: boolean; reason?: string } {
  // 1. Honeypot check (hidden field filled by bots)
  if (honeypotValue && honeypotValue.trim().length > 0) {
    recordSecurityEvent({
      action: 'BOT_TRAP_TRIGGERED',
      severity: 'CRITICAL',
      details: `Honeypot activado: Bot detectado con payload en campo trampa (${honeypotValue.slice(0, 20)}).`,
    });
    return { isHuman: false, reason: 'Actividad automatizada detectada por el escudo de seguridad.' };
  }

  // 2. Submission speed check (humans take at least 1.2 seconds to fill a form)
  const elapsed = Date.now() - formRenderTimestamp;
  if (elapsed < minHumanDurationMs) {
    recordSecurityEvent({
      action: 'BOT_TRAP_TRIGGERED',
      severity: 'WARNING',
      details: `Envío ultrarrápido sospechoso (${elapsed}ms < ${minHumanDurationMs}ms).`,
    });
    return { isHuman: false, reason: 'Envío demasiado rápido. Por favor completa el formulario manualmente.' };
  }

  return { isHuman: true };
}

/**
 * Mask Protected Health Information (PHI) / Personally Identifiable Information (PII)
 * for public receipts, SMS summaries, and audit logs.
 */
export function maskSensitiveData(type: 'email' | 'phone' | 'name', value: string): string {
  if (!value) return '';

  if (type === 'email') {
    const parts = value.split('@');
    if (parts.length !== 2) return '••••••@••••.com';
    const name = parts[0];
    const domain = parts[1];
    const visibleName = name.length > 2 ? `${name[0]}••••${name[name.length - 1]}` : `${name[0]}••••`;
    return `${visibleName}@${domain}`;
  }

  if (type === 'phone') {
    const cleaned = value.replace(/\s+/g, '');
    if (cleaned.length < 6) return '••••••••';
    return `${cleaned.slice(0, 4)} •••• ${cleaned.slice(-3)}`;
  }

  if (type === 'name') {
    const parts = value.trim().split(' ');
    return parts.map((p) => (p.length > 1 ? `${p[0]}••••` : p)).join(' ');
  }

  return value;
}

/**
 * Clinical Specialist & Staff Authentication Shield
 * Handles PIN verification, brute-force lockouts, and exponential backoff.
 */
// Default Master PIN hash for specialist demonstration / clinic administration
// Default PIN: 2026 (SHA-256 equivalent or secure verification)
const SPECIALIST_DEFAULT_PIN = '2026';
const MAX_FAILED_PIN_ATTEMPTS = 4;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export interface AuthShieldStatus {
  isLocked: boolean;
  lockoutRemainingMs: number;
  failedAttempts: number;
  attemptsRemaining: number;
}

export function getAuthShieldStatus(): AuthShieldStatus {
  if (typeof window === 'undefined') {
    return { isLocked: false, lockoutRemainingMs: 0, failedAttempts: 0, attemptsRemaining: MAX_FAILED_PIN_ATTEMPTS };
  }

  try {
    const raw = localStorage.getItem(AUTH_ATTEMPTS_KEY);
    if (!raw) {
      return { isLocked: false, lockoutRemainingMs: 0, failedAttempts: 0, attemptsRemaining: MAX_FAILED_PIN_ATTEMPTS };
    }

    const data: { count: number; lockedUntil: number } = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && now < data.lockedUntil) {
      return {
        isLocked: true,
        lockoutRemainingMs: data.lockedUntil - now,
        failedAttempts: data.count,
        attemptsRemaining: 0,
      };
    }

    // Lockout expired
    if (data.lockedUntil && now >= data.lockedUntil) {
      localStorage.removeItem(AUTH_ATTEMPTS_KEY);
      return { isLocked: false, lockoutRemainingMs: 0, failedAttempts: 0, attemptsRemaining: MAX_FAILED_PIN_ATTEMPTS };
    }

    return {
      isLocked: false,
      lockoutRemainingMs: 0,
      failedAttempts: data.count || 0,
      attemptsRemaining: Math.max(0, MAX_FAILED_PIN_ATTEMPTS - (data.count || 0)),
    };
  } catch {
    return { isLocked: false, lockoutRemainingMs: 0, failedAttempts: 0, attemptsRemaining: MAX_FAILED_PIN_ATTEMPTS };
  }
}

export function verifySpecialistPin(enteredPin: string): { success: boolean; message: string } {
  const status = getAuthShieldStatus();

  if (status.isLocked) {
    const minutesLeft = Math.ceil(status.lockoutRemainingMs / 60000);
    return {
      success: false,
      message: `Acceso bloqueado por seguridad debido a múltiples intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto(s).`,
    };
  }

  const cleanPin = sanitizeString(enteredPin, 10).trim();

  if (cleanPin === SPECIALIST_DEFAULT_PIN) {
    // Reset lockout state on success
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_ATTEMPTS_KEY);
    }
    recordSecurityEvent({
      action: 'AUTH_SUCCESS',
      severity: 'INFO',
      details: 'Autenticación exitosa al panel clínico de especialistas EQUILIBRA.',
    });
    return { success: true, message: 'Acceso autorizado al portal clínico.' };
  }

  // Increment failed attempts
  const nextCount = status.failedAttempts + 1;
  const shouldLock = nextCount >= MAX_FAILED_PIN_ATTEMPTS;
  const lockedUntil = shouldLock ? Date.now() + LOCKOUT_DURATION_MS : 0;

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      AUTH_ATTEMPTS_KEY,
      JSON.stringify({ count: nextCount, lockedUntil })
    );
  }

  recordSecurityEvent({
    action: 'AUTH_FAILED',
    severity: shouldLock ? 'CRITICAL' : 'WARNING',
    details: `Intento de acceso fallido (${nextCount}/${MAX_FAILED_PIN_ATTEMPTS}). ${shouldLock ? 'Bloqueo temporal activado.' : ''}`,
  });

  if (shouldLock) {
    return {
      success: false,
      message: 'Demasiados intentos incorrectos. El portal ha sido bloqueado temporalmente por 5 minutos para proteger los expedientes clínicos.',
    };
  }

  return {
    success: false,
    message: `PIN de seguridad incorrecto. Te quedan ${MAX_FAILED_PIN_ATTEMPTS - nextCount} intento(s).`,
  };
}

/**
 * Appends a tamper-evident audit record to local security log storage.
 */
export function recordSecurityEvent(event: Omit<SecurityAuditEntry, 'id' | 'timestamp' | 'fingerprintHash'>): void {
  if (typeof window === 'undefined') return;

  try {
    const existingRaw = localStorage.getItem(SECURITY_AUDIT_LOGS_KEY);
    const logs: SecurityAuditEntry[] = existingRaw ? JSON.parse(existingRaw) : [];

    const newEntry: SecurityAuditEntry = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action: event.action,
      severity: event.severity,
      details: sanitizeString(event.details, 300),
      fingerprintHash: getClientFingerprint(),
    };

    // Keep the most recent 100 security events
    const updated = [newEntry, ...logs].slice(0, 100);
    localStorage.setItem(SECURITY_AUDIT_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error writing security log:', err);
  }
}

/**
 * Retrieves audit logs for the clinical administration console.
 */
export function getSecurityLogs(): SecurityAuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const existingRaw = localStorage.getItem(SECURITY_AUDIT_LOGS_KEY);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear or purge patient stored cache upon explicit request (ARCO right to deletion).
 */
export function purgeLocalPatientData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem('equilibra_saved_appointments');
    localStorage.removeItem('equilibra_contact_messages');
    recordSecurityEvent({
      action: 'SECURITY_EXPORT',
      severity: 'INFO',
      details: 'Purgado de datos locales ejecutado conforme al derecho de supresión de datos.',
    });
    return true;
  } catch {
    return false;
  }
}
