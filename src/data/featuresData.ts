import { WhyUsItem } from '../types';

export const CLINIC_INFO = {
  name: 'EQUILIBRA',
  tagline: 'Un refugio, no una sala de espera.',
  motto: 'Un refugio, no una sala de espera.',
  brandTagline: 'Un refugio, no una sala de espera.',
  descriptor: 'Centro de Bienestar Integral',
  aboutTitle: 'La unión entre la disciplina deportiva y la alineación holística',
  aboutText: 'Proveer un espacio de salud integral que fusiona la energía del movimiento deportivo con la precisión y el soporte anatómico, ofreciendo una base sólida y un acompañamiento profesional para que cada persona potencie su bienestar, rendimiento y calidad de vida.',
  mission: 'Proveer un espacio de salud integral que fusiona la energía del movimiento deportivo con la precisión y el soporte anatómico, ofreciendo una base sólida y un acompañamiento profesional para que cada persona potencie su bienestar, rendimiento y calidad de vida.',
  vision: 'Consolidarnos como el centro de referencia en salud y bienestar integral, reconocido por nuestra capacidad de integrar el dinamismo activo, la estructura médica y el equilibrio exacto en una comunidad sólida y en constante evolución.',
  colors: {
    creamy: '#F2EFE8',
    sealskin: '#0C0C0C',
    minimalist: '#B1A086',
    keystoneGray: '#D1CEC9',
  },
  values: [
    {
      name: 'EQUILIBRIO',
      desc: 'El punto exacto y necesario entre el esfuerzo físico y la estabilidad estructural.',
      icon: 'Scale',
    },
    {
      name: 'DISCIPLINA',
      desc: 'La base firme y constante que sostiene los resultados reales a largo plazo.',
      icon: 'ShieldCheck',
    },
    {
      name: 'EVOLUCIÓN',
      desc: 'Movimiento continuo y consciente hacia una mejor versión de uno mismo.',
      icon: 'TrendingUp',
    },
    {
      name: 'RENDIMIENTO',
      desc: 'Superación física respaldada por un enfoque profesional, técnico y estructurado.',
      icon: 'Zap',
    },
  ],
  address: {
    country: 'Venezuela',
    city: 'Caracas',
    zone: 'Sabana Grande',
    building: 'Centro Profesional del Este',
    floor: 'Piso 4, Oficina 46 & 48',
    fullAddress: 'Caracas, Sabana Grande, Centro Profesional del Este, piso 4, oficina 46 y 48'
  },
  phone: '0424-272-46-17',
  phoneDisplay: '+58 412-7471858 / 0424-272-4617',
  phoneRaw: '04242724617',
  whatsappDirect: '+58 412-7471858',
  instagram: '@fisiojewsiejew',
  hours: [
    { day: 'Lunes a Sábado', time: '8:00am a 6:00pm' }
  ]
};

export const DEVELOPER_SUPPORT_INFO = {
  teamName: 'Equipo de Desarrollo Web & Infraestructura',
  leadDev: 'Desarrollador Full Stack & Soporte Técnico',
  email: 'paezjose481@gmail.com',
  secondaryEmail: 'paezjose481@gmail.com',
  phoneDisplay: '+58 424-158-07-02',
  whatsappUrl: 'https://wa.me/qr/ZVOTHXHPPR7DJ1?text=Hola%2C%20tengo%20una%20duda%20o%20requiero%20soporte%20t%C3%A9cnico%20con%20la%20plataforma%20EQUILIBRA',
  supportHours: 'Lunes a Domingo: 8:00 AM - 10:00 PM (GMT-4)',
  responseTime: 'Menos de 2 horas',
  techStack: 'React 18, TypeScript, Tailwind CSS, Cloud Ingress, Motor Criptográfico',
  version: 'v2.4.0 (Build 2026.8)',
  status: 'Operativo & En Línea'
};

export const PHILOSOPHY_DATA = {
  subtitle: 'Realizamos un abordaje integral, el paciente no es solo una lesión',
  title: 'Lo que hacemos mejor',
  description: 'Nuestro trabajo se fundamenta en la atención integral y de alta precisión, entendiendo la armonía perfecta entre cuerpo, mente y movimiento. En nuestro espacio, nos alejamos del modelo clínico tradicional para ofrecer un abordaje multidisciplinario y de estándar internacional donde la fisioterapia avanzada, la traumatología, la nutrición especializada y la salud mental convergen en un mismo ecosistema.',
  pillars: [
    {
      title: 'Ciencia & Evidencia',
      desc: 'Protocolos validados internacionalmente con tecnología y medición objetiva.'
    },
    {
      title: 'Atención 1 a 1',
      desc: 'Sesiones personalizadas sin camillas masivas ni tiempos muertos.'
    },
    {
      title: 'Educación & Empoderamiento',
      desc: 'Comprenderás tu cuerpo para ser protagonista activo de tu propia recuperación.'
    }
  ]
};

export const WHY_CHOOSE_US: WhyUsItem[] = [
  {
    id: 'multidisciplinario',
    title: 'Modelo Multidisciplinario & Evaluación 360°',
    badge: 'Enfoque Unificado',
    iconName: 'Users',
    description: 'Porque simplificamos la salud al reunir en un solo lugar a especialistas en traumatología, fisioterapia, nutrición, psicología y entrenamiento. Evitamos la fragmentación médica y diseñamos un plan integral unificado donde cada área colabora en tiempo real para acelerar tus resultados.'
  },
  {
    id: 'calidad-exclusiva',
    title: 'Estándar de Alta Calidad & Atención Exclusiva',
    badge: 'Atención Premium',
    iconName: 'ShieldCheck',
    description: 'Porque ofrecemos un servicio personalizado, de estándar premium y de alta precisión, donde cada protocolo de rehabilitación y plan nutricional se adapta rigurosamente a tus objetivos y necesidades específicas.'
  },
  {
    id: 'rendimiento-pleno',
    title: 'Del Dolor al Rendimiento Pleno',
    badge: 'Proceso Continuo',
    iconName: 'TrendingUp',
    description: 'Porque no nos limitamos a aliviar un síntoma temporal. Acompañamos todo tu proceso: desde la recuperación médica o pediátrica y la salud mental, hasta la optimización física mediante disciplinas activas para garantizar un bienestar sostenible a largo plazo.'
  }
];
