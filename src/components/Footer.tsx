import React from 'react';
import { 
  Activity, 
  MapPin, 
  Phone, 
  Clock, 
  Lock, 
  ShieldCheck,
  DollarSign,
  Play
} from 'lucide-react';

interface FooterProps {
  onOpenMobileApp: () => void;
  onOpenClinicalPortal: () => void;
  onBookAppointment: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenMobileApp,
  onOpenClinicalPortal,
  onBookAppointment
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-slate-800">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-widest text-xl text-white font-display uppercase">
                  EQUILIBRA
                </span>
                <span className="text-[10px] tracking-wider text-slate-400 uppercase font-medium">
                  Centro de Bienestar Físico
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-indigo-500 pl-3 py-1">
              “El lugar donde la mente, el cuerpo y el movimiento encuentran su equilibrio.”
            </p>

            <p className="text-xs text-slate-400 leading-relaxed">
              Combinamos fisioterapia basada en evidencia, traumatología, psicología clínica, 
              nutrición de precisión y entrenamiento activo en un ecosistema integrado de salud.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Caracas, Venezuela
              </span>
            </div>
          </div>

          {/* Col 2: Services Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Disciplinas & Servicios
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#servicios" className="hover:text-white transition-colors">Fisioterapia General & Avanzada</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Fisioterapia Deportiva & Readaptación</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Fisioterapia Pediátrica & Geriátrica</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Traumatología & Infiltraciones</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Salud Mental & Manejo del Estrés</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Nutrición Clínica & Deportiva</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Entrenamiento Funcional & Boxeo</a></li>
            </ul>
          </div>

          {/* Col 3: Information & Prices */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Información & Tarifas
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#tarifas" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tarifas y Precios</span>
                </a>
              </li>
              <li>
                <a href="#tarifas" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors">
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Videos Explicativos</span>
                </a>
              </li>
              <li>
                <button
                  onClick={onBookAppointment}
                  className="text-left text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Reservas en Línea
                </button>
              </li>
              <li>
                <a href="#testimonios" className="hover:text-white transition-colors">
                  Casos de Pacientes
                </a>
              </li>
              <li>
                <a href="#metodo" className="hover:text-white transition-colors">
                  Abordaje 360°
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Contact Direct */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Ubicación & Atención
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Sabana Grande, Centro Profesional del Este, piso 4, of. 46 · Caracas</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <a href="tel:+584127471858" className="hover:text-white font-medium">
                  +58.412.747.18.58
                </a>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Lun a Vie: 8:00 AM a 7:00 PM<br />Sábados: 8:30 AM a 2:00 PM</span>
              </div>

              {/* Internal Administration Access */}
              <div className="pt-3">
                <button
                  onClick={onOpenMobileApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Acceso Administradores (Staff)</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} <strong className="text-white">EQUILIBRA</strong>. Centro de Bienestar Físico y Rehabilitación Integral.
          </div>

          <div className="flex items-center gap-6">
            <span>Privacidad de Datos Médicos</span>
            <span>Términos de Servicio</span>
            <span className="text-indigo-400">Caracas, VE</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
