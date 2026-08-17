const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const db = new Database(path.join(__dirname, 'database.sqlite'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin'
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS device_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );
`);

const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'equilibra123';
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUsername);

if (!adminExists) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(adminUsername, hash, 'admin');
}

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.static(__dirname));

function generateToken(username) {
  return Buffer.from(JSON.stringify({ username, role: 'admin' })).toString('base64');
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (!decoded.username) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'EQUILIBRA API funcionando' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña obligatorios' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);

  if (!isValid) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  return res.json({
    token: generateToken(user.username),
    user: { username: user.username, role: user.role }
  });
});

app.get('/api/appointments', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM appointments
    ORDER BY date ASC, time ASC
  `).all();

  res.json(rows);
});

app.get('/api/admin/appointments', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM appointments
    ORDER BY date ASC, time ASC
  `).all();

  res.json(rows);
});

app.post('/api/device-token', (req, res) => {
  const { deviceToken } = req.body || {};

  if (!deviceToken) {
    return res.status(400).json({ message: 'Falta deviceToken' });
  }

  db.prepare(`
    INSERT OR IGNORE INTO device_tokens (token, created_at)
    VALUES (?, ?)
  `).run(String(deviceToken), Date.now());

  return res.json({ ok: true, message: 'Token registrado' });
});

app.patch('/api/appointments/:id', (req, res) => {
  const { status } = req.body || {};
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ message: 'Falta el estado' });
  }

  const result = db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Cita no encontrada' });
  }

  return res.json({ ok: true, message: 'Estado actualizado' });
});

app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Cita no encontrada' });
  }

  return res.json({ ok: true, message: 'Cita eliminada' });
});

app.post('/api/appointments', async (req, res) => {
  const { name, phone, email, service, date, time } = req.body || {};

  if (!name || !phone || !email || !service || !date || !time) {
    return res.status(400).json({ message: 'Faltan datos de la cita' });
  }

  const appointmentId = `apt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const exists = db.prepare('SELECT 1 FROM appointments WHERE date = ? AND time = ?').get(date, time);

  if (exists) {
    return res.status(409).json({ message: 'Ese horario ya está ocupado' });
  }

  const newAppointment = {
    id: appointmentId,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(email).trim(),
    service: String(service).trim(),
    date: String(date),
    time: String(time),
    status: 'pendiente',
    created_at: Date.now()
  };

  db.prepare(`
    INSERT INTO appointments (id, name, phone, email, service, date, time, status, created_at)
    VALUES (@id, @name, @phone, @email, @service, @date, @time, @status, @created_at)
  `).run(newAppointment);

  const tokens = db.prepare('SELECT token FROM device_tokens').all().map((row) => row.token);
  if (tokens.length) {
    console.log('[notificacion app]', {
      title: 'Nueva cita agendada',
      body: `${newAppointment.name} quiere ${newAppointment.service} para ${newAppointment.date} a las ${newAppointment.time}`,
      tokens: tokens.length
    });
  }

  return res.status(201).json({ message: 'Cita creada correctamente', appointment: newAppointment });
});

app.listen(port, () => {
  console.log(`EQUILIBRA server running on http://localhost:${port}`);
});
