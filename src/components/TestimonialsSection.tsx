import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Sparkles,
  Quote,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  MessageSquarePlus,
  X,
  CheckCircle2,
  Heart,
  Send,
  User,
  ShieldCheck,
} from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';
import { TestimonialItem } from '../types';
import { SERVICES_DATA } from '../data/servicesData';

const STORAGE_KEY = 'equilibra_user_reviews';

export const TestimonialsSection: React.FC = () => {
  // Load community reviews from localStorage
  const [communityReviews, setCommunityReviews] = useState<TestimonialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const allTestimonials: TestimonialItem[] = [...communityReviews, ...TESTIMONIALS_DATA];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Review submission modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newService, setNewService] = useState(SERVICES_DATA[0].title);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto slide every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying || isReviewModalOpen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isReviewModalOpen, allTestimonials.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + allTestimonials.length) % allTestimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % allTestimonials.length);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim().length < 3) {
      setValidationError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!newReviewText.trim() || newReviewText.trim().length < 15) {
      setValidationError('Tu reseña debe contener al menos 15 caracteres describiendo tu experiencia.');
      return;
    }

    const newTestimonial: TestimonialItem = {
      id: `review_${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Paciente Verificado',
      serviceReceived: newService,
      rating: newRating,
      review: newReviewText.trim(),
      date: 'Reciente',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
    };

    const updated = [newTestimonial, ...communityReviews];
    setCommunityReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsReviewModalOpen(false);
      setNewName('');
      setNewRole('');
      setNewReviewText('');
      setNewRating(5);
      setValidationError(null);
      setCurrentIndex(0); // Jump to newly added review
    }, 1800);
  };

  const currentItem = allTestimonials[currentIndex] || allTestimonials[0];

  return (
    <section id="testimonios" className="py-24 lg:py-32 bg-[#faf9f6] dark:bg-[#0c1017] transition-colors relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 -left-28 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/5 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Historias Reales de Recuperación</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
            Opiniones y Reseñas de Pacientes
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-6">
            La confianza de quienes han transformado su dolor en movimiento y bienestar pleno en nuestro centro en Sabana Grande.
          </p>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Dejar mi Opinión / Reseña</span>
          </button>
        </div>

        {/* Carousel Featured Card with Slide Animation */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative bg-white dark:bg-[#131924] rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/30 overflow-hidden"
              >
                {/* Floating Big Watermark Quote */}
                <Quote className="absolute right-6 -bottom-6 w-32 h-32 sm:w-44 sm:h-44 text-amber-500/10 dark:text-amber-400/5 pointer-events-none -rotate-12" />

                <div className="relative z-10">
                  {/* Top Bar: Stars + Rating Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      {[...Array(currentItem.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm"
                        />
                      ))}
                      <span className="ml-2 text-xs font-black text-amber-600 dark:text-amber-400">
                        {currentItem.rating}.0 / 5.0
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                      {currentItem.serviceReceived}
                    </span>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-lg sm:text-2xl text-slate-800 dark:text-slate-100 font-medium leading-relaxed mb-8 italic">
                    “{currentItem.review}”
                  </blockquote>

                  {/* Author Details & Progress */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-100 dark:bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-amber-700 font-bold">
                        {currentItem.avatar ? (
                          <img
                            src={currentItem.avatar}
                            alt={currentItem.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                          {currentItem.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {currentItem.role} · <span className="text-amber-600 dark:text-amber-400 font-semibold">{currentItem.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Paciente Verificado</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="flex items-center gap-2">
                {allTestimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      currentIndex === idx
                        ? 'w-8 bg-amber-500'
                        : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                    aria-label={`Ir a reseña ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-sm"
                  aria-label="Reseña anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-sm"
                  aria-label="Reseña siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate Ratings Banner */}
        <div className="p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-700/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl font-heading shadow-md">
              4.9
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                Puntuación promedio basada en más de 120 testimonios verificados de pacientes en Caracas.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all shadow-sm shrink-0"
          >
            Escribir Mi Testimonio
          </button>
        </div>
      </div>

      {/* Modal: Enviar Nueva Reseña */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                      Comparte tu Experiencia
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tu testimonio ayuda a otros pacientes a tomar la mejor decisión de salud
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                    ¡Muchas gracias por tu reseña!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Tu opinión ha sido añadida con éxito a la lista de testimonios de EQUILIBRA.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                  {validationError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                      {validationError}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Calificación General:
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setNewRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              (hoverRating !== null ? hoverRating >= star : newRating >= star)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                        {hoverRating || newRating} de 5 estrellas
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tu Nombre:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Valeria Mendoza"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ocupación / Motivo:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Maratonista / Paciente Traumatología"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Servicio Recibido:
                    </label>
                    <select
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {SERVICES_DATA.map((srv) => (
                        <option key={srv.id} value={srv.title}>
                          {srv.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tu Reseña / Opinión:
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Cuéntanos cómo fue tu proceso de rehabilitación, la atención recibida y tus resultados..."
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publicar Reseña</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
