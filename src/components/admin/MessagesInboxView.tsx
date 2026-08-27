import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  ExternalLink, 
  Reply, 
  ShieldCheck, 
  Archive 
} from 'lucide-react';
import { ContactMessage } from '../../types';

interface MessagesInboxViewProps {
  messages: ContactMessage[];
  onUpdateStatus: (id: string, status: 'NUEVO' | 'RESPONDIDO' | 'ARCHIVADO', adminNotes?: string) => void;
  onDeleteMessage: (id: string) => void;
}

export const MessagesInboxView: React.FC<MessagesInboxViewProps> = ({
  messages,
  onUpdateStatus,
  onDeleteMessage,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'NUEVO' | 'RESPONDIDO' | 'ARCHIVADO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = messages.filter(m => {
    if (filter !== 'ALL' && m.status !== filter) return false;
    const search = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search) ||
      (m.phone && m.phone.includes(search)) ||
      (m.subject && m.subject.toLowerCase().includes(search)) ||
      m.message.toLowerCase().includes(search)
    );
  });

  const handleWhatsApp = (m: ContactMessage) => {
    if (!m.phone) return;
    const clean = m.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hola ${m.name}, te escribimos de EQUILIBRA (Sabana Grande, Caracas) en respuesta a tu consulta sobre "${m.subject || 'nuestros servicios'}": "${m.message.slice(0, 80)}...". ¿Cómo podemos ayudarte?`
    );
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
    onUpdateStatus(m.id, 'RESPONDIDO');
  };

  const handleEmail = (m: ContactMessage) => {
    const subject = encodeURIComponent(`Respuesta a tu consulta en EQUILIBRA: ${m.subject || 'Información de servicios'}`);
    const body = encodeURIComponent(`Hola ${m.name},\n\nGracias por comunicarte con el Centro Clínico EQUILIBRA en Caracas.\n\nRespecto a tu consulta:\n"${m.message}"\n\n`);
    window.open(`mailto:${m.email}?subject=${subject}&body=${body}`, '_blank');
    onUpdateStatus(m.id, 'RESPONDIDO');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-500" />
            <span>Consultas Web & Mensajes de Pacientes</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bandeja de entrada con solicitudes enviadas desde la página web de EQUILIBRA
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'NUEVO', label: 'Nuevos' },
            { id: 'RESPONDIDO', label: 'Respondidos' },
            { id: 'ARCHIVADO', label: 'Archivados' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en mensajes por remitente, teléfono, asunto o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500">No hay mensajes en esta categoría.</p>
          </div>
        ) : (
          filteredMessages.map(msg => (
            <div
              key={msg.id}
              className={`p-5 rounded-3xl border transition-all space-y-3 ${
                msg.status === 'NUEVO'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    msg.status === 'NUEVO' ? 'bg-rose-500 animate-pulse' : msg.status === 'RESPONDIDO' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {msg.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    msg.status === 'NUEVO'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : msg.status === 'RESPONDIDO'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}>
                    {msg.status || 'NUEVO'}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(msg.created_at).toLocaleString('es-VE')}
                </span>
              </div>

              {/* Subject & Message body */}
              <div className="space-y-1">
                {msg.subject && (
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Asunto: {msg.subject}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  {msg.message}
                </p>
              </div>

              {/* Admin Notes if any */}
              {msg.adminNotes && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
                  <strong className="block font-bold">Nota de Recepción:</strong>
                  {msg.adminNotes}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {msg.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {msg.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {msg.email}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {msg.phone && (
                    <button
                      onClick={() => handleWhatsApp(msg)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleEmail(msg)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(msg.id, msg.status === 'ARCHIVADO' ? 'RESPONDIDO' : 'ARCHIVADO')}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Archivar"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este mensaje?')) onDeleteMessage(msg.id);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
