import { PatientRecord, AppointmentBooking, Testimonial, ServiceDetail } from '../types';

export const INITIAL_SERVICES: ServiceDetail[] = [
  {
    id: 'fisioterapia-general',
    title: 'Fisioterapia General',
    categoryName: 'Fisioterapia',
    tagline: 'Recuperación funcional y alivio del dolor musculoesquelético.',
    description: 'Tratamiento integral enfocado en restaurar el movimiento y la función corporal afectada por lesiones, cirugías o dolencias crónicas mediante terapia manual y tecnología de punta.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
    badge: 'Terapia Manual & Avanzada',
    priceUSD: 35,
    priceLabel: '$35 USD / Sesión Individual',
    duration: '55 - 60 min',
    includedItems: [
      'Valoración clínica y goniometría articular',
      'Terapia manual ortopédica y miofascial',
      'Electroterapia TENS/EMS / Termoterapia profunda',
      'Prescripción de ejercicios terapéuticos'
    ],
    packageOptions: [
      { name: 'Sesión Única', price: '$35 USD', sessions: '1 sesión', savings: 'Tarifa Estándar' },
      { name: 'Plan Alivio (Pack 5)', price: '$150 USD', sessions: '5 sesiones', savings: 'Ahorras $25 ($30/sesión)', popular: true },
      { name: 'Plan Recuperación Total (Pack 10)', price: '$270 USD', sessions: '10 sesiones', savings: 'Ahorras $80 ($27/sesión)' }
    ],
    benefits: [
      'Disminución efectiva del dolor e inflamación',
      'Recuperación progresiva del rango articular',
      'Reeducación postural y fortalecimiento',
      'Protocolos personalizados sin soluciones genéricas'
    ],
    conditions: [
      'Dolores cervicales y lumbares',
      'Tendinopatías y contracturas musculares',
      'Rehabilitación postoperatoria',
      'Esguinces y sobrecargas'
    ],
    methodology: 'Evaluación biomecánica 360°, terapia manual ortopédica, electroterapia y ejercicio terapéutico individualizado.',
    specialists: ['Lic. Mariana Valdés - Fisioterapeuta Principal', 'Lic. Alejandro Rivas - Especialista en Rehabilitación'],
    videoData: {
      title: 'Protocolo Integral de Fisioterapia General en EQUILIBRA',
      duration: '3:45 min',
      presenter: 'Lic. Mariana Valdés',
      presenterRole: 'Fisioterapeuta Principal & Directora Clínica',
      synopsis: 'Descubre en este video cómo abordamos las dolencias musculoesqueléticas desde la primera sesión: desde la evaluación goniométrica y palpación miofascial, hasta la aplicación de agentes físicos y reeducación funcional activa.',
      videoPoster: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
      videoType: 'physio',
      chapters: [
        { time: '0:00', title: 'Introducción & Historia Clínica', description: 'Revisión exhaustiva de antecedentes y dolor con escala EVA.' },
        { time: '0:55', title: 'Evaluación Articular & Biomecánica', description: 'Test de movilidad, fuerza muscular y patrones de movimiento.' },
        { time: '1:45', title: 'Terapia Manual & Agentes Físicos', description: 'Liberación miofascial, descompresión articular y analgesia.' },
        { time: '2:50', title: 'Ejercicio Terapéutico & Cinesiterapia', description: 'Fortalecimiento guiado para evitar recidivas.' }
      ],
      keyPoints: [
        'Atención 1 a 1 sin camillas compartidas',
        'Alivio medible desde la 1ª cita',
        'Combinación de ciencia manual y equipamiento de precisión'
      ],
      techniquesShown: ['Terapia Manual Ortopédica (Mulligan & Maitland)', 'Punción Seca Guiada', 'Electroestimulación TENS / EMS', 'Reeducación Postural Global (RPG)'],
      equipmentUsed: ['Camillas electrohidráulicas ergonómicas', 'Unidad de Electroterapia Multionda', 'Theragun Pro / Pistolas de Percusión', 'Bandas elásticas y bosu de propiocepción']
    }
  },
  {
    id: 'fisioterapia-pediatrica',
    title: 'Fisioterapia Pediátrica',
    categoryName: 'Fisioterapia Pediátrica',
    tagline: 'Estimulación temprana y desarrollo psicomotor en niños.',
    description: 'Atención cálida y especializada para neonatos, niños y adolescentes, facilitando hitos del desarrollo motor y tratando afecciones ortopédicas o neurológicas en un entorno lúdico.',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
    badge: 'Atención Infantil',
    priceUSD: 40,
    priceLabel: '$40 USD / Consulta & Sesión',
    duration: '45 - 55 min',
    includedItems: [
      'Evaluación del neurodesarrollo y reflejos',
      'Terapia psicomotriz y sensorial adaptada',
      'Corrección postural y juego terapéutico',
      'Informe y guía de estimulación en el hogar para padres'
    ],
    packageOptions: [
      { name: 'Consulta Infantil', price: '$40 USD', sessions: '1 sesión', savings: 'Evaluación Inicial' },
      { name: 'Plan Neurodesarrollo (Pack 5)', price: '$175 USD', sessions: '5 sesiones', savings: 'Ahorras $25 ($35/sesión)', popular: true },
      { name: 'Plan Estimulación Continua (Pack 10)', price: '$320 USD', sessions: '10 sesiones', savings: 'Ahorras $80 ($32/sesión)' }
    ],
    benefits: [
      'Estimulación del desarrollo motor global',
      'Corrección postural temprana (pie plano, escoliosis)',
      'Acompañamiento cercano a los padres',
      'Ambiente lúdico y libre de estrés'
    ],
    conditions: [
      'Retraso en el desarrollo psicomotor',
      'Tortícolis congénita y plagiocefalia',
      'Deformidades ortopédicas infantiles',
      'Rehabilitación infantil postraumática'
    ],
    methodology: 'Enfoque neurodesarrollista lúdico, juego terapéutico guiado y pautas de estimulación domiciliaria para la familia.',
    specialists: ['Dra. Elena Castellanos - Especialista Pediátrica'],
    videoData: {
      title: 'Terapia Pediátrica Lúdica & Estimulación Temprana',
      duration: '3:10 min',
      presenter: 'Dra. Elena Castellanos',
      presenterRole: 'Especialista en Fisioterapia Pediátrica & Neurodesarrollo',
      synopsis: 'Explicamos la metodología amigable y no invasiva con la que ayudamos a bebés y niños a alcanzar hitos motores fundamentales como gateo, marcha equilibrada y corrección postural mediante el juego guiado.',
      videoPoster: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=85',
      videoType: 'pediatric',
      chapters: [
        { time: '0:00', title: 'Valoración de Reflejos y Tono Muscular', description: 'Exploración del control cefálico, sedestación y simetría motriz.' },
        { time: '1:10', title: 'Circuitos Psicomotores & Sensoriales', description: 'Actividades en colchonetas y rodillos terapéuticos.' },
        { time: '2:15', title: 'Pautas de Acompañamiento Familiar', description: 'Orientación a mamá y papá para reforzar en casa sin estrés.' }
      ],
      keyPoints: [
        'Ambiente colorido y libre de estrés para los pequeños',
        'Participación activa de los padres',
        'Avances documentados con hitos de desarrollo infantil'
      ],
      techniquesShown: ['Concepto Bobath Pediátrico', 'Integración Sensorial', 'Cinesiterapia Asistida Suave', 'Reeducación de la Marcha'],
      equipmentUsed: ['Pelotas de Bobath / Fitball pediátricas', 'Rodillos neuromotores de espuma', 'Rampas sensoriales y tapices de estimulación', 'Juguetes terapéuticos de agarre y coordinación']
    }
  },
  {
    id: 'fisioterapia-geriatrica',
    title: 'Fisioterapia Geriátrica',
    categoryName: 'Fisioterapia Geriátrica',
    tagline: 'Autonomía, fuerza y equilibrio para el adulto mayor.',
    description: 'Programas diseñados para preservar la independencia motriz, prevenir caídas, reducir el dolor articular degenerativo y potenciar la calidad de vida en la tercera edad.',
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=900&q=80',
    badge: 'Calidad de Vida',
    priceUSD: 35,
    priceLabel: '$35 USD / Sesión Especializada',
    duration: '50 - 60 min',
    includedItems: [
      'Test de balance y valoración del riesgo de caídas',
      'Movilización articular suave y terapia analgésica',
      'Entrenamiento de fuerza funcional y marcha segura',
      'Ejercicios de coordinación y agilidad mental/motriz'
    ],
    packageOptions: [
      { name: 'Sesión Senior', price: '$35 USD', sessions: '1 sesión', savings: 'Tarifa Estándar' },
      { name: 'Plan Movilidad Segura (Pack 5)', price: '$150 USD', sessions: '5 sesiones', savings: 'Ahorras $25 ($30/sesión)', popular: true },
      { name: 'Plan Autonomía & Vitalidad (Pack 10)', price: '$270 USD', sessions: '10 sesiones', savings: 'Ahorras $80 ($27/sesión)' }
    ],
    benefits: [
      'Prevención activa del riesgo de caídas',
      'Mantenimiento de la fuerza y equilibrio',
      'Alivio del dolor osteoarticular y artrosis',
      'Fomento de la autonomía en la vida diaria'
    ],
    conditions: [
      'Artrosis y artritis degenerativa',
      'Alteraciones de la marcha y balance',
      'Recuperación tras prótesis de cadera o rodilla',
      'Pérdida de masa muscular (sarcopenia)'
    ],
    methodology: 'Entrenamiento propioceptivo suave, cinesiterapia activa asistida y ejercicios funcionales adaptados.',
    specialists: ['Lic. Carlos Méndez - Especialista en Geriatría y Movilidad'],
    videoData: {
      title: 'Mantenimiento del Equilibrio, Fuerza y Autonomía Senior',
      duration: '3:30 min',
      presenter: 'Lic. Carlos Méndez',
      presenterRole: 'Fisioterapeuta Especialista en Geriatría y Psicomotricidad',
      synopsis: 'Explicación del protocolo de movilidad y fortalecimiento diseñado para adultos mayores. Observa cómo mejoramos la seguridad en la marcha, aliviamos el dolor de artrosis y devolvemos la confianza para subir escaleras y pasear.',
      videoPoster: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=1200&q=85',
      videoType: 'geriatric',
      chapters: [
        { time: '0:00', title: 'Test de Timed Up and Go (TUG)', description: 'Medición de velocidad y estabilidad de la marcha.' },
        { time: '1:00', title: 'Alivio del Dolor Articular & Rigidez', description: 'Movilización pasiva suave y termoterapia calmante.' },
        { time: '2:10', title: 'Entrenamiento de Propiocepción & Fuerza', description: 'Ejercicios con apoyo y bandas de baja resistencia.' }
      ],
      keyPoints: [
        'Cero impacto brusco, ritmo 100% respetuoso con el paciente',
        'Recuperación de la independencia para actividades cotidianas',
        'Ambiente accesible y seguro con barras de apoyo'
      ],
      techniquesShown: ['Cinesiterapia Activa-Asistida', 'Gimnasia Terapéutica Adaptada', 'Terapia Miofascial Geriátrica', 'Reeducación del Patrón de Marcha'],
      equipmentUsed: ['Plataformas de equilibrio antideslizantes', 'Barras paralelas de marcha', 'Bandas elásticas Theraband suaves', 'Pesas lastradas de tobillo ligeras']
    }
  },
  {
    id: 'fisioterapia-deportiva',
    title: 'Fisioterapia Deportiva',
    categoryName: 'Fisioterapia Deportiva',
    tagline: 'Del dolor agudo al retorno competitivo de alto nivel.',
    description: 'Readaptación neuromuscular y tratamiento específico para atletas y personas activas, optimizando tiempos de recuperación y previniendo recidivas.',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80',
    badge: 'Alto Rendimiento',
    priceUSD: 40,
    priceLabel: '$40 USD / Sesión Deportiva',
    duration: '60 min',
    includedItems: [
      'Evaluación del gesto deportivo y ecografía funcional',
      'Descarga muscular profunda / Punción seca ecoguiada',
      'Readaptación funcional en zona de entrenamiento',
      'Protocolo Return-to-Play y prevención de recaídas'
    ],
    packageOptions: [
      { name: 'Sesión Atleta', price: '$40 USD', sessions: '1 sesión', savings: 'Tarifa Estándar' },
      { name: 'Pack Readaptación (5 Sesiones)', price: '$175 USD', sessions: '5 sesiones', savings: 'Ahorras $25 ($35/sesión)', popular: true },
      { name: 'Pack Alto Rendimiento (10 Sesiones)', price: '$320 USD', sessions: '10 sesiones', savings: 'Ahorras $80 ($32/sesión)' }
    ],
    benefits: [
      'Aceleración segura del retorno al deporte (Return to Play)',
      'Descarga muscular y punción seca avanzada',
      'Análisis biomecánico del gesto deportivo',
      'Fortalecimiento excéntrico y pliometría'
    ],
    conditions: [
      'Roturas fibrilares y desgarros',
      'Lesiones de ligamento cruzado y meniscos',
      'Fascitis plantar y periostitis',
      'Sobrecargas musculares por entrenamiento'
    ],
    methodology: 'Readaptación físico-deportiva en campo, electromiografía de biofeedback y ejercicio de alta intensidad controlado.',
    specialists: ['Lic. Mariana Valdés', 'Prof. Roberto Lugo - Readaptador'],
    videoData: {
      title: 'Readaptación Físico-Deportiva & Retorno al Juego (Return to Play)',
      duration: '4:15 min',
      presenter: 'Lic. Mariana Valdés & Prof. Roberto Lugo',
      presenterRole: 'Equipo de Fisioterapia y Readaptación Deportiva',
      synopsis: 'Video demostrativo donde mostramos el protocolo paso a paso para deportistas: desde el control del dolor agudo con punción seca y terapia manual, hasta los saltos pliométricos y cambios de dirección antes del alta competitiva.',
      videoPoster: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=85',
      videoType: 'sports',
      chapters: [
        { time: '0:00', title: 'Fase Aguda: Control del Dolor & Descarga', description: 'Punción seca, crioterapia y terapia miofascial.' },
        { time: '1:20', title: 'Fase Intermedia: Fuerza Excéntrica', description: 'Activación neuromuscular y trabajo de cadena cinética.' },
        { time: '2:45', title: 'Fase Avanzada: Pliometría & Gesto Deportivo', description: 'Simulación del deporte específico en piso técnico.' }
      ],
      keyPoints: [
        'Pruebas objetivas de fuerza y simetría antes del alta',
        'Técnicas de recuperación rápida post-partido o entrenamiento',
        'Acompañamiento de readaptadores deportivos'
      ],
      techniquesShown: ['Punción Seca y Neuromodulación', 'Flossing de Compresión Elástica', 'Fortalecimiento Excéntrico Nordboard', 'Análisis en Video de Alta Velocidad'],
      equipmentUsed: ['Agujas de punción con ecógrafo portátil', 'BFR (Restricción del Flujo Sanguíneo)', 'Cajas pliométricas y poleas cónicas', 'Sistema de botas de presoterapia Normatec']
    }
  },
  {
    id: 'traumatologia',
    title: 'Traumatología & Ortopedia',
    categoryName: 'Traumatología',
    tagline: 'Diagnóstico médico de precisión y tratamientos conservadores.',
    description: 'Evaluación médica integral del aparato locomotor, diagnóstico por imagen, infiltraciones guiadas de alta precisión y seguimiento clínico continuado.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80',
    badge: 'Diagnóstico Médico',
    priceUSD: 50,
    priceLabel: '$50 USD / Consulta Médica Especializada',
    duration: '45 - 60 min',
    includedItems: [
      'Consulta médica exhaustiva con Médico Traumatólogo',
      'Exploración articular y pruebas ortopédicas específicas',
      'Revisión minuciosa de Resonancias / Rayos X / TAC',
      'Prescripción farmacológica e indicación de protocolo de rehabilitación'
    ],
    packageOptions: [
      { name: 'Consulta Médica Inicial', price: '$50 USD', sessions: '1 consulta', savings: 'Diagnóstico de Certeza' },
      { name: 'Consulta + Infiltración Ecoguiada', price: '$90 USD', sessions: 'Procedimiento en consultorio', savings: 'Incluye medicamento & guía ecográfica', popular: true },
      { name: 'Seguimiento & Control Postratamiento', price: '$35 USD', sessions: 'Consulta de control', savings: 'Dentro de 30 días' }
    ],
    benefits: [
      'Diagnóstico clínico de certeza en primera consulta',
      'Abordaje conservador antes de cirugías invasivas',
      'Infiltraciones ecoguiadas y ácido hialurónico',
      'Coordinación directa con fisioterapeutas'
    ],
    conditions: [
      'Lesiones articulares y condromalacia',
      'Hernias discales y radiculopatías',
      'Fracturas y luxaciones',
      'Bursitis y tendinitis calcificante'
    ],
    methodology: 'Examen físico ortopédico exhaustivo, ecografía musculoesquelética in situ y planes terapéuticos coordinados.',
    specialists: ['Dr. Fernando Carrillo - Médico Traumatólogo Ortopedista'],
    videoData: {
      title: 'Consulta Médica de Traumatología & Tratamientos Ecoguiados',
      duration: '4:00 min',
      presenter: 'Dr. Fernando Carrillo',
      presenterRole: 'Médico Especialista en Traumatología y Cirugía Ortopédica',
      synopsis: 'El Dr. Carrillo detalla el enfoque conservador de EQUILIBRA: por qué priorizamos la regeneración y el tratamiento médico mínimamente invasivo antes de considerar intervenciones quirúrgicas mayores.',
      videoPoster: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=85',
      videoType: 'medical',
      chapters: [
        { time: '0:00', title: 'Exploración Física & Maniobras Clínicas', description: 'Pruebas de menisco, ligamentos y estabilidad articular.' },
        { time: '1:30', title: 'Interpretación de Estudios de Imagen', description: 'Explicación detallada de resonancias y radiografías al paciente.' },
        { time: '2:40', title: 'Infiltraciones Guiadas por Ultrasonido', description: 'Procedimientos de máxima precisión para alivio inmediato.' }
      ],
      keyPoints: [
        'Enfoque conservador basado en evidencia',
        'Coordinación directa en la misma sede con fisioterapia',
        'Tecnología ecográfica para procedimientos indoloros'
      ],
      techniquesShown: ['Infiltración con Ácido Hialurónico', 'Bloqueos Terapéuticos Ecoguiados', 'Artrocentesis Descompresiva', 'Ortesis y Vendajes Funcionales'],
      equipmentUsed: ['Ecógrafo musculoesquelético de alta frecuencia', 'Negatoscopio digital HD', 'Material estéril de infiltración de grado quirúrgico']
    }
  },
  {
    id: 'psicologia',
    title: 'Salud Mental & Psicología',
    categoryName: 'Psicología',
    tagline: 'Gestión del dolor, equilibrio emocional y rendimiento.',
    description: 'Acompañamiento psicológico personalizado enfocado en el equilibrio emocional, manejo del estrés, dolor crónico y bienestar integral en un espacio confidencial.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
    badge: 'Bienestar Integral',
    priceUSD: 40,
    priceLabel: '$40 USD / Sesión Clínica',
    duration: '50 - 60 min',
    includedItems: [
      'Entrevista clínica y evaluación psicoemocional',
      'Intervención Cognitivo-Conductual adaptada',
      'Técnicas de regulación vagal y manejo de la ansiedad',
      'Plan de acompañamiento personalizado y confidencial'
    ],
    packageOptions: [
      { name: 'Sesión Psicológica', price: '$40 USD', sessions: '1 sesión', savings: 'Tarifa Estándar' },
      { name: 'Plan Equilibrio Emocional (Pack 4)', price: '$140 USD', sessions: '4 sesiones mensuales', savings: 'Ahorras $20 ($35/sesión)', popular: true },
      { name: 'Plan Acompañamiento Integral (Pack 8)', price: '$260 USD', sessions: '8 sesiones', savings: 'Ahorras $60 ($32.5/sesión)' }
    ],
    benefits: [
      'Estrategias cognitivo-conductuales para el dolor crónico',
      'Regulación de ansiedad, burnout y estrés',
      'Fortalecimiento de la autoconfianza y motivación',
      'Psicología del deporte y superación de lesiones'
    ],
    conditions: [
      'Miedo a la recaída (kinesiofobia)',
      'Ansiedad y estrés psicofísico',
      'Procesos de duelo o adaptación a limitaciones',
      'Desmotivación y fatiga mental'
    ],
    methodology: 'Terapia Cognitivo-Conductual (TCC), mindfulness para el dolor y biofeedback de respiración.',
    specialists: ['Lic. Claudia Navarro - Psicóloga Clínica'],
    videoData: {
      title: 'Manejo del Dolor Crónico, Estrés y Psicología de la Salud',
      duration: '3:20 min',
      presenter: 'Lic. Claudia Navarro',
      presenterRole: 'Psicóloga Clínica & Especialista en Psicoinmunología',
      synopsis: 'La Lic. Navarro explica la conexión directa entre el sistema nervioso central, la inflamación y la percepción del dolor. Conoce cómo la terapia psicológica ayuda a desbloquear la kinesiofobia y restaurar la paz mental.',
      videoPoster: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85',
      videoType: 'mental',
      chapters: [
        { time: '0:00', title: 'El Eje Mente-Cuerpo y el Dolor', description: 'Por qué el estrés amplifica el dolor musculoesquelético.' },
        { time: '1:15', title: 'Superando la Kinesiofobia', description: 'Pérdida del miedo a moverse tras una lesión prolongada.' },
        { time: '2:20', title: 'Herramientas de Regulación Autónoma', description: 'Ejercicios de respiración diafragmática y foco cognitivo.' }
      ],
      keyPoints: [
        'Espacio 100% privado, empático y libre de juicios',
        'Técnicas prácticas aplicables en la rutina diaria',
        'Coordinación directa con tu fisioterapeuta tratante'
      ],
      techniquesShown: ['Terapia Cognitivo-Conductual (TCC)', 'Mindfulness Basado en Reducción de Estrés (MBSR)', 'Reestructuración Cognitiva', 'Entrenamiento en Coherencia Cardíaca'],
      equipmentUsed: ['Consultorio insonorizado acústicamente', 'Sensores de Biofeedback / Variabilidad Cardíaca', 'Guías y diarios de autorregistro conductual']
    }
  },
  {
    id: 'nutricion',
    title: 'Nutrición Clínica & Deportiva',
    categoryName: 'Nutrición',
    tagline: 'Bioquímica y alimentación para desinflamar y rendir.',
    description: 'Planes de alimentación 100% individualizados adaptados a tus requerimientos fisiológicos, recomposición corporal, recuperación de tejidos y alto rendimiento.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
    badge: 'Nutrición de Precisión',
    priceUSD: 35,
    priceLabel: '$35 USD / Consulta Integral',
    duration: '45 - 60 min',
    includedItems: [
      'Estudio antropométrico y Bioimpedancia Segmental',
      'Análisis de analíticas de laboratorio y requerimientos calóricos',
      'Menú personalizado con opciones flexibles y recetas',
      'Seguimiento quincenal y resolución de dudas'
    ],
    packageOptions: [
      { name: 'Consulta Nutricional + Menú', price: '$35 USD', sessions: '1 consulta', savings: 'Tarifa Estándar' },
      { name: 'Plan Recomposición Corporal (3 Meses)', price: '$90 USD', sessions: '3 consultas + 3 ajustes de menú', savings: 'Ahorras $15 ($30/mes)', popular: true },
      { name: 'Plan Rendimiento Deportivo (6 Meses)', price: '$165 USD', sessions: '6 consultas completas', savings: 'Ahorras $45 ($27.5/mes)' }
    ],
    benefits: [
      'Nutrición antiinflamatoria para acelerar la cicatrización',
      'Planes realistas sin dietas restrictivas extremas',
      'Optimización de la masa muscular y energía diaria',
      'Educación nutricional para hábitos sostenibles'
    ],
    conditions: [
      'Recomposición corporal y control de peso',
      'Recuperación de cirugías o lesiones musculares',
      'Optimización energética para atletas',
      'Nutrición en patologías inflamatorias y metabólicas'
    ],
    methodology: 'Bioimpedancia eléctrica de alta precisión, cálculo antropométrico y planes dietéticos ajustados a tus rutinas.',
    specialists: ['Lic. Valeria Morales - Nutricionista Clínica'],
    videoData: {
      title: 'Nutrición Antiinflamatoria, Bioimpedancia y Recomposición',
      duration: '3:35 min',
      presenter: 'Lic. Valeria Morales',
      presenterRole: 'Nutricionista Clínica Especialista en Deporte y Metabolismo',
      synopsis: 'Aprende en este video cómo calculamos tus macronutrientes exactos con tecnología de bioimpedancia y cómo la alimentación antiinflamatoria reduce el tiempo de cicatrización de tendones y articulaciones.',
      videoPoster: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85',
      videoType: 'nutrition',
      chapters: [
        { time: '0:00', title: 'Medición con Bioimpedancia Segmental', description: 'Porcentaje de grasa visceral, masa muscular y agua intracelular.' },
        { time: '1:10', title: 'Alimentación Pro-Regenerativa', description: 'Micronutrientes clave (colágeno, omega 3, magnesio y antioxidantes).' },
        { time: '2:25', title: 'Diseño del Plan Alimentario Flexible', description: 'Cómo organizar tus comidas diarias sin pasar hambre ni ansiedad.' }
      ],
      keyPoints: [
        'Sin dietas de moda ni restricciones extremas',
        'Medición milimétrica de tu composición corporal',
        'Menús adaptados a tus gustos, horarios y presupuesto'
      ],
      techniquesShown: ['Antropometría ISAK', 'Bioimpedancia Eléctrica Multifrecuencia', 'Planificación de Timing de Nutrientes', 'Estrategias de Suplementación Basada en Evidencia'],
      equipmentUsed: ['Analizador InBody Segmental Grado Médico', 'Plicómetros y cintas antropométricas de precisión', 'Software de cálculo nutricional clínico']
    }
  },
  {
    id: 'entrenamiento-funcional',
    title: 'Entrenamiento Funcional & Movimiento',
    categoryName: 'Entrenamiento Funcional',
    tagline: 'Fuerza, estabilidad y control motor para la vida real.',
    description: 'Sesiones dirigidas a mejorar la condición física, fuerza funcional, postura y movilidad a través de metodologías activas y seguras adaptadas a tu nivel.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    badge: 'Movimiento Funcional',
    priceUSD: 30,
    priceLabel: '$30 USD / Sesión Personalizada',
    duration: '50 - 60 min',
    includedItems: [
      'Screening de movilidad y patrones de movimiento',
      'Entrenamiento semipersonalizado en grupos reducidos o 1-a-1',
      'Supervisión técnica de postura y cargas',
      'Acceso a zona de entrenamiento climatizada'
    ],
    packageOptions: [
      { name: 'Sesión Suelta', price: '$30 USD', sessions: '1 sesión', savings: 'Tarifa Estándar' },
      { name: 'Membresía Mensual 8 Clases (2x/sem)', price: '$85 USD', sessions: '8 clases al mes', savings: 'Ahorras $155 ($10.6/clase)', popular: true },
      { name: 'Membresía Ilimitada Mensual', price: '$120 USD', sessions: 'Acceso total + seguimiento', savings: 'El mejor valor para entrenamiento continuo' }
    ],
    benefits: [
      'Entrenamiento libre de impacto nocivo',
      'Desarrollo del core, estabilidad y postura',
      'Transferencia directa a las actividades diarias',
      'Supervisión constante de la técnica de ejecución'
    ],
    conditions: [
      'Sedentarismo y debilidad muscular',
      'Pérdida de movilidad articular',
      'Transición entre fisioterapia y gimnasio',
      'Acondicionamiento físico general'
    ],
    methodology: 'Circuitos neuromusculares guiados, progresión de cargas seguras y entrenamiento de patrones básicos de movimiento.',
    specialists: ['Prof. Roberto Lugo - Entrenador Funcional'],
    videoData: {
      title: 'Sesión de Entrenamiento Funcional Adaptado en EQUILIBRA',
      duration: '3:05 min',
      presenter: 'Prof. Roberto Lugo',
      presenterRole: 'Especialista en Acondicionamiento Físico y Movimiento Funcional',
      synopsis: 'Acompaña al Prof. Lugo en un recorrido por nuestra sala de entrenamiento: patrones de bisagra de cadera, empujes seguros, trabajo de core y acondicionamiento cardiovascular sin lesionar tus articulaciones.',
      videoPoster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85',
      videoType: 'active',
      chapters: [
        { time: '0:00', title: 'Calentamiento Dinámico & Activación Glútea', description: 'Preparación articular antes de la carga.' },
        { time: '1:00', title: 'Circuitos de Fuerza Funcional', description: 'Kettlebells, bandas y peso corporal con técnica guiada.' },
        { time: '2:10', title: 'Vuelta a la Calma & Flexibilidad', description: 'Estiramientos dinámicos y respiración recuperativa.' }
      ],
      keyPoints: [
        'Grupos pequeños con atención personalizada garantizada',
        'Ejercicios adaptados a personas con antecedentes de dolor',
        'Piso técnico absorbente de impactos'
      ],
      techniquesShown: ['Patrones Fundamentales de Movimiento', 'Core Stability & Anti-Rotación', 'Entrenamiento Isométrico y Balístico', 'Cardio HIIT Controlado'],
      equipmentUsed: ['Pesas Rusas (Kettlebells) de competición', 'TRX / Entrenador en Suspensión', 'Battle Ropes y Slam Balls', 'Trineos de empuje sobre césped sintético']
    }
  },
  {
    id: 'boxeo',
    title: 'Boxeo & Disciplinas Activas',
    categoryName: 'Boxeo',
    tagline: 'Cardio de alta intensidad, reflejos y liberación de estrés.',
    description: 'Práctica de boxeo formativo y terapéutico como herramienta de descarga emocional, agilidad, coordinación óculo-manual y resistencia cardiovascular.',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80',
    badge: 'Energía & Coordinación',
    priceUSD: 25,
    priceLabel: '$25 USD / Clase Individual',
    duration: '50 - 60 min',
    includedItems: [
      'Vendaje deportivo de manos protector',
      'Práctica de desplazamientos, guardia y combinaciones',
      'Trabajo técnico de golpeo en manoplas con el coach',
      'Acondicionamiento físico de alta intensidad'
    ],
    packageOptions: [
      { name: 'Clase Suelta', price: '$25 USD', sessions: '1 clase', savings: 'Paga por sesión' },
      { name: 'Plan Mensual 8 Clases (2x/sem)', price: '$80 USD', sessions: '8 clases al mes', savings: 'Ahorras $120 ($10/clase)', popular: true },
      { name: 'Plan Mensual 12 Clases (3x/sem)', price: '$105 USD', sessions: '12 clases al mes', savings: 'Ahorras $195 ($8.75/clase)' }
    ],
    benefits: [
      'Potente liberación de estrés y tensión acumulada',
      'Mejora drástica de reflejos y balance dinámico',
      'Alto gasto calórico y acondicionamiento aeróbico',
      'Entorno seguro sin contacto físico competitivo'
    ],
    conditions: [
      'Tensión muscular por estrés y ansiedad',
      'Baja resistencia cardiovascular',
      'Deseo de entrenamiento dinámico y motivante'
    ],
    methodology: 'Trabajo técnico de manoplas, saco de boxeo, desplazamientos y drills de agilidad supervisados.',
    specialists: ['Coach Marcos Silva - Instructor de Boxeo'],
    videoData: {
      title: 'Boxeo Formativo & Descarga de Tensión en EQUILIBRA',
      duration: '3:15 min',
      presenter: 'Coach Marcos Silva',
      presenterRole: 'Entrenador de Boxeo & Disciplinas Activas',
      synopsis: 'Observa una clase en acción: cómo combinamos la técnica limpia de golpeo al saco y a las manoplas con ejercicios de agilidad y coordinación. ¡Cero golpes entre participantes, 100% energía positiva y salud cardiovascular!',
      videoPoster: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=85',
      videoType: 'boxing',
      chapters: [
        { time: '0:00', title: 'Vendaje de Manos & Protección Articular', description: 'Técnica adecuada para cuidar muñecas y nudillos.' },
        { time: '0:50', title: 'Desplazamientos y Guardia Básica', description: 'Coordinación de pies y postura equilibrada.' },
        { time: '1:40', title: 'Trabajo de Manoplas & Saco Pesado', description: 'Combinaciones de jab, cross, gancho y esquivas dinámicas.' },
        { time: '2:40', title: 'Acondicionamiento Físico & Estiramiento', description: 'Circuito de core y vuelta a la calma.' }
      ],
      keyPoints: [
        'Totalmente seguro: no hay combates ni golpes entre alumnos',
        'Excelente desestresante después de la jornada laboral',
        'Apto para principiantes de cualquier edad y nivel'
      ],
      techniquesShown: ['Técnica de Golpeo Básico (1-2-3-4)', 'Esquivas y Desplazamientos Angulares', 'Drills de Manoplas de Precisión', 'Cardio Boxing sin Impacto Corporal'],
      equipmentUsed: ['Sacos pesados de cuero de 100 lbs', 'Manoplas y guantillas Everlast/Venum', 'Cuerdas de salto de velocidad', 'Vendajes de algodón semielásticos']
    }
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Elvira Montana',
    role: 'Paciente de Fisioterapia Postquirúrgica',
    treatment: 'Rehabilitación de Ligamento Cruzado Anterior',
    comment: 'Llegué a EQUILIBRA con mucho temor tras mi cirugía de rodilla. El equipo no solo me ayudó a recuperar la extensión y fuerza al 100%, sino que el seguimiento continuo a través de la aplicación me dio la confianza necesaria para volver a correr.',
    rating: 5,
    date: 'Hace 2 semanas',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    verified: true
  },
  {
    id: 'test-2',
    name: 'Carlos Balladares',
    role: 'Deportista & Maratonista',
    treatment: 'Fisioterapia Deportiva & Nutrición Clínica',
    comment: 'La combinación entre fisioterapia avanzada y el plan nutricional especializado transformó mi rendimiento. Tenía una fascitis plantar recurrente que nadie lograba solucionar; en EQUILIBRA abordaron la causa real y hoy entreno sin ningún dolor.',
    rating: 5,
    date: 'Hace 3 semanas',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    verified: true
  },
  {
    id: 'test-3',
    name: 'Daniel Gómez',
    role: 'Ejecutivo de Tecnología',
    treatment: 'Salud Mental & Entrenamiento Funcional',
    comment: 'El abordaje 360° es real: combiné sesiones de psicología para el manejo del estrés laboral con entrenamiento funcional y boxeo. He recuperado mi energía diaria, duermo mucho mejor y los dolores de espalda desaparecieron.',
    rating: 5,
    date: 'Hace 1 mes',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    verified: true
  },
  {
    id: 'test-4',
    name: 'Sofía Ramírez',
    role: 'Madre de Mateo (8 años)',
    treatment: 'Fisioterapia Pediátrica',
    comment: 'La paciencia y calidez con la que atendieron a mi hijo por su problema postural fue excepcional. Las sesiones son dinámicas y divertidas, y la facilidad para ver sus progresos en la app hace que todo el proceso sea transparente.',
    rating: 5,
    date: 'Hace 1 mes',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    verified: true
  }
];

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat-1',
    accessCode: 'EQ-4819',
    fullName: 'Carlos Balladares',
    documentId: 'V-18.942.310',
    email: 'carlos.balladares@gmail.com',
    phone: '+58 412-555-8910',
    secondaryPhone: '+58 212-985-2311',
    emergencyContactName: 'Andrea Balladares',
    emergencyContactRelation: 'Esposa',
    emergencyContactPhone: '+58 412-555-8911',
    address: 'Av. San Juan Bosco, Edif. Ávila Real, Apto 4-B, Altamira Norte',
    city: 'Caracas, Miranda',
    preferredContactMethod: 'Llamada Telefónica',
    bloodType: 'O+',
    allergies: 'Ninguna conocida',
    insuranceCompany: 'Mercantil Seguros (Póliza Salud Platinum)',
    age: 34,
    service: 'Fisioterapia Deportiva',
    specialist: 'Lic. Mariana Valdés',
    specialistRole: 'Fisioterapeuta Deportiva',
    diagnosis: 'Tendinopatía rotuliana rodilla derecha + sobrecarga de soleo',
    status: 'in_progress',
    painInitial: 8,
    painCurrent: 2,
    mobilityProgress: 88,
    completedSessions: 7,
    totalSessions: 10,
    nextAppointmentDate: '2026-08-25',
    nextAppointmentTime: '09:30 AM',
    registeredAt: '2026-07-28',
    treatmentGoal: 'Retorno seguro a carreras de 10K y eliminación completa del dolor anterior.',
    notes: [
      {
        id: 'n-1',
        date: '2026-07-28',
        author: 'Lic. Mariana Valdés',
        role: 'Fisioterapeuta',
        note: 'Evaluación inicial: Dolor EVA 8/10 a la palpación en polo inferior de rótula. Se inicia terapia descompresiva y punción seca.',
        painScore: 8,
        mobilityScore: 50
      },
      {
        id: 'n-2',
        date: '2026-08-08',
        author: 'Lic. Mariana Valdés',
        role: 'Fisioterapeuta',
        note: 'Sesión 4: Notable mejoría en la marcha. Comienza fortalecimiento isométrico en squat estático.',
        painScore: 4,
        mobilityScore: 70
      },
      {
        id: 'n-3',
        date: '2026-08-18',
        author: 'Lic. Mariana Valdés',
        role: 'Fisioterapeuta',
        note: 'Sesión 7: Dolor residual 2/10. Realiza salto bipodal sin molestias. Se programan 3 sesiones finales de readaptación.',
        painScore: 2,
        mobilityScore: 88
      }
    ],
    exercises: [
      {
        id: 'ex-1',
        title: 'Sentadilla isométrica en pared (Wall Sit)',
        sets: '4 series',
        reps: '45 segundos',
        frequency: 'Diario (mañana)',
        instructions: 'Mantén rodillas a 90 grados, espalda completamente apoyada contra la pared y abdomen firme.',
        completedToday: true
      },
      {
        id: 'ex-2',
        title: 'Excéntrico de cuádriceps en banco declinado',
        sets: '3 series',
        reps: '12 repeticiones',
        frequency: '3 veces por semana',
        instructions: 'Baja en 3 segundos lentamente soportando con la pierna afectada y sube con ambas.',
        completedToday: false
      },
      {
        id: 'ex-3',
        title: 'Auto-liberación con rodillo miofascial en gemelos',
        sets: '2 series',
        reps: '60 segundos por pierna',
        frequency: 'Post-entrenamiento',
        instructions: 'Desliza suavemente sobre la zona del sóleo buscando puntos de tensión.',
        completedToday: true
      }
    ],
    painHistory: [
      { date: '28 Jul', score: 8 },
      { date: '04 Ago', score: 6 },
      { date: '11 Ago', score: 4 },
      { date: '18 Ago', score: 2 }
    ],
    chatMessages: [
      {
        id: 'm-1',
        sender: 'specialist',
        text: 'Hola Carlos, ¿cómo sentiste la pierna después de la sesión de readaptación con salto?',
        timestamp: '18 Ago, 11:30 AM'
      },
      {
        id: 'm-2',
        sender: 'patient',
        text: '¡Hola Mariana! Excelente, cero molestias por la noche. Hice el wall sit de hoy y no sentí ningún pinchazo.',
        timestamp: '18 Ago, 01:15 PM'
      },
      {
        id: 'm-3',
        sender: 'specialist',
        text: '¡Gran avance! Mantén la pauta de hidratación y nos vemos el próximo martes para la fase final.',
        timestamp: '18 Ago, 02:00 PM'
      }
    ]
  },
  {
    id: 'pat-2',
    accessCode: 'EQ-7320',
    fullName: 'Elvira Montana',
    documentId: 'V-22.109.845',
    email: 'elvira.montana@gmail.com',
    phone: '+58 414-239-1122',
    secondaryPhone: '+58 212-761-4490',
    emergencyContactName: 'Jorge Montana',
    emergencyContactRelation: 'Padre',
    emergencyContactPhone: '+58 414-301-9988',
    address: 'Calle Los Mangos, Quinta Los Laureles, Las Mercedes',
    city: 'Caracas, Baruta',
    preferredContactMethod: 'Chat App',
    bloodType: 'A+',
    allergies: 'Penicilina',
    insuranceCompany: 'Seguros Caracas',
    age: 29,
    service: 'Fisioterapia General',
    specialist: 'Lic. Alejandro Rivas',
    specialistRole: 'Fisioterapeuta Postquirúrgico',
    diagnosis: 'Postoperatorio reconstrucción LCA rodilla izquierda (Semana 8)',
    status: 'in_progress',
    painInitial: 9,
    painCurrent: 3,
    mobilityProgress: 82,
    completedSessions: 14,
    totalSessions: 20,
    nextAppointmentDate: '2026-08-26',
    nextAppointmentTime: '04:00 PM',
    registeredAt: '2026-07-02',
    treatmentGoal: 'Flexión a 130°, extensión completa 0° y marcha autónoma sin cojera.',
    notes: [
      {
        id: 'n-1',
        date: '2026-07-02',
        author: 'Lic. Alejandro Rivas',
        role: 'Fisioterapeuta',
        note: 'Ingreso postcirugía. Edema moderado ++. Flexión limitada a 70°. Extensión -10°. Tratamiento antiedema y movilizaciones.',
        painScore: 9,
        mobilityScore: 35
      },
      {
        id: 'n-2',
        date: '2026-08-01',
        author: 'Lic. Alejandro Rivas',
        role: 'Fisioterapeuta',
        note: 'Flexión alcanzada 115°. Marcha sin bastones estable. Se introduce bicicleta estática con baja resistencia.',
        painScore: 5,
        mobilityScore: 65
      }
    ],
    exercises: [
      {
        id: 'ex-1',
        title: 'Deslizamiento de talón en pared para flexión',
        sets: '3 series',
        reps: '15 repeticiones',
        frequency: '2 veces al día',
        instructions: 'Coloca el pie en la pared y permite que la gravedad asista suavemente la flexión sin forzar dolor agudo.',
        completedToday: true
      },
      {
        id: 'ex-2',
        title: 'Elevación de pierna recta en decúbito supino',
        sets: '4 series',
        reps: '12 repeticiones',
        frequency: 'Diario',
        instructions: 'Cuádriceps bloqueado al 100%, eleva 30cm del suelo sosteniendo 2 segundos arriba.',
        completedToday: true
      }
    ],
    painHistory: [
      { date: '02 Jul', score: 9 },
      { date: '16 Jul', score: 7 },
      { date: '30 Jul', score: 5 },
      { date: '15 Ago', score: 3 }
    ],
    chatMessages: [
      {
        id: 'm-1',
        sender: 'patient',
        text: 'Lic. Alejandro, completé 15 minutos en la bici fija hoy sin dolor. ¿Puedo subir la resistencia un poco?',
        timestamp: '19 Ago, 10:00 AM'
      },
      {
        id: 'm-2',
        sender: 'specialist',
        text: '¡Excelente noticia Elvira! Mantén la resistencia suave por 3 días más antes de subirla, cuidemos el injerto.',
        timestamp: '19 Ago, 10:45 AM'
      }
    ]
  },
  {
    id: 'pat-3',
    accessCode: 'EQ-5192',
    fullName: 'Daniel Gómez',
    documentId: 'V-16.290.412',
    email: 'daniel.gomez@techcorp.com',
    phone: '+58 424-819-3344',
    secondaryPhone: '+58 212-284-9011',
    emergencyContactName: 'María Fernanda Ruiz',
    emergencyContactRelation: 'Hermana',
    emergencyContactPhone: '+58 424-819-3345',
    address: 'Av. Francisco de Miranda, Residencias Parque Cristal, Los Palos Grandes',
    city: 'Caracas, Chacao',
    preferredContactMethod: 'Correo Electrónico',
    bloodType: 'B+',
    allergies: 'Ninguna conocida',
    insuranceCompany: 'Mapfre Seguros',
    age: 41,
    service: 'Psicología',
    specialist: 'Lic. Claudia Navarro',
    specialistRole: 'Psicóloga Clínica',
    diagnosis: 'Sobrecarga tensional cervical de origen somatomorfo + Síndrome de Burnout',
    status: 'active',
    painInitial: 7,
    painCurrent: 2,
    mobilityProgress: 92,
    completedSessions: 5,
    totalSessions: 8,
    nextAppointmentDate: '2026-08-27',
    nextAppointmentTime: '05:30 PM',
    registeredAt: '2026-07-20',
    treatmentGoal: 'Integrar higiene postural y técnicas de desactivación fisiológica en jornadas laborales.',
    notes: [
      {
        id: 'n-1',
        date: '2026-07-20',
        author: 'Lic. Claudia Navarro',
        role: 'Psicóloga Clínica',
        note: 'Se identifican patrones de rumiación y tensión mandibular/cervical severa. Plan integrado con entrenamiento funcional y boxeo.',
        painScore: 7,
        mobilityScore: 60
      }
    ],
    exercises: [
      {
        id: 'ex-1',
        title: 'Respiración diafragmática 4-7-8',
        sets: '3 ciclos',
        reps: '4 repeticiones',
        frequency: 'Antes de dormir y pausas laborales',
        instructions: 'Inhala en 4s, retén 7s y exhala en 8s vaciando completamente los pulmones.',
        completedToday: true
      },
      {
        id: 'ex-2',
        title: 'Estiramiento activo de trapecio y elevador de escápula',
        sets: '2 series',
        reps: '30 seg por lado',
        frequency: 'Cada 2 horas en escritorio',
        instructions: 'Inclina la cabeza lateralmente sin forzar la columna y siente el estiramiento suave.',
        completedToday: false
      }
    ],
    painHistory: [
      { date: '20 Jul', score: 7 },
      { date: '28 Jul', score: 5 },
      { date: '08 Ago', score: 3 },
      { date: '18 Ago', score: 2 }
    ],
    chatMessages: [
      {
        id: 'm-1',
        sender: 'patient',
        text: 'La clase de boxeo de ayer me ayudó muchísimo a soltar la tensión del cuello.',
        timestamp: '19 Ago, 06:00 PM'
      },
      {
        id: 'm-2',
        sender: 'specialist',
        text: 'Es un gran canalizador físico. Recuerda hacer tus 5 minutos de respiración antes de la reunión de mañana.',
        timestamp: '19 Ago, 07:15 PM'
      }
    ]
  }
];

export const INITIAL_APPOINTMENTS: AppointmentBooking[] = [
  {
    id: 'apt-101',
    patientName: 'Gabriela Morales',
    documentId: 'V-20.891.332',
    email: 'gabriela.m@outlook.com',
    phone: '+58 412-998-1123',
    emergencyContactName: 'Roberto Morales (Hermano)',
    emergencyContactPhone: '+58 412-998-1124',
    address: 'Urb. La Florida, Av. Los Mangos, Quinta Mary, Caracas',
    service: 'Fisioterapia General',
    preferredDate: '2026-08-25',
    preferredTime: '10:00 AM',
    notes: 'Dolor cervical agudo tras viaje largo.',
    isFirstTime: true,
    status: 'confirmed',
    createdAt: '2026-08-20T14:20:00Z',
    generatedAccessCode: 'EQ-9921'
  },
  {
    id: 'apt-102',
    patientName: 'Luis Hernán Blanco',
    documentId: 'V-15.670.198',
    email: 'luis.blanco@gmail.com',
    phone: '+58 414-772-4411',
    emergencyContactName: 'Carmen Blanco (Cónyuge)',
    emergencyContactPhone: '+58 414-772-4412',
    address: 'Colinas de Bello Monte, Edif. Caurimare, Piso 6, Caracas',
    service: 'Traumatología',
    preferredDate: '2026-08-26',
    preferredTime: '02:30 PM',
    notes: 'Evaluación de resonancia de hombro manguito rotador.',
    isFirstTime: true,
    status: 'pending',
    createdAt: '2026-08-21T09:10:00Z',
    generatedAccessCode: 'EQ-3310'
  },
  {
    id: 'apt-103',
    patientName: 'Valentina Soto',
    documentId: 'V-24.319.004',
    email: 'valentina.soto@gmail.com',
    phone: '+58 416-332-9988',
    emergencyContactName: 'Marcos Soto (Padre)',
    emergencyContactPhone: '+58 416-332-9980',
    address: 'San Antonio de Los Altos, Urb. Los Helechos, Miranda',
    service: 'Nutrición',
    preferredDate: '2026-08-27',
    preferredTime: '11:00 AM',
    notes: 'Plan nutricional para carrera de 21K.',
    isFirstTime: false,
    status: 'confirmed',
    createdAt: '2026-08-19T18:00:00Z',
    generatedAccessCode: 'EQ-6420'
  }
];
