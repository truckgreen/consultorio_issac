const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del portal web público
app.use(express.static(path.join(__dirname, 'public')));

// Almacén en memoria de turnos para el portal web
// (Se puede conectar a PostgreSQL / MongoDB de Render)
let appointments = [
  {
    id: 1,
    patientName: "Carlos Mendoza",
    patientPhone: "+54 9 11 5544-2211",
    patientEmail: "carlos.mendoza@email.com",
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    specialty: "Fisioterapia y Rehabilitación",
    doctorName: "Lic. Isaac Rodríguez (Fisioterapeuta)",
    reason: "Rehabilitación lumbar por contractura",
    status: "CONFIRMADO",
    cost: 5000.0,
    isPaid: true,
    adminNotes: "Paciente habitual. Turno reservado.",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    patientName: "Lucía Fernández",
    patientPhone: "+54 9 11 6789-0123",
    patientEmail: "lucia.fernandez@email.com",
    date: new Date().toISOString().split('T')[0],
    time: "11:30",
    specialty: "Kinesiología Deportiva",
    doctorName: "Lic. Elena Morales (Kinesióloga)",
    reason: "Esguince de tobillo grado 2",
    status: "PENDIENTE",
    cost: 5500.0,
    isPaid: false,
    adminNotes: "Traer resonancia magnética previa",
    createdAt: new Date().toISOString()
  }
];

let nextId = 3;

// 1. Health check (usado por Render y por la App Móvil para comprobar estado)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Equilibra Fisioterapia Backend',
    timestamp: new Date().toISOString(),
    appointmentsCount: appointments.length
  });
});

// 2. Obtener todos los turnos (consumido por la App Móvil o panel admin)
app.get('/api/appointments', (req, res) => {
  const { date, specialty } = req.query;
  let filtered = [...appointments];

  if (date) {
    filtered = filtered.filter(a => a.date === date);
  }
  if (specialty) {
    filtered = filtered.filter(a => a.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }

  res.json({
    success: true,
    total: filtered.length,
    data: filtered
  });
});

// 3. Crear nuevo turno (desde el formulario de la página web)
app.post('/api/appointments', (req, res) => {
  const {
    patientName,
    patientPhone,
    patientEmail,
    date,
    time,
    specialty,
    doctorName,
    reason,
    cost
  } = req.body;

  if (!patientName || !patientPhone || !date || !time) {
    return res.status(400).json({
      success: false,
      error: "Campos obligatorios faltantes: patientName, patientPhone, date, time"
    });
  }

  const newAppointment = {
    id: nextId++,
    patientName,
    patientPhone,
    patientEmail: patientEmail || "",
    date,
    time,
    specialty: specialty || "Fisioterapia y Rehabilitación",
    doctorName: doctorName || "Lic. Isaac Rodríguez (Fisioterapeuta)",
    reason: reason || "Consulta / Evaluación Fisioterapéutica",
    status: "PENDIENTE",
    cost: cost ? parseFloat(cost) : 5000.0,
    isPaid: false,
    adminNotes: "Reserva web generada automáticamente",
    createdAt: new Date().toISOString()
  };

  appointments.push(newAppointment);

  console.log(`[NUEVO TURNO WEB] Paciente: ${patientName} | Fecha: ${date} ${time} | Tel: ${patientPhone}`);

  res.status(201).json({
    success: true,
    message: "¡Turno agendado exitosamente en Equilibra!",
    appointment: newAppointment
  });
});

// 4. Actualizar estado del turno (Confirmar / Cancelar)
app.patch('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status, isPaid, adminNotes } = req.body;

  const apt = appointments.find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, error: "Turno no encontrado" });
  }

  if (status) apt.status = status;
  if (typeof isPaid === 'boolean') apt.isPaid = isPaid;
  if (adminNotes) apt.adminNotes = adminNotes;

  res.json({ success: true, appointment: apt });
});

// 5. Cancelar turno
app.delete('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = appointments.length;
  appointments = appointments.filter(a => a.id !== id);

  if (appointments.length === initialLength) {
    return res.status(404).json({ success: false, error: "Turno no encontrado" });
  }

  res.json({ success: true, message: "Turno cancelado correctamente" });
});

// Redirigir cualquier otra ruta a la página principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`🌿 Equilibra Fisioterapia - Servidor Activo`);
  console.log(`🚀 Puerto: ${PORT}`);
  console.log(`📡 URL API Health: http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});
