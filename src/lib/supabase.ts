import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment, ContactMessage, SupabaseConfig, PatientRecord, MedicalRecordDocument } from '../types';

const STORAGE_KEY_APPOINTMENTS = 'equilibra_saved_appointments';
const STORAGE_KEY_MESSAGES = 'equilibra_local_messages';
const STORAGE_KEY_PATIENTS = 'equilibra_local_patients';
const STORAGE_KEY_URL = 'equilibra_supabase_url';
const STORAGE_KEY_KEY = 'equilibra_supabase_key';

let cachedClient: SupabaseClient | null = null;
let currentConfig: SupabaseConfig = {
  url: '',
  anonKey: '',
  isConnected: false,
  source: 'demo'
};

const DEFAULT_SUPABASE_URL = 'https://lzszxtxddlamplzsoihx.supabase.co';

export function getSupabaseCredentials(): { url: string; anonKey: string; source: 'custom' | 'env' | 'demo' } {
  // 1. Check localStorage if user configured in UI
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEY_URL);
    const customKey = localStorage.getItem(STORAGE_KEY_KEY);
    if (customUrl && customKey && customUrl.trim() && customKey.trim()) {
      return { url: customUrl.trim(), anonKey: customKey.trim(), source: 'custom' };
    }
  }

  // 2. Check environment variables (or Vite defined environment)
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : '') ||
    '';
  const envKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' ? (process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_KEY) : '') ||
    '';

  if (envUrl && envKey && !envUrl.includes('placeholder') && !envUrl.includes('your-project')) {
    return { url: envUrl.trim(), anonKey: envKey.trim(), source: 'env' };
  }

  // 3. Fallback to preconfigured project URL
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const targetUrl = (storedUrl || envUrl || DEFAULT_SUPABASE_URL).trim();

  if (envKey && envKey.trim()) {
    return { url: targetUrl, anonKey: envKey.trim(), source: 'env' };
  }

  return { url: targetUrl, anonKey: '', source: 'demo' };
}

export async function saveClinicSettingToSupabase(key: string, value: any): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client.from('clinic_settings').upsert({
      id: key,
      value: value,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('[Supabase Settings] Upsert note:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Settings] Error saving setting to DB:', err);
    return false;
  }
}

export async function getClinicSettingFromSupabase<T = any>(key: string): Promise<T | null> {
  try {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client.from('clinic_settings').select('value').eq('id', key).single();
    if (error || !data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function syncGlobalConfigFromServer(): Promise<void> {
  try {
    // 1. Try server-side /api/config endpoint
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.supabase) {
          if (data.supabase.url && data.supabase.anonKey) {
            localStorage.setItem(STORAGE_KEY_URL, data.supabase.url);
            localStorage.setItem(STORAGE_KEY_KEY, data.supabase.anonKey);
            cachedClient = null;
            initSupabase();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('equilibra_supabase_config_updated', { detail: data.supabase }));
            }
          }
        }
        if (data && data.telegram) {
          const tg = data.telegram;
          if (tg.botToken || tg.chatId) {
            const stored = localStorage.getItem('equilibra_telegram_config');
            const parsed = stored ? JSON.parse(stored) : {};
            const merged = {
              ...parsed,
              botToken: tg.botToken || parsed.botToken || '',
              chatId: tg.chatId || parsed.chatId || '',
              enabled: tg.enabled ?? parsed.enabled ?? true,
              specialistTags: tg.specialistTags || parsed.specialistTags || {},
            };
            localStorage.setItem('equilibra_telegram_config', JSON.stringify(merged));
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('equilibra_telegram_config_updated', { detail: merged }));
            }
          }
        }
      }
    } catch (apiErr) {
      console.warn('[syncGlobalConfigFromServer] /api/config fetch note:', apiErr);
    }

    // 2. Direct cloud database check in Supabase clinic_settings table (for static hosting like Render / Vercel)
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: dbSettings, error: dbErr } = await client.from('clinic_settings').select('*');
        if (!dbErr && dbSettings && Array.isArray(dbSettings)) {
          for (const row of dbSettings) {
            if (row.id === 'telegram_config' && row.value) {
              const tg = row.value;
              const stored = localStorage.getItem('equilibra_telegram_config');
              const parsed = stored ? JSON.parse(stored) : {};
              const merged = {
                ...parsed,
                ...tg,
                botToken: tg.botToken || parsed.botToken || '',
                chatId: tg.chatId || parsed.chatId || '',
                enabled: tg.enabled ?? parsed.enabled ?? true,
                specialistTags: tg.specialistTags || parsed.specialistTags || {},
              };
              localStorage.setItem('equilibra_telegram_config', JSON.stringify(merged));
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('equilibra_telegram_config_updated', { detail: merged }));
              }
            }
            if (row.id === 'supabase_config' && row.value) {
              const sup = row.value;
              if (sup.url && sup.anonKey) {
                localStorage.setItem(STORAGE_KEY_URL, sup.url);
                localStorage.setItem(STORAGE_KEY_KEY, sup.anonKey);
                cachedClient = null;
                initSupabase();
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('equilibra_supabase_config_updated', { detail: sup }));
                }
              }
            }
          }
        }
      } catch (dbSyncErr) {
        console.warn('[syncGlobalConfigFromServer] Supabase DB sync note:', dbSyncErr);
      }
    }
  } catch (err) {
    console.warn('[syncGlobalConfigFromServer] Error:', err);
  }
}

export function initSupabase(): SupabaseClient | null {
  const { url, anonKey, source } = getSupabaseCredentials();

  if (url && anonKey) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      currentConfig = {
        url,
        anonKey,
        isConnected: true,
        source
      };
      return cachedClient;
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      cachedClient = null;
    }
  }

  currentConfig = {
    url: url || DEFAULT_SUPABASE_URL,
    anonKey: '',
    isConnected: false,
    source: 'demo'
  };
  cachedClient = null;
  return null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!cachedClient) {
    return initSupabase();
  }
  return cachedClient;
}

export const supabase = getSupabaseClient() || createClient(DEFAULT_SUPABASE_URL, 'placeholder-anon-key');
export const isSupabaseConfigured = Boolean(getSupabaseCredentials().url && getSupabaseCredentials().anonKey);

export function getCurrentSupabaseConfig(): SupabaseConfig {
  const { url, anonKey, source } = getSupabaseCredentials();
  return {
    url: url || DEFAULT_SUPABASE_URL,
    anonKey,
    isConnected: Boolean(url && anonKey),
    source
  };
}

export async function testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'URL o Anon Key no proporcionados.' };
  }
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('appointments').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && error.message && !error.message.includes('relation "appointments" does not exist')) {
      return { success: false, message: error.message };
    }
    return { success: true, message: '¡Conexión exitosa con tu proyecto de Supabase!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error al conectar con Supabase' };
  }
}

export function saveSupabaseCredentials(url: string, key: string): boolean {
  try {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    cachedClient = null;
    initSupabase();

    // Persist to server config for all devices
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabaseUrl: cleanUrl, supabaseAnonKey: cleanKey }),
    }).catch(err => console.warn('[saveSupabaseCredentials] Server sync note:', err));

    saveClinicSettingToSupabase('supabase_config', { url: cleanUrl, anonKey: cleanKey }).catch(err =>
      console.warn('[saveSupabaseCredentials] Supabase DB sync note:', err)
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('equilibra_supabase_config_updated', {
        detail: { url: cleanUrl, anonKey: cleanKey, isConfigured: true }
      }));
    }

    return true;
  } catch {
    return false;
  }
}

export function clearSupabaseCredentials(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
  currentConfig = {
    url: '',
    anonKey: '',
    isConnected: false,
    source: 'demo'
  };
}

// Local Fallback Storage for Appointments
export function getLocalAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLocalAppointments(appointments: Appointment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
    window.dispatchEvent(new CustomEvent('equilibra_appointments_updated'));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

// Local Fallback Storage for Messages
export function getLocalMessages(): ContactMessage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLocalMessages(messages: ContactMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages to local storage', e);
  }
}

// Database Operations for Appointments
export async function getAppointmentsFromDb(): Promise<Appointment[]> {
  const localList = getLocalAppointments();

  // 1. Try server API
  try {
    const res = await fetch('/api/appointments');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        saveLocalAppointments(json.data);
        return json.data;
      }
    }
  } catch (apiErr) {
    // Continue to direct Supabase client
  }

  // 2. Direct Supabase client
  const client = getSupabaseClient();
  if (!client) {
    return localList;
  }

  try {
    const { data, error } = await client
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase query error, falling back to local data:', error.message);
      return localList;
    }

    if (data && Array.isArray(data)) {
      saveLocalAppointments(data);
      return data;
    }

    return localList;
  } catch (err) {
    console.warn('Network error fetching from Supabase, using local:', err);
    return localList;
  }
}

export function subscribeToAppointments(onChange: (appointments: Appointment[]) => void): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  const channel = client
    .channel('admin-appointments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async () => {
      onChange(await getAppointmentsFromDb());
    })
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export async function insertAppointment(appointment: Appointment): Promise<{ success: boolean; data?: Appointment; error?: string }> {
  const currentLocal = getLocalAppointments();
  const updatedLocal = [appointment, ...currentLocal.filter(a => a.id !== appointment.id)];
  saveLocalAppointments(updatedLocal);

  // 1. Call server API (handles server-side Supabase + automatic Telegram notification)
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return { success: true, data: appointment };
      }
    }
  } catch (apiErr) {
    console.warn('[insertAppointment] Server API call note, continuing to client direct:', apiErr);
  }

  // 2. Client-side direct Supabase fallback
  const client = getSupabaseClient();
  if (!client) {
    return { success: true, data: appointment };
  }

  try {
    const payload: Record<string, any> = {
      id: appointment.id,
      code: appointment.code,
      service_id: appointment.service_id || appointment.serviceId,
      service_title: appointment.service_title || appointment.serviceTitle,
      service_price: appointment.servicePrice || `${appointment.amount || 35} USD`,
      amount: appointment.amount || 35,
      fecha: appointment.fecha,
      hora: appointment.hora,
      nombre: appointment.nombre,
      apellido: appointment.apellido,
      telefono: appointment.telefono,
      email: appointment.email,
      motivo_consulta: appointment.motivo || appointment.motivoConsulta || '',
      motivo: appointment.motivo || appointment.motivoConsulta || '',
      primera_visita: appointment.primera_visita ?? appointment.primeraVisita,
      status: appointment.status || 'CONFIRMADA',
      specialist_id: appointment.specialist_id || appointment.specialistId || '',
      specialist_name: appointment.specialist_name || appointment.specialistName || 'Lic. Isaac Jewsiejew',
      notes: appointment.notes || '',
      payment_status: appointment.payment_status || 'PENDIENTE',
      created_at: appointment.created_at || appointment.createdAt || new Date().toISOString()
    };

    const { data, error } = await client
      .from('appointments')
      .upsert([payload])
      .select();

    if (error) {
      // Retry with minimal columns if table has fewer columns
      const minPayload = {
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
        created_at: payload.created_at
      };
      const retry = await client.from('appointments').upsert([minPayload]).select();
      if (retry.error) {
        console.warn('Could not insert to Supabase table (persisted locally):', retry.error.message);
        return { success: true, data: appointment, error: retry.error.message };
      }
      return { success: true, data: retry.data && retry.data[0] ? retry.data[0] : appointment };
    }

    return { success: true, data: (data && data[0]) ? data[0] : appointment };
  } catch (err: any) {
    console.warn('Supabase insertion failed (stored locally):', err);
    return { success: true, data: appointment, error: err?.message };
  }
}

export async function updateAppointmentInDb(id: string, updates: Partial<Appointment>): Promise<boolean> {
  const currentLocal = getLocalAppointments();
  const updatedLocal = currentLocal.map(app => {
    if (app.id === id) {
      return { ...app, ...updates };
    }
    return app;
  });
  saveLocalAppointments(updatedLocal);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client
      .from('appointments')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.warn('Supabase update error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase update exception:', err);
    return true;
  }
}

export async function deleteAppointmentFromDb(id: string): Promise<boolean> {
  const current = getLocalAppointments();
  saveLocalAppointments(current.filter(a => a.id !== id));

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from('appointments').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete error:', error.message);
    }
    return true;
  } catch {
    return true;
  }
}

// Database Operations for Contact Messages
export async function getContactMessagesFromDb(): Promise<ContactMessage[]> {
  const client = getSupabaseClient();
  const localList = getLocalMessages();

  if (!client) {
    return localList;
  }

  try {
    const { data, error } = await client
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase messages query error:', error.message);
      return localList;
    }

    if (data && Array.isArray(data)) {
      saveLocalMessages(data);
      return data;
    }

    return localList;
  } catch (err) {
    console.warn('Supabase messages fetch failed:', err);
    return localList;
  }
}

export async function sendContactMessageToSupabase(message: Omit<ContactMessage, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  const newMsg: ContactMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
    status: 'NUEVO'
  };

  const currentLocal = getLocalMessages();
  saveLocalMessages([newMsg, ...currentLocal]);

  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    });
    if (res.ok) {
      return { success: true };
    }
  } catch (apiErr) {
    // Continue to client direct
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: true };
  }

  try {
    const { error } = await client.from('contact_messages').insert([
      {
        id: newMsg.id,
        nombre: newMsg.name,
        name: newMsg.name,
        email: newMsg.email,
        telefono: newMsg.phone || '',
        phone: newMsg.phone || '',
        mensaje: newMsg.message,
        message: newMsg.message,
        created_at: newMsg.created_at
      }
    ]);

    if (error) {
      return { success: true, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: true, error: err?.message };
  }
}

export async function updateContactMessageStatus(id: string, status: 'NUEVO' | 'RESPONDIDO' | 'ARCHIVADO', adminNotes?: string): Promise<boolean> {
  const current = getLocalMessages();
  saveLocalMessages(current.map(m => m.id === id ? { ...m, status, adminNotes: adminNotes ?? m.adminNotes } : m));

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    await client.from('contact_messages').update({ status, adminNotes }).eq('id', id);
    return true;
  } catch {
    return true;
  }
}

export async function deleteContactMessageFromDb(id: string): Promise<boolean> {
  const current = getLocalMessages();
  saveLocalMessages(current.filter(m => m.id !== id));

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    await client.from('contact_messages').delete().eq('id', id);
    return true;
  } catch {
    return true;
  }
}

// Local Fallback Storage for Patients
export function getLocalPatients(): PatientRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PATIENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLocalPatients(patients: PatientRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
    window.dispatchEvent(new CustomEvent('equilibra_patients_updated'));
  } catch (e) {
    console.error('Failed to save patients to local storage', e);
  }
}

// Database Operations for Patients
export async function getPatientsFromDb(): Promise<PatientRecord[]> {
  const localList = getLocalPatients();

  // 1. Try server API
  try {
    const res = await fetch('/api/patients');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        saveLocalPatients(json.data);
        return json.data;
      }
    }
  } catch (apiErr) {
    // Continue to direct Supabase client
  }

  // 2. Direct Supabase client
  const client = getSupabaseClient();
  if (!client) {
    return localList;
  }

  try {
    const { data, error } = await client
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase patients query error, falling back to local:', error.message);
      return localList;
    }

    if (data && Array.isArray(data)) {
      const merged = data.map((remotePat: any) => {
        const localMatch = localList.find(l => l.id === remotePat.id);
        return {
          ...remotePat,
          documents: remotePat.documents || localMatch?.documents || []
        };
      });
      saveLocalPatients(merged);
      return merged;
    }

    return localList;
  } catch (err) {
    console.warn('Network error fetching patients from Supabase, using local:', err);
    return localList;
  }
}

export async function insertPatientInDb(patient: PatientRecord): Promise<{ success: boolean; data?: PatientRecord; error?: string }> {
  const currentLocal = getLocalPatients();
  const updatedLocal = [patient, ...currentLocal.filter(p => p.id !== patient.id)];
  saveLocalPatients(updatedLocal);

  // 1. Try server API
  try {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return { success: true, data: patient };
      }
    }
  } catch (apiErr) {
    // Fall through to client direct
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, data: patient };
  }

  try {
    const { data, error } = await client
      .from('patients')
      .upsert([
        {
          id: patient.id,
          cedula: patient.cedula || '',
          nombre: patient.nombre,
          apellido: patient.apellido,
          telefono: patient.telefono,
          email: patient.email,
          fecha_nacimiento: patient.fechaNacimiento || null,
          edad: patient.edad || null,
          genero: patient.genero || 'M',
          direccion: patient.direccion || '',
          contacto_emergencia: patient.contactoEmergencia || null,
          total_appointments: patient.totalAppointments || 0,
          completed_appointments: patient.completedAppointments || 0,
          last_visit: patient.lastVisit || '',
          total_spent: patient.totalSpent || 0,
          first_visit_date: patient.firstVisitDate || '',
          clinical_notes: patient.clinicalNotes || '',
          medical_conditions: patient.medicalConditions || '',
          alergias: patient.alergias || '',
          antecedentes: patient.antecedentes || '',
          medicamentos_actuales: patient.medicamentosActuales || '',
          documents: patient.documents || [],
          created_at: patient.createdAt || new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn('Could not insert patient to Supabase table (persisted locally):', error.message);
      return { success: true, data: patient, error: error.message };
    }

    return { success: true, data: (data && data[0]) ? data[0] : patient };
  } catch (err: any) {
    console.warn('Supabase patient insertion failed (stored locally):', err);
    return { success: true, data: patient, error: err?.message };
  }
}

export async function updatePatientInDb(id: string, updates: Partial<PatientRecord>): Promise<boolean> {
  const currentLocal = getLocalPatients();
  const updatedLocal = currentLocal.map(pat => {
    if (pat.id === id) {
      return { ...pat, ...updates };
    }
    return pat;
  });
  saveLocalPatients(updatedLocal);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client
      .from('patients')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.warn('Supabase patient update error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase patient update exception:', err);
    return true;
  }
}

export async function deletePatientFromDb(id: string): Promise<boolean> {
  const current = getLocalPatients();
  saveLocalPatients(current.filter(p => p.id !== id));

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from('patients').delete().eq('id', id);
    if (error) {
      console.warn('Supabase patient delete error:', error.message);
    }
    return true;
  } catch {
    return true;
  }
}

export async function addDocumentToPatient(patientId: string, document: MedicalRecordDocument): Promise<boolean> {
  const current = getLocalPatients();
  const updated = current.map(p => {
    if (p.id === patientId) {
      const existingDocs = p.documents || [];
      return {
        ...p,
        documents: [document, ...existingDocs.filter(d => d.id !== document.id)]
      };
    }
    return p;
  });
  saveLocalPatients(updated);

  const targetPatient = updated.find(p => p.id === patientId);
  if (targetPatient) {
    await updatePatientInDb(patientId, { documents: targetPatient.documents });
  }
  return true;
}

export async function removeDocumentFromPatient(patientId: string, documentId: string): Promise<boolean> {
  const current = getLocalPatients();
  const updated = current.map(p => {
    if (p.id === patientId) {
      const existingDocs = p.documents || [];
      return {
        ...p,
        documents: existingDocs.filter(d => d.id !== documentId)
      };
    }
    return p;
  });
  saveLocalPatients(updated);

  const targetPatient = updated.find(p => p.id === patientId);
  if (targetPatient) {
    await updatePatientInDb(patientId, { documents: targetPatient.documents });
  }
  return true;
}

export const SUPABASE_SQL_SCHEMA = `-- Copia y pega este script en el SQL Editor de Supabase para inicializar o actualizar el Panel Admin de EQUILIBRA:

-- 1. Tabla de Citas Médicas
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  service_title TEXT NOT NULL,
  service_price TEXT DEFAULT '35 USD',
  selected_package_name TEXT,
  selected_package_price TEXT,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  motivo TEXT,
  motivo_consulta TEXT,
  primera_visita BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'CONFIRMADA',
  specialist_id TEXT,
  specialist_name TEXT DEFAULT 'Lic. Isaac Jewsiejew',
  notes TEXT,
  payment_status TEXT DEFAULT 'PENDIENTE',
  amount NUMERIC DEFAULT 35,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar columnas si la tabla ya existía
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS motivo_consulta TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_price TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS selected_package_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS selected_package_price TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDIENTE';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 35;

-- 2. Tabla de Expedientes de Pacientes
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  cedula TEXT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  fecha_nacimiento DATE,
  edad INTEGER,
  genero TEXT DEFAULT 'M',
  direccion TEXT,
  contacto_emergencia JSONB,
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  last_visit TEXT,
  total_spent NUMERIC DEFAULT 0,
  first_visit_date TEXT,
  clinical_notes TEXT,
  medical_conditions TEXT,
  alergias TEXT,
  antecedentes TEXT,
  medicamentos_actuales TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE patients ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS cedula TEXT;

-- 3. Tabla de Mensajes de Contacto
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT,
  nombre TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  telefono TEXT,
  subject TEXT,
  message TEXT,
  mensaje TEXT,
  status TEXT DEFAULT 'NUEVO',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Configuración de la Clínica & Integraciones (Telegram, Bot, Config Global)
CREATE TABLE IF NOT EXISTS clinic_settings (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Políticas RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo en appointments" ON appointments;
CREATE POLICY "Permitir todo en appointments" ON appointments FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en patients" ON patients;
CREATE POLICY "Permitir todo en patients" ON patients FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en contact_messages" ON contact_messages;
CREATE POLICY "Permitir todo en contact_messages" ON contact_messages FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en clinic_settings" ON clinic_settings;
CREATE POLICY "Permitir todo en clinic_settings" ON clinic_settings FOR ALL TO public USING (true) WITH CHECK (true);
`;
