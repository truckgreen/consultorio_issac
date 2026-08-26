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
    src: "/imagenes/consultorio.jpg",
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
      // Puedes reemplazar esta ruta por tu imagen local (ej: '/imagenes/fisioterapia.jpg') o una URL directa
      src: "/imagenes/servicios/fisioterapia/fondo fisioterapia.jpg",
      alt: "Fisioterapia y entrenamiento de fuerza en banco asistido",
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
      src: "/imagenes/fotodeperfil.jpg",
      alt: "Isaac Jewsiejew - Fisioterapeuta deportivo",
    },
    marividRequena: {
      src: "/imagenes/fotodeperfil.jpg",
      alt: "Marivid Requena - Fisioterapeuta pediátrica",
    },
    lauryTorrealba: {
      src: "/imagenes/fotodeperfil.jpg",
      alt: "Laury Torrealba - Fisioterapeuta Geriátrica",
    },
    stephaniSalina: {
      src: "/imagenes/fotodeperfil.jpg",
      alt: "Stephani Salina - Nutricionista",
    },
    rubenTorrealba: {
      src: "/imagenes/fotodeperfil.jpg",
      alt: "Rubén Torrealba - Médico traumatólogo",
    },
    cristinaFlores: {
      src: "/imagenes/fotodeperfil.jpg",
      alt: "Cristina Flores - Psicóloga",
    },
    indiraAcevedo: {
      src: "/imagenes/fotodeperfil.jpg",
      alt: "Indira Acevedo - Profesora de Boxeo",
    },
    juanAlzualde: {
      src: "/imagenes/fotodeperfil.jpg",
      alt: "Juan Alzualde - Asistente de fisioterapia",
    },
    rebeccaTriana: {
      src: "/imagenes/fotodeperfil.jpg",
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


