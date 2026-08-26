import { WhyUsItem } from '../types';

export const CLINIC_INFO = {
  name: 'EQUILIBRA',
  tagline: 'Tu camino hacia el bienestar físico comienza aquí',
  motto: 'El lugar donde la mente, el cuerpo y el movimiento encuentran su equilibrio.',
  aboutTitle: 'El verdadero bienestar comienza en movimiento',
  aboutText: 'Combinamos fisioterapia basada en evidencia, entrenamiento y acompañamiento humano para transformar la experiencia de rehabilitación en algo activo, cercano y motivador.',
  address: {
    country: 'Venezuela',
    city: 'Caracas',
    zone: 'Sabana Grande',
    building: 'Centro Profesional del Este',
    floor: 'Piso 4, Oficina 48',
    fullAddress: 'Caracas, Sabana Grande, Centro Profesional del Este, piso 4, oficina 48'
  },
  phone: '0412-747-18-58',
  phoneDisplay: '0412-747-18-58',
  phoneRaw: '04127471858',
  instagram: '@fisiojewsiejew',
  email: 'contacto@equilibrave.com',
  hours: [
    { day: 'Lunes a Sábado', time: '8:00am a 5:00pm' }
  ]
};

export const DEVELOPER_SUPPORT_INFO = {
  teamName: 'Equipo de Desarrollo Web & Infraestructura',
  leadDev: 'Desarrollador Full Stack & Soporte Técnico',
  email: 'paezjose481@gmail.com',
  secondaryEmail: 'paezjose481@gmail.com',
  phoneDisplay: '+58 424-2724617',
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
