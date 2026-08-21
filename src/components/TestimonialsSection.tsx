import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Testimonial } from '../types';
import { StorageService } from '../services/storageService';
import { 
  Star, 
  Quote, 
  CheckCircle, 
  MessageSquarePlus, 
  X, 
  Sparkles,
  Heart
} from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  onTestimonialAdded: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onTestimonialAdded
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Paciente de Fisioterapia',
    treatment: 'Rehabilitación y Terapia Manual',
    comment: '',
    rating: 5
  });
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) return;

    StorageService.addTestimonial({
      name: formData.name,
      role: formData.role,
      treatment: formData.treatment,
      comment: formData.comment,
      rating: Number(formData.rating),
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=200&q=80`
    });

    setSubmittedMessage(true);
    onTestimonialAdded();

    setTimeout(() => {
      setSubmittedMessage(false);
      setIsModalOpen(false);
      setFormData({
        name: '',
        role: 'Paciente de Fisioterapia',
        treatment: 'Rehabilitación y Terapia Manual',
        comment: '',
        rating: 5
      });
    }, 1400);
  };

  return (
    <section id="testimonios" className="py-20 sm:py-28 bg-[#F8FAFC] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200/80">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Historias de Éxito
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
              Comentarios de nuestros clientes
            </h2>
            <p className="text-base text-slate-600">
              Aumentá la credibilidad de los tratamientos al conocer los testimonios reales de nuestros pacientes. 
              Sus experiencias y recuperación hablan por sí solas.
            </p>
          </div>

          <button
            id="btn-add-testimonial"
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
            <span>Dejar mi opinión</span>
          </button>
        </div>

        {/* Testimonials 3-Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((test, idx) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white rounded-3xl p-7 sm:p-8 shadow-xs hover:shadow-xl border border-slate-200 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div className="space-y-4">
                {/* 5 Indigo / Gold Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Treatment Tag */}
                <div className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                  {test.treatment}
                </div>

                {/* Comment Text */}
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  “{test.comment}”
                </p>
              </div>

              {/* Patient Info Footer */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-indigo-600">
                    <img
                      src={test.avatarUrl}
                      alt={test.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback avatar
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      {test.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {test.role}
                    </p>
                  </div>
                </div>

                {test.verified && (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full" title="Paciente con seguimiento clínico en EQUILIBRA">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verificado</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Testimonial Submission Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Tu experiencia cuenta
                </span>
                <h3 className="text-2xl font-bold text-slate-900 font-heading">
                  Compartir mi testimonio
                </h3>
                <p className="text-xs text-slate-500">
                  Ayuda a otras personas a encontrar su camino hacia la recuperación física en EQUILIBRA.
                </p>
              </div>

              {submittedMessage ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Heart className="w-7 h-7 fill-emerald-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">¡Muchas gracias por tu reseña!</h4>
                  <p className="text-xs text-slate-500">Tu testimonio ha sido registrado y publicado con éxito.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Especialidad / Tratamiento
                      </label>
                      <select
                        value={formData.treatment}
                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-white"
                      >
                        <option>Fisioterapia Deportiva</option>
                        <option>Fisioterapia General</option>
                        <option>Fisioterapia Pediátrica</option>
                        <option>Fisioterapia Geriátrica</option>
                        <option>Traumatología & Ortopedia</option>
                        <option>Salud Mental & Psicología</option>
                        <option>Nutrición Clínica</option>
                        <option>Entrenamiento Funcional & Boxeo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Puntuación
                      </label>
                      <div className="flex items-center gap-1 h-10 px-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= formData.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu testimonio / Experiencia *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Cuéntanos cómo fue tu evolución, atención del especialista y resultados..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                    >
                      Publicar testimonio
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
