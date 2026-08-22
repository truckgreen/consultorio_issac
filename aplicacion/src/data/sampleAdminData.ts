import { Appointment, ContactMessage, AdminNotification } from '../types';

export const INITIAL_SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 'app_seed_1',
    code: 'EQ-48219',
    service_id: 'fisioterapia-deportiva',
    service_title: 'Fisioterapia Deportiva',
    fecha: new Date().toISOString().split('T')[0], // Hoy
    hora: '09:00 AM - 10:00 AM',
    nombre: 'Alejandro',
    apellido: 'Mendoza',
    telefono: '+58 414 123.45.67',
    email: 'alejandro.mendoza@gmail.com',
    motivo: 'Rehabilitación post-esguince de tobillo grado II jugando fútbol.',
    primera_visita: false,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    status: 'CONFIRMADA',
    specialist_id: 'isaac-jewsiejew',
    specialist_name: 'Isaac Jewsiejew',
    payment_status: 'PAGADO',
    amount: 40,
    notes: 'Paciente con buena tolerancia al ejercicio de propiocepción. Se aplicó terapia manual.'
  },
  {
    id: 'app_seed_2',
    code: 'EQ-93041',
    service_id: 'traumatologia',
    service_title: 'Traumatología',
    fecha: new Date().toISOString().split('T')[0], // Hoy
    hora: '10:00 AM - 11:00 AM',
    nombre: 'Elena',
    apellido: 'Castillo',
    telefono: '+58 412 987.65.43',
    email: 'elena.castillo@yahoo.com',
    motivo: 'Evaluación médica por dolor punzante en rodilla derecha al bajar escaleras.',
    primera_visita: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'CONFIRMADA',
    specialist_id: 'ruben-torrealba',
    specialist_name: 'Dr. Rubén Torrealba',
    payment_status: 'PENDIENTE',
    amount: 50,
    notes: 'Traerá resonancia magnética previa. Requiere evaluación de meniscos.'
  },
  {
    id: 'app_seed_3',
    code: 'EQ-71628',
    service_id: 'fisioterapia-pediatrica',
    service_title: 'Fisioterapia Pediátrica',
    fecha: new Date().toISOString().split('T')[0], // Hoy
    hora: '02:00 PM - 03:00 PM',
    nombre: 'Mateo',
    apellido: 'Gutiérrez (Padre: Carlos G.)',
    telefono: '+58 416 555.77.88',
    email: 'carlos.gutierrez@outlook.com',
    motivo: 'Control de corrección de marcha y fortalecimiento de arcos plantares (6 años).',
    primera_visita: false,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'CONFIRMADA',
    specialist_id: 'marivid-requena',
    specialist_name: 'Marivid Requena',
    payment_status: 'PAGADO',
    amount: 35,
    notes: 'Sesión lúdica. Notable mejoría en equilibrio monopodal.'
  },
  {
    id: 'app_seed_4',
    code: 'EQ-15284',
    service_id: 'psicologia',
    service_title: 'Psicología',
    fecha: new Date().toISOString().split('T')[0], // Hoy
    hora: '04:00 PM - 05:00 PM',
    nombre: 'Valeria',
    apellido: 'Rondón',
    telefono: '+58 424 333.22.11',
    email: 'valeria.rondon@gmail.com',
    motivo: 'Manejo de ansiedad y kinesiofobia tras cirugía de ligamento cruzado anterior.',
    primera_visita: true,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'PENDIENTE',
    specialist_id: 'cristina-flores',
    specialist_name: 'Cristina Flores',
    payment_status: 'PENDIENTE',
    amount: 40,
    notes: 'Pendiente confirmar hora por mensaje de WhatsApp.'
  },
  {
    id: 'app_seed_5',
    code: 'EQ-62915',
    service_id: 'fisioterapia-geriatrica',
    service_title: 'Fisioterapia Geriátrica',
    fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    hora: '09:00 AM - 10:00 AM',
    nombre: 'Doña Carmen',
    apellido: 'Paredes',
    telefono: '+58 412 888.99.00',
    email: 'hija.carmen@gmail.com',
    motivo: 'Mantenimiento articular de cadera y reeducación de la marcha.',
    primera_visita: false,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: 'CONFIRMADA',
    specialist_id: 'laury-torrealba',
    specialist_name: 'Laury Torrealba',
    payment_status: 'PAGADO',
    amount: 30,
    notes: 'Viene acompañada por su hija. Sesión suave con ejercicios en colchoneta y barra.'
  },
  {
    id: 'app_seed_6',
    code: 'EQ-88402',
    service_id: 'nutricion',
    service_title: 'Nutrición',
    fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    hora: '11:00 AM - 12:00 PM',
    nombre: 'Gustavo',
    apellido: 'Blanco',
    telefono: '+58 414 444.11.22',
    email: 'gblanco@empresa.com',
    motivo: 'Plan de nutrición antiinflamatoria y recomposición corporal.',
    primera_visita: true,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'CONFIRMADA',
    specialist_id: 'stephani-salina',
    specialist_name: 'Stephani Salina',
    payment_status: 'PENDIENTE',
    amount: 35,
    notes: 'Se realizará estudio de bioimpedancia completo.'
  },
  {
    id: 'app_seed_7',
    code: 'EQ-33921',
    service_id: 'entrenamiento-funcional',
    service_title: 'Entrenamiento funcional',
    fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Ayer
    hora: '05:00 PM - 06:00 PM',
    nombre: 'Rodrigo',
    apellido: 'Suárez',
    telefono: '+58 412 777.66.55',
    email: 'rodrigo.suarez@live.com',
    motivo: 'Clase de fortalecimiento de core y readaptación física.',
    primera_visita: false,
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    status: 'COMPLETADA',
    specialist_id: 'indira-acevedo',
    specialist_name: 'Indira Acevedo',
    payment_status: 'PAGADO',
    amount: 25,
    notes: 'Asistió puntualmente. Cumplió con todo el circuito de 5 bloques.'
  }
];

export const INITIAL_SAMPLE_MESSAGES: ContactMessage[] = [
  {
    id: 'msg_seed_1',
    name: 'Dra. Patricia Colmenares',
    email: 'pcolmenares@salud.ve',
    phone: '+58 414 234.56.78',
    subject: 'Alianza médica y remisión de pacientes traumatológicos',
    message: 'Hola equipo de Equilibra, soy traumatóloga en una clínica vecina de Chacaíto y me gustaría coordinar remisión directa de mis pacientes post-quirúrgicos a su sede de Sabana Grande.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'NUEVO',
    adminNotes: ''
  },
  {
    id: 'msg_seed_2',
    name: 'Ignacio Febres',
    email: 'ifebres99@gmail.com',
    phone: '+58 412 654.32.10',
    subject: 'Consulta sobre planes de entrenamiento y boxeo para empresas',
    message: 'Buenas tardes, quisiera saber si tienen paquetes corporativos para grupos de 6 personas en las mañanas de boxeo y funcional.',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    status: 'RESPONDIDO',
    adminNotes: 'Respondido vía WhatsApp por Coordinación.'
  }
];

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif_1',
    title: 'Nueva Cita Agendada Online',
    message: 'Valeria Rondón solicitó cita de Psicología para hoy a las 04:00 PM.',
    timestamp: 'Hace 2 horas',
    type: 'appointment',
    read: false,
    linkTab: 'citas'
  },
  {
    id: 'notif_2',
    title: 'Mensaje de Contacto Entrante',
    message: 'Dra. Patricia Colmenares envió una propuesta de alianza médica.',
    timestamp: 'Hace 5 horas',
    type: 'message',
    read: false,
    linkTab: 'mensajes'
  },
  {
    id: 'notif_3',
    title: 'Base de Datos Sincronizada',
    message: 'Los registros locales están listos para sincronizar con Supabase Cloud.',
    timestamp: 'Hoy',
    type: 'system',
    read: true,
    linkTab: 'dashboard'
  }
];
