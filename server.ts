import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server Data Persistence Directory
const DATA_DIR = path.join(process.cwd(), "server_data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");
const SERVICES_FILE = path.join(DATA_DIR, "services.json");
const SETTINGS_FILE = path.join(DATA_DIR, "clinic_settings.json");

// Helper to read/write persistent JSON stores
function loadJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function saveJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error saving ${filePath}:`, err);
  }
}

// Initial In-Memory Seed Data
const defaultAppointments = [
  {
    id: "apt-101",
    patientName: "Carlos Eduardo Mendoza",
    phone: "+58 414 123 4567",
    email: "carlos.mendoza@gmail.com",
    service: "Fisioterapia Deportiva",
    preferredDate: "2026-08-22",
    preferredTime: "09:00 AM",
    notes: "Molestia en ligamento cruzado anterior tras partido.",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    generatedAccessCode: "EQ-4819"
  },
  {
    id: "apt-102",
    patientName: "Valentina Sofía Gómez",
    phone: "+58 412 987 6543",
    email: "valentina.gomez@hotmail.com",
    service: "Fisioterapia General",
    preferredDate: "2026-08-22",
    preferredTime: "11:30 AM",
    notes: "Cervicalgia recurrente por trabajo de oficina frente a monitor.",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    generatedAccessCode: "EQ-7392"
  },
  {
    id: "apt-103",
    patientName: "Andrés Ignacio Bello",
    phone: "+58 424 555 7890",
    email: "andres.bello@empresa.ve",
    service: "Traumatología",
    preferredDate: "2026-08-23",
    preferredTime: "02:00 PM",
    notes: "Evaluación traumatológica de hombro doloroso post-caída.",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    generatedAccessCode: "EQ-1045"
  }
];

const defaultClinicSettings = {
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

let appointments = loadJSON(APPOINTMENTS_FILE, defaultAppointments);
let patients = loadJSON(PATIENTS_FILE, []);
let services = loadJSON(SERVICES_FILE, []);
let clinicSettings = loadJSON(SETTINGS_FILE, defaultClinicSettings);

let lastUpdatedTimestamp = Date.now();

// -------------------------------------------------------------
// REAL-TIME API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    online: true,
    serverTime: new Date().toISOString(),
    appointmentsCount: appointments.length,
    servicesCount: services.length,
    lastUpdate: lastUpdatedTimestamp
  });
});

// Real-time synchronization check
app.get("/api/sync", (_req: Request, res: Response) => {
  res.json({
    timestamp: lastUpdatedTimestamp,
    appointmentsCount: appointments.length,
    patientsCount: patients.length,
    servicesCount: services.length,
    appointments: appointments,
    patients: patients,
    services: services,
    clinicSettings: clinicSettings
  });
});

// GET & PUT clinic settings
app.get("/api/clinic-settings", (_req: Request, res: Response) => {
  res.json({ success: true, settings: clinicSettings });
});

app.post("/api/clinic-settings", (req: Request, res: Response) => {
  clinicSettings = { ...clinicSettings, ...req.body };
  saveJSON(SETTINGS_FILE, clinicSettings);
  lastUpdatedTimestamp = Date.now();
  res.json({ success: true, settings: clinicSettings });
});

// GET & POST & PUT & DELETE services
app.get("/api/services", (_req: Request, res: Response) => {
  res.json({ success: true, data: services, timestamp: lastUpdatedTimestamp });
});

app.post("/api/services", (req: Request, res: Response) => {
  const newService = req.body;
  if (!newService || !newService.id || !newService.title) {
    return res.status(400).json({ error: "Datos del servicio incompletos." });
  }

  const existingIdx = services.findIndex((s: any) => s.id === newService.id);
  if (existingIdx >= 0) {
    services[existingIdx] = newService;
  } else {
    services.push(newService);
  }

  saveJSON(SERVICES_FILE, services);
  lastUpdatedTimestamp = Date.now();
  res.json({ success: true, service: newService });
});

app.put("/api/services/bulk", (req: Request, res: Response) => {
  if (Array.isArray(req.body)) {
    services = req.body;
    saveJSON(SERVICES_FILE, services);
    lastUpdatedTimestamp = Date.now();
    res.json({ success: true, count: services.length });
  } else {
    res.status(400).json({ error: "Array de servicios esperado." });
  }
});

app.patch("/api/services/:id/price", (req: Request, res: Response) => {
  const { id } = req.params;
  const { priceUSD, duration, customVideoUrl } = req.body;

  const srvIndex = services.findIndex((s: any) => s.id === id);
  if (srvIndex === -1) {
    return res.status(404).json({ error: "Servicio no encontrado." });
  }

  if (priceUSD !== undefined) {
    services[srvIndex].priceUSD = Number(priceUSD);
    services[srvIndex].priceLabel = `$${priceUSD} USD / Sesión Individual`;
  }
  if (duration !== undefined) {
    services[srvIndex].duration = duration;
  }
  if (customVideoUrl !== undefined) {
    if (!services[srvIndex].videoData) {
      services[srvIndex].videoData = {
        title: services[srvIndex].title,
        duration: "3:00 min",
        presenter: "Especialista EQUILIBRA",
        presenterRole: "Especialista",
        synopsis: services[srvIndex].description,
        videoPoster: services[srvIndex].image,
        chapters: [],
        keyPoints: [],
        techniquesShown: [],
        equipmentUsed: []
      };
    }
    services[srvIndex].videoData.customVideoUrl = customVideoUrl;
  }

  saveJSON(SERVICES_FILE, services);
  lastUpdatedTimestamp = Date.now();

  res.json({ success: true, service: services[srvIndex] });
});

app.delete("/api/services/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  services = services.filter((s: any) => s.id !== id);
  saveJSON(SERVICES_FILE, services);
  lastUpdatedTimestamp = Date.now();
  res.json({ success: true, deletedId: id });
});

// GET all appointments (with live filtering & sorting)
app.get("/api/appointments", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: appointments,
    timestamp: lastUpdatedTimestamp
  });
});

// POST new appointment from web or mobile
app.post("/api/appointments", (req: Request, res: Response) => {
  const bookingData = req.body;
  if (!bookingData.patientName || !bookingData.phone || !bookingData.service) {
    return res.status(400).json({ error: "Faltan datos obligatorios para la reserva." });
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const accessCode = `EQ-${randomNum}`;

  const newAppointment = {
    id: "apt-" + Date.now(),
    patientName: bookingData.patientName,
    phone: bookingData.phone,
    email: bookingData.email || "",
    service: bookingData.service,
    preferredDate: bookingData.preferredDate || new Date().toISOString().split("T")[0],
    preferredTime: bookingData.preferredTime || "10:00 AM",
    notes: bookingData.notes || "",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    generatedAccessCode: accessCode
  };

  appointments.unshift(newAppointment);
  saveJSON(APPOINTMENTS_FILE, appointments);
  lastUpdatedTimestamp = Date.now();

  console.log(`[EQUILIBRA SERVER] Nueva cita agendada: ${newAppointment.patientName} (${newAppointment.service}) - Código ${accessCode}`);

  res.status(201).json({
    success: true,
    appointment: newAppointment,
    accessCode
  });
});

// PATCH update appointment status
app.patch("/api/appointments/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const aptIndex = appointments.findIndex((a: any) => a.id === id);
  if (aptIndex === -1) {
    return res.status(404).json({ error: "Cita no encontrada." });
  }

  appointments[aptIndex].status = status;
  saveJSON(APPOINTMENTS_FILE, appointments);
  lastUpdatedTimestamp = Date.now();

  res.json({
    success: true,
    data: appointments[aptIndex]
  });
});

// GET patients
app.get("/api/patients", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: patients,
    timestamp: lastUpdatedTimestamp
  });
});

// POST or update patient
app.post("/api/patients", (req: Request, res: Response) => {
  const patient = req.body;
  if (!patient || !patient.id) {
    return res.status(400).json({ error: "Paciente inválido." });
  }

  const existingIndex = patients.findIndex((p: any) => p.id === patient.id);
  if (existingIndex >= 0) {
    patients[existingIndex] = patient;
  } else {
    patients.unshift(patient);
  }

  saveJSON(PATIENTS_FILE, patients);
  lastUpdatedTimestamp = Date.now();

  res.json({ success: true, patient });
});

// POST chat message for patient
app.post("/api/patients/:id/chat", (req: Request, res: Response) => {
  const { id } = req.params;
  const { sender, text } = req.body;

  const patient = patients.find((p: any) => p.id === id);
  if (!patient) {
    return res.status(404).json({ error: "Paciente no encontrado." });
  }

  const timestamp = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + ", Hoy";
  const newMessage = {
    id: "msg-" + Date.now(),
    sender: sender || "specialist",
    text: text || "",
    timestamp
  };

  if (!patient.chatMessages) {
    patient.chatMessages = [];
  }
  patient.chatMessages.push(newMessage);

  saveJSON(PATIENTS_FILE, patients);
  lastUpdatedTimestamp = Date.now();

  res.json({ success: true, message: newMessage });
});

// -------------------------------------------------------------
// VITE / STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EQUILIBRA ONLINE] Servidor activo en http://localhost:${PORT}`);
  });
}

startServer();
