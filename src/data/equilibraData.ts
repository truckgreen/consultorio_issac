import { ServiceItem, TeamMember, SpecialtyItem, WhyUsItem, TestimonialItem, FaqItem, TimeSlotInfo, Appointment } from '../types';

export const CLINIC_INFO = {
  name: "EQUILIBRA",
  tagline: "Tu camino hacia el bienestar físico comienza aquí",
  motto: "El lugar donde la mente, el cuerpo y el movimiento encuentran su equilibrio.",
  aboutTitle: "El verdadero bienestar comienza en movimiento",
  aboutText: "Combinamos fisioterapia basada en evidencia, entrenamiento y acompañamiento humano para transformar la experiencia de rehabilitación en algo activo, cercano y motivador.",
  addressFull: "Venezuela, Caracas, Sabana Grande, Centro Profesional del Este, piso 4, oficina 46",
  addressShort: "Centro Profesional del Este, Piso 4, Ofic. 46, Sabana Grande, Caracas",
  phoneDisplay: "+58 424-2724617",
  phoneRaw: "+584127471858",
  email: "contacto@equilibrave.com",
  instagram: "@equilibrave",
  whatsappUrl: "https://wa.me/584127471858?text=Hola%20Equilibra,%20quisiera%20solicitar%20informaci%C3%B3n%20sobre%20sus%20servicios.",
  googleMapsUrl: "https://maps.google.com/?q=Centro+Profesional+del+Este+Caracas+Sabana+Grande",
  hours: [
    "Lunes a Viernes: 8:00am a 7:00pm",
    "Sábados: 8:00am a 2:00pm",
    "Domingos: Cerrado"
  ]
};

export const PHILOSOPHY_PILLARS = [
  {
    title: "Ciencia & Evidencia",
    description: "Protocolos validados internacionalmente con tecnología y medición de objetivos.",
    icon: "ShieldCheck"
  },
  {
    title: "Atención 1 a 1",
    description: "Sesiones personalizadas sin camillas masivas ni tiempos muertos.",
    icon: "UserCheck"
  },
  {
    title: "Educación & Empoderamiento",
    description: "Comprenderás tu cuerpo para ser protagonista activo de tu propia recuperación.",
    icon: "Lightbulb"
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: "fisioterapia",
    title: "Fisioterapia",
    category: "fisioterapia",
    shortDescription: "Evaluación biomecánica y terapia manual personalizada para el alivio del dolor y restauración de la movilidad.",
    fullDescription: "Combinamos técnicas de terapia manual avanzada, electroterapia de última generación, punción seca y prescripción de ejercicio terapéutico guiado por evidencia científica. Nuestro objetivo primordial es identificar la causa raíz de tu disfunción muscular o articular, no solo mitigar los síntomas.",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Alivio significativo del dolor crónico y agudo",
      "Restablecimiento de los arcos de movilidad articular",
      "Prevención de recurrencias y readaptación biomecánica",
      "Tratamiento individualizado en cabinas privadas y área activa"
    ],
    duration: "50 - 60 min",
    price: 35,
    priceFormatted: "$35",
    packageOption: "Pack 5 sesiones: $150 ($30 c/u)",
    priceNote: "Evaluación inicial + Terapia manual + Agentes físicos",
    targetAudience: ["Personas con dolores musculares o articulares", "Cervicalgias y lumbalgias", "Posturas laborales sedentarias"],
    methodology: "Evaluación funcional inicial, aplicación de agentes físicos y terapia activa con seguimiento de métricas."
  },
  {
    id: "fisioterapia-pediatrica",
    title: "Fisioterapia Pediátrica",
    category: "fisioterapia",
    shortDescription: "Atención integral para bebés, niños y adolescentes en desarrollo neuromotor, ortopédico y postural.",
    fullDescription: "Programa especializado en el desarrollo psicomotor, corrección postural y rehabilitación de condiciones congénitas o adquiridas en edad pediátrica. Con un enfoque lúdico, empático y respetuoso del ritmo del niño, brindamos herramientas para que cada pequeño alcance su máximo potencial físico.",
    imageUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Estimulación temprana del desarrollo motor y gateo/marcha",
      "Tratamiento de escoliosis, pie plano y alteraciones de la marcha",
      "Rehabilitación de traumatismos o lesiones deportivas infantiles",
      "Acompañamiento y orientación a padres y cuidadores"
    ],
    duration: "45 - 50 min",
    price: 35,
    priceFormatted: "$35",
    packageOption: "Pack 4 sesiones: $120 ($30 c/u)",
    priceNote: "Sesión personalizada de estimulación y motricidad lúdica",
    targetAudience: ["Lactantes con retraso motor leve", "Niños y adolescentes con alteraciones posturales", "Pequeños atletas"],
    methodology: "Ejercicios neuromusculares adaptados por edad a través de dinámicas de juego terapéutico."
  },
  {
    id: "fisioterapia-geriatrica",
    title: "Fisioterapia Geriátrica",
    category: "fisioterapia",
    shortDescription: "Mantenimiento de la autonomía funcional, equilibrio y calidad de vida para adultos mayores.",
    fullDescription: "Diseñado específicamente para preservar la independencia, fuerza y balance de las personas de la tercera edad. Abordamos patologías degenerativas como artrosis, osteoporosis, prevención de caídas y acondicionamiento cardiovascular adaptado.",
    imageUrl: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Mejora notable del equilibrio y prevención de caídas",
      "Conservación de la masa muscular (prevención de sarcopenia)",
      "Alivio de rigidez articular y mejora de la coordinación",
      "Incremento de la energía y bienestar en la vida diaria"
    ],
    duration: "50 min",
    price: 30,
    priceFormatted: "$30",
    packageOption: "Pack 5 sesiones: $135 ($27 c/u)",
    priceNote: "Movilidad articular, equilibrio y fuerza funcional",
    targetAudience: ["Adultos mayores que desean mantener su independencia", "Personas en recuperación post-operatoria de cadera/rodilla"],
    methodology: "Técnicas de movilización suave, reeducación de la marcha y fortalecimiento funcional progresivo."
  },
  {
    id: "fisioterapia-deportiva",
    title: "Fisioterapia Deportiva",
    category: "fisioterapia",
    shortDescription: "Rehabilitación de alta exigencia, retorno al juego seguro y optimización del rendimiento atlético.",
    fullDescription: "Atención especializada para atletas profesionales y recreativos. Tratamos roturas de ligamentos, esguinces, desgarros musculares, tendinopatías y fases de Readaptación Funcional Deportiva en campo/gimnasio con mediciones objetivas de fuerza y simetría.",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Retorno seguro al deporte minimizando riesgo de relesión",
      "Test biomecánicos y de salto con tecnología de medición",
      "Protocolos acelerados basados en la biología tisular",
      "Terapia manual de alto impacto, ventosas y recuperación activa"
    ],
    duration: "60 min",
    price: 40,
    priceFormatted: "$40",
    packageOption: "Pack 5 sesiones: $175 ($35 c/u)",
    priceNote: "Evaluación biomecánica + Readaptación y retorno a cancha",
    targetAudience: ["Futbolistas, corredores, crossfitters, tenistas", "Atletas de alto rendimiento y aficionados"],
    methodology: "Fases progresivas: Control de dolor, movilidad, fuerza, potencia y retorno a gestos deportivos específicos."
  },
  {
    id: "traumatologia",
    title: "Traumatología",
    category: "medicina",
    shortDescription: "Diagnóstico médico de precisión, control de lesiones óseas, articulares y musculares.",
    fullDescription: "Consulta médica especializada en el diagnóstico certero de patologías del aparato locomotor. Evaluación clínica, prescripción de estudios imagenológicos, infiltraciones ecoguiadas y coordinación directa con el equipo de fisioterapia para un plan sinérgico.",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Diagnóstico médico riguroso sin derivaciones innecesarias",
      "Comunicación en tiempo real entre médico traumatólogo y fisioterapeuta",
      "Manejo de lesiones articulares agudas y sobrecargas crónicas",
      "Indicación precisa de protocolos no quirúrgicos y quirúrgicos"
    ],
    duration: "30 - 45 min",
    price: 50,
    priceFormatted: "$50",
    packageOption: "Control post-tratamiento: $30",
    priceNote: "Consulta médica traumatológica + Orden de estudios e informe",
    targetAudience: ["Personas con dolor articular persistente", "Pacientes con traumatismos recientes", "Segunda opinión médica"],
    methodology: "Examen físico exhaustivo, revisión de radiografías/resonancias y plan de manejo integral."
  },
  {
    id: "psicologia",
    title: "Psicología",
    category: "bienestar",
    shortDescription: "Acompañamiento emocional, manejo del estrés, dolor crónico y bienestar mental integral.",
    fullDescription: "La mente y el cuerpo forman una unidad indivisible. Nuestro servicio de psicología clínica y deportiva acompaña procesos de gestión del estrés, ansiedad asociada a lesiones, resiliencia y empoderamiento personal en un espacio confidencial y cálido.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Gestión del dolor crónico y factores psicosomáticos",
      "Herramientas cognitivas para superar el miedo a la relesión (kinesiofobia)",
      "Manejo del estrés laboral, ansiedad y regulación del sueño",
      "Acompañamiento a niños, jóvenes y adultos"
    ],
    duration: "50 min",
    price: 40,
    priceFormatted: "$40",
    packageOption: "Pack 4 consultas: $140 ($35 c/u)",
    priceNote: "Sesión clínica y deportiva individual (50 min)",
    targetAudience: ["Personas en procesos de rehabilitación prolongada", "Manejo del estrés y burnout", "Niños y adultos"],
    methodology: "Terapia cognitivo-conductual, técnicas de regulación emocional y mindfulness aplicado a la salud física."
  },
  {
    id: "nutricion",
    title: "Nutrición",
    category: "bienestar",
    shortDescription: "Planes nutricionales clínicos y deportivos personalizados según tu composición y metas.",
    fullDescription: "Asesoramiento nutricional fundamentado en la bioquímica individual y hábitos reales. Diseñamos planes antiinflamatorios para acelerar la recuperación de tejidos, optimización de composición corporal y nutrición deportiva de alto rendimiento.",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Bioimpedancia y medición de masa muscular y grasa",
      "Estrategias de nutrición antiinflamatoria para curación de tejidos",
      "Planes flexibles sin dietas restrictivas ni efectos rebote",
      "Periodización nutricional según intensidad de entrenamiento"
    ],
    duration: "45 - 60 min",
    price: 35,
    priceFormatted: "$35",
    packageOption: "Control mensual de seguimiento: $25",
    priceNote: "Evaluación antropométrica + Plan 100% personalizado",
    targetAudience: ["Deportistas en búsqueda de rendimiento", "Pacientes en recuperación de lesiones", "Poblaciones con condiciones clínicas"],
    methodology: "Anamnesis nutricional, cálculo de requerimientos energéticos y pautas de suplementación basada en evidencia."
  },
  {
    id: "entrenamiento-funcional",
    title: "Entrenamiento funcional",
    category: "movimiento",
    shortDescription: "Clases guiadas para potenciar fuerza, estabilidad postural y agilidad corporal.",
    fullDescription: "Sesiones personalizadas o en grupos reducidos con foco estricto en la técnica correcta y la transferencia al día a día o al deporte. Guiado por profesionales del movimiento que aseguran cargas seguras y estimulantes.",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Desarrollo de fuerza funcional y control del core",
      "Mejora de la resistencia cardiovascular y postura",
      "Grupos reducidos con supervisión técnica milimétrica",
      "Entorno motivador, moderno y libre de lesiones"
    ],
    duration: "60 min",
    price: 25,
    priceFormatted: "$25",
    packageOption: "Plan mensual 8 sesiones: $60 ($7.5 c/u)",
    priceNote: "Sesión guiada individual o en grupo reducido",
    targetAudience: ["Personas que buscan ponerse en forma con seguridad", "Pacientes con alta médica de fisioterapia"],
    methodology: "Patrones fundamentales de movimiento (empuje, tracción, bisagra de cadera, sentadilla y marcha)."
  },
  {
    id: "boxeo",
    title: "Boxeo",
    category: "movimiento",
    shortDescription: "Disciplina activa terapéutica, acondicionamiento cardiovascular, reflejos y descarga de estrés.",
    fullDescription: "Entrenamiento técnico de boxeo adaptado a todos los niveles, desde principiantes hasta practicantes avanzados. Excelente vía de liberación del estrés, mejora de la coordinación viso-motriz, velocidad de reacción y acondicionamiento cardiovascular integral sin combate lesivo.",
    imageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80",
    benefits: [
      "Quema calórica superior y acondicionamiento aeróbico/anaeróbico",
      "Descarga efectiva de tensiones y mejora del enfoque mental",
      "Desarrollo de agilidad, reflejos y coordinación óculo-manual",
      "Apto para todas las edades bajo supervisión técnica experta"
    ],
    duration: "60 min",
    price: 25,
    priceFormatted: "$25",
    packageOption: "Plan mensual 8 clases: $60 ($7.5 c/u)",
    priceNote: "Clase técnica y circuito de acondicionamiento físico",
    targetAudience: ["Cualquier persona que busque una actividad física divertida y desafiante", "Jóvenes y adultos"],
    methodology: "Trabajo de manoplas, saco, desplazamientos, sombra técnica y circuito de acondicionamiento físico."
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "isaac-jewsiejew",
    name: "Isaac Jewsiejew",
    role: "Fisioterapeuta deportivo",
    specialty: "Rehabilitación y readaptación física en deportistas y atletas de alto rendimiento",
    category: "fisioterapia",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    credentials: "Fisioterapeuta Especialista en Deporte",
    bio: "Especialista en prevención de lesiones, terapia manual ortopédica y readaptación deportiva integral para acelerar el retorno seguro a la actividad física de alto nivel.",
    relatedServiceId: "fisioterapia-deportiva"
  },
  {
    id: "marivid-requena",
    name: "Marivid Requena",
    role: "Fisioterapeuta pediátrica",
    specialty: "Desarrollo psicomotor infantil, estimulación temprana y rehabilitación neuromuscular",
    category: "fisioterapia",
    imageUrl: "https://images.unsplash.com/photo-1594824813590-b089c922ec9c?auto=format&fit=crop&w=600&q=80",
    credentials: "Lic. en Fisioterapia Pediátrica",
    bio: "Dedicada al desarrollo motriz, corrección de posturas infantiles y tratamientos neurológicos y ortopédicos adaptados a bebés, niños y adolescentes con calidez y paciencia.",
    relatedServiceId: "fisioterapia-pediatrica"
  },
  {
    id: "laury-torrealba",
    name: "Laury Torrealba",
    role: "Fisioterapeuta Geriátrica",
    specialty: "Salud funcional, movilidad articular y prevención de caídas en el adulto mayor",
    category: "fisioterapia",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    credentials: "Especialista en Fisioterapia Geriátrica",
    bio: "Enfocada en preservar la autonomía, fuerza muscular, equilibrio y calidad de vida de nuestros adultos mayores mediante terapias activas y personalizadas.",
    relatedServiceId: "fisioterapia-geriatrica"
  },
  {
    id: "stephani-salina",
    name: "Stephani Salina",
    role: "Nutricionista",
    specialty: "Nutrición clínica, recomposición corporal y planificación dietética para atletas",
    category: "nutricion",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    credentials: "Lic. en Nutrición y Dietética",
    bio: "Diseña planes de alimentación balanceados y sostenibles que complementan los tratamientos de fisioterapia, optimizan el metabolismo y mejoran el rendimiento físico.",
    relatedServiceId: "nutricion"
  },
  {
    id: "ruben-torrealba",
    name: "Rubén Torrealba",
    role: "Médico traumatólogo",
    specialty: "Diagnóstico ortopédico, lesiones articulares, columna y medicina musculoesquelética",
    category: "medicina",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
    credentials: "Médico Cirujano Ortopedista y Traumatólogo",
    bio: "Encargado de la evaluación clínica profunda, diagnóstico diferencial por imágenes y tratamiento integral de afecciones óseas, musculares y articulares.",
    relatedServiceId: "traumatologia"
  },
  {
    id: "cristina-flores",
    name: "Cristina Flores",
    role: "Psicóloga",
    specialty: "Psicología clínica, manejo de estrés, dolor crónico y enfoque biopsicosocial",
    category: "psicologia",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    credentials: "Lic. en Psicología Clínica",
    bio: "Acompaña a los pacientes en el impacto emocional del dolor, procesos de rehabilitación prolongados, ansiedad y desarrollo de hábitos para el bienestar integral.",
    relatedServiceId: "psicologia"
  },
  {
    id: "indira-acevedo",
    name: "Indira Acevedo",
    role: "Profesora de Boxeo",
    specialty: "Boxeo técnico, acondicionamiento cardiovascular, potencia y coordinación motora",
    category: "entrenamiento",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    credentials: "Instructora Certificada de Boxeo y Preparación Física",
    bio: "Dirige sesiones dinámicas de boxeo y entrenamiento funcional que mejoran la agilidad, reflejos, resistencia cardiovascular y liberación de estrés.",
    relatedServiceId: "boxeo"
  },
  {
    id: "juan-alzualde",
    name: "Juan Alzualde",
    role: "Asistente de fisioterapia",
    specialty: "Soporte en terapia física, termoterapia, electroterapia y atención asistencial",
    category: "asistencia",
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
    credentials: "Técnico Asistente en Fisioterapia",
    bio: "Brinda apoyo cercano y profesional en la aplicación de agentes físicos, preparación del espacio terapéutico y acompañamiento en cada protocolo de recuperación.",
    relatedServiceId: "fisioterapia"
  },
  {
    id: "rebecca-triana",
    name: "Rebecca Triana",
    role: "Asistente de fisioterapia",
    specialty: "Asistencia en ejercicios terapéuticos, mecanoterapia y bienestar del paciente",
    category: "asistencia",
    imageUrl: "https://images.unsplash.com/photo-1594824813590-b089c922ec9c?auto=format&fit=crop&w=600&q=80",
    credentials: "Técnica Asistente en Fisioterapia",
    bio: "Asiste a los fisioterapeutas y médicos en la ejecución precisa de rutinas terapéuticas, asegurando una experiencia confortable y atenta durante toda la sesión.",
    relatedServiceId: "fisioterapia"
  }
];

export const SPECIALTIES: SpecialtyItem[] = [
  {
    id: "medicina-fisioterapia",
    title: "Medicina & Fisioterapia Especializada",
    description: "Abordaje integral y de alta precisión para la prevención, diagnóstico y rehabilitación de lesiones. Contamos con traumatología, fisioterapia avanzada y atención especializada en fisioterapia pediátrica y geriátrica.",
    iconName: "Activity",
    highlights: [
      "Diagnóstico traumatológico y ortopédico",
      "Fisioterapia invasiva y terapia manual ortopédica",
      "Protocolos avanzados para niños, jóvenes y adultos mayores",
      "Seguimiento digital de la evolución de arcos y fuerza"
    ],
    subSpecialties: ["Traumatología", "Fisioterapia General", "Pediatría", "Geriatría", "Deportiva"]
  },
  {
    id: "salud-mental",
    title: "Salud Mental & Empoderamiento Emocional",
    description: "Acompañamiento psicológico personalizado enfocado en el equilibrio emocional, la gestión del estrés y el bienestar integral de niños, jóvenes y adultos en un entorno seguro y confidencial.",
    iconName: "HeartHandshake",
    highlights: [
      "Gestión de dolor persistente y reconexión mente-cuerpo",
      "Terapia para manejo del estrés, ansiedad y regulación del sueño",
      "Psicología orientada a la autoconfianza y rendimiento",
      "Espacios privados diseñados para la tranquilidad y empatía"
    ],
    subSpecialties: ["Psicología Clínica", "Psicología Deportiva", "Terapia Infantojuvenil", "Mindfulness"]
  },
  {
    id: "nutricion-clinica",
    title: "Nutrición Clínica & Deporte de Alto Nivel",
    description: "Planes de alimentación 100% personalizados adaptados a las exigencias de deportistas de alto rendimiento, así como programas especializados de nutrición para niños y poblaciones con condiciones específicas.",
    iconName: "Salad",
    highlights: [
      "Bioimpedancia y cineantropometría ISAK",
      "Nutrición orientada a la regeneración celular y articular",
      "Planes dietéticos realistas ajustados a tus rutinas y gustos",
      "Estrategias de suplementación deportiva respaldadas por ciencia"
    ],
    subSpecialties: ["Nutrición Deportiva", "Nutrición Clínica & Metabólica", "Nutrición Pediátrica", "Recomposición Corporal"]
  },
  {
    id: "entrenamiento-movimiento",
    title: "Entrenamiento Funcional & Movimiento",
    description: "Clases y sesiones diseñadas para optimizar la condición física, fuerza y movilidad a través de disciplinas activas como entrenamiento funcional, boxeo, yoga y pilates.",
    iconName: "Flame",
    highlights: [
      "Sesiones individuales y en grupos ultra reducidos",
      "Equipamiento de primer nivel para acondicionamiento atlético",
      "Entrenadores certificados en biomecánica y prevención de lesiones",
      "Ambiente enérgico, seguro y altamente motivador"
    ],
    subSpecialties: ["Entrenamiento Funcional", "Boxeo Terapéutico", "Movilidad & Core", "Reacondicionamiento Físico"]
  }
];

export const WHY_CHOOSE_US: WhyUsItem[] = [
  {
    id: "multidisciplinario",
    title: "Modelo Multidisciplinario & Evaluación 360°",
    badge: "Enfoque Unificado",
    iconName: "Users",
    description: "Porque simplificamos la salud al reunir en un solo lugar a especialistas en traumatología, fisioterapia, nutrición, psicología y entrenamiento. Evitamos la fragmentación médica y diseñamos un plan integral unificado donde cada área colabora en tiempo real para acelerar tus resultados."
  },
  {
    id: "calidad-exclusiva",
    title: "Estándar de Alta Calidad & Atención Exclusiva",
    badge: "Atención Premium",
    iconName: "ShieldCheck",
    description: "Porque ofrecemos un servicio personalizado, de estándar premium y de alta precisión, donde cada protocolo de rehabilitación y plan nutricional se adapta rigurosamente a tus objetivos y necesidades específicas."
  },
  {
    id: "rendimiento-pleno",
    title: "Del Dolor al Rendimiento Pleno",
    badge: "Proceso Continuo",
    iconName: "TrendingUp",
    description: "Porque no nos limitamos a aliviar un síntoma temporal. Acompañamos todo tu proceso: desde la recuperación médica o pediátrica y la salud mental, hasta la optimización física mediante disciplinas activas para garantizar un bienestar sostenible a largo plazo."
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "elvira-montana",
    name: "Elvira Montana",
    role: "Paciente de Fisioterapia & Readaptación",
    review: "Llegué con un dolor lumbar crónico que me impedía trabajar sentada más de dos horas. Desde la primera sesión multidisciplinaria, el equipo me explicó la causa real y me dio un plan de ejercicios activo. Hoy en día puedo entrenar sin molestias y con total confianza.",
    rating: 5,
    serviceReceived: "Fisioterapia General & Movilidad",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    date: "Hace 3 semanas"
  },
  {
    id: "carlos-balladares",
    name: "Carlos Balladares",
    role: "Corredor aficionado de media maratón",
    review: "Sufrí un desgarro en los isquiotibiales a un mes de una competencia. Gracias al trabajo conjunto de traumatología, fisioterapia deportiva y el plan nutricional antiinflamatorio, mi tiempo de recuperación fue récord. La atención y el profesionalismo son insuperables.",
    rating: 5,
    serviceReceived: "Fisioterapia Deportiva & Nutrición",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    date: "Hace 1 mes"
  },
  {
    id: "daniel-gomez",
    name: "Daniel Gómez",
    role: "Paciente de Traumatología y Entrenamiento Funcional",
    review: "Lo que más me impactó es que no te dejan tirado en una máquina de calor. Aquí el enfoque es 100% activo y personalizado. Salí del dolor de hombro y pasé a sus clases de entrenamiento funcional para fortalecerlo. Espacio impecable en Sabana Grande.",
    rating: 5,
    serviceReceived: "Traumatología & Entrenamiento",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    date: "Hace 2 meses"
  },
  {
    id: "mariana-rivas",
    name: "Mariana Rivas",
    role: "Madre de paciente pediátrico",
    review: "La paciencia, el cariño y el rigor técnico con el que trataron a mi hijo de 6 años para corregir su postura y marcha fue extraordinario. Venía con miedo y terminó amando sus sesiones de fisioterapia pediátrica.",
    rating: 5,
    serviceReceived: "Fisioterapia Pediátrica",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    date: "Hace 1 semana"
  }
];

export const FAQS: FaqItem[] = [
  {
    category: "Citas y Atención",
    question: "¿Cómo puedo agendar mi primera cita de evaluación?",
    answer: "Puedes reservar directamente a través del formulario interactivo de esta web seleccionando el servicio y horario de tu preferencia, o llamándonos al +58 424-2724617. Recibirás tu confirmación inmediata con tu código y todos los detalles de tu consulta."
  },
  {
    category: "Citas y Atención",
    question: "¿Qué debo llevar a mi primera sesión de fisioterapia o traumatología?",
    answer: "Recomendamos asistir con ropa deportiva cómoda que permita evaluar y movilizar la zona afectada. Si cuentas con estudios médicos previos (radiografías, resonancias magnéticas, informes), te invitamos a traerlos para su análisis en la consulta inicial."
  },
  {
    category: "Servicios",
    question: "¿Cuál es la diferencia entre fisioterapia convencional y el modelo Equilibra?",
    answer: "En Equilibra no creemos en tratamientos pasivos donde el paciente permanece en reposo con compresas. Implementamos un modelo activo basado en evidencia, integrando terapia manual ortopédica, ejercicio terapéutico dosificado, nutrición y acompañamiento integral para una recuperación real y duradera."
  },
  {
    category: "Instalaciones",
    question: "¿Dónde están ubicados y cuentan con estacionamiento?",
    answer: "Estamos ubicados en Caracas, Sabana Grande, Centro Profesional del Este, Piso 4, Oficina 46. El edificio cuenta con vigilancia privada, ascensores operativos y opciones de estacionamiento público en las inmediaciones."
  },
  {
    category: "Servicios",
    question: "¿Tienen programas de entrenamiento para personas sin lesiones?",
    answer: "¡Por supuesto! Nuestras disciplinas de Entrenamiento Funcional y Boxeo están abiertas a cualquier persona que desee mejorar su fuerza, salud cardiovascular, movilidad y manejo del estrés, siempre bajo la supervisión de profesionales de la salud y el movimiento."
  }
];

export const STANDARD_WEEKDAY_SLOTS = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM"
];

export const SATURDAY_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM"
];

export function getSlotsForDate(
  dateStr: string,
  userBookedAppointments: Appointment[] = []
): TimeSlotInfo[] {
  if (!dateStr) return [];

  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return [];
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday

    if (dayOfWeek === 0) {
      // Sunday closed
      return [];
    }

    const baseSlots = dayOfWeek === 6 ? SATURDAY_SLOTS : STANDARD_WEEKDAY_SLOTS;

    return baseSlots.map((time, index) => {
      const userBooked = userBookedAppointments.some(
        (app) => app.fecha === dateStr && app.hora === time
      );
      if (userBooked) {
        return {
          time,
          status: 'OCUPADO',
          notes: "Reservado por ti recientemente"
        };
      }

      const seed = (day * 7 + index * 13 + ((month + 1) * 3)) % 10;
      if (seed === 1 || seed === 6) {
        return {
          time,
          status: 'OCUPADO',
          notes: "Horario reservado por otro paciente"
        };
      } else if (seed === 3 || seed === 8) {
        return {
          time,
          status: 'POR_CONFIRMAR',
          notes: "En proceso de confirmación clínica"
        };
      } else {
        return {
          time,
          status: 'DISPONIBLE',
          notes: "Disponible para agendar inmediatamente"
        };
      }
    });
  } catch {
    return [];
  }
}
