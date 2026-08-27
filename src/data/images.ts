/**
 * Centralized Image Assets for EQUILIBRA
 * You can easily update, replace, or customize all images for the site right here.
 * Either provide external image URLs (e.g. Unsplash, CDN) or local assets in `/public/images/`.
 */

export interface ImageAsset {
  src: string;
  alt: string;
  credit?: string;
  position?: string;
}

export const APP_IMAGES = {
  // Hero section main image (Clinical rehabilitation & gym setup)
  hero: {
    src: "/imagenes/consultorio.jpg",
    alt: "Centro de Fisioterapia y Rehabilitación Equilibra",
    position: "object-center",
  },

  // About Section: "El verdadero bienestar comienza en movimiento"
  about: {
    src: "/imagenes/consultorio.jpg",
    alt: "Sesión de fisioterapia y rehabilitación activa",
    position: "object-[center_35%]",
  },
  aboutSecondary: {
    src: "/imagenes/fotodeperfil.jpg",
    alt: "Especialista acompañando la recuperación del paciente",
    position: "object-top",
  },

  // 9 Core Services (Matches the exact cards in the photo)
  services: {
    fisioterapia: {
      src: "/imagenes/servicios/fisioterapia/fondo fisioterapia.jpg",
      alt: "Fisioterapia y evaluación funcional",
      position: "object-[center_12%]",
    },
    fisioterapiaPediatrica: {
      src: "/imagenes/servicios/fisioterapia pediatrica/foto fondo.jpg",
      alt: "Fisioterapia Pediátrica infantil y desarrollo motor",
      position: "object-[center_18%]",
    },
    fisioterapiaGeriatrica: {
      src: "/imagenes/servicios/fisioterapia geriatrica/foto fondo.jpg",
      alt: "Fisioterapia Geriátrica y movilidad para adultos mayores",
      position: "object-[center_18%]",
    },
    fisioterapiaDeportiva: {
      src: "/imagenes/servicios/fisioterapia deportiva/foto fondo.jpg",
      alt: "Fisioterapia Deportiva y prevención de lesiones en atletas",
      position: "object-[center_15%]",
    },
    traumatologia: {
      src: "/imagenes/servicios/traumatologia/foto fondo.jpg",
      alt: "Traumatología y valoración ortopédica integral",
      position: "object-[center_18%]",
    },
    psicologia: {
      src: "/imagenes/servicios/psicologia/foto fondo.jpg",
      alt: "Psicología y salud emocional",
      position: "object-[center_20%]",
    },
    nutricion: {
      src: "/imagenes/servicios/nutricion/precios.jpg",
      alt: "Nutrición clínica y deportiva personalizada",
      position: "object-[center_20%]",
    },
    entrenamientoFuncional: {
      src: "/imagenes/servicios/entrenamiento funcional/precios.jpg",
      alt: "Entrenamiento funcional y acondicionamiento biomecánico",
      position: "object-[center_20%]",
    },
    boxeo: {
      src: "/imagenes/servicios/boxeo/foto fondo.jpg",
      alt: "Boxeo terapéutico y acondicionamiento cardiovascular",
      position: "object-[center_18%]",
    },
  },

  // 9 Team Members from Fisiojewsiejew / Equilibra
  team: {
    isaacJewsiejew: {
      src: "/imagenes/fotos de perfil/Isaac Jewsiejew.jpg",
      alt: "Isaac Jewsiejew - Fisioterapeuta deportivo",
    },
    marividRequena: {
      src: "/imagenes/fotos de perfil/Marivid Requena.jpg",
      alt: "Marivid Requena - Fisioterapeuta pediátrica",
    },
    lauryTorrealba: {
      src: "/imagenes/fotos de perfil/Laury Torrealba.jpg",
      alt: "Laury Torrealba - Fisioterapeuta Geriátrica",
    },
    stephaniSalina: {
      src: "/imagenes/fotos de perfil/Stephani salina.jpg",
      alt: "Stephani Salina - Nutricionista",
    },
    rubenTorrealba: {
      src: "/imagenes/fotos de perfil/Rubén Torrealba.jpg",
      alt: "Rubén Torrealba - Médico traumatólogo",
    },
    cristinaFlores: {
      src: "/imagenes/fotos de perfil/Cristina flores.jpg",
      alt: "Cristina Flores - Psicóloga",
    },
    gabrielaRodriguez: {
      src: "/imagenes/fotos de perfil/Gabriela Rodriguez.jpg",
      alt: "Gabriela Rodríguez - Fisioterapeuta",
    },
    indiraAcevedo: {
      src: "/imagenes/fotos de perfil/Indira Acevedo.jpg",
      alt: "Indira Acevedo - Profesora de Boxeo",
    },
    kareinysMartinez: {
      src: "/imagenes/fotos de perfil/Kareinys Martinez.jpg",
      alt: "Kareinys Martínez - Fisioterapeuta",
    },
    rebeccaTriana: {
      src: "/imagenes/fotos de perfil/Rebecca Triana.jpg",
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


