import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  Bot,
  Calendar,
  Phone,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Clock,
  ChevronDown,
} from 'lucide-react';
import {
  getAutonomousClinicalResponse,
  callDirectGeminiApi,
  getStoredGeminiApiKey,
} from '../utils/clinicalBotEngine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isEmergency?: boolean;
}

interface GeminiBotWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenBooking: (serviceId?: string) => void;
}

const QUICK_PROMPTS = [
  '¿Qué especialista necesito para dolor de espalda o cuello?',
  '¿Atienden lesiones de gimnasio y corredores?',
  '¿Cuáles son sus horarios y ubicación en Caracas?',
  '¿Cuánto dura una sesión y cómo es la primera visita?',
  '¿Cómo puedo agendar mi cita en línea?',
];

export const GeminiBotWidget: React.FC<GeminiBotWidgetProps> = ({
  isOpen,
  onOpen,
  onClose,
  onOpenBooking,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `¡Hola! 👋 Soy **EquilibraBot**, tu Asistente Clínico Inteligente de **EQUILIBRA**.

Estoy entrenado para orientarte sobre:
• **¿Qué especialidad o servicio necesitas** para tu molestia o lesión?
• **Horarios, ubicación en Sabana Grande y proceso de cita**.
• **Recomendaciones seguras de autocuidado** mientras acudes a consulta.

¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Handle external prompt events (e.g. from HomeView teaser chips)
  useEffect(() => {
    const handleCustomPrompt = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && typeof customEvent.detail === 'string') {
        handleSendMessage(customEvent.detail);
      }
    };
    window.addEventListener('equilibra_gemini_prompt', handleCustomPrompt);
    return () => window.removeEventListener('equilibra_gemini_prompt', handleCustomPrompt);
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      let replyText = '';
      let isEmergencyFlag = false;

      // 1. Intento primario: Consultar al endpoint backend de Node.js (/api/gemini/chat)
      try {
        const historyPayload = messages
          .filter((m) => m.id !== 'welcome-1')
          .slice(-6)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyPayload,
          }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.success && data.reply) {
            replyText = data.reply;
            isEmergencyFlag = Boolean(data.isEmergency);
          }
        }
      } catch (serverErr) {
        // En servidores estáticos (cPanel, Vercel, Netlify sin backend Node) la ruta /api dará 404 o fetch error
        console.warn('[GeminiWidget] Servidor Node no disponible o hosting estático:', serverErr);
      }

      // 2. Intento secundario: Si no hubo respuesta del servidor, consultar directamente a Google Gemini si hay API Key en .env
      if (!replyText) {
        const directKey = getStoredGeminiApiKey();
        if (directKey) {
          try {
            replyText = await callDirectGeminiApi(directKey, text, messages);
          } catch (directErr) {
            console.warn('[GeminiWidget] Llamada directa a Gemini falló, usando motor clínico autónomo:', directErr);
          }
        }
      }

      // 3. Garantía clínica: Motor Autónomo de Triage de EQUILIBRA (Garantiza respuesta inmediata y precisa 100% offline)
      if (!replyText) {
        const localResult = getAutonomousClinicalResponse(text);
        replyText = localResult.reply;
        isEmergencyFlag = Boolean(localResult.isEmergency);
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: isEmergencyFlag,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (unhandledErr) {
      console.error('[GeminiWidget] Error no controlado:', unhandledErr);
      const safeFallback = getAutonomousClinicalResponse(text);
      const botMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        role: 'model',
        content: safeFallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: Boolean(safeFallback.isEmergency),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Conversación reiniciada. ¿Tienes alguna pregunta sobre tus síntomas, citas o especialidades de EQUILIBRA?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to render basic markdown formatting: bold, bullets, paragraphs
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Empty line -> spacing
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ')) {
        const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1 text-[13px] leading-relaxed">
            <span className="text-[#B1A086] font-bold shrink-0">•</span>
            <span>{parseInlineBold(cleanLine)}</span>
          </div>
        );
      }

      // Numbered items: 1. 2.
      const numberedMatch = line.trim().match(/^(\d+)\.\s*(.+)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1 text-[13px] leading-relaxed">
            <span className="text-[#B1A086] font-bold shrink-0">{numberedMatch[1]}.</span>
            <span>{parseInlineBold(numberedMatch[2])}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="my-1 text-[13px] leading-relaxed">
          {parseInlineBold(line)}
        </p>
      );
    });
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right, stacked cleanly above WhatsApp action to prevent collision) */}
      <div className="fixed bottom-24 right-5 sm:bottom-24 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={onOpen}
                aria-label="Abrir asistente inteligente Gemini"
                className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#0C0C0C] hover:bg-[#1a1a1a] dark:bg-[#181818] dark:hover:bg-[#222] text-[#F2EFE8] rounded-full shadow-2xl border border-[#B1A086]/50 hover:border-[#B1A086] transition-all duration-300 hover:scale-105"
              >
                {/* Glow ring */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#B1A086]/40 via-amber-400/30 to-[#B1A086]/40 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />

                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#B1A086] to-amber-300 text-slate-950 font-bold shadow-sm">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>

                <div className="relative flex flex-col text-left pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-wider uppercase text-amber-300">
                      Asistente Gemini
                    </span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium">
                    Orientación Clínica & Citas
                  </span>
                </div>

                {unreadCount > 0 && (
                  <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {unreadCount}
                  </span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Interactive Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[88vh] h-[640px] flex flex-col bg-[#FAF9F5] dark:bg-[#121212] rounded-3xl shadow-2xl border border-[#B1A086]/30 dark:border-[#B1A086]/20 overflow-hidden font-sans backdrop-blur-xl"
          >
            {/* Window Header */}
            <div className="px-5 py-4 bg-[#0C0C0C] text-[#F2EFE8] flex items-center justify-between border-b border-[#B1A086]/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9E8D74] via-[#B1A086] to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
                  <Bot className="w-5 h-5 text-slate-950" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0C0C0C]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-sm tracking-wide text-white uppercase">
                      EquilibraBot
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B1A086]/25 text-amber-300 border border-[#B1A086]/40">
                      Gemini 3.8 Flash
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Asistente Clínico · En línea 24/7
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reiniciar conversación"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  title="Minimizar ventana"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Context Bar */}
            <div className="px-4 py-2 bg-[#F2EFE8] dark:bg-[#1a1a1a] border-b border-[#D1CEC9]/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#B1A086] shrink-0" />
                <span className="truncate">Sabana Grande, Caracas</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Lun–Vie 7:30am–6pm</span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#FAF9F5] to-[#F2EFE8]/70 dark:from-[#121212] dark:to-[#0C0C0C]">
              {messages.map((msg) => {
                const isBot = msg.role === 'model';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm text-slate-800 dark:text-slate-100 ${
                        isBot
                          ? msg.isEmergency
                            ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                            : 'bg-white dark:bg-[#1C1C1C] border border-[#B1A086]/20 dark:border-slate-800 rounded-tl-sm'
                          : 'bg-[#0C0C0C] dark:bg-[#252525] text-white rounded-tr-sm border border-[#B1A086]/30'
                      }`}
                    >
                      {msg.isEmergency && (
                        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-bold text-xs">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>ALERTA MÉDICA IMPORTANTE</span>
                        </div>
                      )}

                      <div className="prose-sm">{renderFormattedContent(msg.content)}</div>

                      {/* Bot interactive quick actions based on response content */}
                      {isBot && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenBooking();
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-xs"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Agendar Cita</span>
                          </button>

                          <a
                            href="tel:04242724617"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-[#B1A086]" />
                            <span>0424-2724617</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </motion.div>
                );
              })}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="bg-white dark:bg-[#1C1C1C] border border-[#B1A086]/20 dark:border-slate-800 rounded-2xl rounded-tl-sm p-3.5 shadow-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      EquilibraBot analizando con Gemini 3.8...
                    </span>
                    <div className="flex items-center gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B1A086] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B1A086] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B1A086] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips */}
            {messages.length <= 3 && !isLoading && (
              <div className="px-4 py-2 bg-[#F2EFE8]/70 dark:bg-[#141414] border-t border-[#D1CEC9]/60 dark:border-slate-800/80 overflow-x-auto shrink-0 flex items-center gap-1.5 no-scrollbar">
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase shrink-0">
                  Preguntas rápidas:
                </span>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-[#B1A086]/30 dark:border-slate-700 transition-colors whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Section */}
            <div className="p-3 bg-white dark:bg-[#141414] border-t border-[#D1CEC9]/60 dark:border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu molestia, duda o pregunta..."
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#F2EFE8]/70 dark:bg-[#1C1C1C] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#B1A086] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Enviar mensaje"
                  className="p-2.5 rounded-xl bg-gradient-to-tr from-[#9E8D74] to-amber-400 hover:from-[#B1A086] hover:to-amber-300 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 px-1">
                <span>Orientación de triage educativo por IA. No sustituye consulta presencial.</span>
                <span className="font-semibold text-[#B1A086]">EQUILIBRA</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
