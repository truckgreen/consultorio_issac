// server.ts - Entry point compatible con tsx y Vite en el entorno de desarrollo
import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Base de datos JSON
const DB_FILE = path.join(__dirname, 'database.json');

const defaultData = {
  users: [
    {
      id: 1,
      username: 'admin',
      password_hash: bcrypt.hashSync('equilibra123', 10),
      role: 'admin'
    }
  ],
  prices: [
    { id: '1', service: 'Fisioterapia Deportiva', price: 45, currency: '$', duration: '50 min', note: 'Evaluación física y rehabilitación funcional', updated_at: Date.now() },
    { id: '2', service: 'Traumatología', price: 50, currency: '$', duration: '45 min', note: 'Diagnóstico articular y musculoesquelético', updated_at: Date.now() },
    { id: '3', service: 'Psicología', price: 40, currency: '$', duration: '50 min', note: 'Acompañamiento emocional y hábitos', updated_at: Date.now() },
    { id: '4', service: 'Nutrición', price: 35, currency: '$', duration: '45 min', note: 'Plan personalizado y composición corporal', updated_at: Date.now() },
    { id: '5', service: 'Entrenamiento Funcional', price: 30, currency: '$', duration: '60 min', note: 'Fuerza, estabilidad y movilidad', updated_at: Date.now() },
    { id: '6', service: 'Boxeo', price: 25, currency: '$', duration: '60 min', note: 'Acondicionamiento físico y técnica', updated_at: Date.now() }
  ],
  appointments: [
    {
      id: 'demo-1',
      name: 'María López',
      phone: '0412-1234567',
      email: 'maria@example.com',
      service: 'Fisioterapia Deportiva',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '09:00',
      status: 'confirmada',
      created_at: Date.now() - 3600000 * 6
    },
    {
      id: 'demo-2',
      name: 'Carlos Pérez',
      phone: '0412-7654321',
      email: 'carlos@example.com',
      service: 'Psicología',
      date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      time: '14:30',
      status: 'pendiente',
      created_at: Date.now() - 3600000 * 12
    },
    {
      id: 'demo-3',
      name: 'Ana García',
      phone: '0414-9876543',
      email: 'ana@example.com',
      service: 'Nutrición',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      time: '16:00',
      status: 'confirmada',
      created_at: Date.now() - 3600000 * 24
    }
  ],
  device_tokens: []
};

function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    saveDatabase(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || defaultData.users,
      prices: parsed.prices || defaultData.prices,
      appointments: parsed.appointments || defaultData.appointments,
      device_tokens: parsed.device_tokens || defaultData.device_tokens
    };
  } catch (err) {
    saveDatabase(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error guardando DB:', err);
  }
}

let db = loadDatabase();

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'EQUILIBRA API funcionando' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  db = loadDatabase();
  const user = db.users.find((u: any) => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = Buffer.from(JSON.stringify({ username: user.username, role: user.role, time: Date.now() })).toString('base64');
  return res.json({ ok: true, token, user: { username: user.username, role: user.role } });
});

app.get('/api/appointments', (req, res) => {
  db = loadDatabase();
  const sorted = [...db.appointments].sort((a: any, b: any) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  res.json(sorted);
});

app.post('/api/appointments', (req, res) => {
  const { name, phone, email, service, date, time } = req.body || {};
  if (!name || !phone || !email || !service || !date || !time) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  db = loadDatabase();
  const conflict = db.appointments.find((a: any) => a.date === date && a.time === time && a.status !== 'cancelada');
  if (conflict) {
    return res.status(409).json({ message: 'Ese horario ya está ocupado' });
  }

  const newAppointment = {
    id: req.body.id || `apt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(email).trim(),
    service: String(service).trim(),
    date: String(date),
    time: String(time),
    status: req.body.status || 'pendiente',
    created_at: Date.now()
  };

  db.appointments.push(newAppointment);
  saveDatabase(db);
  return res.status(201).json({ message: 'Cita creada correctamente', appointment: newAppointment });
});

app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  db = loadDatabase();
  const index = db.appointments.findIndex((a: any) => a.id === id);
  if (index === -1) return res.status(404).json({ message: 'Cita no encontrada' });

  db.appointments[index] = { ...db.appointments[index], ...req.body, id };
  saveDatabase(db);
  return res.json({ ok: true, message: 'Cita actualizada', appointment: db.appointments[index] });
});

app.patch('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  db = loadDatabase();
  const appointment = db.appointments.find((a: any) => a.id === id);
  if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });

  appointment.status = status;
  saveDatabase(db);
  return res.json({ ok: true, message: `Estado cambiado a ${status}`, appointment });
});

app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  db = loadDatabase();
  const before = db.appointments.length;
  db.appointments = db.appointments.filter((a: any) => a.id !== id);
  if (db.appointments.length === before) return res.status(404).json({ message: 'Cita no encontrada' });

  saveDatabase(db);
  return res.json({ ok: true, message: 'Cita eliminada' });
});

// Precios dinámicos
app.get('/api/prices', (req, res) => {
  db = loadDatabase();
  res.json(db.prices || []);
});

app.put('/api/prices', (req, res) => {
  const { prices } = req.body || {};
  if (!Array.isArray(prices)) return res.status(400).json({ message: 'Arreglo inválido' });

  db = loadDatabase();
  db.prices = prices.map((p: any) => ({
    id: p.id || `price-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    service: String(p.service).trim(),
    price: Number(p.price) || 0,
    currency: p.currency || '$',
    duration: p.duration || '50 min',
    note: p.note || '',
    updated_at: Date.now()
  }));

  saveDatabase(db);
  return res.json({ ok: true, message: 'Precios actualizados', prices: db.prices });
});

app.patch('/api/prices/:id', (req, res) => {
  const { id } = req.params;
  const { price, currency, note, duration } = req.body || {};
  db = loadDatabase();
  const servicePrice = db.prices.find((p: any) => p.id === id);
  if (!servicePrice) return res.status(404).json({ message: 'Servicio no encontrado' });

  if (price !== undefined) servicePrice.price = Number(price);
  if (currency !== undefined) servicePrice.currency = currency;
  if (note !== undefined) servicePrice.note = note;
  if (duration !== undefined) servicePrice.duration = duration;
  servicePrice.updated_at = Date.now();

  saveDatabase(db);
  return res.json({ ok: true, message: 'Precio actualizado', service: servicePrice });
});

// Servir archivos estáticos directamente
app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'user.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EQUILIBRA running on http://localhost:${PORT}`);
});
