import nodemailer from 'nodemailer';

export interface EmailAppointmentData {
  id: string;
  code: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  service_title?: string;
  serviceTitle?: string;
  selected_package_name?: string;
  selectedPackageName?: string;
  selected_package_price?: string;
  selectedPackagePrice?: string;
  service_price?: string;
  servicePrice?: string;
  specialist_name?: string;
  specialistName?: string;
  package_total_sessions?: number;
  packageTotalSessions?: number;
  package_session_number?: number;
  packageSessionNumber?: number;
  motivo_consulta?: string;
  motivoConsulta?: string;
  motivo?: string;
  notes?: string;
  reminder_24h_sent?: boolean;
  reminder_2h_sent?: boolean;
  rescheduled_from_date?: string;
  rescheduled_from_time?: string;
}

// Read email configuration from environment or persistent clinic defaults
function getEmailConfig() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = (process.env.SMTP_USER || 'equilibraavisos@gmail.com').trim();
  // Strip whitespace from passwords if user enters Google app password format with spaces
  let pass = (process.env.SMTP_PASS || 'kuikiehilwwvzlyu').trim();
  if (pass.replace(/\s+/g, '').length === 16) {
    pass = pass.replace(/\s+/g, '');
  }
  const from = process.env.SMTP_FROM || `"EQUILIBRA - Fisioterapia & Bienestar" <${user}>`;

  const isConfigured = Boolean(host && user && pass);

  return { host, port, user, pass, from, isConfigured };
}

let transporterInstance: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const config = getEmailConfig();
  if (!config.isConfigured) return null;

  if (!transporterInstance) {
    try {
      transporterInstance = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });
      console.log('[Email Service] Servidor SMTP configurado hacia:', config.host);
    } catch (err) {
      console.error('[Email Service] Error inicializando transporte SMTP:', err);
      return null;
    }
  }
  return transporterInstance;
}

// Brand styling constants matching Brand Book 2026
const BRAND_COLORS = {
  creamy: '#F2EFE8',
  sealskin: '#0C0C0C',
  minimalist: '#B1A086',
  keystoneGray: '#D1CEC9',
  white: '#FFFFFF',
};

function generateEmailHeader(title: string, subtitle: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND_COLORS.sealskin}; border-radius: 16px 16px 0 0; padding: 36px 32px; text-align: center;">
    <tr>
      <td align="center">
        <!-- Isotipo 3 barras -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px auto;">
          <tr>
            <td style="background-color: ${BRAND_COLORS.minimalist}; width: 44px; height: 6px; border-radius: 2px;"></td>
          </tr>
          <tr><td style="height: 4px;"></td></tr>
          <tr>
            <td style="background-color: ${BRAND_COLORS.minimalist}; width: 44px; height: 6px; border-radius: 2px;"></td>
          </tr>
          <tr><td style="height: 4px;"></td></tr>
          <tr>
            <td style="background-color: ${BRAND_COLORS.minimalist}; width: 44px; height: 6px; border-radius: 2px;"></td>
          </tr>
        </table>

        <h1 style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 3px; color: ${BRAND_COLORS.creamy}; text-transform: uppercase;">
          EQUILIBRA
        </h1>
        <p style="margin: 6px 0 16px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 2px; color: ${BRAND_COLORS.minimalist}; text-transform: uppercase; font-weight: 600;">
          Un refugio, no una sala de espera.
        </p>
        <div style="height: 1px; width: 60px; background-color: ${BRAND_COLORS.minimalist}; margin: 0 auto 16px auto;"></div>
        <h2 style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 18px; color: ${BRAND_COLORS.white}; font-weight: 700;">
          ${title}
        </h2>
        <p style="margin: 4px 0 0 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #A8A39A;">
          ${subtitle}
        </p>
      </td>
    </tr>
  </table>
  `;
}

function generateEmailFooter(): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 0 0 16px 16px; padding: 28px 24px; text-align: center; color: #8E8A82; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.6;">
    <tr>
      <td align="center">
        <p style="margin: 0 0 8px 0; color: ${BRAND_COLORS.creamy}; font-weight: 600;">
          EQUILIBRA • Centro de Bienestar Integral & Fisioterapia
        </p>
        <p style="margin: 0 0 8px 0;">
          📍 Av. Francisco de Miranda, Sabana Grande, Centro Profesional del Este, Piso 4, Oficinas 46 y 48, Caracas, Venezuela.
        </p>
        <p style="margin: 0 0 12px 0;">
          📞 Teléfono de Citas: +58 424-2724617 • Instagram: @fisiojewsiejew
        </p>
        <div style="height: 1px; width: 80%; background-color: #262626; margin: 12px auto;"></div>
        <p style="margin: 0; font-size: 11px; color: #666;">
          Este correo fue generado automáticamente por el sistema de reservas clínicas de EQUILIBRA. Si necesitas reprogramar o cancelar, puedes hacerlo directamente a través de nuestro portal web con tu código de cita.
        </p>
      </td>
    </tr>
  </table>
  `;
}

/**
 * 1. Envía correo de CONFIRMACIÓN INICIAL de cita al paciente
 */
export async function sendBookingConfirmationEmail(data: EmailAppointmentData): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  const patientEmail = String(data.email || '').trim().toLowerCase();
  if (!patientEmail || !patientEmail.includes('@')) {
    return { success: false, error: 'Email de paciente no válido o vacío' };
  }

  const patientName = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Paciente';
  const serviceName = data.service_title || data.serviceTitle || 'Fisioterapia y Rehabilitación';
  const packageName = data.selected_package_name || data.selectedPackageName || 'Sesión Clínica 1 a 1';
  const price = data.selected_package_price || data.selectedPackagePrice || data.service_price || data.servicePrice || 'Tarifa oficial';
  const specialist = data.specialist_name || data.specialistName || 'Lic. Isaac Jewsiejew';
  const code = data.code || 'EQUILIBRA';
  const totalSessions = data.package_total_sessions || data.packageTotalSessions || 1;
  const sessionNumber = data.package_session_number || data.packageSessionNumber || 1;
  const isPackage = totalSessions > 1;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Cita - EQUILIBRA</title>
  </head>
  <body style="margin: 0; padding: 24px 12px; background-color: #E8E5DF; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden;">
      
      <!-- Encabezado con Identidad Oficial -->
      <tr>
        <td>
          ${generateEmailHeader('¡Tu Cita Ha Sido Confirmada!', 'Bienvenido a una nueva experiencia de salud')}
        </td>
      </tr>

      <!-- Cuerpo del Mensaje -->
      <tr>
        <td style="padding: 32px 28px; color: #212529; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Hola <strong style="color: ${BRAND_COLORS.sealskin};">${patientName}</strong>,
          </p>
          <p style="margin: 0 0 24px 0; color: #495057;">
            Hemos reservado y confirmado tu cita en <strong>EQUILIBRA</strong>. Nuestro equipo multidisciplinario está preparado para brindarte una atención técnica, cercana y de alto estándar.
          </p>

          <!-- Tarjeta de Detalles de la Cita -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND_COLORS.creamy}; border: 1px solid ${BRAND_COLORS.keystoneGray}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <tr>
              <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #DFD9CE;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #84735B; font-weight: 700;">Código Único de Consulta</span>
                <div style="font-size: 22px; font-weight: 900; color: ${BRAND_COLORS.sealskin}; letter-spacing: 2px; margin-top: 2px;">
                  ${code}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 8px 6px 0; vertical-align: top; width: 50%;">
                <strong style="color: #6C757D; font-size: 11px; text-transform: uppercase; display: block;">Fecha:</strong>
                <span style="font-size: 15px; font-weight: 700; color: ${BRAND_COLORS.sealskin};">📅 ${data.fecha}</span>
              </td>
              <td style="padding: 12px 0 6px 8px; vertical-align: top; width: 50%;">
                <strong style="color: #6C757D; font-size: 11px; text-transform: uppercase; display: block;">Horario:</strong>
                <span style="font-size: 15px; font-weight: 700; color: ${BRAND_COLORS.sealskin};">⏰ ${data.hora}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 8px 6px 0; vertical-align: top;">
                <strong style="color: #6C757D; font-size: 11px; text-transform: uppercase; display: block;">Especialidad:</strong>
                <span style="font-size: 14px; font-weight: 600; color: ${BRAND_COLORS.sealskin};">🩺 ${serviceName}</span>
              </td>
              <td style="padding: 8px 0 6px 8px; vertical-align: top;">
                <strong style="color: #6C757D; font-size: 11px; text-transform: uppercase; display: block;">Modalidad / Plan:</strong>
                <span style="font-size: 14px; font-weight: 600; color: ${BRAND_COLORS.sealskin};">🏷️ ${packageName} ${isPackage ? `(Sesión ${sessionNumber}/${totalSessions})` : ''}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 8px 0 0; vertical-align: top;">
                <strong style="color: #6C757D; font-size: 11px; text-transform: uppercase; display: block;">Especialista Asignado:</strong>
                <span style="font-size: 14px; font-weight: 600; color: ${BRAND_COLORS.sealskin};">👨‍⚕️ ${specialist}</span>
              </td>
              <td style="padding: 8px 0 0 8px; vertical-align: top;">
                <strong style="color: #6C757D; font-size: 11px; text-transform: uppercase; display: block;">Tarifa:</strong>
                <span style="font-size: 14px; font-weight: 700; color: #2E261D;">💵 ${price}</span>
              </td>
            </tr>
          </table>

          <!-- Aviso de Recordatorios Automáticos -->
          <div style="background-color: #F8F9FA; border-left: 4px solid ${BRAND_COLORS.minimalist}; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px; font-size: 13px; color: #495057;">
            🔔 <strong>Sistema de Recordatorios Automáticos Activado:</strong><br>
            Te enviaremos un recordatorio por correo electrónico <strong>1 día antes (24 horas)</strong> y otro recordatorio <strong>2 horas antes</strong> de tu cita con indicaciones directas para llegar a la clínica.
          </div>

          <!-- Recomendaciones para la Consulta -->
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_COLORS.sealskin}; margin: 0 0 10px 0;">
            Recomendaciones para tu Visita:
          </h3>
          <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #495057; font-size: 13px; line-height: 1.7;">
            <li>Asiste con ropa deportiva o cómoda que permita la evaluación de la zona afectada.</li>
            <li>Si dispones de estudios previos (Rayos X, resonancias, ecografías o informes médicos), por favor tráelos en físico o digital.</li>
            <li>Llega con 10 minutos de anticipación para tu registro inicial.</li>
            <li>Puedes reprogramar o cancelar sin costo con al menos 12 horas de antelación.</li>
          </ul>

          <!-- Botón de Acción -->
          <div style="text-align: center; margin: 30px 0 10px 0;">
            <a href="https://consultorio-equilibra.onrender.com/?portal_code=${code}" style="background-color: ${BRAND_COLORS.sealskin}; color: ${BRAND_COLORS.creamy}; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.5px; border: 2px solid ${BRAND_COLORS.minimalist};">
              Validar y Gestionar mi Cita en Línea →
            </a>
          </div>
        </td>
      </tr>

      <!-- Pie de Página -->
      <tr>
        <td>
          ${generateEmailFooter()}
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const config = getEmailConfig();
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Service Simulated] 📧 Confirmación de Cita preparada para ${patientEmail} [${code}]:`);
    console.log(`  -> Paciente: ${patientName} | Fecha: ${data.fecha} ${data.hora} | Servicio: ${serviceName}`);
    console.log(`  -> Para activar envíos reales por internet, añade las variables SMTP_HOST, SMTP_USER y SMTP_PASS en el entorno.`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: patientEmail,
      subject: `Confirmación de Cita (${code}) • EQUILIBRA Fisioterapia & Bienestar`,
      html: htmlContent,
    });
    console.log(`[Email Service] Correo de confirmación enviado exitosamente a ${patientEmail}. ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Service Error] Error enviando correo a ${patientEmail}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * 2. Envía correo de REPROGRAMACIÓN de cita al paciente
 */
export async function sendRescheduleConfirmationEmail(
  data: EmailAppointmentData,
  previousDate?: string,
  previousTime?: string
): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  const patientEmail = String(data.email || '').trim().toLowerCase();
  if (!patientEmail || !patientEmail.includes('@')) {
    return { success: false, error: 'Email no válido' };
  }

  const patientName = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Paciente';
  const serviceName = data.service_title || data.serviceTitle || 'Fisioterapia';
  const specialist = data.specialist_name || data.specialistName || 'Lic. Isaac Jewsiejew';
  const code = data.code || 'EQUILIBRA';
  const oldDateText = previousDate ? `${previousDate} (${previousTime || ''})` : (data.rescheduled_from_date ? `${data.rescheduled_from_date} (${data.rescheduled_from_time || ''})` : 'Horario anterior');

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Reprogramación de Cita - EQUILIBRA</title>
  </head>
  <body style="margin: 0; padding: 24px 12px; background-color: #E8E5DF; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden;">
      <tr>
        <td>
          ${generateEmailHeader('Tu Cita Ha Sido Reprogramada', 'Actualización de agenda confirmada')}
        </td>
      </tr>
      <tr>
        <td style="padding: 32px 28px; color: #212529; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Hola <strong style="color: ${BRAND_COLORS.sealskin};">${patientName}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #495057;">
            Te notificamos que tu cita ha sido reprogramada exitosamente a través de la plataforma web de <strong>EQUILIBRA</strong>.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND_COLORS.creamy}; border: 1px solid ${BRAND_COLORS.keystoneGray}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <tr>
              <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #DFD9CE;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #84735B; font-weight: 700;">Código de Consulta</span>
                <div style="font-size: 20px; font-weight: 900; color: ${BRAND_COLORS.sealskin};">${code}</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 8px 6px 0; vertical-align: top; width: 50%;">
                <strong style="color: #DC3545; font-size: 11px; text-transform: uppercase; display: block;">Horario Anterior:</strong>
                <span style="font-size: 13px; text-decoration: line-through; color: #6C757D;">${oldDateText}</span>
              </td>
              <td style="padding: 12px 0 6px 8px; vertical-align: top; width: 50%;">
                <strong style="color: #28A745; font-size: 11px; text-transform: uppercase; display: block;">Nuevo Horario Confirmado:</strong>
                <span style="font-size: 15px; font-weight: 700; color: ${BRAND_COLORS.sealskin};">📅 ${data.fecha} (${data.hora})</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 8px 0 0; vertical-align: top;">
                <strong style="color: #6C757D; font-size: 11px; text-transform: uppercase; display: block;">Especialista:</strong>
                <span style="font-size: 14px; font-weight: 600; color: ${BRAND_COLORS.sealskin};">👨‍⚕️ ${specialist}</span>
              </td>
              <td style="padding: 8px 0 0 8px; vertical-align: top;">
                <strong style="color: #6C757D; font-size: 11px; text-transform: uppercase; display: block;">Área:</strong>
                <span style="font-size: 14px; font-weight: 600; color: ${BRAND_COLORS.sealskin};">🩺 ${serviceName}</span>
              </td>
            </tr>
          </table>

          <div style="background-color: #F8F9FA; border-left: 4px solid ${BRAND_COLORS.minimalist}; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px; font-size: 13px; color: #495057;">
            🔔 Los recordatorios automáticos (24 horas y 2 horas antes) han sido reprogramados automáticamente para tu nueva fecha y hora.
          </div>

          <div style="text-align: center; margin: 24px 0 10px 0;">
            <a href="https://consultorio-equilibra.onrender.com/?portal_code=${code}" style="background-color: ${BRAND_COLORS.sealskin}; color: ${BRAND_COLORS.creamy}; padding: 12px 26px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; border: 2px solid ${BRAND_COLORS.minimalist};">
              Ver detalles de mi Cita en el Portal →
            </a>
          </div>
        </td>
      </tr>
      <tr><td>${generateEmailFooter()}</td></tr>
    </table>
  </body>
  </html>
  `;

  const config = getEmailConfig();
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Service Simulated] 📧 Reprogramación de Cita para ${patientEmail} [${code}]:`);
    console.log(`  -> Anterior: ${oldDateText} | Nueva Fecha: ${data.fecha} ${data.hora}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: patientEmail,
      subject: `Cita Reprogramada con Éxito (${code}) • EQUILIBRA`,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Service Error] Error enviando reprogramación a ${patientEmail}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * 3. Envía correo de CANCELACIÓN de cita al paciente
 */
export async function sendCancellationEmail(
  data: EmailAppointmentData,
  reason?: string
): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  const patientEmail = String(data.email || '').trim().toLowerCase();
  if (!patientEmail || !patientEmail.includes('@')) {
    return { success: false, error: 'Email no válido' };
  }

  const patientName = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Paciente';
  const serviceName = data.service_title || data.serviceTitle || 'Fisioterapia';
  const code = data.code || 'EQUILIBRA';
  const motivo = reason || 'Cancelación solicitada por el paciente';

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Cancelación de Cita - EQUILIBRA</title>
  </head>
  <body style="margin: 0; padding: 24px 12px; background-color: #E8E5DF; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden;">
      <tr>
        <td>
          ${generateEmailHeader('Cancelación de Cita Procesada', 'Constancia de anulación en sistema')}
        </td>
      </tr>
      <tr>
        <td style="padding: 32px 28px; color: #212529; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Hola <strong style="color: ${BRAND_COLORS.sealskin};">${patientName}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #495057;">
            Confirmamos que tu cita para <strong>${serviceName}</strong> (Código: <strong>${code}</strong>) fijada para el <strong>${data.fecha} a las ${data.hora}</strong> ha sido <strong>cancelada</strong> en nuestro sistema.
          </p>
          <div style="background-color: #FFF3CD; border: 1px solid #FFEBAA; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; font-size: 13px; color: #856404;">
            <strong>Motivo registrado:</strong> ${motivo}
          </div>
          <p style="margin: 0 0 20px 0; color: #6C757D; font-size: 13px;">
            Si deseas agendar una nueva fecha en el futuro o retomar tu tratamiento, puedes hacerlo en cualquier momento desde nuestra página web o vía WhatsApp al +58 424-2724617.
          </p>
          <div style="text-align: center; margin: 24px 0 10px 0;">
            <a href="https://consultorio-equilibra.onrender.com/#servicios" style="background-color: ${BRAND_COLORS.sealskin}; color: ${BRAND_COLORS.creamy}; padding: 12px 26px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; border: 2px solid ${BRAND_COLORS.minimalist};">
              Agendar una Nueva Cita →
            </a>
          </div>
        </td>
      </tr>
      <tr><td>${generateEmailFooter()}</td></tr>
    </table>
  </body>
  </html>
  `;

  const config = getEmailConfig();
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Service Simulated] 📧 Cancelación de Cita enviada para ${patientEmail} [${code}]: ${motivo}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: patientEmail,
      subject: `Cita Cancelada (${code}) • EQUILIBRA`,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Service Error] Error enviando cancelación a ${patientEmail}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * 4. Envía RECORDATORIO 24 HORAS (1 día antes)
 */
export async function send24HourReminderEmail(data: EmailAppointmentData): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  const patientEmail = String(data.email || '').trim().toLowerCase();
  if (!patientEmail || !patientEmail.includes('@')) return { success: false, error: 'Email inválido' };

  const patientName = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Paciente';
  const serviceName = data.service_title || data.serviceTitle || 'Fisioterapia';
  const specialist = data.specialist_name || data.specialistName || 'Lic. Isaac Jewsiejew';
  const code = data.code || 'EQUILIBRA';

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>Recordatorio 1 día antes - EQUILIBRA</title></head>
  <body style="margin: 0; padding: 24px 12px; background-color: #E8E5DF; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden;">
      <tr><td>${generateEmailHeader('Recordatorio: Mañana es tu Cita', 'Nos vemos en 24 horas')}</td></tr>
      <tr>
        <td style="padding: 32px 28px; color: #212529; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Hola <strong style="color: ${BRAND_COLORS.sealskin};">${patientName}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #495057;">
            Te recordamos que tienes pautada tu sesión clínica para <strong>mañana</strong> en EQUILIBRA.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND_COLORS.creamy}; border: 1px solid ${BRAND_COLORS.keystoneGray}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <tr>
              <td style="padding: 6px 0;"><strong>📅 Fecha:</strong> ${data.fecha}</td>
              <td style="padding: 6px 0;"><strong>⏰ Horario:</strong> ${data.hora}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>🩺 Servicio:</strong> ${serviceName}</td>
              <td style="padding: 6px 0;"><strong>👨‍⚕️ Especialista:</strong> ${specialist}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 8px; border-top: 1px solid #DFD9CE; font-size: 13px;">
                <strong>Código de Cita:</strong> <span style="font-family: monospace; font-size: 15px; font-weight: 700;">${code}</span>
              </td>
            </tr>
          </table>

          <p style="margin: 0 0 16px 0; font-size: 13px; color: #495057;">
            <strong>Ubicación:</strong> Av. Francisco de Miranda, Sabana Grande, Centro Profesional del Este, Piso 4, Oficina 46 y 48.
          </p>
          <div style="text-align: center; margin: 24px 0 10px 0;">
            <a href="https://consultorio-equilibra.onrender.com/?portal_code=${code}" style="background-color: ${BRAND_COLORS.sealskin}; color: ${BRAND_COLORS.creamy}; padding: 12px 26px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; border: 2px solid ${BRAND_COLORS.minimalist};">
              Ver Detalles o Reprogramar en Línea →
            </a>
          </div>
        </td>
      </tr>
      <tr><td>${generateEmailFooter()}</td></tr>
    </table>
  </body>
  </html>
  `;

  const config = getEmailConfig();
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Service Simulated] 🔔 Recordatorio 24 Horas para ${patientEmail} [${code}]`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: patientEmail,
      subject: `Recordatorio: Mañana es tu Cita (${data.hora}) • EQUILIBRA`,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Service Error] Error recordatorio 24h a ${patientEmail}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * 5. Envía RECORDATORIO 2 HORAS ANTES
 */
export async function send2HourReminderEmail(data: EmailAppointmentData): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  const patientEmail = String(data.email || '').trim().toLowerCase();
  if (!patientEmail || !patientEmail.includes('@')) return { success: false, error: 'Email inválido' };

  const patientName = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Paciente';
  const serviceName = data.service_title || data.serviceTitle || 'Fisioterapia';
  const code = data.code || 'EQUILIBRA';

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>Recordatorio 2 horas antes - EQUILIBRA</title></head>
  <body style="margin: 0; padding: 24px 12px; background-color: #E8E5DF; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden;">
      <tr><td>${generateEmailHeader('¡Tu Cita es en 2 Horas!', 'Te esperamos en nuestra sede')}</td></tr>
      <tr>
        <td style="padding: 32px 28px; color: #212529; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Hola <strong style="color: ${BRAND_COLORS.sealskin};">${patientName}</strong>,
          </p>
          <div style="background-color: #D4EDDA; border: 1px solid #C3E6CB; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; font-size: 14px; color: #155724; font-weight: 600;">
            ⏰ Tu cita de <strong>${serviceName}</strong> comienza en aproximadamente 2 horas: <strong>${data.hora}</strong> (Hoy).
          </div>
          <p style="margin: 0 0 16px 0; color: #495057;">
            📍 <strong>Cómo llegar a EQUILIBRA:</strong><br>
            Av. Francisco de Miranda, Sabana Grande, Centro Profesional del Este, Piso 4, Oficinas 46 y 48 (Caracas). Al llegar, por favor anuncia tu código de cita <strong>${code}</strong> en recepción.
          </p>
          <p style="margin: 0 0 20px 0; color: #495057;">
            Si tienes algún retraso o eventualidad en el tráfico, puedes escribirnos por WhatsApp al <a href="https://wa.me/584242724617" style="color: #28A745; font-weight: bold;">+58 424-2724617</a>.
          </p>
          <div style="text-align: center; margin: 20px 0 10px 0;">
            <a href="https://maps.google.com/?q=Centro+Profesional+del+Este+Caracas" style="background-color: ${BRAND_COLORS.sealskin}; color: ${BRAND_COLORS.creamy}; padding: 12px 26px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; border: 2px solid ${BRAND_COLORS.minimalist};">
              Abrir Ubicación en Google Maps →
            </a>
          </div>
        </td>
      </tr>
      <tr><td>${generateEmailFooter()}</td></tr>
    </table>
  </body>
  </html>
  `;

  const config = getEmailConfig();
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Service Simulated] ⏰ Recordatorio 2 Horas para ${patientEmail} [${code}]`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: patientEmail,
      subject: `🚨 Recordatorio: Tu Cita es en 2 Horas (${data.hora}) • EQUILIBRA`,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Service Error] Error recordatorio 2h a ${patientEmail}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * 6. Motor Programador Automático de Recordatorios (Analiza fechas y despacha a las 24h y 2h antes)
 */
export function parseAppointmentDateTime(fechaStr: string, horaStr: string): Date | null {
  try {
    if (!fechaStr || !horaStr) return null;

    // Normalizar formato de fecha: YYYY-MM-DD
    const dateParts = fechaStr.trim().split('-');
    if (dateParts.length !== 3) return null;
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);

    // Extraer hora inicial de cadenas como "08:00 AM - 09:00 AM" o "14:30" o "2:00 PM"
    const match = horaStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3] ? match[3].toUpperCase() : null;

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    const date = new Date(year, month, day, hours, minutes, 0);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * 7. Envío de Notificación de Ticket y Mensaje al Desarrollador por Correo
 */
export interface DeveloperTicketEmailData {
  ticketId: string;
  nombre: string;
  email: string;
  telefono?: string;
  tipoConsulta: string;
  asunto: string;
  mensaje: string;
  developerEmail?: string;
}

export async function sendDeveloperSupportEmail(
  data: DeveloperTicketEmailData
): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  const config = getEmailConfig();
  const targetDevEmail = (data.developerEmail || process.env.DEVELOPER_EMAIL || 'paezjose481@gmail.com').trim();

  const getTipoConsultaLabel = (tipo: string) => {
    switch (tipo) {
      case 'reporte_error': return '🐛 Reporte de Error o Bug';
      case 'problema_reserva': return '📅 Problema con Reserva / Calendario';
      case 'validacion_cita': return '🔍 Validación de Código de Cita';
      case 'sugerencia_mejora': return '💡 Sugerencia o Nueva Función';
      case 'duda_general': return '❓ Duda sobre la Plataforma Web';
      default: return '🛠️ Consulta Técnica General';
    }
  };

  const tipoLabel = getTipoConsultaLabel(data.tipoConsulta);
  const nowStr = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' });

  const htmlDev = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Nuevo Ticket para el Desarrollador</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080808; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F2EFE8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #080808; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #121212; border-radius: 20px; overflow: hidden; border: 1px solid #262626; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0C0C0C; padding: 32px 30px; text-align: center; border-bottom: 2px solid #B1A086;">
              <div style="display: inline-block; background-color: rgba(177,160,134,0.15); border: 1px solid #B1A086; color: #E5D5B8; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
                TICKET DE SOPORTE TÉCNICO • EQUILIBRA
              </div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 900; letter-spacing: 0.5px;">
                Mensaje para el Desarrollador
              </h1>
              <p style="margin: 6px 0 0 0; color: #B1A086; font-size: 13px;">
                Identificador Oficial: <strong style="color: #FFFFFF; font-family: monospace;">#${data.ticketId}</strong>
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1A1A1A; border-radius: 14px; padding: 20px; border: 1px solid #333333; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="color: #A0A0A0; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Tipo de Consulta</div>
                    <div style="color: #E5D5B8; font-size: 14px; font-weight: bold; margin-top: 3px;">${tipoLabel}</div>
                    
                    <div style="height: 12px;"></div>

                    <div style="color: #A0A0A0; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Asunto</div>
                    <div style="color: #FFFFFF; font-size: 15px; font-weight: bold; margin-top: 3px;">${data.asunto}</div>
                  </td>
                </tr>
              </table>

              <!-- Remitente Info -->
              <h3 style="margin: 0 0 12px 0; color: #B1A086; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">
                Datos del Remitente
              </h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #161616; border-radius: 12px; padding: 16px; border: 1px solid #282828; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #8E8E8E; width: 110px;">Nombre:</td>
                  <td style="padding: 4px 0; color: #FFFFFF; font-weight: bold;">${data.nombre}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #8E8E8E;">Email:</td>
                  <td style="padding: 4px 0;"><a href="mailto:${data.email}" style="color: #60A5FA; text-decoration: none; font-weight: bold;">${data.email}</a></td>
                </tr>
                ${data.telefono ? `
                <tr>
                  <td style="padding: 4px 0; color: #8E8E8E;">Teléfono / WA:</td>
                  <td style="padding: 4px 0;"><a href="https://wa.me/${data.telefono.replace(/[^0-9]/g, '')}" style="color: #34D399; text-decoration: none; font-weight: bold;">${data.telefono}</a></td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 4px 0; color: #8E8E8E;">Fecha y Hora:</td>
                  <td style="padding: 4px 0; color: #D1CEC9;">${nowStr} (Caracas)</td>
                </tr>
              </table>

              <!-- Mensaje Completo -->
              <h3 style="margin: 0 0 12px 0; color: #B1A086; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">
                Mensaje / Detalle de la Solicitud
              </h3>
              <div style="background-color: #181818; border-left: 4px solid #B1A086; border-radius: 0 12px 12px 0; padding: 20px; font-size: 14px; line-height: 1.6; color: #F2EFE8; white-space: pre-line; margin-bottom: 28px;">
${data.mensaje}
              </div>

              <!-- Quick Action Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}?subject=RE:%20[Ticket%20${data.ticketId}]%20${encodeURIComponent(data.asunto)}" 
                       style="display: inline-block; background-color: #B1A086; color: #0C0C0C; padding: 14px 28px; border-radius: 12px; font-size: 13px; font-weight: 900; text-decoration: none; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(177,160,134,0.3);">
                      ✉️ Responder Directamente a ${data.nombre}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0A0A0A; padding: 20px 30px; text-align: center; border-top: 1px solid #222222; font-size: 11px; color: #777777;">
              Enviado automáticamente por el Sistema Web de EQUILIBRA Sabana Grande · Caracas, Venezuela.
              <br>Canal de soporte al desarrollador (<span style="color: #999;">${targetDevEmail}</span>).
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const htmlUserConfirm = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Confirmación de Ticket Técnico</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080808; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F2EFE8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #080808; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #121212; border-radius: 20px; overflow: hidden; border: 1px solid #262626;">
          <tr>
            <td style="background-color: #0C0C0C; padding: 28px; text-align: center; border-bottom: 2px solid #B1A086;">
              <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 900;">EQUILIBRA • Soporte Técnico</h2>
              <p style="margin: 6px 0 0 0; color: #B1A086; font-size: 12px;">Hemos recibido tu mensaje correctamente</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <p style="color: #FFFFFF; font-size: 14px; margin-top: 0;">
                Hola <strong>${data.nombre}</strong>,
              </p>
              <p style="color: #D1CEC9; font-size: 13px; line-height: 1.6;">
                Te confirmamos que tu consulta ha sido enviada exitosamente al equipo de desarrollo y soporte técnico de EQUILIBRA con el número de ticket:
              </p>
              <div style="background-color: #1A1A1A; border: 1px solid #B1A086; border-radius: 12px; padding: 14px; text-align: center; margin: 18px 0;">
                <span style="font-size: 11px; color: #B1A086; text-transform: uppercase; font-weight: bold;">Ticket ID:</span>
                <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #FFFFFF; margin-top: 2px;">#${data.ticketId}</div>
              </div>
              <p style="color: #D1CEC9; font-size: 13px; line-height: 1.6;">
                <strong>Asunto:</strong> ${data.asunto}
              </p>
              <p style="color: #D1CEC9; font-size: 13px; line-height: 1.6;">
                El desarrollador revisará tu reporte y te responderá directamente a este correo electrónico (<strong>${data.email}</strong>) en menos de 2 horas.
              </p>
              <p style="color: #888888; font-size: 12px; margin-top: 24px;">
                Si se trata de una urgencia médica o requieres atención presencial inmediata, puedes comunicarte por WhatsApp al +58 424-2724617.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Developer Email Service] Modo simulado (sin SMTP). Enviando ticket #${data.ticketId} a ${targetDevEmail}`);
    return { success: true, simulated: true };
  }

  try {
    // 1. Send email to Developer
    const infoDev = await transporter.sendMail({
      from: config.from,
      to: targetDevEmail,
      replyTo: data.email,
      subject: `🛠️ [SOPORTE DEV #${data.ticketId}] ${data.asunto} - ${data.nombre}`,
      html: htmlDev,
    });
    console.log(`[Developer Email Service] Ticket #${data.ticketId} entregado al desarrollador (${targetDevEmail}):`, infoDev.messageId);

    // 2. Send confirmation to user (non-blocking)
    if (data.email && data.email.includes('@')) {
      transporter.sendMail({
        from: config.from,
        to: data.email,
        subject: `✅ Ticket de Soporte Recibido [#${data.ticketId}] • EQUILIBRA`,
        html: htmlUserConfirm,
      }).catch((uErr: any) => {
        console.warn(`[Developer Email Service] Nota enviando confirmación a usuario ${data.email}:`, uErr?.message);
      });
    }

    return { success: true, messageId: infoDev.messageId };
  } catch (err: any) {
    console.error(`[Developer Email Service Error] Error enviando correo al desarrollador:`, err?.message);
    return { success: false, error: err?.message };
  }
}

