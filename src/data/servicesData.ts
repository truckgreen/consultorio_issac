import { ServiceItem } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'fisioterapia',
    title: 'Fisioterapia',
    category: 'fisioterapia',
    shortDescription: 'Evaluación biomecánica y terapia manual personalizada para el alivio del dolor y restauración de la movilidad.',
    fullDescription: 'Combinamos técnicas de terapia manual avanzada, electroterapia de última generación, punción seca y prescripción de ejercicio terapéutico guiado por evidencia científica. Nuestro objetivo primordial es identificar la causa raíz de tu disfunción muscular o articular, no solo mitigar los síntomas.',
    imageKey: 'fisioterapia',
    benefits: [
      'Alivio significativo del dolor crónico y agudo',
      'Restablecimiento de los arcos de movilidad articular',
      'Prevención de recurrencias y readaptación biomecánica',
      'Tratamiento individualizado en cabinas privadas y área activa'
    ],
    duration: '50 - 60 min',
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
    targetAudience: ['Lactantes con retraso motor leve', 'Niños y adolescentes con alteraciones posturales', 'Pequeños atletas'],
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
    targetAudience: ['Adultos mayores que desean mantener su independencia', 'Personas en recuperación post-operatoria de cadera/rodilla'],
    methodology: 'Técnicas de movilización suave, reeducación de la marcha y fortalecimiento funcional progresivo.'
  },
  {
    id: 'fisioterapia-deportiva',
    title: 'Fisioterapia Deportiva',
    category: 'fisioterapia',
    shortDescription: 'Rehabilitación de alta exigencia, retorno al juego seguro y optimización del rendimiento atlético.',
    fullDescription: 'Atención especializada para atletas profesionales y recreativos. Tratamos roturas de ligamentos, esguinces, desgarros musculares, tendinopatías y fases de Readaptación Funcional Deportiva en campo/gimnasio con mediciones objetivas de fuerza y simetría.',
    imageKey: 'fisioterapiaDeportiva',
    benefits: [
      'Retorno seguro al deporte minimizando riesgo de relesión',
      'Test biomecánicos y de salto con tecnología de medición',
      'Protocolos acelerados basados en la biología tisular',
      'Terapia manual de alto impacto, ventosas y recuperación activa'
    ],
    duration: '60 min',
    targetAudience: ['Futbolistas, corredores, crossfitters, tenistas', 'Atletas de alto rendimiento y aficionados'],
    methodology: 'Fases progresivas: Control de dolor, movilidad, fuerza, potencia y retorno a gestos deportivos específicos.'
  },
  {
    id: 'traumatologia',
    title: 'Traumatología',
    category: 'medicina',
    shortDescription: 'Diagnóstico médico de precisión, control de lesiones óseas, articulares y musculares.',
    fullDescription: 'Consulta médica especializada en el diagnóstico certero de patologías del aparato locomotor. Evaluación clínica, prescripción de estudios imagenológicos, infiltraciones ecoguiadas y coordinación directa con el equipo de fisioterapia para un plan sinérgico.',
    imageKey: 'traumatologia',
    benefits: [
      'Diagnóstico médico riguroso sin derivaciones innecesarias',
      'Comunicación en tiempo real entre médico traumatólogo y fisioterapeuta',
      'Manejo de lesiones articulares agudas y sobrecargas crónicas',
      'Indicación precisa de protocolos no quirúrgicos y quirúrgicos'
    ],
    duration: '30 - 45 min',
    targetAudience: ['Personas con dolor articular persistente', 'Pacientes con traumatismos recientes', 'Segunda opinión médica'],
    methodology: 'Examen físico exhaustivo, revisión de radiografías/resonancias y plan de manejo integral.'
  },
  {
    id: 'psicologia',
    title: 'Psicología',
    category: 'bienestar',
    shortDescription: 'Acompañamiento emocional, manejo del estrés, dolor crónico y bienestar mental integral.',
    fullDescription: 'La mente y el cuerpo forman una unidad indivisible. Nuestro servicio de psicología clínica y deportiva acompaña procesos de gestión del estrés, ansiedad asociada a lesiones, resiliencia y empoderamiento personal en un espacio confidencial y cálido.',
    imageKey: 'psicologia',
    benefits: [
      'Gestión del dolor crónico y factores psicosomáticos',
      'Herramientas cognitivas para superar el miedo a la relesión (kinesiofobia)',
      'Manejo del estrés laboral, ansiedad y regulación del sueño',
      'Acompañamiento a niños, jóvenes y adultos'
    ],
    duration: '50 min',
    targetAudience: ['Personas en procesos de rehabilitación prolongada', 'Manejo del estrés y burnout', 'Niños y adultos'],
    methodology: 'Terapia cognitivo-conductual, técnicas de regulación emocional y mindfulness aplicado a la salud física.'
  },
  {
    id: 'nutricion',
    title: 'Nutrición',
    category: 'bienestar',
    shortDescription: 'Planes nutricionales clínicos y deportivos personalizados según tu composición y metas.',
    fullDescription: 'Asesoramiento nutricional fundamentado en la bioquímica individual y hábitos reales. Diseñamos planes antiinflamatorios para acelerar la recuperación de tejidos, optimización de composición corporal y nutrición deportiva de alto rendimiento.',
    imageKey: 'nutricion',
    benefits: [
      'Bioimpedancia y medición de masa muscular y grasa',
      'Estrategias de nutrición antiinflamatoria para curación de tejidos',
      'Planes flexibles sin dietas restrictivas ni efectos rebote',
      'Periodización nutricional según intensidad de entrenamiento'
    ],
    duration: '45 - 60 min',
    targetAudience: ['Deportistas en búsqueda de rendimiento', 'Pacientes en recuperación de lesiones', 'Poblaciones con condiciones clínicas'],
    methodology: 'Anamnesis nutricional, cálculo de requerimientos energéticos y pautas de suplementación basada en evidencia.'
  },
  {
    id: 'entrenamiento-funcional',
    title: 'Entrenamiento funcional',
    category: 'movimiento',
    shortDescription: 'Clases guiadas para potenciar fuerza, estabilidad postural y agilidad corporal.',
    fullDescription: 'Sesiones personalizadas o en grupos reducidos con foco estricto en la técnica correcta y la transferencia al día a día o al deporte. Guiado por profesionales del movimiento que aseguran cargas seguras y estimulantes.',
    imageKey: 'entrenamientoFuncional',
    benefits: [
      'Desarrollo de fuerza funcional y control del core',
      'Mejora de la resistencia cardiovascular y postura',
      'Grupos reducidos con supervisión técnica milimétrica',
      'Entorno motivador, moderno y libre de lesiones'
    ],
    duration: '60 min',
    targetAudience: ['Personas que buscan ponerse en forma con seguridad', 'Pacientes con alta médica de fisioterapia'],
    methodology: 'Patrones fundamentales de movimiento (empuje, tracción, bisagra de cadera, sentadilla y marcha).'
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
      'Apto para todas las edades bajo supervisión técnica experta'
    ],
    duration: '60 min',
    targetAudience: ['Cualquier persona que busque una actividad física divertida y desafiante', 'Jóvenes y adultos'],
    methodology: 'Trabajo de manoplas, saco, desplazamientos, sombra técnica y circuito de acondicionamiento físico.'
  }
];
