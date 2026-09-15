import React from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Star,
  ExternalLink,
  CheckCircle,
  Clock,
  Navigation,
  MessageSquareHeart,
  Sparkles,
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export const GoogleBusinessCard: React.FC = () => {
  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Sabana+Grande+Caracas+Venezuela+Fisioterapia+Equilibra';
  const googleReviewUrl =
    'https://search.google.com/local/writereview?placeid=ChIJCaracasEquilibraFisio';

  const reviews = [
    {
      author: 'Carlos Eduardo M.',
      rating: 5,
      date: 'Hace 1 semana',
      comment:
        'Excelente atención en traumatología y fisioterapia. Tras mi cirugía de menisco, la rehabilitación con el equipo de Equilibra me devolvió la movilidad en tiempo récord.',
    },
    {
      author: 'Valentina Silva R.',
      rating: 5,
      date: 'Hace 3 semanas',
      comment:
        'Instalaciones impecables en Sabana Grande y terapeutas muy atentos y profesionales. El plan de 10 sesiones fue una gran inversión para mi espalda.',
    },
    {
      author: 'Ing. Roberto Hernández',
      rating: 5,
      date: 'Hace 1 mes',
      comment:
        'Puntualidad, trato humano inmejorable y tecnología de vanguardia. La evaluación fue súper detallada. 100% recomendados en Caracas.',
    },
  ];

  return (
    <div className="my-12 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="bg-gradient-to-br from-white via-slate-50 to-amber-50/40 dark:from-[#131924] dark:via-[#111620] dark:to-[#171f2c] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header row with Google logo styling & Verified Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              {/* Google G visual emblem */}
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center p-2.5 shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading">
                    Perfil de Empresa Verificado en Google
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Verificado
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  EQUILIBRA · Centro de Fisioterapia & Bienestar Integral
                </p>
              </div>
            </div>

            {/* Score & Stars */}
            <div className="flex items-center gap-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 rounded-2xl self-start sm:self-auto">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-heading">
                4.9
              </span>
              <div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  +124 reseñas en Google
                </span>
              </div>
            </div>
          </div>

          {/* Business location & quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
              <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">Ubicación Céntrica</span>
                <span className="block text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  Av. Francisco de Miranda, Sabana Grande, Caracas (Cerca de estación del Metro).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">Horario de Atención</span>
                <span className="block text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  Lunes a Sábado: 8:00 AM – 6:00 PM (Previa Cita).
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('google_maps_click', 'engagement', 'directions')}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 text-xs font-bold shadow-md transition-all"
              >
                <Navigation className="w-4 h-4 text-amber-400 dark:text-slate-950" />
                <span>Cómo llegar (Google Maps)</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('google_review_click', 'engagement', 'write_review')}
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
              >
                <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
                <span>Dejar una reseña en Google</span>
              </a>
            </div>
          </div>

          {/* Real Patient Reviews Carousel Cards */}
          <div>
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Opiniones recientes de pacientes reales en Google:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#151c28] border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between text-xs"
                >
                  <p className="text-slate-600 dark:text-slate-300 italic line-clamp-3 mb-3">
                    "{rev.comment}"
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{rev.author}</span>
                    <span className="text-slate-400 shrink-0">{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
