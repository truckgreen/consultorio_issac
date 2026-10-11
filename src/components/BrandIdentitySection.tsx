import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Download,
  Eye,
  Layers,
  Palette,
  ShieldCheck,
  Check,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import { CLINIC_INFO } from '../data/featuresData';
import { APP_IMAGES } from '../data/images';

export const BrandIdentitySection: React.FC = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; category: string } | null>(null);

  const colors = [
    {
      name: 'Creamy',
      role: 'Principal / Canvas Claro',
      hex: '#F2EFE8',
      rgb: '242 239 232',
      cmyk: '6% 8% 11% 0%',
      textColor: 'text-slate-900',
      bgClass: 'bg-[#F2EFE8]',
      borderClass: 'border-[#D1CEC9]',
      description: 'Calma, calidez y bienestar holístico. Tono institucional para fondos limpios y luminosos.',
    },
    {
      name: 'Sealskin',
      role: 'Principal / Canvas Oscuro',
      hex: '#0C0C0C',
      rgb: '12 12 12',
      cmyk: '84% 83% 73% 78%',
      textColor: 'text-white',
      bgClass: 'bg-[#0C0C0C]',
      borderClass: 'border-slate-800',
      description: 'Sobriedad técnica, precisión atlética y solidez médica de alto impacto.',
    },
    {
      name: 'Minimalist',
      role: 'Secundaria / Acento Oro-Arena',
      hex: '#B1A086',
      rgb: '177 160 134',
      cmyk: '34% 37% 50% 0%',
      textColor: 'text-slate-950',
      bgClass: 'bg-[#B1A086]',
      borderClass: 'border-[#9E8D74]',
      description: 'Elegancia deportiva y balance orgánico. Utilizado en insignias, botones y detalles clave.',
    },
    {
      name: 'Keystone Gray',
      role: 'Secundaria / Neutro Cálido',
      hex: '#D1CEC9',
      rgb: '209 206 201',
      cmyk: '21% 18% 21% 0%',
      textColor: 'text-slate-900',
      bgClass: 'bg-[#D1CEC9]',
      borderClass: 'border-slate-400',
      description: 'Transición arquitectónica, divisores sutiles y tarjetas estructuradas.',
    },
  ];

  const brandGallery = [
    {
      title: 'Fachada Arquitectónica 3D',
      category: 'Sede & Espacio Físico',
      src: '/brand_book/01_fachada_clinica_3d.jpg',
      aspect: 'col-span-12 md:col-span-7',
      desc: 'Paneles negro mate arquitectónicos con rótulo retroiluminado blanco en relieve.',
    },
    {
      title: 'Ropa Técnica & Deportiva',
      category: 'Indumentaria Atlética',
      src: '/brand_book/02_ropa_tecnica_deportiva.jpg',
      aspect: 'col-span-12 md:col-span-5',
      desc: 'Cortavientos técnico impermeable con logo en pecho e isotipo en joggers.',
    },
    {
      title: 'Moodboard de Aplicaciones',
      category: 'Identidad de Marca',
      src: '/brand_book/03_aplicaciones_moodboard.jpg',
      aspect: 'col-span-12 md:col-span-4',
      desc: 'Gorra crema con isotipo bordado, termo de acero negro, pin metálico esmaltado y app.',
    },
    {
      title: 'Colección de Uniformes Clínicos',
      category: 'Scrubs Médicos',
      src: '/brand_book/04_uniformes_medicos_scrubs.jpg',
      aspect: 'col-span-12 md:col-span-4',
      desc: 'Sets en Creamy, Minimalist Sand y Sealskin para el equipo multidisciplinario.',
    },
    {
      title: 'Sesión Clínica en Camilla',
      category: 'Atención 1 a 1',
      src: '/brand_book/05_sesion_clinica_camilla.jpg',
      aspect: 'col-span-12 md:col-span-4',
      desc: 'Terapia manual y estiramientos asistidos en cabinas de rehabilitación biomecánica.',
    },
  ];

  const logoAssets = [
    {
      name: 'Logotipo Principal (Sealskin)',
      format: 'SVG Vector',
      file: '/brand_book/logo_equilibra_principal_sealskin.svg',
      bg: 'bg-[#F2EFE8]',
      type: 'dark',
    },
    {
      name: 'Logotipo Principal (Creamy)',
      format: 'SVG Vector',
      file: '/brand_book/logo_equilibra_principal_creamy.svg',
      bg: 'bg-[#0C0C0C]',
      type: 'light',
    },
    {
      name: 'Logotipo Principal (Minimalist)',
      format: 'SVG Vector',
      file: '/brand_book/logo_equilibra_principal_minimalist.svg',
      bg: 'bg-[#0C0C0C]',
      type: 'minimalist',
    },
    {
      name: 'Isotipo Oficial (Tres Barras)',
      format: 'SVG Vector',
      file: '/brand_book/isotipo_tres_barras_minimalist.svg',
      bg: 'bg-[#0C0C0C]',
      type: 'isotype',
    },
  ];

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <section id="identidad-marca" className="py-24 bg-[#FAF9F7] dark:bg-[#0C0C0C] transition-colors relative overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80">
      {/* Subtle ambient light */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B1A086]/5 dark:bg-[#B1A086]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B1A086]/15 dark:bg-[#B1A086]/20 border border-[#B1A086]/40 text-[#B1A086] text-xs font-bold uppercase tracking-widest mb-4">
            <Palette className="w-3.5 h-3.5" />
            <span>Brand Book Oficial 2026</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-[#F2EFE8] tracking-tight mb-4 font-heading">
            Identidad Visual & Esencia
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-[#B5B0A6] italic font-light">
            “{CLINIC_INFO.tagline}”
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8E8A82] mt-2">
            La fusión calculada entre la estética deportiva de alto rendimiento y la estructura médica anatómica.
          </p>
        </div>

        {/* 4 Brand Pillars (Page 6 of Brand Book) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {CLINIC_INFO.values.map((val, idx) => (
            <motion.div
              key={val.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-[#D1CEC9]/60 dark:border-slate-800 shadow-sm hover:border-[#B1A086] transition-all group"
            >
              <div className="text-xs font-black tracking-widest text-[#B1A086] mb-2 uppercase">
                Pilar 0{idx + 1}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-[#F2EFE8] font-heading mb-3 group-hover:text-[#B1A086] transition-colors">
                {val.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-[#B5B0A6] leading-relaxed">
                {val.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Official Color Palette (Page 15 of Brand Book) */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-[#F2EFE8] font-heading">
                Paleta Cromática Oficial
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#B5B0A6]">
                Haz clic en cualquier tarjeta para copiar el código hexadecimal exacto
              </p>
            </div>
            <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-[#B1A086] font-bold border border-[#B1A086]/30 px-3 py-1 rounded-full">
              RGB & CMYK Validados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {colors.map((color) => {
              const isCopied = copiedColor === color.hex;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => copyHex(color.hex)}
                  className="text-left rounded-2xl overflow-hidden bg-white dark:bg-[#141414] border border-[#D1CEC9]/70 dark:border-slate-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B1A086]"
                >
                  <div className={`h-28 w-full ${color.bgClass} flex items-end justify-between p-4 border-b ${color.borderClass}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded backdrop-blur-md bg-white/70 dark:bg-black/50 ${color.textColor}`}>
                      {color.hex}
                    </span>
                    <span className="text-[11px] font-semibold opacity-80 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded">
                      {isCopied ? '¡Copiado!' : 'Copiar'}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-black text-slate-900 dark:text-[#F2EFE8] font-heading">
                        {color.name}
                      </h4>
                      {isCopied && <Check className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-xs font-bold text-[#B1A086] mb-3">
                      {color.role}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-[#B5B0A6] mb-4 leading-relaxed">
                      {color.description}
                    </p>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between text-[11px] font-mono text-slate-500 dark:text-[#8E8A82]">
                      <span>RGB: {color.rgb}</span>
                      <span>CMYK: {color.cmyk}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Gallery with High-Resolution Photos */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-[#F2EFE8] font-heading">
                Galería de Aplicaciones & Espacios
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#B5B0A6]">
                Todas las imágenes forman parte de la carpeta oficial <code className="text-[#B1A086] font-mono">/public/brand_book/</code>
              </p>
            </div>
            <a
              href="/brand_book/01_fachada_clinica_3d.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#B1A086] hover:text-[#9E8D74] border border-[#B1A086]/30 px-3.5 py-2 rounded-full transition-colors w-fit"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Explorar Carpeta de Imágenes</span>
            </a>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {brandGallery.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setSelectedImage(item)}
                className={`${item.aspect} group relative rounded-3xl overflow-hidden shadow-lg border border-[#D1CEC9]/60 dark:border-slate-800 bg-slate-900 cursor-pointer h-72 sm:h-80`}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold tracking-widest text-[#B1A086] uppercase">
                      {item.category}
                    </span>
                    <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h4 className="text-lg font-bold font-heading mb-1 text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vector Logos & Isotypes Download Strip */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#141414] border border-[#D1CEC9]/80 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B1A086] uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Activos Vectoriales Oficiales</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F2EFE8] font-heading">
                Logotipos, Isotipo y Descarga Directa
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-[#B5B0A6]">
                Ubicación del repositorio: <strong className="text-slate-800 dark:text-slate-200">/brand_book/</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {logoAssets.map((logo) => (
              <div
                key={logo.name}
                className="flex flex-col justify-between p-5 rounded-2xl bg-[#FAF9F7] dark:bg-[#0C0C0C] border border-[#D1CEC9]/60 dark:border-slate-800"
              >
                <div>
                  <div className={`h-24 rounded-xl ${logo.bg} flex items-center justify-center p-4 mb-4 border border-slate-200/40 dark:border-slate-800`}>
                    <img src={logo.file} alt={logo.name} className="max-h-16 max-w-full object-contain" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-[#F2EFE8] mb-1">
                    {logo.name}
                  </h5>
                  <span className="text-[11px] text-slate-500 dark:text-[#8E8A82]">
                    Formato: {logo.format}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href={logo.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#B1A086] hover:text-[#9E8D74] inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </a>
                  <a
                    href={logo.file}
                    download
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox Modal for Fullscreen Image Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-[#0C0C0C] rounded-3xl overflow-hidden border border-[#D1CEC9]/20 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                aria-label="Cerrar vista"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>
              <div className="p-6 bg-[#141414] border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B1A086]">
                    {selectedImage.category}
                  </span>
                  <h4 className="text-xl font-bold text-white font-heading">
                    {selectedImage.title}
                  </h4>
                </div>
                <a
                  href={selectedImage.src}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B1A086] text-slate-950 font-bold text-sm hover:bg-[#9E8D74] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Alta Resolución</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
