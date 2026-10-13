import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Brain,
  Dumbbell,
  HeartPulse,
  Cross,
  Apple,
  Sparkles,
  Move,
  ClipboardCheck,
  RotateCcw,
  DoorOpen,
  Stethoscope,
  Armchair,
  Shirt,
  UserCheck,
  Accessibility,
  Droplet,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Wifi,
  Info,
  TrendingUp,
  Layers,
  Shapes,
} from 'lucide-react';

interface GraphicItem {
  id: string;
  num: string;
  name: string;
  category: 'especialidades' | 'areas' | 'digital';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const BrandGraphicElements: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'todos' | 'especialidades' | 'areas' | 'digital'>('todos');

  const items: GraphicItem[] = [
    // Especialidades (01 - 10)
    { id: 'esp-01', num: '01', name: 'Fisioterapia', category: 'especialidades', icon: Activity, description: 'Rehabilitación y alineación biomecánica activa' },
    { id: 'esp-02', num: '02', name: 'Psicología', category: 'especialidades', icon: Brain, description: 'Salud mental y modulación del dolor' },
    { id: 'esp-03', num: '03', name: 'Gimnasio', category: 'especialidades', icon: Dumbbell, description: 'Acondicionamiento y fuerza funcional' },
    { id: 'esp-04', num: '04', name: 'Rehabilitación', category: 'especialidades', icon: HeartPulse, description: 'Readaptación neuromuscular y deportiva' },
    { id: 'esp-05', num: '05', name: 'Medicina Deportiva', category: 'especialidades', icon: Cross, description: 'Valoración traumatológica y médica integral' },
    { id: 'esp-06', num: '06', name: 'Nutrición', category: 'especialidades', icon: Apple, description: 'Planes nutricionales antiinflamatorios' },
    { id: 'esp-07', num: '07', name: 'Masoterapia', category: 'especialidades', icon: Sparkles, description: 'Terapia miofascial y descarga muscular profunda' },
    { id: 'esp-08', num: '08', name: 'Movilidad', category: 'especialidades', icon: Move, description: 'Rango de movimiento y flexibilidad articular' },
    { id: 'esp-09', num: '09', name: 'Evaluación Funcional', category: 'especialidades', icon: ClipboardCheck, description: 'Pruebas biomecánicas y diagnóstico 1 a 1' },
    { id: 'esp-10', num: '10', name: 'Recuperación', category: 'especialidades', icon: RotateCcw, description: 'Descanso activo y retorno progresivo' },

    // Áreas (11 - 17)
    { id: 'area-11', num: '11', name: 'Recepción', category: 'areas', icon: DoorOpen, description: 'Bienvenida personalizada y orientación clínica' },
    { id: 'area-12', num: '12', name: 'Consultorio', category: 'areas', icon: Stethoscope, description: 'Espacio privado de diagnóstico y exploración' },
    { id: 'area-13', num: '13', name: 'Sala de Espera', category: 'areas', icon: Armchair, description: 'Ambiente acústico sereno y relajante' },
    { id: 'area-14', num: '14', name: 'Vestuario', category: 'areas', icon: Shirt, description: 'Comodidad, casilleros e higiene privada' },
    { id: 'area-15', num: '15', name: 'Baños', category: 'areas', icon: UserCheck, description: 'Instalaciones sanitarias de estándar premium' },
    { id: 'area-16', num: '16', name: 'Accesibilidad', category: 'areas', icon: Accessibility, description: 'Acceso universal y rampas adaptadas' },
    { id: 'area-17', num: '17', name: 'Hidratación', category: 'areas', icon: Droplet, description: 'Puntos de agua fresca y reposición electrolítica' },

    // Indicadores Digitales (18 - 24)
    { id: 'dig-18', num: '18', name: 'Citas', category: 'digital', icon: Calendar, description: 'Reserva digital 24/7 con confirmación automática' },
    { id: 'dig-19', num: '19', name: 'Horarios', category: 'digital', icon: Clock, description: 'Atención continua de lunes a sábado' },
    { id: 'dig-20', num: '20', name: 'Ubicación', category: 'digital', icon: MapPin, description: 'Centro Profesional del Este, Sabana Grande' },
    { id: 'dig-21', num: '21', name: 'Contacto', category: 'digital', icon: Phone, description: 'Canal directo telefónico y WhatsApp' },
    { id: 'dig-22', num: '22', name: 'Wi-Fi', category: 'digital', icon: Wifi, description: 'Conectividad de alta velocidad en sede' },
    { id: 'dig-23', num: '23', name: 'Información', category: 'digital', icon: Info, description: 'Portal del paciente y expedientes clínicos' },
    { id: 'dig-24', num: '24', name: 'Progreso', category: 'digital', icon: TrendingUp, description: 'Métricas de evolución y metas cumplidas' },
  ];

  const filteredItems = activeTab === 'todos' ? items : items.filter((i) => i.category === activeTab);

  return (
    <div className="mt-16 pt-16 border-t border-[#D1CEC9]/60 dark:border-slate-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B1A086]/15 text-[#B1A086] text-xs font-bold uppercase tracking-widest mb-3">
            <Shapes className="w-3.5 h-3.5" />
            <span>Sistema Gráfico Institucional (Página 17)</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F2EFE8] font-heading">
            Iconografía y Elementos de Orientación
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#B5B0A6] mt-1 max-w-2xl">
            Una familia visual clínica, humana y activa diseñada para orientar cada punto de contacto físico y digital de EQUILIBRA.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#141414] border border-[#D1CEC9]/80 dark:border-slate-800 shadow-sm overflow-x-auto w-full md:w-auto">
          {[
            { id: 'todos', label: 'Todos (24)' },
            { id: 'especialidades', label: 'Especialidades (01-10)' },
            { id: 'areas', label: 'Áreas (11-17)' },
            { id: 'digital', label: 'Digitales (18-24)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#B1A086] text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Graphic Elements */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {filteredItems.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (idx % 12) * 0.04 }}
              className="p-4 rounded-2xl bg-white dark:bg-[#141414] border border-[#D1CEC9]/60 dark:border-slate-800 shadow-sm hover:border-[#B1A086] hover:shadow-md transition-all flex flex-col items-center text-center group cursor-default"
            >
              {/* Icon Container with subtle rounded aesthetic */}
              <div className="relative w-12 h-12 rounded-xl bg-[#FAF9F7] dark:bg-[#0C0C0C] border border-[#D1CEC9]/60 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-[#F2EFE8] group-hover:text-[#B1A086] group-hover:border-[#B1A086]/50 transition-colors mb-3">
                <IconComponent className="w-6 h-6 stroke-[1.8]" />
              </div>

              {/* Number and Name */}
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F2EFE8] leading-tight mb-1 font-heading group-hover:text-[#B1A086] transition-colors">
                {item.name}
              </h4>
              <span className="text-[10px] font-mono text-[#B1A086] font-bold">
                {item.num}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-[#8E8A82] mt-1.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
