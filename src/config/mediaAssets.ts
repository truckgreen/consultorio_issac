/**
 * ============================================================================
 * GUÍA DE CONFIGURACIÓN DE IMÁGENES Y VIDEOS PERSONALIZADOS - EQUILIBRA
 * ============================================================================
 * 
 * Este archivo centraliza todas las rutas de imágenes y enlaces de videos
 * de la página web y de la aplicación móvil.
 * 
 * INSTRUCCIONES RÁPIDAS:
 * ----------------------------------------------------------------------------
 * 1. CÓMO CAMBIAR UNA IMAGEN:
 *    - Opción A (Recomendada): Guarda tu imagen en la carpeta /public/images/
 *      (por ejemplo: /public/images/mi-logo.png) y coloca la ruta aquí:
 *      logo: '/images/mi-logo.png'
 *    - Opción B: Pega un enlace directo de internet (URL de Google Drive público,
 *      Cloudinary, Imgur, AWS S3 o Unsplash).
 * 
 * 2. CÓMO COLOCAR UN VIDEO PERSONALIZADO:
 *    - Puedes pegar enlaces directos de YouTube (ej: 'https://www.youtube.com/watch?v=XXXXX' o 'https://youtu.be/XXXXX')
 *    - Enlaces de Vimeo (ej: 'https://vimeo.com/XXXXX')
 *    - Archivos MP4 locales guardados en /public/videos/ (ej: '/videos/fisioterapia.mp4')
 *    - Si dejas el campo vacío (''), el sistema activará automáticamente el
 *      simulador clínico interactivo de alta fidelidad con capítulos y métricas.
 * ============================================================================
 */

export interface ServiceMediaConfig {
  id: string;
  serviceTitle: string;
  image: string;
  videoUrl?: string; // Enlace a YouTube, Vimeo o archivo .mp4 en /public/videos/
  videoPoster?: string;
}

export const MEDIA_CONFIG = {
  // 1. IDENTIDAD VISUAL & LOGOTIPO
  branding: {
    logoUrl: '', // Deja vacío para usar el logo vectorial SVG de EQUILIBRA o pon '/images/logo.png'
    faviconUrl: '/favicon.ico',
    appIcon: '/icon-512.svg'
  },

  // 2. IMÁGENES DE LA SECCIÓN PRINCIPAL (HERO & NOSOTROS)
  general: {
    heroBanner: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    philosophyPhoto: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1000&q=80',
    clinicFacade: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80',
    clinicEquipment: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80'
  },

  // 3. IMÁGENES Y VIDEOS POR CADA SERVICIO
  // Puedes reemplazar cualquier 'image' o 'videoUrl' con tus propios archivos o links de YouTube.
  services: {
    'fisioterapia-general': {
      id: 'fisioterapia-general',
      serviceTitle: 'Fisioterapia General',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
      // Pega aquí tu link de YouTube o MP4 (ej: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' o '/videos/fisioterapia.mp4'):
      videoUrl: '', 
      videoPoster: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85'
    },
    'fisioterapia-pediatrica': {
      id: 'fisioterapia-pediatrica',
      serviceTitle: 'Fisioterapia Pediátrica',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
      videoUrl: '',
      videoPoster: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=85'
    },
    'fisioterapia-geriatrica': {
      id: 'fisioterapia-geriatrica',
      serviceTitle: 'Fisioterapia Geriátrica',
      image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=900&q=80',
      videoUrl: '',
      videoPoster: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=1200&q=85'
    },
    'fisioterapia-deportiva': {
      id: 'fisioterapia-deportiva',
      serviceTitle: 'Fisioterapia Deportiva',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
      videoUrl: '',
      videoPoster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85'
    },
    'traumatologia': {
      id: 'traumatologia',
      serviceTitle: 'Traumatología',
      image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=900&q=80',
      videoUrl: '',
      videoPoster: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=85'
    },
    'psicologia': {
      id: 'psicologia',
      serviceTitle: 'Psicología Clínica',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80',
      videoUrl: '',
      videoPoster: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=85'
    },
    'nutricion': {
      id: 'nutricion',
      serviceTitle: 'Nutrición Clínica & Deportiva',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
      videoUrl: '',
      videoPoster: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85'
    },
    'entrenamiento-funcional': {
      id: 'entrenamiento-funcional',
      serviceTitle: 'Entrenamiento Funcional',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
      videoUrl: '',
      videoPoster: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85'
    },
    'boxeo': {
      id: 'boxeo',
      serviceTitle: 'Boxeo Terapéutico & Acondicionamiento',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80',
      videoUrl: '',
      videoPoster: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=85'
    }
  }
};

/**
 * Función auxiliar para obtener la URL de video formateada (para iframes o video tags)
 */
export function parseVideoUrl(url: string | undefined): { type: 'youtube' | 'vimeo' | 'mp4' | 'simulated'; embedUrl?: string; rawUrl?: string } {
  if (!url || url.trim() === '') {
    return { type: 'simulated' };
  }

  const clean = url.trim();

  // YouTube
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    let videoId = '';
    if (clean.includes('youtu.be/')) {
      videoId = clean.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (clean.includes('watch?v=')) {
      videoId = clean.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (clean.includes('embed/')) {
      videoId = clean.split('embed/')[1]?.split('?')[0] || '';
    }
    
    if (videoId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
        rawUrl: clean
      };
    }
  }

  // Vimeo
  if (clean.includes('vimeo.com')) {
    const parts = clean.split('vimeo.com/');
    const vimeoId = parts[1]?.split('/')[0]?.split('?')[0];
    if (vimeoId) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
        rawUrl: clean
      };
    }
  }

  // Archivo local o URL directa MP4/WebM
  if (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.startsWith('/') || clean.startsWith('http')) {
    return {
      type: 'mp4',
      rawUrl: clean
    };
  }

  return { type: 'simulated' };
}
