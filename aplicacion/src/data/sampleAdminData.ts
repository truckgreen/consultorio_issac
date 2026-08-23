import { Appointment, ContactMessage, AdminNotification, PatientRecord } from '../types';
import { generateMedicalReportPdfDataUrl } from '../utils/pdfUtils';

export const INITIAL_SAMPLE_PATIENTS: PatientRecord[] = [
  {
    id: 'pat_alejandro_mendoza',
    cedula: 'V-20.145.892',
    nombre: 'Alejandro',
    apellido: 'Mendoza',
    telefono: '+58 414 123.45.67',
    email: 'alejandro.mendoza@gmail.com',
    fechaNacimiento: '1996-04-12',
    edad: 29,
    genero: 'M',
    direccion: 'Av. Solano López, Edif. Los Alpes, Apto 4-B, Sabana Grande, Caracas',
    contactoEmergencia: {
      nombre: 'Mariana Mendoza',
      telefono: '+58 414 777.88.99',
      parentesco: 'Hermana'
    },
    totalAppointments: 4,
    completedAppointments: 3,
    lastVisit: new Date().toISOString().split('T')[0],
    firstVisitDate: '2025-01-15',
    totalSpent: 160,
    medicalConditions: 'Esguince de tobillo derecho Grado II (Ligamento Peroneoastragalino Anterior).',
    alergias: 'Ninguna conocida (NKDA)',
    antecedentes: 'Sin cirugías previas. Deportista amateur de fútbol.',
    medicamentosActuales: 'Ibuprofeno 400mg SOS en caso de dolor agudo.',
    clinicalNotes: 'Paciente con excelente evolución funcional. Se encuentra en fase de readaptación con ejercicios propioceptivos y fortalecimiento excéntrico de gemelos y peroneos. Fuerza muscular 5/5.',
    createdAt: '2025-01-15T10:00:00.000Z',
    documents: [
      {
        id: 'doc_am_1',
        patientId: 'pat_alejandro_mendoza',
        title: 'Informe Fisioterapéutico de Evolución Funcional',
        description: 'Evaluación goniométrica y propioceptiva de tobillo derecho con protocolo de readaptación deportiva.',
        category: 'informe',
        fileName: 'Informe_Fisioterapia_AlejandroMendoza.pdf',
        fileSize: '24.5 KB',
        fileType: 'application/pdf',
        fileData: generateMedicalReportPdfDataUrl({
          patientName: 'Alejandro Mendoza',
          patientIdDoc: 'V-20.145.892',
          doctorName: 'Lic. Isaac Jewsiejew',
          doctorSpecialty: 'Fisioterapia Deportiva & Readaptación',
          reportTitle: 'Informe de Evolución en Fisioterapia Deportiva',
          date: new Date().toISOString().split('T')[0],
          category: 'Informe Clínico',
          diagnosis: 'Esguince de Tobillo Derecho Grado II con inestabilidad funcional residual leve.',
          evolutionNotes: 'El paciente completó 8 sesiones de fisioterapia con terapia manual, drenaje linfático, neurodinamia y entrenamiento en plataforma inestable. Rango de dorsiflexión completo a 20 grados.',
          recommendations: [
            'Continuar 4 semanas con ejercicios de propiocepción en casa.',
            'Uso de tobillera preventiva en entrenamientos de alto impacto.',
            'Alta médica deportiva programada para control en 15 días.'
          ]
        }),
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'Lic. Isaac Jewsiejew',
        specialistNotes: 'Favorable respuesta al tratamiento kinésico.'
      }
    ]
  },
  {
    id: 'pat_elena_castillo',
    cedula: 'V-16.890.341',
    nombre: 'Elena',
    apellido: 'Castillo',
    telefono: '+58 412 987.65.43',
    email: 'elena.castillo@yahoo.com',
    fechaNacimiento: '1988-11-23',
    edad: 37,
    genero: 'F',
    direccion: 'Urb. Bello Monte, Calle Chopin, Qta. Villa Clara, Caracas',
    contactoEmergencia: {
      nombre: 'Ricardo Castillo',
      telefono: '+58 412 111.22.33',
      parentesco: 'Esposo'
    },
    totalAppointments: 2,
    completedAppointments: 1,
    lastVisit: new Date().toISOString().split('T')[0],
    firstVisitDate: '2025-02-01',
    totalSpent: 100,
    medicalConditions: 'Meniscopatía grado II cuerno posterior menisco medial rodilla derecha. Condromalacia rotuliana grado I.',
    alergias: 'Penicilina y derivados betalactámicos',
    antecedentes: 'Cesárea (2018). Gastritis leve controlada.',
    medicamentosActuales: 'Glucosamina + Condroitina 1500mg/día.',
    clinicalNotes: 'Evaluación médica por dolor punzante al descender escaleras. Signo de McMurray levemente positivo. Se solicitó y anexó estudio de Resonancia Magnética.',
    createdAt: '2025-02-01T09:30:00.000Z',
    documents: [
      {
        id: 'doc_ec_1',
        patientId: 'pat_elena_castillo',
        title: 'Informe Traumatológico y Plan Quirúrgico Conservador',
        description: 'Estudio de rodilla derecha y protocolo de fortalecimiento de cuádriceps y vasto interno.',
        category: 'resonancia',
        fileName: 'Resonancia_Rodilla_Elena_Castillo.pdf',
        fileSize: '28.2 KB',
        fileType: 'application/pdf',
        fileData: generateMedicalReportPdfDataUrl({
          patientName: 'Elena Castillo',
          patientIdDoc: 'V-16.890.341',
          doctorName: 'Dr. Rubén Torrealba',
          doctorSpecialty: 'Traumatología & Cirugía Articular',
          reportTitle: 'Informe Traumatológico - Estudio de Imagen RM',
          date: new Date().toISOString().split('T')[0],
          category: 'Resonancia Magnética & Traumatología',
          diagnosis: 'Lesión Meniscal Grado II en cuerno posterior de menisco medial sin rotura completa.',
          evolutionNotes: 'Examen físico revela derrame articular leve, dolor a la palpación interlínea articular medial. Se descarta necesidad de cirugía artroscópica inmediata en vista de buena respuesta a fisioterapia.',
          recommendations: [
            'Ciclo de 10 sesiones de fisioterapia con énfasis en vasto medial oblicuo (VMO).',
            'Evitar impacto y flexión profunda mayor a 90 grados durante 3 semanas.',
            'Crioterapia local post-ejercicio 15 min 3 veces al día.'
          ]
        }),
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'Dr. Rubén Torrealba',
        specialistNotes: 'Manejo conservador con fisioterapia intensiva.'
      }
    ]
  },
  {
    id: 'pat_valeria_rondon',
    cedula: 'V-24.512.780',
    nombre: 'Valeria',
    apellido: 'Rondón',
    telefono: '+58 424 333.22.11',
    email: 'valeria.rondon@gmail.com',
    fechaNacimiento: '2001-08-14',
    edad: 24,
    genero: 'F',
    direccion: 'El Rosal, Calle Mohedano, Torre Credicard, Caracas',
    contactoEmergencia: {
      nombre: 'Carla Rondón',
      telefono: '+58 424 999.00.11',
      parentesco: 'Madre'
    },
    totalAppointments: 1,
    completedAppointments: 0,
    lastVisit: new Date().toISOString().split('T')[0],
    firstVisitDate: new Date().toISOString().split('T')[0],
    totalSpent: 40,
    medicalConditions: 'Post-operatorio de Plastia LCA rodilla izquierda (6 meses) con kinesiofobia y ansiedad por reincorporación deportiva.',
    alergias: 'Ninguna',
    antecedentes: 'Reconstrucción de LCA con injerto HTH en agosto 2024.',
    medicamentosActuales: 'Ninguno.',
    clinicalNotes: 'Paciente remitida para acompañamiento psicológico y psicofisiología del dolor. Expresa temor a re-lesión al realizar saltos o giros.',
    createdAt: new Date().toISOString(),
    documents: [
      {
        id: 'doc_vr_1',
        patientId: 'pat_valeria_rondon',
        title: 'Evaluación Psicológica del Retorno al Deporte (TSK-11)',
        description: 'Escala de Tampa para kinesiofobia y programa de desensibilización sistemática.',
        category: 'informe',
        fileName: 'Evaluacion_Psicologica_ValeriaRondon.pdf',
        fileSize: '22.8 KB',
        fileType: 'application/pdf',
        fileData: generateMedicalReportPdfDataUrl({
          patientName: 'Valeria Rondón',
          patientIdDoc: 'V-24.512.780',
          doctorName: 'Lic. Cristina Flores',
          doctorSpecialty: 'Psicología Clínica & Deportiva',
          reportTitle: 'Informe Psicológico y Readaptación Mental',
          date: new Date().toISOString().split('T')[0],
          category: 'Psicología Deportiva',
          diagnosis: 'Kinesiofobia moderada post-reconstrucción de LCA con niveles elevados de hipervigilancia propioceptiva.',
          evolutionNotes: 'Se aplicó la escala TSK-11 arrojando 38/44 pts. Buena receptividad a técnicas de reestructuración cognitiva y visualización motora guiada.',
          recommendations: [
            'Sesiones semanales de psicología aplicada al rendimiento deportivo.',
            'Entrenamiento de biofeedback y respiración diafragmática durante cargas mecánicas.',
            'Coordinación directa con el equipo de fisioterapia para exposición gradual.'
          ]
        }),
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'Lic. Cristina Flores',
        specialistNotes: 'Pronóstico muy favorable con acompañamiento integral.'
      }
    ]
  },
  {
    id: 'pat_mateo_gutierrez',
    cedula: 'V-34.901.122',
    nombre: 'Mateo',
    apellido: 'Gutiérrez',
    telefono: '+58 416 555.77.88',
    email: 'carlos.gutierrez@outlook.com',
    fechaNacimiento: '2019-06-10',
    edad: 6,
    genero: 'M',
    direccion: 'La Florida, Av. Los Manolos, Qta. San Judas, Caracas',
    contactoEmergencia: {
      nombre: 'Carlos Gutiérrez (Padre)',
      telefono: '+58 416 555.77.88',
      parentesco: 'Padre'
    },
    totalAppointments: 3,
    completedAppointments: 2,
    lastVisit: new Date().toISOString().split('T')[0],
    firstVisitDate: '2025-01-10',
    totalSpent: 105,
    medicalConditions: 'Pie plano valgo flexible bilateral y genu valgo fisiológico en seguimiento.',
    alergias: 'Ninguna',
    antecedentes: 'Parto a término sin complicaciones neonatales.',
    medicamentosActuales: 'Ninguno.',
    clinicalNotes: 'Control de corrección de marcha. Buena tolerancia a los circuitos lúdicos y ejercicios con pelotas y texturas.',
    createdAt: '2025-01-10T14:00:00.000Z',
    documents: []
  },
  {
    id: 'pat_carmen_paredes',
    cedula: 'V-4.819.002',
    nombre: 'Carmen',
    apellido: 'Paredes',
    telefono: '+58 412 888.99.00',
    email: 'hija.carmen@gmail.com',
    fechaNacimiento: '1948-03-15',
    edad: 77,
    genero: 'F',
    direccion: 'Chacao, Calle Cecilio Acosta, Edif. Ávila, Piso 2, Caracas',
    contactoEmergencia: {
      nombre: 'Sofía Paredes',
      telefono: '+58 412 888.99.00',
      parentesco: 'Hija'
    },
    totalAppointments: 5,
    completedAppointments: 4,
    lastVisit: '2025-02-18',
    firstVisitDate: '2024-12-05',
    totalSpent: 150,
    medicalConditions: 'Coxartrosis grado III bilateral y gonartrosis moderada. Marcha claudicante.',
    alergias: 'AINES (sensibilidad gástrica)',
    antecedentes: 'Hipertensión arterial controlada con Losartán 50mg.',
    medicamentosActuales: 'Losartán Potásico 50mg OD, Paracetamol 1g SOS.',
    clinicalNotes: 'Mantenimiento articular y reeducación de la marcha. Se trabaja fortalecimiento de glúteo medio y transferencias seguras para prevención de caídas.',
    createdAt: '2024-12-05T09:00:00.000Z',
    documents: [
      {
        id: 'doc_cp_1',
        patientId: 'pat_carmen_paredes',
        title: 'Estudio Radiográfico de Pelvis y Caderas',
        description: 'Rx comparativa anteroposterior y axial de cadera con disminución de espacio interarticular.',
        category: 'radiografia',
        fileName: 'Radiografia_Pelvis_Cadera_CarmenParedes.pdf',
        fileSize: '31.4 KB',
        fileType: 'application/pdf',
        fileData: generateMedicalReportPdfDataUrl({
          patientName: 'Carmen Paredes',
          patientIdDoc: 'V-4.819.002',
          doctorName: 'Lic. Laury Torrealba',
          doctorSpecialty: 'Fisioterapia Geriátrica & Reumatología',
          reportTitle: 'Constancia de Tratamiento Kinésico Geriátrico',
          date: '2025-02-18',
          category: 'Radiografía & Fisioterapia Geriátrica',
          diagnosis: 'Coxartrosis Bilateral Grado III con limitación funcional de la rotación interna.',
          evolutionNotes: 'La paciente muestra excelente apego terapéutico. Disminución del dolor en escala EVA de 8/10 a 4/10. Mayor seguridad en la deambulación independiente con bastón canadiense.',
          recommendations: [
            'Mantener programa domiciliario de movilidad y estiramientos suaves.',
            'Uso constante de calzado con suela antideslizante y soporte de arco.',
            'Control de densidad ósea cada 6 meses.'
          ]
        }),
        uploadedAt: '2025-02-18',
        uploadedBy: 'Lic. Laury Torrealba',
        specialistNotes: 'Gran progreso en equilibrio estático y dinámico.'
      }
    ]
  }
];

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
