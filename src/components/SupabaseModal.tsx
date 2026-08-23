import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Key, 
  Globe, 
  Loader2, 
  Sparkles,
  Code2,
  Trash2
} from 'lucide-react';
import { SupabaseConfig } from '../types';
import { 
  testConnection, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onConfigUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor ingresa la URL y el Anon Key de tu proyecto Supabase.' });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    const res = await testConnection(url.trim(), anonKey.trim());
    setIsTesting(false);

    if (res.success) {
      saveSupabaseCredentials(url, anonKey);
      setStatusMessage({ type: 'success', text: res.message });
      onConfigUpdated();
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setStatusMessage({ type: 'info', text: 'Credenciales eliminadas. La app continuará usando almacenamiento local.' });
    onConfigUpdated();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Conexión con Supabase
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  config.isConnected 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {config.isConnected ? 'Conectado' : 'Modo Híbrido / Local'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sincronización en la nube para citas y mensajes de contacto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            Configuración de Credenciales
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'sql'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Script SQL de Tablas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {statusMessage && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 text-amber-800 dark:text-amber-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'config' ? (
            <form onSubmit={handleTestAndSave} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span>Supabase Project URL (Project Settings &gt; API)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Supabase Anon Public Key (Project Settings &gt; API)</span>
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  💡 ¿Cómo funciona la sincronización?
                </p>
                <p>• Las citas y mensajes se envían directamente a tu base de datos Supabase.</p>
                <p>• Si no estás conectado o estás sin internet, la aplicación guarda todas las citas localmente en tu navegador sin interrumpir la experiencia.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="flex-1 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando conexión con Supabase...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Probar y Guardar Conexión</span>
                    </>
                  )}
                </button>

                {config.isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Desconectar</span>
                  </button>
                )}
              </div>

            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Ejecuta este código en el <strong>SQL Editor</strong> de Supabase para inicializar las tablas:
                </p>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
