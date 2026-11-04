/**
 * Motor Autónomo de Inteligencia Clínica para EQUILIBRA
 * 
 * Garantiza que el asistente responda con empatía, precisión y profesionalismo
 * incluso cuando la web se aloja en servidores estáticos (sin Node.js) o sin clave de API.
 * 
 * Si se dispone de una clave Gemini (en .env o ingresada por el usuario), puede consultar
 * directamente a la API de Google Gemini en la nube.
 */

import { CLINIC_INFO } from '../data/featuresData';

const GEMINI_STORAGE_KEY = 'equilibra_gemini_api_key';

export function getStoredGeminiApiKey(): string {
  try {
    const fromStorage = localStorage.getItem(GEMINI_STORAGE_KEY) || '';
    if (fromStorage.trim()) return fromStorage.trim();
  } catch {}

  const fromEnv = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
  return String(fromEnv).trim();
}

export function setStoredGeminiApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(GEMINI_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[GeminiStorage] Error saving key:', e);
  }
}

/**
 * Consulta directa a la API de Google Gemini (desde el navegador)
 */
export async function callDirectGeminiApi(apiKey: string, userMessage: string, history: any[] = []): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `Eres "EquilibraBot", el Asistente Clínico Inteligente oficial de "EQUILIBRA - Centro de Fisioterapia & Bienestar Integral" en Sabana Grande, Caracas, Venezuela.
Tu objetivo es orientar a los pacientes con empatía, tono profesional y rigurosidad biomecánica.
Filosofía: "Un refugio, no una sala de espera". Tratamiento individual 1 a 1, sin masificación.
Teléfono / WhatsApp oficial: 0424-2724617.
Correo: equilibraavisos@gmail.com.
Horario: Lunes a Viernes de 7:30 AM a 6:00 PM. Sábados de 8:00 AM a 2:00 PM.
Ubicación: Sabana Grande, Caracas (cerca del Metro).
Especialidades: Fisioterapia traumatológica, deportiva, pediátrica, geriátrica, posquirúrgica / dermatofuncional, entrenamiento funcional, nutrición clínica y psicología.
Pautas: Responde siempre en español cálido, usa viñetas y negritas, brinda recomendaciones iniciales seguras (hielo/calor, posturas) e invita a agendar en la web o por el 0424-2724617.`;

  const contents: any[] = [];
  if (Array.isArray(history)) {
    for (const item of history.slice(-6)) {
      if (item && item.content) {
        contents.push({
          role: item.role === 'model' || item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(item.content) }],
        });
      }
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const bodyPayload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 800,
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Respuesta vacía del modelo Gemini.');
  }
  return text;
}

/**
 * Motor Clínico de Triage Autónomo de EQUILIBRA
 * Ofrece respuestas completas, estructuradas y personalizadas sin depender de red externa.
 */
export function getAutonomousClinicalResponse(userQuery: string): {
  reply: string;
  isEmergency?: boolean;
  suggestedSpecialtyId?: string;
} {
  const query = userQuery.toLowerCase().trim();

  // 1. Detección de Banderas Rojas / Emergencias Médicas
  const emergencyKeywords = [
    'pecho', 'infarto', 'corazon', 'corazón', 'paro', 'paralisis', 'parálisis',
    'desmayo', 'perdida de consciencia', 'pérdida de consciencia', 'asfixia', 'ahogo',
    'no puedo respirar', 'dificultad respiratoria', 'hemorragia', 'sangrado profuso',
    'fractura expuesta', 'convulsion', 'convulsión', 'acv', 'ictus'
  ];

  if (emergencyKeywords.some((w) => query.includes(w))) {
    return {
      isEmergency: true,
      reply: `⚠️ **ALERTA DE SEGURIDAD MÉDICA INMEDIATA**

Los síntomas que indicas sugieren una posible emergencia médica que requiere atención hospitalaria urgente.

La fisioterapia y rehabilitación ambulatoria **no están indicadas** para atender cuadros cardiorrespiratorios agudos o pérdida de consciencia.

**Pasos inmediatos a seguir:**
1. No pierdas tiempo intentando agendar una consulta de rehabilitación.
2. Comunícate de inmediato con emergencias al **911 / Ven911** o a una ambulancia.
3. Trasládate al centro hospitalario o sala de urgencias más cercana.
4. Si necesitas avisar a un familiar o a nuestro consultorio: **0424-2724617**.`,
    };
  }

  // 2. Columna, Espalda, Lumbar, Cervical, Ciática, Hernias
  if (
    query.includes('espalda') ||
    query.includes('lumbar') ||
    query.includes('lumbalgia') ||
    query.includes('ciatica') ||
    query.includes('ciática') ||
    query.includes('hernia') ||
    query.includes('columna') ||
    query.includes('vertebra') ||
    query.includes('lumbago')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia',
      reply: `Para molestias en columna o zona lumbar, en **EQUILIBRA** contamos con la unidad de **Fisioterapia Traumatológica y Terapia Manual Ortopédica**.

**¿Qué puede estar ocurriendo?**
Las molestias lumbares y ciáticas suelen relacionarse con sobrecarga postural, compresión foraminal, contractura del psoas/piramidal o discopatías que generan irritación nerviosa hacia el glúteo o pierna.

**Pautas iniciales de alivio seguro:**
• **Alternancia postural:** Evita permanecer sentado o de pie por más de 45 minutos continuos. Realiza pausas activas caminando 2 minutos.
• **Manejo térmico:** Si el dolor es agudo o punzante (< 72h), aplica frío envuelto en toalla durante 15 minutos. Si es rigidez muscular difusa, aplica calor suave por 20 minutos para distender.
• **Postura de descarga:** Acostado boca arriba con las piernas flexionadas en 90° sobre una silla o cojín para descomprimir la zona lumbar.

Te recomendamos una **Evaluación Biomecánica 1 a 1** para determinar el origen exacto y comenzar tu protocolo de descompresión y fortalecimiento del core.`,
    };
  }

  // 3. Cuello, Cervical, Trapecio, Tortícolis, Tensión en hombros
  if (
    query.includes('cuello') ||
    query.includes('cervical') ||
    query.includes('cervicalgia') ||
    query.includes('torticolis') ||
    query.includes('tortícolis') ||
    query.includes('trapecio') ||
    query.includes('nuca')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia',
      reply: `Las molestias en cuello y cervicales son de las más comunes y en **EQUILIBRA** las tratamos con nuestro protocolo de **Reeducación Postural & Terapia Miofascial Cervical**.

**Causas frecuentes:**
Bruxismo, estrés acumulado, pantallas a baja altura ("cuello de texto") o disfunción articular en vértebras cervicales altas (C1-C4) que provocan mareos tensionales o dolor irradiado hacia la cabeza.

**Recomendaciones seguras:**
• Ajusta la pantalla a la altura de tus ojos para no flexionar el cuello continuamente.
• Realiza giros lentos laterales y retracción de barbilla (papada suave) sin forzar el rango de dolor.
• Aplica calor húmedo suave en la base del cuello durante 15 minutos al final del día.

En consulta presencial realizamos liberación suboccipital y ajuste ergonómico individualizado.`,
    };
  }

  // 4. Hombro, Manguito Rotador, Bursitis, Codo, Muñeca, Túnel Carpiano
  if (
    query.includes('hombro') ||
    query.includes('manguito') ||
    query.includes('rotador') ||
    query.includes('bursitis') ||
    query.includes('codo') ||
    query.includes('tenista') ||
    query.includes('muñeca') ||
    query.includes('muneca') ||
    query.includes('tunel carpiano') ||
    query.includes('túnel carpiano')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia',
      reply: `Para el miembro superior (hombro, codo o muñeca), nuestro servicio ideal es **Fisioterapia Traumatológica & Readaptación Articular**.

**Enfoque terapéutico:**
• En el hombro evaluamos el espacio subacromial, la movilidad de la escápula y la fuerza del manguito rotador.
• En codo de tenista o túnel carpiano aplicamos neurodinamia (movilización del nervio mediano o radial) y terapia de puntos gatillo.

**Consejos preventivos:**
• Evita cargar bolsas pesadas con un solo brazo o dormir sobre el hombro afectado.
• Realiza movimientos pendulares suaves de Codman (inclinado hacia adelante, dejando caer el brazo relajado con círculos pequeños).
• No realices estiramientos agresivos si hay inflamación activa.`,
    };
  }

  // 5. Rodilla, Meniscos, Ligamentos, Artrosis, Condromalacia
  if (
    query.includes('rodilla') ||
    query.includes('menisco') ||
    query.includes('ligamento') ||
    query.includes('cruzado') ||
    query.includes('condromalacia') ||
    query.includes('rotula') ||
    query.includes('rótula') ||
    query.includes('artrosis de rodilla')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia-deportiva',
      reply: `El dolor de rodilla requiere una valoración biomecánica precisa. En **EQUILIBRA** lo abordamos mediante **Fisioterapia Deportiva y Readaptación Funcional de Miembro Inferior**.

**Puntos clave:**
La rodilla es una articulación intermedia: suele sufrir por falta de movilidad en el tobillo o por debilidad en los glúteos y cadera.

**Recomendaciones inmediatas:**
• Evita subir o bajar escaleras con prisa; utiliza apoyo y apoya el pie firme.
• Si sientes hinchazón visible o calor, aplica compresas frías por 15 minutos dos veces al día.
• En consulta evaluamos tu alineación femoral, fuerza del cuádriceps y rango articular para evitar el desgaste del cartílago.`,
    };
  }

  // 6. Tobillo, Pie, Fascitis Plantar, Esguince, Tendón de Aquiles
  if (
    query.includes('tobillo') ||
    query.includes('pie') ||
    query.includes('esguince') ||
    query.includes('fascitis') ||
    query.includes('plantar') ||
    query.includes('aquiles') ||
    query.includes('talon') ||
    query.includes('talón')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia-deportiva',
      reply: `Para lesiones de tobillo y pie, en **EQUILIBRA** aplicamos protocolos avanzados de **Rehabilitación de Apoyo & Propiocepción**.

**¿Fascitis o esguince?**
• **Fascitis plantar:** Dolor agudo matutino al dar el primer paso. Se alivia rodando suavemente una botella de agua congelada bajo la planta del pie durante 10 minutos.
• **Esguince de tobillo:** Es vital trabajar la propiocepción y la estabilidad ligamentosa para evitar esguinces de repetición o tobillo inestable.

Nuestros fisioterapeutas te guiarán con vendajes funcionales y fortalecimiento progresivo de gemelos y tibial.`,
    };
  }

  // 7. Deporte, Gym, Corredor, Runner, Crossfit, Desgarro, Pesas
  if (
    query.includes('deporte') ||
    query.includes('deportiva') ||
    query.includes('gym') ||
    query.includes('gimnasio') ||
    query.includes('correr') ||
    query.includes('runner') ||
    query.includes('running') ||
    query.includes('crossfit') ||
    query.includes('desgarro') ||
    query.includes('sobrecarga') ||
    query.includes('pesas')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia-deportiva',
      reply: `¡Excelente! Para deportistas y personas con entrenamiento continuo contamos con el área de **Fisioterapia Deportiva & Readaptación Funcional**.

**Nuestro método:**
No nos limitamos a quitar el dolor: evaluamos el gesto técnico de tu disciplina, el equilibrio muscular agonista/antagonista y la carga de entrenamiento para que vuelvas a tu 100% sin miedo a recaer.

**Atendemos con frecuencia:**
• Sobrecargas de cuádriceps, isquiotibiales y pantorrillas.
• Tendinopatías rotulianas y del manguito rotador en levantamiento de pesas.
• Fascitis y periostitis tibial en corredores.`,
    };
  }

  // 8. Niños, Pediatría, Bebé, Postura Infantil, Escoliosis
  if (
    query.includes('niño') ||
    query.includes('hijo') ||
    query.includes('bebe') ||
    query.includes('bebé') ||
    query.includes('pediatr') ||
    query.includes('escoliosis') ||
    query.includes('postura infantil')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia-pediatrica',
      reply: `Para niños y adolescentes disponemos del servicio especializado de **Fisioterapia Pediátrica & Desarrollo Motor**.

**Áreas de intervención:**
• Detección y corrección precoz de escoliosis y asimetrías posturales.
• Apoyo en etapas del neurodesarrollo infantil, gateo y patrón de marcha.
• Tratamiento de pies planos o valgo con ejercicios lúdicos y adaptados a su edad.

La atención se realiza siempre en compañía de los padres en un ambiente seguro y acogedor.`,
    };
  }

  // 9. Adulto Mayor, Artrosis, Geriatría, Abuelo, Caídas, Equilibrio
  if (
    query.includes('abuelo') ||
    query.includes('adulto mayor') ||
    query.includes('geriatr') ||
    query.includes('geriatrica') ||
    query.includes('geriátrica') ||
    query.includes('artrosis') ||
    query.includes('osteoporosis') ||
    query.includes('caida') ||
    query.includes('caída') ||
    query.includes('equilibrio')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia-geriatrica',
      reply: `Para el adulto mayor brindamos **Fisioterapia Geriátrica & Autonomía Funcional**.

**Objetivos de la sesión:**
• Mejorar la estabilidad para prevenir caídas y fracturas.
• Preservar la movilidad articular frente a la artrosis y artritis.
• Mantener la fuerza en piernas y espalda para una marcha independiente y sin dolor.

Las sesiones son adaptadas al ritmo del paciente, respetando sus tiempos y con máxima calidez humana.`,
    };
  }

  // 10. Cirugías, Postoperatorio, Drenaje Linfático, Estética
  if (
    query.includes('drenaje') ||
    query.includes('linfatico') ||
    query.includes('linfático') ||
    query.includes('postoperatorio') ||
    query.includes('posquirurgico') ||
    query.includes('posquirúrgico') ||
    query.includes('lipo') ||
    query.includes('cirugia') ||
    query.includes('cirugía') ||
    query.includes('fibrosis')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia-estetica',
      reply: `En recuperación postquirúrgica contamos con **Fisioterapia Dermatofuncional & Drenaje Linfático Manual Certificado**.

**Beneficios clínicos:**
• Disminución rápida del edema e hinchazón postoperatoria.
• Prevención y tratamiento de adherencias y fibrosis tisular.
• Protocolos seguros avalados por médicos cirujanos plásticos y traumatólogos.`,
    };
  }

  // 11. Precios, Costo, Cuánto vale, Tarifas, Presupuesto, Formas de Pago
  if (
    query.includes('precio') ||
    query.includes('costo') ||
    query.includes('cuanto') ||
    query.includes('cuánto') ||
    query.includes('tarifa') ||
    query.includes('presupuesto') ||
    query.includes('pago') ||
    query.includes('zelle') ||
    query.includes('transferencia')
  ) {
    return {
      reply: `En **EQUILIBRA** manejamos tarifas justas y transparentes con atención individual 1 a 1 de 60 minutos:

**Opciones disponibles:**
• **Sesión Individual de Valoración & Tratamiento:** Incluye anamnesis clínica, pruebas biomecánicas, terapia manual y prescripción de ejercicios terapéuticos.
• **Paquetes de Tratamiento Continuo (5 y 10 sesiones):** Diseñados para procesos de rehabilitación completa con descuento preferencial por sesión.

**Métodos de pago aceptados en clínica:**
• Pago Móvil y transferencias bancarias nacionales.
• Zelle y divisas en efectivo.
• Tarjetas de débito.

Puedes consultar las tarifas vigentes y reservar tu espacio haciendo clic en **"Citas Online"** en el menú superior o escribiéndonos directamente a nuestro WhatsApp **0424-2724617**.`,
    };
  }

  // 12. Horarios, Qué días abren, Sábados, Horas de atención
  if (
    query.includes('horario') ||
    query.includes('hora') ||
    query.includes('sabado') ||
    query.includes('sábado') ||
    query.includes('dias') ||
    query.includes('días') ||
    query.includes('atienden hoy')
  ) {
    return {
      reply: `Nuestros horarios de atención oficial en consultorio son:

• **Lunes a Viernes:** 7:30 AM – 6:00 PM (Jornada continua)
• **Sábados:** 8:00 AM – 2:00 PM
• **Domingos:** Cerrado (descanso médico)

Las citas se programan por bloques cerrados de 1 hora para asegurar que nunca esperes en salas congestionadas. ¡Un refugio, no una sala de espera!`,
    };
  }

  // 13. Ubicación, Dónde están, Dirección, Cómo llegar, Metro
  if (
    query.includes('donde') ||
    query.includes('dónde') ||
    query.includes('ubicacion') ||
    query.includes('ubicación') ||
    query.includes('direccion') ||
    query.includes('dirección') ||
    query.includes('llegar') ||
    query.includes('sabana grande') ||
    query.includes('caracas')
  ) {
    return {
      reply: `📍 **Ubicación de EQUILIBRA:**
Nos encontramos en **Sabana Grande, Caracas, Venezuela**.

**Puntos de referencia:**
• Zona céntrica de fácil acceso a pocos pasos de la estación del **Metro de Sabana Grande**.
• Cómodo acceso vehicular con opciones de estacionamiento cercano.
• Instalaciones climatizadas y adaptadas para pacientes con movilidad reducida.

Puedes ver la ubicación interactiva en el mapa de la sección **Contacto** o llamarnos al **0424-2724617** para guiarte en tu llegada.`,
    };
  }

  // 14. Cómo agendar, Sacar cita, Reservar, Proceso de cita
  if (
    query.includes('agendar') ||
    query.includes('cita') ||
    query.includes('reservar') ||
    query.includes('turno') ||
    query.includes('disponibilidad')
  ) {
    return {
      suggestedSpecialtyId: 'fisioterapia',
      reply: `Agendar tu cita en **EQUILIBRA** es rápido y puedes hacerlo de 2 formas:

1. **Directamente en esta web:**
   Haz clic en la pestaña **"Citas Online"** en el menú superior o en el botón **"Agendar Cita"**. Seleccionas tu especialidad, especialista, fecha y hora disponible en tiempo real. Recibirás tu confirmación inmediata por correo electrónico y WhatsApp.

2. **Por WhatsApp o llamada directa:**
   Escríbenos al **0424-2724617** y nuestra recepción te asignará el turno de tu preferencia.

¿Tienes alguna duda sobre qué especialista elegir para tu molestia?`,
    };
  }

  // 15. Información de contacto general
  if (
    query.includes('contacto') ||
    query.includes('telefono') ||
    query.includes('teléfono') ||
    query.includes('whatsapp') ||
    query.includes('correo') ||
    query.includes('email')
  ) {
    return {
      reply: `📞 **Canales Oficiales de Contacto de EQUILIBRA:**

• **Teléfono / WhatsApp:** 0424-2724617
• **Correo oficial:** equilibraavisos@gmail.com
• **Sede:** Sabana Grande, Caracas
• **Horario:** Lunes a Viernes 7:30 AM – 6:00 PM | Sábados 8:00 AM – 2:00 PM

Estamos a tu disposición para atender cualquier duda sobre tu proceso de rehabilitación.`,
    };
  }

  // 16. Respuesta general inteligente y empática
  return {
    reply: `¡Hola! Bienvenido al asistente clínico de **EQUILIBRA - Fisioterapia & Bienestar Integral**.

Puedo ayudarte con:
• **Orientación de síntomas:** Cuéntame dónde sientes dolor (espalda, cuello, rodilla, hombro, etc.) y te indico qué especialista necesitas y medidas de autocuidado.
• **Información del consultorio:** Horarios, ubicación en Sabana Grande y formas de pago.
• **Agendamiento:** Cómo reservar tu cita presencial 1 a 1.

¿En qué podemos apoyarte hoy? También puedes comunicarte directamente al **0424-2724617**.`,
  };
}
