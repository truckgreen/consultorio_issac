import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Download, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Send,
  Bot,
  BellRing
} from 'lucide-react';
import { SupabaseConfig, TelegramConfig } from '../../types';
import { 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  testConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../../lib/supabase';
import { 
  getStoredTelegramConfig, 
  saveTelegramConfig, 
  testTelegramNotification 
} from '../../utils/telegramBot';

interface SettingsViewProps {
  supabaseConfig: SupabaseConfig;
  onConfigUpdated: () => void;
  onLoadDemoData: () => void;
  onExportCsv: () => void;
  onExportJsonBackup: () => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  supabaseConfig,
  onConfigUpdated,
  onLoadDemoData,
  onExportCsv,
  onExportJsonBackup,
  onClearData,
}) => {
  // Supabase state
  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Telegram Bot state
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(getStoredTelegramConfig());
  const [telegramToken, setTelegramToken] = useState(telegramConfig.botToken || '');
  const [telegramChatId, setTelegramChatId] = useState(telegramConfig.chatId || '');
  const [telegramEnabled, setTelegramEnabled] = useState(telegramConfig.enabled ?? true);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [telegramSaveSuccess, setTelegramSaveSuccess] = useState(false);

  useEffect(() => {
    const cfg = getStoredTelegramConfig();
    setTelegramConfig(cfg);
    setTelegramToken(cfg.botToken || '');
    setTelegramChatId(cfg.chatId || '');
    setTelegramEnabled(cfg.enabled ?? true);
  }, []);

  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testConnection(url, anonKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = saveSupabaseCredentials(url, anonKey);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onConfigUpdated();
    }
  };

  const handleClearSupabase = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigUpdated();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveTelegramConfig({
      botToken: telegramToken.trim(),
      chatId: telegramChatId.trim(),
      enabled: telegramEnabled,
      notifyOnBooking: true,
      notifyOnCancellation: true,
    });
    setTelegramConfig(updated);
    setTelegramSaveSuccess(true);
    setTimeout(() => setTelegramSaveSuccess(false), 3000);
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramTestResult(null);
    const res = await testTelegramNotification(telegramToken, telegramChatId);
    setTelegramTestResult(res);
    setIsTestingTelegram(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-amber-500" />
          <span>Configuración del Sistema, Telegram Bot & Supabase Cloud</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Notificaciones de Telegram en tiempo real, base de datos en la nube y respaldos clínicos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Telegram Bot & Supabase Cloud Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Telegram Bot Notification Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Bot de Telegram para Notificaciones en Tiempo Real</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                      En Vivo
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Envía al instante todos los datos del paciente (nombre, apellido, teléfono, qué reservó si evaluación/sesión/paquete, especialista y horario).
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                telegramConfig.botToken && telegramConfig.chatId && telegramConfig.enabled
                  ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-300'
              }`}>
                {telegramConfig.botToken && telegramConfig.chatId && telegramConfig.enabled ? '● Bot Activo' : '● Sin Configurar'}
              </span>
            </div>

            <form onSubmit={handleSaveTelegram} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-slate-900 dark:text-white">Alertas automáticas de nuevas reservas</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={telegramEnabled} 
                      onChange={(e) => setTelegramEnabled(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cada vez que un paciente agende una cita desde la web o el panel, el bot emitirá un reporte detallado con sus datos de contacto y detalles de la cita.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Telegram Bot Token:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Obtenido en @BotFather</span>
                  </label>
                  <input
                    type="text"
                    placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Chat ID / Canal ID:</span>
                    <span className="text-[10px] text-slate-400 font-normal">ID de usuario o grupo (@userinfobot)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: -100123456789 o 987654321"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {telegramTestResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  telegramTestResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-700 dark:text-rose-300'
                }`}>
                  {telegramTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{telegramTestResult.message}</span>
                </div>
              )}

              {telegramSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Configuración de Telegram guardada y activa!</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Guardar Configuración Telegram</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={isTestingTelegram || !telegramToken || !telegramChatId}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isTestingTelegram ? 'Enviando prueba...' : '🧪 Probar Bot (Enviar Mensaje de Prueba)'}
                </button>
              </div>
            </form>
          </div>

          {/* Supabase Cloud Connection */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Conexión a Base de Datos Supabase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sincronización en la nube para citas, pacientes y mensajes
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
              }`}>
                {supabaseConfig.isConnected ? '● Conectado a la Nube' : '● Modo Híbrido'}
              </span>
            </div>

            <form onSubmit={handleSaveSupabase} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Supabase Project URL:
                </label>
                <input
                  type="url"
                  placeholder="https://tu-proyecto.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Supabase Anon Key:
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-700 dark:text-rose-300'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Credenciales guardadas y aplicadas con éxito!</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-colors"
                >
                  Guardar Credenciales Supabase
                </button>

                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTesting || !url || !anonKey}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {isTesting ? 'Probando...' : 'Probar Conexión'}
                </button>

                {supabaseConfig.source === 'custom' && (
                  <button
                    type="button"
                    onClick={handleClearSupabase}
                    className="px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition-colors ml-auto"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* SQL Schema helper */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Script SQL para Supabase (Tablas de Citas, Pacientes y Mensajes)
              </h3>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
                <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

        </div>

        {/* Right Col: Clinic Details & Data Operations */}
        <div className="space-y-6">
          
          {/* Sede Physical Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Sede Física EQUILIBRA</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Centro Profesional del Este, Piso 4, Ofic 46. Sabana Grande, Caracas.</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Lun a Vie: 8:00 AM - 7:00 PM | Sáb: 8:00 AM - 2:00 PM</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+58 414 239.88.99 / +58 212 762.11.44</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>administracion@equilibra.com.ve</span>
              </div>
            </div>
          </div>

          {/* Backup & Demo Data Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Gestión de Datos & Respaldos
            </h3>

            <div className="space-y-2">
              <button
                onClick={onLoadDemoData}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-between transition-colors border border-amber-200 dark:border-amber-900/50"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                  <span>Cargar Datos Demo de la Clínica</span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">7 citas</span>
              </button>

              <button
                onClick={onExportCsv}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Descargar Reporte CSV de Citas</span>
              </button>

              <button
                onClick={onExportJsonBackup}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Exportar Copia JSON de Seguridad</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de limpiar la base de datos local? Esto borrará citas y mensajes guardados localmente.')) {
                    onClearData();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Restablecer Registros Locales</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
