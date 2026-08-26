import { ServiceItem } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'fisioterapia',
    title: 'Fisioterapia',
    category: 'fisioterapia',
    shortDescription: 'Evaluación biomecánica y terapia manual personalizada para el alivio del dolor y restauración de la movilidad.',
    fullDescription: 'Combinamos técnicas de terapia manual avanzada, electroterapia, punción seca y prescripción de ejercicio terapéutico guiado por evidencia científica. Nuestro objetivo primordial es identificar la causa raíz de tu disfunción muscular o articular, no solo mitigar los síntomas.',
    imageKey: 'fisioterapia',
    benefits: [
      'Alivio significativo del dolor crónico y agudo',
      'Restablecimiento de los arcos de movilidad articular',
      'Prevención de recurrencias y readaptación biomecánica',
      'Tratamiento individualizado en cabinas privadas y área activa'
    ],
    duration: '50 - 60 min',
    price: 35,
    priceFormatted: '35€',
    packageOption: 'Paquete 10 sesiones: 300€ (3x por semana)',
    priceNote: 'Evaluación + Tratamiento personalizado',
    pricingFlyerImage: '/imagenes/servicios/fisioterapia/precios_fisioterapia.jpg',
    pricingTiers: [
      {
        name: 'Evaluación',
        description: 'Evaluación física + informe de fisioterapia + primera sesión',
        price: '45€',
        highlight: false
      },
      {
        name: 'Sesión de fisioterapia',
        description: 'Evaluación + tratamiento',
        price: '35€',
        highlight: true
      },
      {
        name: 'Paquete 10 sesiones',
        description: 'Dividido en 3 sesiones por semana',
        price: '300€',
        highlight: false
      }
    ],
    targetAudience: ['Personas con dolores musculares o articulares', 'Cervicalgias y lumbalgias', 'Posturas laborales sedentarias'],
    methodology: 'Evaluación funcional inicial, aplicación de agentes físicos y terapia activa con seguimiento de métricas.'
  },
  {
    id: 'fisioterapia-pediatrica',
    title: 'Fisioterapia Pediátrica',
    category: 'fisioterapia',
    shortDescription: 'Atención integral para bebés, niños y adolescentes en desarrollo neuromotor, ortopédico y postural.',
    fullDescription: 'Programa especializado en el desarrollo psicomotor, corrección postural y rehabilitación de condiciones congénitas o adquiridas en edad pediátrica. Con un enfoque lúdico, empático y respetuoso del ritmo del niño, brindamos herramientas para que cada pequeño alcance su máximo potencial físico.',
    imageKey: 'fisioterapiaPediatrica',
    benefits: [
      'Estimulación temprana del desarrollo motor y gateo/marcha',
      'Tratamiento de escoliosis, pie plano y alteraciones de la marcha',
      'Rehabilitación de traumatismos o lesiones deportivas infantiles',
      'Acompañamiento y orientación a padres y cuidadores'
    ],
    duration: '45 - 50 min',
    price: 35,
    priceFormatted: '35€',
    packageOption: 'Paquete 10 sesiones: 300€ (Dividido en 3 sesiones x semana)',
    priceNote: 'Evaluación + Estimulación temprana + Tratamiento',
    pricingFlyerImage: '/imagenes/servicios/fisioterapia pediatrica/precios.jpg',
    pricingTiers: [
      {
        name: 'Evaluación',
        description: 'Evaluación física + informe de fisioterapia + primera sesión',
        price: '45€',
        highlight: false
      },
      {
        name: 'Sesión de fisioterapia',
        description: 'Evaluación + tratamiento / Sesión de estimulación temprana',
        price: '35€',
        highlight: true
      },
      {
        name: 'Paquete 10 sesiones',
        description: 'Dividido en 3 sesiones por semana',
        price: '300€',
        highlight: false
      }
    ],
    targetAudience: ['Trastornos del neurodesarrollo', 'Lactantes y niños con retraso motor o psicomotriz', 'Alteraciones posturales, escoliosis y marcha', 'Pequeños atletas y rehabilitación infantil'],
    methodology: 'Ejercicios neuromusculares adaptados por edad a través de dinámicas de juego terapéutico.'
  },
  {
    id: 'fisioterapia-geriatrica',
    title: 'Fisioterapia Geriátrica',
    category: 'fisioterapia',
    shortDescription: 'Mantenimiento de la autonomía funcional, equilibrio y calidad de vida para adultos mayores.',
    fullDescription: 'Diseñado específicamente para preservar la independencia, fuerza y balance de las personas de la tercera edad. Abordamos patologías degenerativas como artrosis, osteoporosis, prevención de caídas y acondicionamiento cardiovascular adaptado.',
    imageKey: 'fisioterapiaGeriatrica',
    benefits: [
      'Mejora notable del equilibrio y prevención de caídas',
      'Conservación de la masa muscular (prevención de sarcopenia)',
      'Alivio de rigidez articular y mejora de la coordinación',
      'Incremento de la energía y bienestar en la vida diaria'
    ],
    duration: '50 min',
    price: 35,
    priceFormatted: '35€',
    packageOption: 'Paquete 10 sesiones: 300€ (Dividido en 3 sesiones x semana)',
    priceNote: 'Evaluación + Tratamiento personalizado',
    pricingFlyerImage: '/imagenes/servicios/fisioterapia geriatrica/precios.jpg',
    pricingTiers: [
      {
        name: 'Evaluación',
        description: 'Evaluación física + informe de fisioterapia + primera sesión',
        price: '45€',
        highlight: false
      },
      {
        name: 'Sesión de fisioterapia',
        description: 'Evaluación + tratamiento',
        price: '35€',
        highlight: true
      },
      {
        name: 'Paquete 10 sesiones',
        description: 'Dividido en 3 sesiones por semana',
        price: '300€',
        highlight: false
      }
    ],
    targetAudience: [
      'Adultos mayores que desean mantener su independencia',
      'Personas en recuperación post operatoria',
      'Adultos mayores que quieren recuperar su independencia',
      'Personas que quieran mejorar su calidad de vida'
    ],
    methodology: 'Ejercicios adaptados, movilizaciones activas y mejora del equilibrio y la postura.'
  },
  {
    id: 'fisioterapia-deportiva',
    title: 'Fisioterapia Deportiva',
    category: 'fisioterapia',
    shortDescription: 'Rehabilitación de alta exigencia, retorno al juego seguro y optimización del rendimiento atlético.',
    fullDescription: 'Atención especializada para atletas profesionales y recreativos. Tratamos roturas de ligamentos, esguinces, desgarros musculares, tendinopatías y fases de Readaptación Funcional Deportiva en campo/gimnasio.',
    imageKey: 'fisioterapiaDeportiva',
    benefits: [
      'Retorno seguro al deporte minimizando riesgo de relesión',
      'Test biomecánicos y de salto funcionales',
      'Protocolos acelerados basados en la biología tisular',
      'Terapia manual de alto impacto y recuperación activa'
    ],
    duration: '60 min',
    price: 35,
    priceFormatted: '35€',
    packageOption: 'Paquete 10 sesiones: 300€ (Dividido en 3 sesiones x semana)',
    priceNote: 'Evaluación biomecánica + Readaptación y retorno a cancha',
    pricingFlyerImage: '/imagenes/servicios/fisioterapia deportiva/precios.jpg',
    pricingTiers: [
      {
        name: 'Evaluación',
        description: 'Evaluación física + informe de fisioterapia + primera sesión',
        price: '45€',
        highlight: false
      },
      {
        name: 'Sesión de fisioterapia',
        description: 'Evaluación + tratamiento',
        price: '35€',
        highlight: true
      },
      {
        name: 'Paquete 10 sesiones',
        description: 'Dividido en 3 sesiones por semana',
        price: '300€',
        highlight: false
      }
    ],
    targetAudience: ['Futbolistas, corredores, crossfitters, tenistas', 'Atletas de alto rendimiento y aficionados'],
    methodology: 'Fases progresivas: Control de dolor, movilidad, fuerza, potencia y retorno a gestos deportivos específicos.'
  },
  {
    id: 'traumatologia',
    title: 'Traumatología',
    category: 'medicina',
    shortDescription: 'Diagnóstico médico de precisión, control de lesiones óseas, articulares y musculares.',
    fullDescription: 'Consulta médica especializada en el diagnóstico certero de patologías del aparato locomotor. Evaluación clínica, prescripción de estudios imagenológicos, aplicación de plasma rico en plaquetas y realización de ecografías, en coordinación directa con el equipo de fisioterapia para un plan sinérgico.',
    imageKey: 'traumatologia',
    benefits: [
      'Diagnóstico médico riguroso sin derivaciones innecesarias',
      'Realización de ecografías musculoesqueléticas',
      'Aplicación de plasma rico en plaquetas (PRP)',
      'Manejo de lesiones articulares agudas y sobrecargas crónicas'
    ],
    duration: '30 - 45 min',
    price: 50,
    priceFormatted: '50€',
    packageOption: 'Sesión plasma rico en plaquetas: 70€ | Ecografía: 40€',
    priceNote: 'Consulta médica traumatológica + Orden de estudios e informe',
    pricingFlyerImage: '/imagenes/servicios/traumatologia/precios.jpg',
    pricingTiers: [
      {
        name: 'Consulta médica',
        description: 'Evaluación física + Informe médico',
        price: '50€',
        highlight: true
      },
      {
        name: 'Ecografía',
        description: 'Ecografía musculoesquelética de evaluación',
        price: '40€',
        highlight: false
      },
      {
        name: 'Sesión plasma rico en plaquetas',
        description: 'Tratamiento biológico regenerativo (PRP)',
        price: '70€',
        highlight: false
      }
    ],
    targetAudience: ['Personas con lesiones músculo esqueléticas', 'Personas con dolor articular persistente', 'Pacientes con traumatismos recientes'],
    methodology: 'Examen físico exhaustivo, revisión de radiografías/resonancias, ecografía y plan de manejo integral.'
  },
  {
    id: 'psicologia',
    title: 'Psicología',
    category: 'bienestar',
    shortDescription: 'Acompañamiento emocional, manejo del estrés, bienestar mental integral y sanación de procesos.',
    fullDescription: 'La mente y el cuerpo forman una unidad indivisible. Nuestro servicio de psicología clínica acompaña procesos de salud mental, superación de vivencias difíciles, resiliencia y empoderamiento personal en un espacio confidencial y cálido.',
    imageKey: 'psicologia',
    benefits: [
      'Gestión del dolor crónico y factores psicosomáticos',
      'Herramientas cognitivas para superar el miedo y la ansiedad',
      'Manejo del estrés laboral, ansiedad y regulación del sueño',
      'Acompañamiento individual y de pareja para jóvenes y adultos'
    ],
    duration: '50 min',
    price: 30,
    priceFormatted: '30€',
    packageOption: 'Terapia de Pareja: 50€ (1ra sesión) / 40€ (posteriores)',
    priceNote: 'Sesión clínica individual presencial u online (50 min)',
    pricingFlyerImage: '/imagenes/servicios/psicologia/precios.jpg',
    pricingTiers: [
      {
        name: 'Sesión psicoterapia',
        description: 'Sesión individual de psicoterapia presencial',
        price: '30€',
        highlight: true
      },
      {
        name: 'Primera sesión de terapia de pareja',
        description: 'Evaluación, diagnóstico vincular y encuadre inicial',
        price: '50€',
        highlight: false
      },
      {
        name: 'Sesiones de terapia de pareja posteriores',
        description: 'Seguimiento y dinámicas continuas de pareja',
        price: '40€',
        highlight: false
      },
      {
        name: 'Sesión psicoterapia online',
        description: 'Atención psicológica a distancia vía videollamada',
        price: '30€',
        highlight: false
      }
    ],
    targetAudience: [
      'Personas que quieran sanar procesos',
      'Personas que deseen mejorar su salud mental',
      'Manejo del estrés y regulación emocional',
      'Adultos y jóvenes en búsqueda de bienestar psicológico'
    ],
    methodology: 'Terapia cognitivo-conductual, técnicas de regulación emocional y mindfulness aplicado al bienestar.'
  },
  {
    id: 'nutricion',
    title: 'Nutrición',
    category: 'bienestar',
    shortDescription: 'Planes nutricionales clínicos y deportivos personalizados según tu composición y metas.',
    fullDescription: 'Asesoramiento nutricional fundamentado en la bioquímica individual y hábitos reales. Diseñamos planes para acelerar la recuperación de tejidos, optimización de composición corporal y nutrición de alto rendimiento.',
    imageKey: 'nutricion',
    benefits: [
      'Bioimpedancia y medición de masa muscular y grasa',
      'Estrategias de nutrición para curación de tejidos y energía',
      'Planes flexibles sin dietas restrictivas ni efectos rebote',
      'Periodización nutricional según metas y estilo de vida'
    ],
    duration: '45 - 60 min',
    price: 45,
    priceFormatted: '45€',
    packageOption: 'Control por 3 meses: 100€',
    priceNote: 'Evaluación antropométrica + Plan 100% personalizado',
    pricingFlyerImage: '/imagenes/servicios/nutricion/precios.jpg',
    pricingTiers: [
      {
        name: 'Evaluación',
        description: 'Evaluación antropométrica y diseño del plan nutricional inicial',
        price: '45€',
        highlight: true
      },
      {
        name: 'Control de nutrición',
        description: 'Consulta de seguimiento, evolución y ajuste de pautas',
        price: '40€',
        highlight: false
      },
      {
        name: 'Control por 3 meses',
        description: 'Acompañamiento trimestral continuo y mediciones periódicas',
        price: '100€',
        highlight: false
      }
    ],
    targetAudience: [
      'Personas que quieran mejorar su alimentación',
      'Deportistas en búsqueda de rendimiento y composición corporal',
      'Pacientes en recuperación de lesiones y optimización de salud'
    ],
    methodology: 'Anamnesis nutricional, cálculo de requerimientos energéticos y pautas de alimentación basada en evidencia.'
  },
  {
    id: 'entrenamiento-funcional',
    title: 'Entrenamiento funcional',
    category: 'movimiento',
    shortDescription: 'Clases guiadas para potenciar fuerza, estabilidad postural y agilidad corporal.',
    fullDescription: 'Sesiones personalizadas o en grupos reducidos con foco estricto en la técnica correcta y la transferencia al día a día o al deporte. Guiado por profesionales y atención en fisioterapia para prevenir lesiones.',
    imageKey: 'entrenamientoFuncional',
    benefits: [
      'Desarrollo de fuerza funcional y control del core',
      'Mejora de la resistencia cardiovascular y postura',
      'Grupos reducidos con supervisión técnica milimétrica',
      'Todos los planes incluyen 1 descarga muscular al mes'
    ],
    duration: '60 min',
    price: 50,
    priceFormatted: '50€',
    packageOption: '¡1era clase Gratis! | Planes desde 50€ a 60€',
    priceNote: 'Incluye 1 descarga muscular al mes en todos los planes',
    pricingFlyerImage: '/imagenes/servicios/entrenamiento funcional/precios.jpg',
    pricingTiers: [
      {
        name: '6 clases al mes',
        description: '2 clases a la semana + 1 descarga muscular al mes incluida',
        price: '50€',
        highlight: false
      },
      {
        name: '12 clases al mes',
        description: '3 clases a la semana + 1 descarga muscular al mes incluida',
        price: '55€',
        highlight: true
      },
      {
        name: '20 clases al mes',
        description: '5 clases a la semana + 1 descarga muscular al mes incluida',
        price: '60€',
        highlight: false
      }
    ],
    targetAudience: [
      'Personas con alta en fisioterapia',
      'Personas que quieran mejorar su salud física y mental',
      'Personas que buscan ponerse en forma con seguridad'
    ],
    methodology: 'Ejercicios de movilidad, sobrecarga progresiva con pesas y máquinas, entrenamiento cardiovascular y estiramientos.'
  },
  {
    id: 'boxeo',
    title: 'Boxeo',
    category: 'movimiento',
    shortDescription: 'Disciplina activa terapéutica, acondicionamiento cardiovascular, reflejos y descarga de estrés.',
    fullDescription: 'Entrenamiento técnico de boxeo adaptado a todos los niveles, desde principiantes hasta practicantes avanzados. Excelente vía de liberación del estrés, mejora de la coordinación viso-motriz, velocidad de reacción y acondicionamiento cardiovascular integral sin combate lesivo.',
    imageKey: 'boxeo',
    benefits: [
      'Quema calórica superior y acondicionamiento aeróbico/anaeróbico',
      'Descarga efectiva de tensiones y mejora del enfoque mental',
      'Desarrollo de agilidad, reflejos y coordinación óculo-manual',
      'Apto para todas las edades bajo supervisión técnica de la Prof. Indira Acevedo'
    ],
    duration: '60 min',
    price: 25,
    priceFormatted: '25€',
    packageOption: '8 Clases al mes: 120€ | Primera clase: 15€',
    priceNote: 'Clase técnica y circuito de acondicionamiento físico',
    pricingFlyerImage: '/imagenes/servicios/boxeo/precios.jpg',
    pricingTiers: [
      {
        name: 'Primera clase',
        description: 'Clase introductoria para conocer la técnica y dinámica',
        price: '15€',
        highlight: false
      },
      {
        name: 'Clase individual',
        description: 'Sesión técnica personalizada 1 a 1',
        price: '25€',
        highlight: true
      },
      {
        name: '8 Clases al mes',
        description: 'Plan mensual regular de 2 clases por semana',
        price: '120€',
        highlight: false
      }
    ],
    targetAudience: ['Cualquier persona que busque una actividad física divertida y desafiante', 'Jóvenes y adultos'],
    methodology: 'Trabajo de manoplas, saco, desplazamientos, sombra técnica y circuito de acondicionamiento físico.'
  }
];
