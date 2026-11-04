import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  ShieldCheck,
  Bot,
  Activity,
  HeartPulse,
  Users,
  Award,
  Star,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { CLINIC_INFO } from '../data/featuresData';
import { SERVICES_DATA } from '../data/servicesData';
import { Hero } from './Hero';

export type AppView = 'inicio' | 'servicios' | 'triage' | 'equipo' | 'citas' | 'testimonios' | 'contacto';

interface HomeViewProps {
  onNavigateView: (view: AppView) => void;
  onOpenBooking: (serviceId?: string) => void;
  onOpenGeminiBot: (initialPrompt?: string) => void;
  onSelectService: (service: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateView,
  onOpenBooking,
  onOpenGeminiBot,
  onSelectService,
}) => {
  // Top 4 highlighted services for quick access
  const highlightedServices = SERVICES_DATA.slice(0, 4);

  // Quick navigation categories
  const navigationHub = [
    {
      id: 'servicios' as AppView,
      title: 'Servicios & Especialidades',
      tagline: 'Fisioterapia deportiva, traumatología y rehabilitación',
      icon: Stethoscope,
      badge: '8 Especialidades',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
      description: 'Programas de rehabilitación biomecánica, punción seca, readaptación para deportistas y fisioterapia geriátrica.',
      gradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
      borderColor: 'group-hover:border-[#B1A086]',
    },
    {
      id: 'triage' as AppView,
      title: 'Orientación Clínica & Triage',
      tagline: 'Autoevaluación interactiva con mapa de dolor',
      icon: Activity,
      badge: 'Herramienta Interactiva',
      badgeColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
      description: 'Identifica la posible causa de tu dolor y descubre qué especialista y tipo de terapia necesitas antes de acudir.',
      gradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
      borderColor: 'group-hover:border-emerald-500/60',
    },
    {
      id: 'citas' as AppView,
      title: 'Citas Online Directas',
      tagline: 'Reserva tu horario sin llamadas ni esperas',
      icon: Calendar,
      badge: 'Confirmación Inmediata',
      badgeColor: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300',
      description: 'Elige tu especialista, fecha, hora y paquete. Recibirás comprobante oficial con código QR y recordatorio por WhatsApp y correo.',
      gradient: 'from-indigo-500/10 via-indigo-400/5 to-transparent',
      borderColor: 'group-hover:border-indigo-500/60',
    },
    {
      id: 'equipo' as AppView,
      title: 'Equipo Médico & Filosofía',
      tagline: 'Un refugio, no una sala de espera',
      icon: Users,
      badge: 'Atención 1 a 1',
      badgeColor: 'bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300',
      description: 'Fisioterapeutas colegiados con dedicación exclusiva. Cero máquinas desatendidas o rotación masiva de pacientes.',
      gradient: 'from-teal-500/10 via-teal-400/5 to-transparent',
      borderColor: 'group-hover:border-teal-500/60',
    },
    {
      id: 'testimonios' as AppView,
      title: 'Reseñas & Casos de Éxito',
      tagline: 'Calificación 5.0 en Google Business',
      icon: Star,
      badge: '+1,200 Pacientes',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
      description: 'Conoce los testimonios reales de atletas, pacientes postoperados y adultos mayores que recuperaron su movilidad con nosotros.',
      gradient: 'from-yellow-500/10 via-yellow-400/5 to-transparent',
      borderColor: 'group-hover:border-yellow-500/60',
    },
    {
      id: 'contacto' as AppView,
      title: 'Ubicación & Contacto Directo',
      tagline: 'Sabana Grande, Caracas · Tel: 0424-2724617',
      icon: MapPin,
      badge: 'Fácil Acceso',
      badgeColor: 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
      description: 'A pocos pasos del Metro de Sabana Grande. Horarios continuos de Lunes a Sábado, estacionamiento cercano y atención directa.',
      gradient: 'from-rose-500/10 via-rose-400/5 to-transparent',
      borderColor: 'group-hover:border-rose-500/60',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. Hero Section with Cinematic Identity */}
      <Hero onOpenBooking={() => onOpenBooking()} />

      {/* 2. Interactive AI Gemini Assistant Spotlight Banner */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C0C0C] via-[#1a1714] to-[#0C0C0C] text-[#F2EFE8] p-6 sm:p-8 lg:p-10 border border-[#B1A086]/40 shadow-2xl shadow-black/30"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#B1A086]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>Nuevo · Asistente Clínico con Gemini 3.8 Flash</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight text-white">
                ¿Tienes dudas sobre tu molestia o qué especialista necesitas?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Pregúntale a <strong className="text-amber-300 font-semibold">EquilibraBot</strong> en lenguaje natural. Recibe orientación inmediata sobre síntomas, servicios recomendados, preparación previa y cómo agendar tu evaluación presencial en Sabana Grande.
              </p>

              {/* Sample Prompt Pills */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenGeminiBot('Tengo dolor en la zona lumbar al levantarme, ¿qué terapia me recomiendan?')}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 hover:border-amber-400/50 transition-all text-left"
                >
                  💬 "¿Qué hacer para dolor lumbar matutino?"
                </button>
                <button
                  type="button"
                  onClick={() => onOpenGeminiBot('¿Atienden roturas de meniscos y rehabilitación deportiva para corredores?')}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 hover:border-amber-400/50 transition-all text-left"
                >
                  💬 "Rehabilitación para corredores y rodilla"
                </button>
                <button
                  type="button"
                  onClick={() => onOpenGeminiBot('¿Cuáles son los horarios y precios de las sesiones en Sabana Grande?')}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 hover:border-amber-400/50 transition-all text-left"
                >
                  💬 "Horarios y ubicación en Sabana Grande"
                </button>
              </div>
            </div>

            {/* Right Action */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-stretch lg:items-end">
              <button
                type="button"
                onClick={() => onOpenGeminiBot()}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/25 transition-all hover:scale-[1.02] active:scale-98 group btn-glow-amber"
              >
                <Bot className="w-5 h-5 text-slate-950" />
                <span>Hablar con el Asistente IA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateView('triage')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/20 hover:border-white/30 transition-all"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Abrir Triage Clínico Interactivo</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Intuitive View Explorer / Hub Cards */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-black tracking-widest text-[#B1A086] uppercase">
            Navegación Intuitiva de la Clínica
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-slate-950 dark:text-white mt-2 tracking-tight">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            Hemos organizado nuestra plataforma en vistas claras y especializadas para que encuentres tu tratamiento, conozcas a los médicos o reserves tu horario con total comodidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationHub.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => onNavigateView(item.id)}
                className={`group relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${item.borderColor}`}
              >
                {/* Background accent subtle gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0C0C0C] dark:bg-[#202020] text-[#B1A086] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#B1A086] group-hover:text-slate-950 transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black font-heading text-slate-950 dark:text-white group-hover:text-[#B1A086] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#B1A086] mt-0.5">
                    {item.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-[#B1A086]">
                  <span>Explorar esta vista</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-[#B1A086] group-hover:text-slate-950 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Three Differential Pillars of EQUILIBRA */}
      <section className="py-16 bg-[#EBE7DF]/60 dark:bg-[#0E0E0E] border-y border-[#D1CEC9]/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-black tracking-widest text-[#B1A086] uppercase">
                Filosofía de Atención
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-950 dark:text-white leading-tight">
                Un modelo clínico diseñado para tu recuperación real
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                En muchos centros tradicionales, un solo terapeuta vigila 6 personas a la vez con aparatos pasivos. En EQUILIBRA rompimos ese esquema para crear un espacio terapéutico donde cada minuto cuenta.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateView('equipo')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-amber-300 hover:text-[#B1A086] transition-colors"
                >
                  <span>Conoce más sobre nuestra filosofía y equipo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3">
                  1:1
                </div>
                <h4 className="font-bold text-base text-slate-950 dark:text-white">
                  Atención 1 a 1 Exclusiva
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Tu fisioterapeuta está contigo el 100% del tiempo de la sesión aplicando terapia manual y corrigiendo biomecánica.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-slate-950 dark:text-white">
                  Basado en Evidencia Científica
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Protocolos médicos actualizados, pruebas diagnósticas funcionales y readaptación física con objetivos medibles.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-400/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-slate-950 dark:text-white">
                  Expediente Clínico Digital
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Monitoreo de tus arcos de movilidad, dolor y evolución sesión a sesión accesible con tu código de paciente.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-teal-400/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-slate-950 dark:text-white">
                  Puntualidad Absoluta
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Agendamos por bloques estrictos de 45 a 60 minutos. Llegas a tu hora y tu camilla y especialista están listos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Highlighted Services Preview with Direct Actions */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs sm:text-sm font-black tracking-widest text-[#B1A086] uppercase">
              Especialidades Más Solicitadas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-950 dark:text-white mt-1">
              Tratamientos Destacados
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigateView('servicios')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs sm:text-sm font-bold hover:bg-[#B1A086] dark:hover:bg-[#B1A086] transition-colors"
          >
            <span>Ver Catálogo Completo (8 Servicios)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlightedServices.map((service) => (
            <div
              key={service.id}
              className="rounded-3xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#B1A086]">
                  {service.category}
                </span>
                <h3 className="font-bold text-base text-slate-950 dark:text-white mt-1">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {service.shortDescription}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>⏱️ {service.duration}</span>
                  <span className="text-[#B1A086] font-bold">{service.priceFormatted || `${service.price} USD`}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectService(service)}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  Detalles
                </button>
                <button
                  type="button"
                  onClick={() => onOpenBooking(service.id)}
                  className="flex-1 py-2 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-xs"
                >
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Quick Direct Contact Bar */}
      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0C0C0C] to-[#1F1E1B] text-[#F2EFE8] border border-[#B1A086]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
              Atención Telefónica & Presencial
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
              ¿Prefieres consultar o agendar por llamada directa?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Teléfono oficial del consultorio:{' '}
              <strong className="text-white font-bold tracking-wider">0424-2724617</strong> · Sabana Grande, Caracas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:04242724617"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>0424-2724617</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Online</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
