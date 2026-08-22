import { SpecialtyItem } from '../types';

export const SPECIALTIES_DATA: SpecialtyItem[] = [
  {
    id: 'medicina-fisioterapia',
    title: 'Medicina & Fisioterapia Especializada',
    description: 'Abordaje integral y de alta precisión para la prevención, diagnóstico y rehabilitación de lesiones. Contamos con traumatología, fisioterapia avanzada y atención especializada en fisioterapia pediátrica y geriátrica.',
    iconName: 'Activity',
    highlights: [
      'Diagnóstico traumatológico y ortopédico',
      'Fisioterapia invasiva y terapia manual ortopédica',
      'Protocolos avanzados para niños, jóvenes y adultos mayores',
      'Seguimiento digital de la evolución de arcos y fuerza'
    ],
    subSpecialties: ['Traumatología', 'Fisioterapia General', 'Pediatría', 'Geriatría', 'Deportiva']
  },
  {
    id: 'salud-mental',
    title: 'Salud Mental & Empoderamiento Emocional',
    description: 'Acompañamiento psicológico personalizado enfocado en el equilibrio emocional, la gestión del estrés y el bienestar integral de niños, jóvenes y adultos en un entorno seguro y confidencial.',
    iconName: 'HeartHandshake',
    highlights: [
      'Gestión de dolor persistente y reconexión mente-cuerpo',
      'Terapia para manejo del estrés, ansiedad y regulación del sueño',
      'Psicología orientada a la autoconfianza y rendimiento',
      'Espacios privados diseñados para la tranquilidad y empatía'
    ],
    subSpecialties: ['Psicología Clínica', 'Psicología Deportiva', 'Terapia Infantojuvenil', 'Mindfulness']
  },
  {
    id: 'nutricion-clinica',
    title: 'Nutrición Clínica & Deporte de Alto Nivel',
    description: 'Planes de alimentación 100% personalizados adaptados a las exigencias de deportistas de alto rendimiento, así como programas especializados de nutrición para niños y poblaciones con condiciones específicas.',
    iconName: 'Salad',
    highlights: [
      'Bioimpedancia y cineantropometría ISAK',
      'Nutrición orientada a la regeneración celular y articular',
      'Planes dietéticos realistas ajustados a tus rutinas y gustos',
      'Estrategias de suplementación deportiva respaldadas por ciencia'
    ],
    subSpecialties: ['Nutrición Deportiva', 'Nutrición Clínica & Metabólica', 'Nutrición Pediátrica', 'Recomposición Corporal']
  },
  {
    id: 'entrenamiento-movimiento',
    title: 'Entrenamiento Funcional & Movimiento',
    description: 'Clases y sesiones diseñadas para optimizar la condición física, fuerza y movilidad a través de disciplinas activas como entrenamiento funcional, boxeo, yoga y pilates.',
    iconName: 'Flame',
    highlights: [
      'Sesiones individuales y en grupos ultra reducidos',
      'Equipamiento de primer nivel para acondicionamiento atlético',
      'Entrenadores certificados en biomecánica y prevención de lesiones',
      'Ambiente enérgico, seguro y altamente motivador'
    ],
    subSpecialties: ['Entrenamiento Funcional', 'Boxeo Terapéutico', 'Movilidad & Core', 'Reacondicionamiento Físico']
  }
];
