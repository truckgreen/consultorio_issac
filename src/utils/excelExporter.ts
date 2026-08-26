import { ConfirmedAppointment } from '../types';
import { SPECIALISTS_ACCOUNTS } from '../data/specialistsAuthData';
import { getSecurityLogs } from './security';

export interface DatabaseExportOptions {
  appointments: ConfirmedAppointment[];
  specialistFilterId?: string;
  filenamePrefix?: string;
}

/**
 * Escapes XML/HTML characters for safe Excel Spreadsheet rendering
 */
function escapeXml(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) return '';
  const str = String(unsafe);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a fully formatted, multi-sheet Excel XML Workbook (SpreadsheetML)
 * Compatible with Microsoft Excel (all versions), Google Sheets, LibreOffice, Numbers, and Mobile Excel.
 * Completely zero external dependencies (no xlsx npm package required).
 */
export function exportAppointmentsToExcel({
  appointments,
  specialistFilterId,
  filenamePrefix = 'EQUILIBRA_BaseDatos_Clinica',
}: DatabaseExportOptions): { success: boolean; filename: string } {
  try {
    const filteredList = specialistFilterId && specialistFilterId !== 'TODOS'
      ? appointments.filter((a) => a.specialistId === specialistFilterId || a.specialist_id === specialistFilterId)
      : appointments;

    // 1. Master Appointments (Citas Clínicas)
    const appointmentsRows = filteredList.map((app, index) => {
      const isCanceled = app.status === 'cancelada' || app.status === 'CANCELADA';
      const isRescheduled = app.status === 'reprogramada' || app.status === 'REPROGRAMADA' || Boolean(app.rescheduledFromDate);
      const cancelCount = app.cancellationCount || (isCanceled ? 1 : 0);
      const penaltyPercent = isCanceled && (app.cancellationFeePercent !== undefined) ? `${app.cancellationFeePercent}%` : (isCanceled && cancelCount >= 2 ? '20%' : '0%');
      const penaltyAmount = isCanceled && app.cancellationFeeAmount ? `${app.cancellationFeeAmount} USD` : (isCanceled && cancelCount >= 2 ? '7.00 USD' : '0.00 USD');

      return [
        index + 1,
        app.code || 'N/A',
        (app.status || 'CONFIRMADA').toUpperCase(),
        app.fecha || '',
        app.hora || '',
        app.nombre || '',
        app.apellido || '',
        app.telefono || '',
        app.email || '',
        app.serviceId || app.service_id || '',
        app.selectedPackageName || 'Sesión Estándar',
        app.selectedPackagePrice || app.servicePrice || app.service_price || '35 USD',
        app.specialistName || app.specialist_name || 'Lic. Isaac Jewsiejew',
        app.primeraVisita || app.primera_visita ? 'SÍ' : 'NO',
        app.motivoConsulta || app.motivo || 'N/A',
        isRescheduled ? `Sí (${app.rescheduledFromDate || ''})` : 'No',
        app.rescheduledCount || 0,
        isCanceled ? 'SÍ' : 'NO',
        cancelCount,
        penaltyPercent,
        penaltyAmount,
        app.cancellationReason || 'N/A',
        app.createdAt || app.created_at || new Date().toISOString(),
      ];
    });

    const appointmentsHeaders = [
      '#',
      'Código de Cita',
      'Estado',
      'Fecha Cita',
      'Hora',
      'Paciente Nombre',
      'Paciente Apellido',
      'Teléfono',
      'Correo',
      'Servicio ID',
      'Paquete Seleccionado',
      'Precio / Monto',
      'Especialista Asignado',
      'Primera Visita',
      'Motivo Consulta',
      'Reprogramada',
      'Veces Reprogramada',
      'Cancelada',
      'N° Cancelaciones',
      'Penalización (%)',
      'Monto Penalización',
      'Motivo Cancelación',
      'Fecha de Creación',
    ];

    // 2. Control Cancelaciones
    const canceledList = appointments.filter((a) => a.status === 'cancelada' || a.status === 'CANCELADA' || (a.cancellationCount && a.cancellationCount > 0));
    const cancellationsHeaders = [
      '#',
      'Código',
      'Paciente',
      'Teléfono',
      'Fecha Original',
      'Hora Original',
      'Servicio',
      'N° de Cancelación',
      'Aplica Penalización',
      'Porcentaje Penalización',
      'Monto Penalización',
      'Motivo del Paciente',
      'Fecha de Cancelación',
    ];

    const cancellationsRows = canceledList.map((app, index) => {
      const isSecondOrMore = (app.cancellationCount || 1) >= 2;
      return [
        index + 1,
        app.code || '',
        `${app.nombre || ''} ${app.apellido || ''}`.trim(),
        app.telefono || '',
        app.fecha || '',
        app.hora || '',
        app.serviceId || app.service_id || '',
        app.cancellationCount || 1,
        isSecondOrMore ? 'SÍ (20% Recargo 2da+)' : 'NO (1ra Cancelación Gratuita)',
        isSecondOrMore ? '20%' : '0%',
        app.cancellationFeeAmount ? `${app.cancellationFeeAmount} USD` : (isSecondOrMore ? '7.00 USD' : '0.00 USD'),
        app.cancellationReason || 'No especificado',
        app.canceledAt || app.createdAt || '',
      ];
    });

    // 3. Directorio de Especialistas
    const specialistsHeaders = [
      'ID Especialista',
      'Nombre',
      'Rol Profesional',
      'Especialidad',
      'Correo Institucional',
      'PIN Fácil',
      'Acceso Biométrico',
      'Servicio Principal',
    ];
    const specialistsRows = SPECIALISTS_ACCOUNTS.map((spec) => [
      spec.id,
      spec.name,
      spec.role,
      spec.specialty,
      spec.email,
      spec.easyPin,
      spec.biometricRegistered ? 'Habilitado (Huella / TouchID)' : 'PIN Únicamente',
      spec.relatedServiceId,
    ]);

    // 4. Auditoría de Seguridad
    const securityLogs = getSecurityLogs();
    const securityHeaders = ['#', 'Timestamp', 'Acción', 'Severidad', 'Detalles', 'Huella Dispositivo'];
    const securityRows = securityLogs.map((log, index) => [
      index + 1,
      log.timestamp,
      log.action,
      log.severity,
      log.details,
      log.fingerprintHash || 'browser-hash',
    ]);

    // Build XML Spreadsheet 2003 format
    const renderTableXml = (headers: string[], rows: (string | number)[][]) => {
      let xml = '<Table>\n';
      // Header Row
      xml += '  <Row ss:StyleID="HeaderStyle">\n';
      headers.forEach((h) => {
        xml += `    <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
      });
      xml += '  </Row>\n';

      // Data Rows
      if (rows.length === 0) {
        xml += '  <Row ss:StyleID="DefaultStyle">\n';
        xml += `    <Cell ss:MergeAcross="${headers.length - 1}"><Data ss:Type="String">Sin registros actualmente en el sistema</Data></Cell>\n`;
        xml += '  </Row>\n';
      } else {
        rows.forEach((row, rIdx) => {
          const style = rIdx % 2 === 0 ? 'RowEven' : 'RowOdd';
          xml += `  <Row ss:StyleID="${style}">\n`;
          row.forEach((val) => {
            const isNum = typeof val === 'number';
            const type = isNum ? 'Number' : 'String';
            xml += `    <Cell><Data ss:Type="${type}">${escapeXml(val)}</Data></Cell>\n`;
          });
          xml += '  </Row>\n';
        });
      }
      xml += '</Table>\n';
      return xml;
    };

    const xmlWorkbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>EQUILIBRA Fisioterapia - Base de Datos Clínica</Title>
  <Author>Sistema Clínico EQUILIBRA</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>EQUILIBRA Fisioterapia Integral</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#D97706"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="RowEven">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#0F172A"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="RowOdd">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#0F172A"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DefaultStyle">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#64748B"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Citas Clínicas">
  ${renderTableXml(appointmentsHeaders, appointmentsRows)}
 </Worksheet>
 <Worksheet ss:Name="Control Cancelaciones">
  ${renderTableXml(cancellationsHeaders, cancellationsRows)}
 </Worksheet>
 <Worksheet ss:Name="Especialistas &amp; Claves">
  ${renderTableXml(specialistsHeaders, specialistsRows)}
 </Worksheet>
 <Worksheet ss:Name="Auditoría Seguridad">
  ${renderTableXml(securityHeaders, securityRows)}
 </Worksheet>
</Workbook>`;

    const dateStamp = new Date().toISOString().slice(0, 10);
    const fullFilename = `${filenamePrefix}_${dateStamp}.xls`;

    // Create Blob and trigger download
    const blob = new Blob([xmlWorkbook], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename: fullFilename };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, filename: '' };
  }
}
