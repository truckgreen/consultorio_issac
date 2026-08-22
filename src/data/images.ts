/**
 * Centralized Image Assets for EQUILIBRA
 * You can easily update, replace, or customize all images for the site right here.
 * Either provide external image URLs (e.g. Unsplash, CDN) or local assets in `/public/images/`.
 */

export interface ImageAsset {
  src: string;
  alt: string;
  credit?: string;
}

export const APP_IMAGES = {
  // Hero section main image (Clinical rehabilitation & gym setup)
  hero: {
    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=80",
    alt: "Centro de Fisioterapia y Rehabilitación Equilibra",
  },

  // About Section: "El verdadero bienestar comienza en movimiento"
  about: {
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    alt: "Sesión de fisioterapia y rehabilitación activa",
  },
  aboutSecondary: {
    src: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1000&q=80",
    alt: "Especialista acompañando la recuperación del paciente",
  },

  // 9 Core Services (Matches the exact cards in the photo)
  services: {
    fisioterapia: {
      src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
      alt: "Fisioterapia general y avanzada",
    },
    fisioterapiaPediatrica: {
      src: "https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=800&q=80",
      alt: "Fisioterapia Pediátrica infantil y desarrollo motor",
    },
    fisioterapiaGeriatrica: {
      src: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80",
      alt: "Fisioterapia Geriátrica y movilidad para adultos mayores",
    },
    fisioterapiaDeportiva: {
      src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      alt: "Fisioterapia Deportiva y prevención de lesiones en atletas",
    },
    traumatologia: {
      src: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
      alt: "Traumatología y valoración ortopédica integral",
    },
    psicologia: {
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      alt: "Psicología y salud emocional",
    },
    nutricion: {
      src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
      alt: "Nutrición clínica y deportiva personalizada",
    },
    entrenamientoFuncional: {
      src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      alt: "Entrenamiento funcional y biomecánica del movimiento",
    },
    boxeo: {
      src: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80",
      alt: "Boxeo terapéutico y acondicionamiento cardiovascular",
    },
  },

  // 9 Team Members from Fisiojewsiejew / Equilibra
  team: {
    isaacJewsiejew: {
      src: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
      alt: "Isaac Jewsiejew - Fisioterapeuta deportivo",
    },
    marividRequena: {
      src: "https://images.unsplash.com/photo-1594824813590-b089c922ec9c?auto=format&fit=crop&w=600&q=80",
      alt: "Marivid Requena - Fisioterapeuta pediátrica",
    },
    lauryTorrealba: {
      src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
      alt: "Laury Torrealba - Fisioterapeuta Geriátrica",
    },
    stephaniSalina: {
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      alt: "Stephani Salina - Nutricionista",
    },
    rubenTorrealba: {
      src: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
      alt: "Rubén Torrealba - Médico traumatólogo",
    },
    cristinaFlores: {
      src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
      alt: "Cristina Flores - Psicóloga",
    },
    indiraAcevedo: {
      src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
      alt: "Indira Acevedo - Profesora de Boxeo",
    },
    juanAlzualde: {
      src: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
      alt: "Juan Alzualde - Asistente de fisioterapia",
    },
    rebeccaTriana: {
      src: "https://images.unsplash.com/photo-1594824813590-b089c922ec9c?auto=format&fit=crop&w=600&q=80",
      alt: "Rebecca Triana - Asistente de fisioterapia",
    },
  },

  // Philosophy banner ("Lo que hacemos mejor")
  philosophy: {
    src: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80",
    alt: "Abordaje integral del cuerpo y movimiento",
  },

  // Clinic facilities banner
  facility: {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    alt: "Instalaciones modernas de Equilibra en Sabana Grande",
  },
};
