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

export function getSupabaseCredentials(): { url: string; anonKey: string; source: 'custom' | 'env' | 'demo' } {
  // 1. Check localStorage first
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEY_URL);
    const customKey = localStorage.getItem(STORAGE_KEY_KEY);
    if (customUrl && customKey) {
      return { url: customUrl, anonKey: customKey, source: 'custom' };
    }
  }

  // 2. Check environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey && !envUrl.includes('placeholder') && !envUrl.includes('your-project')) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  return { url: '', anonKey: '', source: 'demo' };
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
    url: '',
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

export const supabase = getSupabaseClient() || createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
export const isSupabaseConfigured = Boolean(getSupabaseCredentials().url && getSupabaseCredentials().anonKey);

export function getCurrentSupabaseConfig(): SupabaseConfig {
  const { url, anonKey, source } = getSupabaseCredentials();
  return {
    url,
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
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    cachedClient = null;
    initSupabase();
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
  const client = getSupabaseClient();
  const localList = getLocalAppointments();

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

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, data: appointment };
  }

  try {
    const { data, error } = await client
      .from('appointments')
      .upsert([
        {
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
          primera_visita: appointment.primera_visita ?? appointment.primeraVisita,
          status: appointment.status || 'CONFIRMADA',
          specialist_id: appointment.specialist_id || appointment.specialistId || '',
          specialist_name: appointment.specialist_name || appointment.specialistName || 'Lic. Isaac Jewsiejew',
          notes: appointment.notes || '',
          payment_status: appointment.payment_status || 'PENDIENTE',
          created_at: appointment.created_at || appointment.createdAt || new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn('Could not insert to Supabase table (persisted locally):', error.message);
      return { success: true, data: appointment, error: error.message };
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

  const client = getSupabaseClient();
  if (!client) {
    return { success: true };
  }

  try {
    const { error } = await client.from('contact_messages').insert([
      {
        id: newMsg.id,
        nombre: newMsg.name,
        email: newMsg.email,
        telefono: newMsg.phone || '',
        mensaje: newMsg.message,
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
  const client = getSupabaseClient();
  const localList = getLocalPatients();

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

export const SUPABASE_SQL_SCHEMA = `-- Copia y pega este script en el SQL Editor de Supabase para inicializar el Panel Admin de EQUILIBRA:

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  service_title TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  motivo TEXT,
  primera_visita BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'CONFIRMADA',
  specialist_id TEXT,
  specialist_name TEXT,
  notes TEXT,
  payment_status TEXT DEFAULT 'PENDIENTE',
  amount NUMERIC DEFAULT 35,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NUEVO',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo en appointments" ON appointments FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en patients" ON patients FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en contact_messages" ON contact_messages FOR ALL TO public USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
`;
