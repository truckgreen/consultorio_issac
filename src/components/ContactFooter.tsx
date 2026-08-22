import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Clock, Calendar, Mail, Activity, ArrowUp, ShieldCheck } from 'lucide-react';
import { CLINIC_INFO } from '../data/featuresData';
import { APP_IMAGES } from '../data/images';

interface ContactFooterProps {
  onOpenBooking: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({ onOpenBooking }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contacto" className="relative bg-slate-900 text-white pt-20 pb-12 overflow-hidden">
      
      {/* Top CTA Banner matching the flyer ("Reserva tu cita ¡Ahora!") */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 p-8 sm:p-12 text-slate-950 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/15 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-3">
              Atención Inmediata
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-heading">
              Reserva tu cita ¡Ahora!
            </h2>
            <p className="text-sm sm:text-base font-medium text-slate-900/90 mt-2">
              Comienza tu proceso de rehabilitación activa, fisioterapia o entrenamiento en Sabana Grande, Caracas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white bg-slate-950 hover:bg-slate-900 active:scale-95 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Agendar en Línea</span>
            </button>

            <a
              href={`tel:${CLINIC_INFO.phoneRaw}`}
              className="w-full sm:w-auto px-6 py-4 text-base font-bold text-slate-950 bg-white/70 hover:bg-white active:scale-95 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-slate-950/20"
            >
              <Phone className="w-5 h-5" />
              <span>{CLINIC_INFO.phoneDisplay}</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main Footer Information Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-slate-800">
          
          {/* Brand Info & Address (Col 1-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 shadow-md">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-widest uppercase font-heading text-white">
                  {CLINIC_INFO.name}
                </span>
                <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase -mt-1">
                  Centro de Fisioterapia & Bienestar
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              “{CLINIC_INFO.motto}”
            </p>

            {/* Address box from flyer */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                  Ubicación de la Clínica:
                </h4>
                <p className="text-sm text-slate-300 leading-snug">
                  {CLINIC_INFO.address.country}, {CLINIC_INFO.address.city}, {CLINIC_INFO.address.zone}, {CLINIC_INFO.address.building}, {CLINIC_INFO.address.floor}.
                </p>
              </div>
            </div>

            {/* Direct Phone */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Teléfono de Citas:</div>
                  <div className="text-base font-bold text-white">{CLINIC_INFO.phoneDisplay}</div>
                </div>
              </div>
              <a
                href={`tel:${CLINIC_INFO.phoneRaw}`}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-full transition-colors"
              >
                Llamar
              </a>
            </div>
          </div>

          {/* Opening Hours matching the flyer (Col 6-9) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Clock className="w-4 h-4" />
              <span>Horario de nuestro centro</span>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 space-y-2.5">
              {CLINIC_INFO.hours.map((h, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-slate-700/50 last:border-0"
                >
                  <span className="text-slate-300 font-medium">{h.day}:</span>
                  <span className="text-amber-300 font-bold">{h.time}</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-400 italic">
              * Atención previa cita programada para garantizar tu espacio individual.
            </div>
          </div>

          {/* Quick Navigation & Facilities (Col 10-12) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Enlaces Directos
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href="#inicio" className="hover:text-amber-400 transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#sobre-nosotros" className="hover:text-amber-400 transition-colors">Sobre Nosotros</a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-amber-400 transition-colors">Nuestros Servicios</a>
              </li>
              <li>
                <a href="#especialidades" className="hover:text-amber-400 transition-colors">Especialidades</a>
              </li>
              <li>
                <a href="#por-que-nosotros" className="hover:text-amber-400 transition-colors">Por Qué Elegirnos</a>
              </li>
              <li>
                <a href="#testimonios" className="hover:text-amber-400 transition-colors">Testimonios de Pacientes</a>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md"
              >
                Agendar Cita
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright and back-to-top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} EQUILIBRA C.A. Todos los derechos reservados. Sabana Grande, Caracas, Venezuela.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
