import React, { useState } from 'react';
import { 
  Tag, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  Layers, 
  ShieldCheck, 
  Search 
} from 'lucide-react';
import { ServiceItem } from '../../types';
import { SERVICES_DATA } from '../../data/servicesData';

export const ServicesPricingView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [servicesList, setServicesList] = useState<ServiceItem[]>(SERVICES_DATA);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const filteredServices = servicesList.filter(s => {
    const search = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(search) ||
      s.category.toLowerCase().includes(search) ||
      s.shortDescription.toLowerCase().includes(search)
    );
  });

  const handleSaveServicePrice = (id: string, newPrice: number, packageOption?: string) => {
    setServicesList(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          price: newPrice,
          priceFormatted: `$${newPrice} USD`,
          packageOption: packageOption ?? s.packageOption
        };
      }
      return s;
    }));
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-amber-500" />
            <span>Catálogo de Servicios & Tarifas Oficiales</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de tarifas en USD, duración por sesión y opciones de paquetes clínicos
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
          {SERVICES_DATA.length} Especialidades Activas
        </span>
      </div>

      {/* Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar especialidad o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors"
          >
            <div className="space-y-3">
              
              {/* Image & Title */}
              <div className="relative h-36 rounded-2xl overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                  {service.category}
                </span>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <h3 className="text-sm font-black text-white truncate">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Price & Duration Badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{service.duration}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {service.priceFormatted || `$${service.price} USD`}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {service.shortDescription}
              </p>

              {/* Package option if any */}
              {service.packageOption && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  <strong className="block font-bold">Opción Paquete:</strong>
                  {service.packageOption}
                </div>
              )}

            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditingService(service)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-500" />
              <span>Ajustar Tarifa / Paquete</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Ajustar Tarifa: {editingService.title}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const price = Number(form.price.value);
                const pkg = form.packageOption.value;
                handleSaveServicePrice(editingService.id, price, pkg);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Precio por Sesión ($ USD):
                </label>
                <input
                  name="price"
                  type="number"
                  defaultValue={editingService.price}
                  required
                  min="5"
                  max="500"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Promoción o Paquete (Opcional):
                </label>
                <textarea
                  name="packageOption"
                  defaultValue={editingService.packageOption || ''}
                  rows={2}
                  placeholder="Ej: Paquete de 5 sesiones con 10% de descuento..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/25 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
