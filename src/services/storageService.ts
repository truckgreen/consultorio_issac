import { PatientRecord, AppointmentBooking, Testimonial, ClinicalNote, PrescribedExercise, ServiceDetail, ClinicSettings } from '../types';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_TESTIMONIALS, INITIAL_SERVICES } from '../data/mockData';

const STORAGE_KEYS = {
  PATIENTS: 'equilibra_patients_v1',
  APPOINTMENTS: 'equilibra_appointments_v1',
  TESTIMONIALS: 'equilibra_testimonials_v1',
  SERVICES: 'equilibra_services_v1',
  CLINIC_SETTINGS: 'equilibra_clinic_settings_v1',
  CURRENT_USER_CODE: 'equilibra_active_user_code_v1',
  LAST_SYNC: 'equilibra_last_sync_timestamp'
};

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  clinicName: "EQUILIBRA",
  tagline: "Centro de Bienestar Físico y Rehabilitación Integral",
  phone: "+58 412 747 1858",
  whatsapp: "+58 412 747 1858",
  emergencyPhone: "+58 212 951 4088",
  email: "contacto@equilibra.com.ve",
  address: "Av. Francisco Solano López con Calle El Recreo, Sabana Grande",
  floorSuite: "Centro Profesional del Este, Piso 4, Oficina 46",
  city: "Caracas, Distrito Capital",
  workingHoursWeekdays: "Lunes a Viernes: 8:00 AM - 7:00 PM",
  workingHoursSaturdays: "Sábados: 8:30 AM - 2:00 PM (Previa Cita)",
  announcementBanner: "¡Atención personalizada 1 a 1 en Sabana Grande! Citas disponibles esta semana.",
  announcementActive: true,
  instagramHandle: "@equilibra.ve",
  facebookUrl: "https://facebook.com/equilibra.ve"
};

const DB_EVENT_NAME = 'equilibra_db_updated';

let isOnlineState = true;
let lastSyncTimestamp = 0;
let isSyncing = false;

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DB_EVENT_NAME));
  }
}

// Background Cloud Synchronization Engine
async function syncWithServer() {
  if (typeof window === 'undefined' || isSyncing) return;
  
  isSyncing = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('/api/sync', {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      isOnlineState = true;
      const data = await response.json();
      
      if (data.timestamp && data.timestamp > lastSyncTimestamp) {
        lastSyncTimestamp = data.timestamp;
        
        if (Array.isArray(data.appointments) && data.appointments.length > 0) {
          const localApts: AppointmentBooking[] = StorageService.getAppointments();
          const mergedApts = [...data.appointments];
          localApts.forEach(la => {
            if (!mergedApts.some(ma => ma.id === la.id)) {
              mergedApts.push(la);
            }
          });
          localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mergedApts));
        }

        if (Array.isArray(data.patients) && data.patients.length > 0) {
          const localPatients: PatientRecord[] = StorageService.getPatients();
          const mergedPatients = [...data.patients];
          localPatients.forEach(lp => {
            if (!mergedPatients.some(mp => mp.id === lp.id)) {
              mergedPatients.push(lp);
            }
          });
          localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(mergedPatients));
        }

        if (Array.isArray(data.services) && data.services.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
        }

        if (data.clinicSettings) {
          localStorage.setItem(STORAGE_KEYS.CLINIC_SETTINGS, JSON.stringify(data.clinicSettings));
        }

        notifyChange();
      }
    } else {
      isOnlineState = false;
    }
  } catch (err) {
    isOnlineState = false;
  } finally {
    isSyncing = false;
  }
}

// Initialize Periodic Background Internet Polling (every 3.5s)
if (typeof window !== 'undefined') {
  // Run first sync immediately
  setTimeout(syncWithServer, 500);
  setInterval(syncWithServer, 3500);

  window.addEventListener('online', () => {
    isOnlineState = true;
    syncWithServer();
  });
  window.addEventListener('offline', () => {
    isOnlineState = false;
  });
}

export const StorageService = {
  isOnline(): boolean {
    return isOnlineState;
  },

  triggerManualSync(): Promise<void> {
    return syncWithServer();
  },

  // --- PATIENTS ---
  getPatients(): PatientRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
        return INITIAL_PATIENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PATIENTS;
    }
  },

  getPatientById(id: string): PatientRecord | undefined {
    const patients = this.getPatients();
    return patients.find(p => p.id === id);
  },

  getPatientByAccessCode(code: string): PatientRecord | undefined {
    const patients = this.getPatients();
    const cleanCode = code.trim().toUpperCase();
    return patients.find(p => p.accessCode.toUpperCase() === cleanCode || p.phone.includes(cleanCode) || p.email.toLowerCase() === cleanCode.toLowerCase());
  },

  savePatient(patient: PatientRecord): void {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === patient.id);
    if (index >= 0) {
      patients[index] = patient;
    } else {
      patients.unshift(patient);
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    notifyChange();

    // Async push to server
    fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient)
    }).catch(() => {});
  },

  updatePatient(id: string, updates: Partial<PatientRecord>): PatientRecord | null {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updated = { ...patients[index], ...updates };
    patients[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    notifyChange();

    // Async push to server
    fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});

    return updated;
  },

  deletePatient(id: string): void {
    const patients = this.getPatients().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    notifyChange();
  },

  addClinicalNote(patientId: string, note: Omit<ClinicalNote, 'id' | 'date'>): PatientRecord | null {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    const newNote: ClinicalNote = {
      ...note,
      id: 'note-' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };

    const updatedNotes = [newNote, ...patient.notes];
    const updates: Partial<PatientRecord> = { notes: updatedNotes };
    
    if (note.painScore !== undefined) {
      updates.painCurrent = note.painScore;
      updates.painHistory = [
        ...patient.painHistory,
        {
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          score: note.painScore
        }
      ];
    }

    if (note.mobilityScore !== undefined) {
      updates.mobilityProgress = note.mobilityScore;
    }

    return this.updatePatient(patientId, updates);
  },

  logPatientDailyPain(patientId: string, painScore: number, feelingText?: string): PatientRecord | null {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    const todayLabel = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const newPainHistory = [...patient.painHistory, { date: todayLabel, score: painScore }];
    
    const painReduction = Math.max(0, patient.painInitial - painScore);
    const estimatedMobility = Math.min(100, Math.round(50 + (painReduction / patient.painInitial) * 50));

    const noteEntry: ClinicalNote = {
      id: 'pain-log-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      author: patient.fullName + ' (Autoevaluación App Móvil)',
      role: 'Paciente',
      note: `Registro diario: Nivel de dolor ${painScore}/10. ${feelingText ? `Comentario: "${feelingText}"` : ''}`,
      painScore: painScore,
      mobilityScore: estimatedMobility
    };

    return this.updatePatient(patientId, {
      painCurrent: painScore,
      mobilityProgress: Math.max(patient.mobilityProgress, estimatedMobility),
      painHistory: newPainHistory,
      notes: [noteEntry, ...patient.notes]
    });
  },

  togglePatientExercise(patientId: string, exerciseId: string): PatientRecord | null {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    const updatedExercises = patient.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, completedToday: !ex.completedToday };
      }
      return ex;
    });

    return this.updatePatient(patientId, { exercises: updatedExercises });
  },

  addPatientExercise(patientId: string, exercise: Omit<PrescribedExercise, 'id' | 'completedToday'>): PatientRecord | null {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    const newEx: PrescribedExercise = {
      ...exercise,
      id: 'ex-' + Date.now(),
      completedToday: false
    };

    return this.updatePatient(patientId, {
      exercises: [...patient.exercises, newEx]
    });
  },

  sendChatMessage(patientId: string, sender: 'patient' | 'specialist', text: string): PatientRecord | null {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ', Hoy';
    const newMessage = {
      id: 'msg-' + Date.now(),
      sender,
      text,
      timestamp
    };

    const updated = this.updatePatient(patientId, {
      chatMessages: [...(patient.chatMessages || []), newMessage]
    });

    // Push message to server
    fetch(`/api/patients/${patientId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, text })
    }).catch(() => {});

    return updated;
  },

  // --- APPOINTMENTS (REAL TIME) ---
  getAppointments(): AppointmentBooking[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
        return INITIAL_APPOINTMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  },

  createAppointment(bookingData: Omit<AppointmentBooking, 'id' | 'status' | 'createdAt' | 'generatedAccessCode'>): { appointment: AppointmentBooking; accessCode: string; patient: PatientRecord } {
    const appointments = this.getAppointments();
    const patients = this.getPatients();

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const accessCode = `EQ-${randomNum}`;

    const newAppointment: AppointmentBooking = {
      ...bookingData,
      id: 'apt-' + Date.now(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      generatedAccessCode: accessCode
    };

    appointments.unshift(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));

    // Auto-create or connect patient record
    let patient = patients.find(p => p.email.toLowerCase() === bookingData.email.toLowerCase() || p.phone === bookingData.phone);
    
    if (!patient) {
      const specialistNames: Record<string, { name: string; role: string }> = {
        'Fisioterapia General': { name: 'Lic. Alejandro Rivas', role: 'Fisioterapeuta' },
        'Fisioterapia Deportiva': { name: 'Lic. Mariana Valdés', role: 'Fisioterapeuta Deportiva' },
        'Fisioterapia Pediátrica': { name: 'Dra. Elena Castellanos', role: 'Especialista Pediátrica' },
        'Fisioterapia Geriátrica': { name: 'Lic. Carlos Méndez', role: 'Especialista en Geriatría' },
        'Traumatología': { name: 'Dr. Fernando Carrillo', role: 'Médico Traumatólogo' },
        'Psicología': { name: 'Lic. Claudia Navarro', role: 'Psicóloga Clínica' },
        'Nutrición': { name: 'Lic. Valeria Morales', role: 'Nutricionista Clínica' },
        'Entrenamiento Funcional': { name: 'Prof. Roberto Lugo', role: 'Entrenador Funcional' },
        'Boxeo': { name: 'Coach Marcos Silva', role: 'Instructor de Boxeo' }
      };

      const spec = specialistNames[bookingData.service] || { name: 'Lic. Mariana Valdés', role: 'Fisioterapeuta Principal' };

      patient = {
        id: 'pat-' + Date.now(),
        accessCode: accessCode,
        fullName: bookingData.patientName,
        documentId: bookingData.documentId || `V-${Math.floor(10000000 + Math.random() * 20000000)}`,
        email: bookingData.email,
        phone: bookingData.phone,
        emergencyContactName: bookingData.emergencyContactName || 'Familiar de Contacto',
        emergencyContactPhone: bookingData.emergencyContactPhone || bookingData.phone,
        emergencyContactRelation: 'Familiar',
        address: bookingData.address || 'Caracas, Distrito Capital',
        city: 'Caracas',
        preferredContactMethod: 'Llamada Telefónica',
        bloodType: 'O+',
        allergies: 'Sin alergias registradas',
        insuranceCompany: 'Particular',
        age: 30,
        service: bookingData.service as any,
        specialist: spec.name,
        specialistRole: spec.role,
        diagnosis: bookingData.notes || 'Consulta inicial programada',
        status: 'scheduled',
        painInitial: 6,
        painCurrent: 6,
        mobilityProgress: 45,
        completedSessions: 0,
        totalSessions: 8,
        nextAppointmentDate: bookingData.preferredDate,
        nextAppointmentTime: bookingData.preferredTime,
        registeredAt: new Date().toISOString().split('T')[0],
        treatmentGoal: 'Evaluación biomecánica inicial y diseño de plan personalizado.',
        notes: [
          {
            id: 'note-init-' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            author: 'Sistema Automatizado EQUILIBRA',
            role: 'Admisión',
            note: `Cita confirmada vía web para ${bookingData.preferredDate} a las ${bookingData.preferredTime}. Motivo: ${bookingData.notes || 'Evaluación inicial'}`
          }
        ],
        exercises: [
          {
            id: 'ex-init-1',
            title: 'Movilidad articular suave y control respiratorio',
            sets: '2 series',
            reps: '10 repeticiones',
            frequency: 'Previo a consulta',
            instructions: 'Realizar movimientos suaves dentro de un rango indoloro mientras asistes a tu cita.',
            completedToday: false
          }
        ],
        painHistory: [
          { date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), score: 6 }
        ],
        chatMessages: [
          {
            id: 'msg-welcome',
            sender: 'specialist',
            text: `¡Hola ${bookingData.patientName}! Bienvenido a EQUILIBRA. Tu cita para ${bookingData.service} está programada para el ${bookingData.preferredDate} a las ${bookingData.preferredTime}. Estaremos esperándote en Sabana Grande, Centro Profesional del Este.`,
            timestamp: 'Hoy'
          }
        ]
      };

      patients.unshift(patient);
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    } else {
      patient.nextAppointmentDate = bookingData.preferredDate;
      patient.nextAppointmentTime = bookingData.preferredTime;
      patient.notes.unshift({
        id: 'note-new-apt-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        author: 'Sistema EQUILIBRA',
        role: 'Admisión',
        note: `Nueva cita agendada para ${bookingData.preferredDate} a las ${bookingData.preferredTime}.`
      });
      this.savePatient(patient);
    }

    notifyChange();

    // Push new appointment to cloud server immediately
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    })
      .then(res => res.json())
      .then(serverRes => {
        if (serverRes.success && serverRes.appointment) {
          // Trigger immediate sync
          syncWithServer();
        }
      })
      .catch(err => {
        console.warn('Real-time sync queued locally:', err);
      });

    return { appointment: newAppointment, accessCode, patient };
  },

  updateAppointmentStatus(id: string, status: AppointmentBooking['status']): void {
    const appointments = this.getAppointments();
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      notifyChange();

      // Push update to server
      fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => {});
    }
  },

  // --- SERVICES & PRICING MANAGEMENT ---
  getServices(): ServiceDetail[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
        // Also push initial services to server in background
        fetch('/api/services/bulk', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(INITIAL_SERVICES)
        }).catch(() => {});
        return INITIAL_SERVICES;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  },

  getServiceById(id: string): ServiceDetail | undefined {
    return this.getServices().find(s => s.id === id);
  },

  saveService(service: ServiceDetail): void {
    const list = this.getServices();
    const index = list.findIndex(s => s.id === service.id);
    if (index >= 0) {
      list[index] = service;
    } else {
      list.push(service);
    }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
    notifyChange();

    // Push to server
    fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    }).catch(() => {});
  },

  updateServicePrice(id: string, newPriceUSD: number, duration?: string, customVideoUrl?: string): ServiceDetail | null {
    const list = this.getServices();
    const srv = list.find(s => s.id === id);
    if (!srv) return null;

    srv.priceUSD = Number(newPriceUSD);
    srv.priceLabel = `$${newPriceUSD} USD / Sesión Individual`;
    if (duration) srv.duration = duration;
    if (customVideoUrl !== undefined) {
      if (!srv.videoData) {
        srv.videoData = {
          title: srv.title,
          duration: duration || '3:00 min',
          presenter: 'Especialista EQUILIBRA',
          presenterRole: 'Especialista',
          synopsis: srv.description,
          videoPoster: srv.image,
          chapters: [],
          keyPoints: [],
          techniquesShown: [],
          equipmentUsed: []
        };
      }
      srv.videoData.customVideoUrl = customVideoUrl;
    }

    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
    notifyChange();

    // Push to server
    fetch(`/api/services/${id}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceUSD: newPriceUSD, duration, customVideoUrl })
    }).catch(() => {});

    return srv;
  },

  deleteService(id: string): void {
    const list = this.getServices().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
    notifyChange();

    fetch(`/api/services/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // --- CLINIC SETTINGS MANAGEMENT ---
  getClinicSettings(): ClinicSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLINIC_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CLINIC_SETTINGS, JSON.stringify(DEFAULT_CLINIC_SETTINGS));
        return DEFAULT_CLINIC_SETTINGS;
      }
      return { ...DEFAULT_CLINIC_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_CLINIC_SETTINGS;
    }
  },

  saveClinicSettings(settings: Partial<ClinicSettings>): ClinicSettings {
    const current = this.getClinicSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.CLINIC_SETTINGS, JSON.stringify(updated));
    notifyChange();

    fetch('/api/clinic-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});

    return updated;
  },

  // --- TESTIMONIALS ---
  getTestimonials(): Testimonial[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(INITIAL_TESTIMONIALS));
        return INITIAL_TESTIMONIALS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TESTIMONIALS;
    }
  },

  addTestimonial(testimonial: Omit<Testimonial, 'id' | 'date' | 'verified'>): Testimonial {
    const list = this.getTestimonials();
    const newTest: Testimonial = {
      ...testimonial,
      id: 'test-' + Date.now(),
      date: 'Recién publicado',
      verified: true
    };
    list.unshift(newTest);
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list));
    notifyChange();
    return newTest;
  },

  getActivePatientCode(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_CODE) || 'EQ-4819';
  },

  setActivePatientCode(code: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_CODE, code);
    notifyChange();
  },

  resetDatabase(): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(INITIAL_TESTIMONIALS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_CODE, 'EQ-4819');
    notifyChange();
    syncWithServer();
  },

  exportDatabaseJSON(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      patients: this.getPatients(),
      appointments: this.getAppointments(),
      testimonials: this.getTestimonials()
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.patients && Array.isArray(parsed.patients)) {
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(parsed.patients));
      }
      if (parsed.appointments && Array.isArray(parsed.appointments)) {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(parsed.appointments));
      }
      if (parsed.testimonials && Array.isArray(parsed.testimonials)) {
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(parsed.testimonials));
      }
      notifyChange();
      return true;
    } catch {
      return false;
    }
  },

  onDatabaseChange(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(DB_EVENT_NAME, callback);
    return () => window.removeEventListener(DB_EVENT_NAME, callback);
  }
};
