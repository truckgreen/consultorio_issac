import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Award,
  ChevronRight,
  RotateCcw,
  Video,
  FileCode,
  ExternalLink
} from 'lucide-react';
import { ServiceDetail } from '../types';
import { MEDIA_CONFIG, parseVideoUrl } from '../config/mediaAssets';

interface ServiceVideoModalProps {
  service: ServiceDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (serviceTitle: string) => void;
}

export const ServiceVideoModal: React.FC<ServiceVideoModalProps> = ({
  service,
  isOpen,
  onClose,
  onBookAppointment
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(15);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'custom' | 'simulator'>('simulator');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if there is a custom video defined in mediaAssets.ts or in service.videoData
  const serviceMedia = service ? (MEDIA_CONFIG.services as any)[service.id] : null;
  const customVideoUrl = serviceMedia?.videoUrl || (service?.videoData as any)?.customVideoUrl || '';
  const parsedVideo = parseVideoUrl(customVideoUrl);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setProgress(10);
      setActiveChapterIndex(0);
      if (parsedVideo.type !== 'simulated') {
        setViewMode('custom');
      } else {
        setViewMode('simulator');
      }
    }
  }, [isOpen, service?.id, customVideoUrl]);

  useEffect(() => {
    if (isPlaying && isOpen && viewMode === 'simulator') {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 1;
          // Update active chapter based on percentage
          if (service?.videoData?.chapters && service.videoData.chapters.length > 0) {
            const step = 100 / service.videoData.chapters.length;
            const idx = Math.min(
              Math.floor(next / step),
              service.videoData.chapters.length - 1
            );
            setActiveChapterIndex(idx);
          }
          return next;
        });
      }, 350);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isOpen, service, viewMode]);

  if (!isOpen || !service) return null;

  const currentChapter = service.videoData?.chapters?.[activeChapterIndex] || {
    time: '0:00',
    title: service.title,
    description: service.tagline
  };

  const handleJumpToChapter = (index: number) => {
    if (!service.videoData?.chapters) return;
    const step = 100 / service.videoData.chapters.length;
    setProgress(index * step + 2);
    setActiveChapterIndex(index);
    setIsPlaying(true);
    setViewMode('simulator');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-700/80 my-auto text-white flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header Bar */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 border border-indigo-700/50 shrink-0">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Video Explicativo
            </span>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-white truncate font-heading">
                {service.videoData?.title || service.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {service.categoryName} · Presentado por {service.videoData?.presenter || 'Especialista EQUILIBRA'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {parsedVideo.type !== 'simulated' && (
              <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setViewMode('custom')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    viewMode === 'custom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tu Video (YouTube/MP4)
                </button>
                <button
                  onClick={() => setViewMode('simulator')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    viewMode === 'simulator' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Simulador Clínico
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              aria-label="Cerrar video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
          
          {/* Left Column: Video Screen */}
          <div className="lg:col-span-7 bg-black flex flex-col justify-between relative select-none">
            
            {/* Real Embedded Custom Video (YouTube / Vimeo / MP4) */}
            {viewMode === 'custom' && parsedVideo.type !== 'simulated' ? (
              <div className="relative aspect-video w-full bg-black flex items-center justify-center min-h-[360px]">
                {parsedVideo.type === 'youtube' && parsedVideo.embedUrl ? (
                  <iframe
                    src={parsedVideo.embedUrl}
                    title={service.title}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : parsedVideo.type === 'vimeo' && parsedVideo.embedUrl ? (
                  <iframe
                    src={parsedVideo.embedUrl}
                    title={service.title}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : parsedVideo.type === 'mp4' && parsedVideo.rawUrl ? (
                  <video
                    src={parsedVideo.rawUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>
            ) : (
              /* High-tech Interactive Clinical Simulation Screen */
              <div 
                className="relative aspect-video sm:aspect-auto sm:min-h-[380px] w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer group"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {/* Background Poster & Motion Visual */}
                <img
                  src={serviceMedia?.videoPoster || service.videoData?.videoPoster || service.image}
                  alt={service.title}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isPlaying ? 'scale-105 brightness-[0.75]' : 'brightness-[0.45]'
                  }`}
                  referrerPolicy="no-referrer"
                />

                {/* Dynamic Anatomical / Biomechanical Overlay Graphics during play */}
                {isPlaying && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-t from-black/80 via-transparent to-black/50">
                    
                    {/* Top video status badges */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[10px] font-mono uppercase bg-red-600/90 text-white px-2.5 py-1 rounded shadow animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Demostración Clínica HD
                      </span>

                      {service.videoData?.chapters && (
                        <span className="text-[11px] font-mono text-slate-200 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700">
                          Capítulo {activeChapterIndex + 1}/{service.videoData.chapters.length}
                        </span>
                      )}
                    </div>

                    {/* Active Chapter Overlay Subtitle / Callout */}
                    <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-xl animate-in slide-in-from-bottom-2 max-w-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{currentChapter.title}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 leading-snug">
                        {currentChapter.description}
                      </p>
                    </div>

                  </div>
                )}

                {/* Big Center Play/Pause button if paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xs gap-3">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 ml-1 fill-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200 bg-black/60 px-3 py-1 rounded-full">
                      Hacer clic para reproducir
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Video Controls Bar (for simulator mode) */}
            {viewMode === 'simulator' && (
              <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2">
                
                {/* Progress Scrub Bar */}
                <div 
                  className="w-full bg-slate-800 h-2 rounded-full overflow-hidden cursor-pointer relative group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                    setProgress(newPercent);
                  }}
                >
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-150 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    <button
                      onClick={() => {
                        setProgress(0);
                        setActiveChapterIndex(0);
                        setIsPlaying(true);
                      }}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Reiniciar video"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isMuted ? 'Activar audio' : 'Silenciar'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="font-mono text-[11px] text-slate-300">
                      {service.videoData?.duration || '3:00 min'} (Explicación Completa)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Protocolo Verificado
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Custom media file guidance pill banner */}
            <div className="px-3.5 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>¿Quieres tu video real? Edita <code>src/config/mediaAssets.ts</code></span>
              </span>
              <span className="text-slate-500 font-mono text-[10px] hidden sm:inline">
                ID: {service.id}
              </span>
            </div>

          </div>

          {/* Right Column: Protocol Chapters, Pricing & Appointment Action */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-900 flex flex-col justify-between gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 overflow-y-auto">
            
            <div className="space-y-5">
              
              {/* Service Synopsis */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  ¿Cómo funciona este tratamiento?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {service.videoData?.synopsis || service.description}
                </p>
              </div>

              {/* Video Clinical Chapters Navigation */}
              {service.videoData?.chapters && service.videoData.chapters.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                    <span>Capítulos del Procedimiento</span>
                    <span className="text-[10px] text-indigo-400 font-normal">Toca para ir al minuto</span>
                  </h4>

                  <div className="space-y-1.5">
                    {service.videoData.chapters.map((chapter, idx) => {
                      const isActive = activeChapterIndex === idx && viewMode === 'simulator';
                      return (
                        <button
                          key={idx}
                          onClick={() => handleJumpToChapter(idx)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                            isActive
                              ? 'bg-indigo-950/70 border-indigo-600 text-white shadow-inner'
                              : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 mt-0.5 ${
                            isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {chapter.time}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{chapter.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{chapter.description}</p>
                          </div>
                          {isActive && <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 self-center" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Techniques & Equipment */}
              {service.videoData?.techniquesShown && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Técnicas Demostradas en Video
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {service.videoData.techniquesShown.map((tech, i) => (
                      <span key={i} className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Box */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tarifa Oficial</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-white font-heading">${service.priceUSD} USD</span>
                    <span className="text-[11px] text-slate-400">/ sesión ({service.duration})</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Aceptamos Bs. y Divisas
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Actions: Book appointment with this service */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onBookAppointment(service.title);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Cita para {service.title}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                Volver a la página
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
